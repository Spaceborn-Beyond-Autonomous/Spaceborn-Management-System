// src/services/automationService.js
// System Automation Core - Auto tracking, reports, notifications

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

export const automationService = {
  // ==================== AUTO ATTENDANCE TRACKING ====================
  
  // Mark attendance automatically
  autoMarkAttendance: async (userId, date, status = 'present') => {
    return apiRequest('/automation/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ userId, date, status, autoMarked: true }),
    });
  },
  
  // Get attendance for date range
  getAttendance: async (userId, startDate, endDate) => {
    return apiRequest(`/automation/attendance/${userId}?start=${startDate}&end=${endDate}`);
  },
  
  // Get attendance summary
  getAttendanceSummary: async (userId, month, year) => {
    return apiRequest(`/automation/attendance/summary/${userId}?month=${month}&year=${year}`);
  },
  
  // Auto calculate attendance percentage
  calculateAttendancePercentage: async (userId, month, year) => {
    return apiRequest(`/automation/attendance/percentage/${userId}?month=${month}&year=${year}`);
  },
  
  // ==================== AUTO REPORT GENERATION ====================
  
  // Generate daily report automatically
  generateDailyReport: async (userId, date) => {
    return apiRequest('/automation/reports/daily', {
      method: 'POST',
      body: JSON.stringify({ userId, date }),
    });
  },
  
  // Generate weekly report
  generateWeeklyReport: async (userId, weekStartDate) => {
    return apiRequest('/automation/reports/weekly', {
      method: 'POST',
      body: JSON.stringify({ userId, weekStartDate }),
    });
  },
  
  // Generate monthly report
  generateMonthlyReport: async (userId, month, year) => {
    return apiRequest('/automation/reports/monthly', {
      method: 'POST',
      body: JSON.stringify({ userId, month, year }),
    });
  },
  
  // Get auto-generated reports
  getAutoReports: async (userId, type, period) => {
    return apiRequest(`/automation/reports/${userId}?type=${type}&period=${period}`);
  },
  
  // ==================== AUTO PERFORMANCE CALCULATION ====================
  
  // Calculate performance metrics
  calculatePerformance: async (userId, period) => {
    return apiRequest(`/automation/performance/${userId}?period=${period}`);
  },
  
  // Get team performance
  getTeamPerformance: async (department, period) => {
    return apiRequest(`/automation/performance/team/${department}?period=${period}`);
  },
  
  // Calculate productivity score
  calculateProductivityScore: async (userId, startDate, endDate) => {
    return apiRequest('/automation/performance/productivity', {
      method: 'POST',
      body: JSON.stringify({ userId, startDate, endDate }),
    });
  },
  
  // ==================== AUTO EMAIL NOTIFICATIONS ====================
  
  // Send email notification
  sendEmail: async (to, subject, body, type) => {
    return apiRequest('/automation/email/send', {
      method: 'POST',
      body: JSON.stringify({ to, subject, body, type }),
    });
  },
  
  // Send bulk email
  sendBulkEmail: async (recipients, subject, body) => {
    return apiRequest('/automation/email/bulk', {
      method: 'POST',
      body: JSON.stringify({ recipients, subject, body }),
    });
  },
  
  // Send task assigned notification
  sendTaskAssignedEmail: async (taskId, assignee, assigner) => {
    return apiRequest('/automation/email/task-assigned', {
      method: 'POST',
      body: JSON.stringify({ taskId, assignee, assigner }),
    });
  },
  
  // Send task completed notification
  sendTaskCompletedEmail: async (taskId, completedBy, manager) => {
    return apiRequest('/automation/email/task-completed', {
      method: 'POST',
      body: JSON.stringify({ taskId, completedBy, manager }),
    });
  },
  
  // Send leave approved notification
  sendLeaveApprovedEmail: async (leaveId, employee, approver) => {
    return apiRequest('/automation/email/leave-approved', {
      method: 'POST',
      body: JSON.stringify({ leaveId, employee, approver }),
    });
  },
  
  // Send leave rejected notification
  sendLeaveRejectedEmail: async (leaveId, employee, approver, reason) => {
    return apiRequest('/automation/email/leave-rejected', {
      method: 'POST',
      body: JSON.stringify({ leaveId, employee, approver, reason }),
    });
  },
  
  // Send weekly report email
  sendWeeklyReportEmail: async (userId, weekData) => {
    return apiRequest('/automation/email/weekly-report', {
      method: 'POST',
      body: JSON.stringify({ userId, weekData }),
    });
  },
  
  // Send monthly evaluation email
  sendMonthlyEvaluationEmail: async (userId, monthData) => {
    return apiRequest('/automation/email/monthly-evaluation', {
      method: 'POST',
      body: JSON.stringify({ userId, monthData }),
    });
  },
  
  // Send attendance summary email
  sendAttendanceSummaryEmail: async (userId, monthData) => {
    return apiRequest('/automation/email/attendance-summary', {
      method: 'POST',
      body: JSON.stringify({ userId, monthData }),
    });
  },
  
  // Send performance alert email
  sendPerformanceAlertEmail: async (userId, alertData) => {
    return apiRequest('/automation/email/performance-alert', {
      method: 'POST',
      body: JSON.stringify({ userId, alertData }),
    });
  },
  
  // ==================== AUTO REMINDERS ====================
  
  // Create reminder
  createReminder: async (reminderData) => {
    return apiRequest('/automation/reminders', {
      method: 'POST',
      body: JSON.stringify(reminderData),
    });
  },
  
  // Get user reminders
  getUserReminders: async (userId) => {
    return apiRequest(`/automation/reminders/${userId}`);
  },
  
  // Mark reminder as sent
  markReminderSent: async (reminderId) => {
    return apiRequest(`/automation/reminders/${reminderId}/sent`, {
      method: 'PUT',
    });
  },
  
  // Send task deadline reminder
  sendTaskDeadlineReminder: async (taskId, userId) => {
    return apiRequest('/automation/reminders/task-deadline', {
      method: 'POST',
      body: JSON.stringify({ taskId, userId }),
    });
  },
  
  // Send pending task reminder
  sendPendingTasksReminder: async (userId) => {
    return apiRequest('/automation/reminders/pending-tasks', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },
  
  // ==================== AUTO SYNC ====================
  
  // Sync all data
  syncAllData: async () => {
    return apiRequest('/automation/sync', {
      method: 'POST',
    });
  },
  
  // Sync attendance data
  syncAttendance: async () => {
    return apiRequest('/automation/sync/attendance', {
      method: 'POST',
    });
  },
  
  // Sync reports
  syncReports: async () => {
    return apiRequest('/automation/sync/reports', {
      method: 'POST',
    });
  },
  
  // ==================== AUTO SCHEDULER ====================
  
  // Run daily scheduler
  runDailyScheduler: async () => {
    return apiRequest('/automation/scheduler/daily', {
      method: 'POST',
    });
  },
  
  // Run weekly scheduler
  runWeeklyScheduler: async () => {
    return apiRequest('/automation/scheduler/weekly', {
      method: 'POST',
    });
  },
  
  // Run monthly scheduler
  runMonthlyScheduler: async () => {
    return apiRequest('/automation/scheduler/monthly', {
      method: 'POST',
    });
  },
  
  // ==================== AUTO EVALUATIONS ====================
  
  // Generate monthly evaluation
  generateMonthlyEvaluation: async (userId, month, year) => {
    return apiRequest(`/automation/evaluation/monthly/${userId}?month=${month}&year=${year}`);
  },
  
  // Generate quarterly evaluation
  generateQuarterlyEvaluation: async (userId, quarter, year) => {
    return apiRequest(`/automation/evaluation/quarterly/${userId}?quarter=${quarter}&year=${year}`);
  },
  
  // Get evaluation history
  getEvaluationHistory: async (userId) => {
    return apiRequest(`/automation/evaluation/history/${userId}`);
  },
};

export default automationService;