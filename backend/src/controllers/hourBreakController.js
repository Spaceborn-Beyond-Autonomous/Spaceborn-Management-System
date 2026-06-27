const HourBreak = require('../models/HourBreak');
const Notification = require('../models/Notification');
const { formatResponse } = require('../utils/helpers');

// ==================== GET ALL HOUR BREAKS ====================

exports.getHourBreaks = async (req, res) => {
  try {
    const { role, department, userId } = req.query;
    let query = {};
    
    if (userId) query.userId = parseInt(userId);
    if (role !== 'Manager' && role !== 'COO' && department) query.department = department;
    
    const breaks = await HourBreak.find(query).sort({ createdAt: -1 });
    res.status(200).json(formatResponse(true, 'Breaks fetched', breaks));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== APPLY FOR HOUR BREAK ====================

exports.applyBreak = async (req, res) => {
  try {
    const { userId, userName, employeeId, userRole, department, date, hours, reason } = req.body;

    // Approval rules for hour breaks (no attendance impact)
    // - CEO hour breaks are auto-approved
    // - Team Lead hour breaks: only Manager can approve/reject
    // - Manager hour breaks: only CEO can approve/reject
    const autoApproved = userRole === 'CEO';

    const breakItem = await HourBreak.create({
      userId, userName, employeeId, userRole, department, date, hours, reason,
      status: autoApproved ? 'approved' : 'pending',
      ...(autoApproved ? { approvedBy: 'CEO', approvedOn: new Date() } : {})
    });

    
    // Notify manager/CEO
    await Notification.create({
      type: 'break_request',
      title: '⏰ Hour Break Request',
      message: `${userName} has requested a ${hours} hour break on ${date}. Reason: ${reason}`,
      fromUserId: userId,
      fromUserName: userName,
      fromEmployeeId: employeeId,
      toRole: userRole === 'Team Lead' ? 'Manager' : 'CEO',
      relatedId: breakItem._id,
      relatedModel: 'HourBreak',
      priority: 'normal'
    });
    
    res.status(201).json(formatResponse(true, 'Break requested', breakItem));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== UPDATE BREAK STATUS ====================

exports.updateBreakStatus = async (req, res) => {
  try {
    const { breakId } = req.params;
    const { status, approvedBy, rejectionReason } = req.body;

    const breakItem = await HourBreak.findById(breakId);
    if (!breakItem) {
      return res.status(404).json(formatResponse(false, 'Break not found'));
    }

    // Enforce approval hierarchy:
    // - If requester is Team Lead: only Manager can approve/reject
    // - If requester is Manager: only CEO can approve/reject
    // - If requester is CEO: break must be auto-approved; block manual updates
    const requesterRole = breakItem.userRole;
    const approverRole = req.user?.role;

    const normalizeStatus = (s) => String(s).toLowerCase();
    const nextStatus = normalizeStatus(status);
    if (!['approved', 'rejected'].includes(nextStatus)) {
      return res.status(400).json(formatResponse(false, 'Invalid status'));
    }

    if (requesterRole === 'CEO') {
      return res.status(400).json(formatResponse(false, 'CEO hour breaks are auto-approved'));
    }

    if (requesterRole === 'Team Lead' && approverRole !== 'Manager') {
      return res.status(403).json(formatResponse(false, 'Only Manager can approve/reject Team Lead hour breaks'));
    }

    if (requesterRole === 'Manager' && approverRole !== 'CEO') {
      return res.status(403).json(formatResponse(false, 'Only CEO can approve/reject Manager hour breaks'));
    }

    breakItem.status = nextStatus;
    breakItem.approvedBy = approvedBy || req.user?.fullName || req.user?.firstName || req.user?.lastName || approverRole;
    breakItem.approvedOn = new Date();
    if (rejectionReason) breakItem.rejectionReason = rejectionReason;
    await breakItem.save();


    // Notify employee
    await Notification.create({
      type: nextStatus === 'approved' ? 'break_approved' : 'break_rejected',
      title: nextStatus === 'approved' ? '✅ Break Approved' : '❌ Break Rejected',
      message: nextStatus === 'approved'
        ? `Your ${breakItem.hours} hour break on ${breakItem.date} has been approved by ${breakItem.approvedBy}.`
        : `Your ${breakItem.hours} hour break on ${breakItem.date} has been rejected by ${breakItem.approvedBy}. Reason: ${rejectionReason}`,
      fromUserName: breakItem.approvedBy,

      toUserId: breakItem.userId,
      relatedId: breakItem._id,
      relatedModel: 'HourBreak',
      priority: 'normal'
    });

    res.status(200).json(formatResponse(true, `Break ${nextStatus}`, breakItem));

  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== DELETE BREAK ====================

exports.deleteBreak = async (req, res) => {
  try {
    const { breakId } = req.params;
    await HourBreak.findByIdAndDelete(breakId);
    res.status(200).json(formatResponse(true, 'Break deleted'));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};

// ==================== GET MY BREAKS ====================

exports.getMyBreaks = async (req, res) => {
  try {
    const { userId } = req.params;
    const breaks = await HourBreak.find({ userId: parseInt(userId) }).sort({ createdAt: -1 });
    res.status(200).json(formatResponse(true, 'Breaks fetched', breaks));
  } catch (error) {
    res.status(500).json(formatResponse(false, error.message));
  }
};
