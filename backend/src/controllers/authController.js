const User = require('../models/User');
const { formatResponse } = require('../utils/helpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      department: department || 'Engineering',
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
