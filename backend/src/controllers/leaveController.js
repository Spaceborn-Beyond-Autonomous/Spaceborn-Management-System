const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const { formatResponse } = require('../utils/helpers');
const {
  notifyLeaveRequested,
  notifyLeaveDecision
} = require('../utils/notificationDispatcher');

// ==================== APPLY FOR LEAVE ====================
exports.applyLeave = async (req, res) => {
  try {
    const { userId, userName, employeeId, userRole, department, startDate, endDate, days, type, reason, halfDay, halfDayType } = req.body;

    // Check leave balance for non-CEO
    if (userRole !== 'CEO') {
      const balance = await LeaveBalance.findOne({ userId, year: new Date().getFullYear() });
      if (balance && balance[type] < days) {
        return res.status(400).json(formatResponse(false, `Insufficient ${type} leave balance`));
      }
    }

    let pendingApprovals = [];
    let status = 'Pending';

    if (userRole === 'CEO') {
      status = 'Approved';
      pendingApprovals = ['CEO'];
    } else if (userRole === 'Manager') {
      pendingApprovals = ['CEO'];
    } else {
      pendingApprovals = ['Manager', 'CEO'];
    }

    const leave = await Leave.create({
      userId,
      userName,
      employeeId,
      userRole,
      department,
      startDate,
      endDate,
      days,
      type,
      reason,
      halfDay,
      halfDayType,
      status,
      pendingApprovals,
      approvedBy: userRole === 'CEO' ? ['CEO'] : []
    });

    await notifyLeaveRequested(leave);

    res.status(201).json(formatResponse(true, 'Leave applied', leave));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== GET ALL LEAVES ====================
exports.getAllLeaves = async (req, res) => {
  try {
    const { role, department } = req.query;
    let query = {};
    if ((role === 'Manager' || role === 'COO') && department) query.department = department;
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.status(200).json(formatResponse(true, 'Leaves fetched', leaves));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== GET MY LEAVES ====================
exports.getMyLeaves = async (req, res) => {
  try {
    const { userId } = req.params;
    const leaves = await Leave.find({ userId: parseInt(userId, 10) }).sort({ createdAt: -1 });
    res.status(200).json(formatResponse(true, 'Leaves fetched', leaves));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== UPDATE LEAVE STATUS ====================
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { status, approvedBy, comments } = req.body;

    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json(formatResponse(false, 'Leave not found'));

    leave.status = status;
    leave.approvedBy = [...(leave.approvedBy || []), approvedBy];
    leave.approvedOn = new Date();
    leave.comments = comments;
    leave.pendingApprovals = leave.pendingApprovals.filter((approval) => approval !== approvedBy);
    await leave.save();

    await notifyLeaveDecision(leave);

    res.status(200).json(formatResponse(true, `Leave ${status}`, leave));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== GET LEAVE BALANCE ====================
exports.getLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const year = new Date().getFullYear();
    let balance = await LeaveBalance.findOne({ userId: parseInt(userId, 10), year });
    if (!balance) {
      balance = await LeaveBalance.create({ userId: parseInt(userId, 10), Sick: 12, Casual: 10, Annual: 15, Emergency: 5, Other: 3, year });
    }
    res.status(200).json(formatResponse(true, 'Balance fetched', balance));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== GET PENDING LEAVES ====================
exports.getPendingLeaves = async (req, res) => {
  try {
    const { role, department } = req.query;
    let query = { status: 'Pending' };
    if (role === 'Manager' || role === 'COO') {
      query.pendingApprovals = { $in: ['Manager'] };
      if (department) query.department = department;
    } else if (role === 'CEO') {
      query.pendingApprovals = { $in: ['CEO'] };
    }
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    res.status(200).json(formatResponse(true, 'Pending leaves', leaves));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== CANCEL LEAVE ====================
exports.cancelLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await Leave.findById(leaveId);
    if (!leave) return res.status(404).json(formatResponse(false, 'Leave not found'));
    if (leave.status !== 'Pending') return res.status(400).json(formatResponse(false, 'Can only cancel pending leaves'));
    leave.status = 'Cancelled';
    await leave.save();
    res.status(200).json(formatResponse(true, 'Leave cancelled', leave));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};
