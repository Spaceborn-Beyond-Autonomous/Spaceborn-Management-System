const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

const uniqueIds = (ids) => [...new Set(ids.filter(Boolean).map(String))];

const getUserName = (user) =>
  user?.fullName || user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

const buildNotification = (userId, payload) => ({
  userId,
  title: payload.title,
  message: payload.message || payload.description || payload.title,
  description: payload.description || '',
  category: payload.category || 'System',
  priority: payload.priority || 'medium',
  actionUrl: payload.actionUrl || null,
  actionLabel: payload.actionLabel || null,
  details: payload.details || {}
});

const notifyUsers = async (users, payload) => {
  const userIds = uniqueIds(users.map((user) => user?._id || user));
  if (!userIds.length) return [];

  const docs = userIds.map((userId) => buildNotification(userId, payload));
  return Notification.insertMany(docs, { ordered: false });
};

const notifyRoles = async (roles, payload, extraQuery = {}) => {
  const users = await User.find({
    role: { $in: roles },
    isActive: true,
    ...extraQuery
  }).select('_id');

  return notifyUsers(users, payload);
};

const notifyUserById = async (userId, payload) => {
  if (!userId) return [];

  const query = mongoose.Types.ObjectId.isValid(String(userId))
    ? { _id: userId }
    : { employeeId: String(userId) };

  const user = await User.findOne(query).select('_id');
  return user ? notifyUsers([user], payload) : [];
};

const notifyUserByEmployeeId = async (employeeId, payload) => {
  if (!employeeId) return [];
  const user = await User.findOne({ employeeId: String(employeeId) }).select('_id');
  return user ? notifyUsers([user], payload) : [];
};

const notifyMeetingCreated = async (meeting) => {
  const departmentFilter = meeting.department && meeting.department !== 'All'
    ? { department: meeting.department }
    : {};

  const users = await User.find({
    isActive: true,
    $or: [
      { role: { $in: ['CEO', 'COO', 'Manager'] } },
      { role: { $in: ['Team Lead', 'Member'] }, ...departmentFilter }
    ]
  }).select('_id');

  return notifyUsers(users, {
    title: 'New Meeting Created',
    message: `${meeting.title} is scheduled for ${meeting.date} at ${meeting.time}`,
    description: meeting.description || `Meeting for ${meeting.department || 'all departments'}`,
    category: 'Meeting',
    priority: 'medium',
    actionUrl: '/meetings',
    actionLabel: 'View Meeting',
    details: {
      meetingTitle: meeting.title,
      department: meeting.department,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      createdBy: meeting.createdBy
    }
  });
};

const notifyLeaveRequested = async (leave) => {
  return notifyRoles(['CEO', 'COO'], {
    title: 'New Leave Request',
    message: `${leave.userName} requested ${leave.days} day(s) of ${leave.type} leave`,
    description: `${leave.startDate} to ${leave.endDate}`,
    category: 'Leave',
    priority: 'medium',
    actionUrl: '/leave',
    actionLabel: 'Review Leave',
    details: {
      employee: leave.userName,
      role: leave.userRole,
      department: leave.department,
      type: leave.type,
      days: leave.days,
      reason: leave.reason
    }
  });
};

const notifyLeaveDecision = async (leave) => {
  return notifyUserByEmployeeId(leave.employeeId, {
    title: `Leave ${leave.status}`,
    message: `Your ${leave.type} leave request has been ${leave.status.toLowerCase()}`,
    description: leave.comments || '',
    category: 'Leave',
    priority: leave.status === 'Rejected' ? 'high' : 'medium',
    actionUrl: '/leave',
    actionLabel: 'View Leave',
    details: {
      status: leave.status,
      startDate: leave.startDate,
      endDate: leave.endDate,
      approvedBy: (leave.approvedBy || []).join(', ')
    }
  });
};

const notifyResourceRequested = async (request) => {
  return notifyRoles(['CEO', 'COO'], {
    title: 'New Resource Request',
    message: `${request.requesterName} requested ${request.resourceName}`,
    description: request.reason,
    category: 'Resource',
    priority: request.priority || 'medium',
    actionUrl: '/resources',
    actionLabel: 'Review Request',
    details: {
      requester: request.requesterName,
      role: request.requesterRole,
      department: request.department,
      resource: request.resourceName,
      resourceType: request.resourceType,
      quantity: request.quantity
    }
  });
};

const notifyResourceDecision = async (request, status) => {
  return notifyUserById(request.requester, {
    title: `Resource Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
    message: `Your request for ${request.resourceName} has been ${status}`,
    description: request.reason,
    category: 'Resource',
    priority: status === 'rejected' ? 'high' : 'medium',
    actionUrl: '/resources',
    actionLabel: 'View Request',
    details: {
      status,
      resource: request.resourceName,
      resourceType: request.resourceType,
      quantity: request.quantity,
      decidedBy: request.approvedByName || request.rejectedByName
    }
  });
};

const notifyReportSubmitted = async (report) => {
  if (report.userRole !== 'Member') return [];

  return notifyRoles(['Team Lead'], {
    title: 'Department Report Submitted',
    message: `${report.userName} submitted a daily report`,
    description: report.completedTasks || report.ongoingWork || 'Daily report is ready for review',
    category: 'Report',
    priority: 'medium',
    actionUrl: '/reports',
    actionLabel: 'View Report',
    details: {
      employee: report.userName,
      department: report.department,
      date: report.date
    }
  }, { department: report.department });
};

const notifyMvpSubmitted = async (roadmap, submittedBy) => {
  return notifyRoles(['CEO', 'COO'], {
    title: 'MVP Roadmap Submitted',
    message: `${roadmap.title} has been submitted`,
    description: roadmap.description || '',
    category: 'Project',
    priority: 'high',
    actionUrl: '/reports',
    actionLabel: 'View MVP',
    details: {
      roadmap: roadmap.title,
      department: roadmap.department,
      submittedBy: getUserName(submittedBy)
    }
  });
};

const notifyTaskAssigned = async (task) => {
  if (!task.assignedTo) return [];

  return notifyUserById(task.assignedTo, {
    title: 'New Task Assigned',
    message: `You have been assigned "${task.title}"`,
    description: task.description || '',
    category: 'Task',
    priority: task.priority || 'medium',
    actionUrl: '/tasks',
    actionLabel: 'View Task',
    details: {
      task: task.title,
      department: task.department,
      dueDate: task.dueDate,
      priority: task.priority
    }
  });
};

module.exports = {
  notifyUsers,
  notifyRoles,
  notifyMeetingCreated,
  notifyLeaveRequested,
  notifyLeaveDecision,
  notifyResourceRequested,
  notifyResourceDecision,
  notifyReportSubmitted,
  notifyMvpSubmitted,
  notifyTaskAssigned
};
