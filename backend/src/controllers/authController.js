const User = require('../models/User');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { formatResponse } = require('../utils/helpers');
const { sendPasswordResetEmail } = require('../services/emailService');
const {
  notifyPasswordResetRequested,
  notifyPasswordResetDecision
} = require('../utils/notificationDispatcher');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, department, employeeId, phone, joinDate, designation } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
    if (existingUser) {
      return res.status(400).json(formatResponse(false, 'User already exists'));
    }
    
    // Create user
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;
    
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'Member',
      department: department || 'Core Systems',
      employeeId,
      phone,
      joinDate,
      designation,
      createdBy: req.user?._id,
      createdByName: req.user?.fullName
    });
    
    // Generate token
    const token = user.getSignedJwtToken();
    
    res.status(201).json(formatResponse(true, 'User registered', {
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department
      },
      token
    }));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    
    if (!employeeId || !password) {
      return res.status(400).json(formatResponse(false, 'Please provide employee ID and password'));
    }
    
    const user = await User.findOne({ employeeId }).select('+password');
    if (!user) {
      return res.status(401).json(formatResponse(false, 'Invalid credentials'));
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(formatResponse(false, 'Invalid credentials'));
    }
    
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = user.getSignedJwtToken();
    
    res.json(formatResponse(true, 'Login successful', {
      user: {
        id: user._id,
        employeeId: user.employeeId,
        name: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department
      },
      token
    }));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, {
        isOnline: false,
        lastSeen: new Date()
      });
    }
  } catch (error) {
    console.error('Logout update error:', error);
  }

  res.json(formatResponse(true, 'Logged out'));
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id).select('-password');
    if (!user) {
      return res.status(404).json(formatResponse(false, 'User not found'));
    }

    res.json(formatResponse(true, 'User fetched', {
      id: user._id,
      employeeId: user.employeeId,
      name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone,
      joinDate: user.joinDate,
      designation: user.designation,
      team: user.team,
      manager: user.manager
    }));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

const getUserName = (user) =>
  user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

const toResetRequestDto = (request) => ({
  id: String(request._id),
  _id: request._id,
  employeeId: request.employeeId,
  employeeName: request.employeeName,
  employeeEmail: request.employeeEmail,
  department: request.department,
  role: request.role,
  reason: request.reason,
  status: request.status,
  requestedAt: request.requestedAt,
  approvedBy: request.approvedByName,
  approvedAt: request.approvedAt,
  rejectedBy: request.rejectedByName,
  rejectedAt: request.rejectedAt,
  comments: request.comments,
  rejectionReason: request.rejectionReason,
  emailStatus: request.emailStatus,
  emailError: request.emailError
});

const generateTemporaryPassword = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  return Array.from({ length: 12 }, () => alphabet[crypto.randomInt(alphabet.length)]).join('');
};

// Public: employee requests a manager/COO password reset.
exports.requestPasswordReset = async (req, res) => {
  try {
    const employeeId = String(req.body.employeeId || '').trim().toUpperCase();
    const reason = String(req.body.reason || '').trim();

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    const user = await User.findOne({ employeeId, isActive: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee ID not found' });
    }

    const existingRequest = await PasswordResetRequest.findOne({ employeeId, status: 'pending' });
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending password reset request.'
      });
    }

    const request = await PasswordResetRequest.create({
      employee: user._id,
      employeeId: user.employeeId,
      employeeName: getUserName(user),
      employeeEmail: user.email,
      department: user.department || '',
      role: user.role || '',
      reason
    });

    await notifyPasswordResetRequested(request).catch((error) => {
      console.error('Password reset notification error:', error.message);
    });

    res.status(201).json({
      success: true,
      message: 'Password reset request submitted. COO and Manager users have been notified.',
      requestId: String(request._id),
      data: toResetRequestDto(request)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit reset request' });
  }
};

exports.checkPendingPasswordReset = async (req, res) => {
  try {
    const employeeId = String(req.query.employeeId || '').trim().toUpperCase();
    if (!employeeId) {
      return res.json({ success: true, hasPending: false });
    }

    const hasPending = await PasswordResetRequest.exists({ employeeId, status: 'pending' });
    res.json({ success: true, hasPending: Boolean(hasPending) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to check reset request' });
  }
};

exports.getPendingPasswordResetRequests = async (req, res) => {
  try {
    const requests = await PasswordResetRequest.find({ status: 'pending' }).sort({ requestedAt: -1 });
    const data = requests.map(toResetRequestDto);
    res.json({ success: true, data, requests: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reset requests' });
  }
};

exports.getPasswordResetStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [pending, approvedToday, totalMonth] = await Promise.all([
      PasswordResetRequest.countDocuments({ status: 'pending' }),
      PasswordResetRequest.countDocuments({ status: 'approved', approvedAt: { $gte: startOfToday } }),
      PasswordResetRequest.countDocuments({ requestedAt: { $gte: startOfMonth } })
    ]);

    res.json({ success: true, pending, approvedToday, totalMonth, data: { pending, approvedToday, totalMonth } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reset stats' });
  }
};

exports.approvePasswordResetRequest = async (req, res) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Password reset request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request has already been processed' });
    }

    const user = await User.findOne({ employeeId: request.employeeId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee no longer exists' });
    }

    const temporaryPassword = generateTemporaryPassword();
    user.password = temporaryPassword;
    await user.save();

    const comments = String(req.body.comments || '').trim();
    let emailResult = { sent: false, skipped: true, reason: 'Email was not attempted' };
    try {
      emailResult = await sendPasswordResetEmail({
        to: request.employeeEmail,
        name: request.employeeName,
        employeeId: request.employeeId,
        temporaryPassword,
        comments
      });
      request.emailStatus = emailResult.sent ? 'sent' : 'skipped';
      request.emailError = emailResult.reason || '';
    } catch (emailError) {
      request.emailStatus = 'failed';
      request.emailError = emailError.message || 'Email failed';
      console.error('Password reset email error:', emailError.message);
    }

    request.status = 'approved';
    request.approvedBy = req.user._id;
    request.approvedByName = req.user.name;
    request.approvedAt = new Date();
    request.comments = comments;
    await request.save();

    await notifyPasswordResetDecision(request, 'approved').catch((error) => {
      console.error('Password reset decision notification error:', error.message);
    });

    const emailMessage = request.emailStatus === 'sent'
      ? 'A temporary password has been emailed to the employee.'
      : 'The password was reset, but SMTP email is not configured or delivery failed. Check backend logs for the temporary password.';

    if (request.emailStatus !== 'sent') {
      console.log(`[password reset] Temporary password for ${request.employeeId}: ${temporaryPassword}`);
    }

    res.json({
      success: true,
      message: `Password reset approved. ${emailMessage}`,
      emailStatus: request.emailStatus,
      data: toResetRequestDto(request)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to approve reset request' });
  }
};

exports.rejectPasswordResetRequest = async (req, res) => {
  try {
    const request = await PasswordResetRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Password reset request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request has already been processed' });
    }

    request.status = 'rejected';
    request.rejectedBy = req.user._id;
    request.rejectedByName = req.user.name;
    request.rejectedAt = new Date();
    request.rejectionReason = String(req.body.reason || '').trim();
    await request.save();

    await notifyPasswordResetDecision(request, 'rejected').catch((error) => {
      console.error('Password reset rejection notification error:', error.message);
    });

    res.json({
      success: true,
      message: 'Password reset request rejected.',
      data: toResetRequestDto(request)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to reject reset request' });
  }
};

// Public: immediately reset password and return the temporary password
exports.forgotPasswordImmediate = async (req, res) => {
  try {
    const employeeId = String(req.body.employeeId || '').trim().toUpperCase();
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID is required' });
    }

    const user = await User.findOne({ employeeId, isActive: true }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee ID not found' });
    }

    const temporaryPassword = generateTemporaryPassword();
    user.password = temporaryPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Try to email the temporary password, but do not fail if email is not configured
    let emailResult = { sent: false, reason: 'Email not attempted' };
    try {
      emailResult = await sendPasswordResetEmail({
        to: user.email,
        name: getUserName(user),
        employeeId: user.employeeId,
        temporaryPassword,
        comments: String(req.body.reason || '').trim()
      });
    } catch (emailError) {
      console.error('Password reset email error:', emailError.message);
      emailResult = { sent: false, reason: emailError.message || 'Email failed' };
    }

    // Log the password in backend logs when email wasn't sent (useful for dev)
    if (!emailResult.sent) {
      console.log(`[password reset immediate] Temporary password for ${user.employeeId}: ${temporaryPassword}`);
    }

    res.json({
      success: true,
      message: emailResult.sent ? 'Temporary password emailed' : 'Temporary password generated',
      temporaryPassword,
      emailStatus: emailResult.sent ? 'sent' : 'skipped',
      employeeId: user.employeeId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};
