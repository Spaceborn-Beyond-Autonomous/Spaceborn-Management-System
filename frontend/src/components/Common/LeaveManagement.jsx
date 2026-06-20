import React, { useState, useEffect } from 'react';
import { Calendar, Gift, Clock, Plus, X, Bell, Send } from 'lucide-react';
import employeeService from '../../services/employeeService';
import authService from '../../services/authService';

// Mock service for backend compatibility
const mockDataService = {
  getLeaveRequests: async () => {
    const saved = localStorage.getItem('mock_leave_requests');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, userId: 4, userName: 'Ravi Das', userRole: 'Member', department: 'Core Systems', employeeId: 'EMP001', startDate: '2026-06-15', endDate: '2026-06-17', days: 3, type: 'Sick', reason: 'Medical consultation', status: 'Pending', appliedOn: new Date().toISOString(), pendingApprovals: ['Manager', 'CEO'] },
      { id: 2, userId: 5, userName: 'Priya Sharma', userRole: 'Team Lead', department: 'Core Systems', employeeId: 'EMP002', startDate: '2026-06-20', endDate: '2026-06-22', days: 3, type: 'Annual', reason: 'Family vacation', status: 'Approved', appliedOn: new Date().toISOString(), approvedBy: ['Manager', 'CEO'] }
    ];
  },
  addLeaveRequest: async (leaveData) => {
    const leaves = await mockDataService.getLeaveRequests();
    const newLeave = {
      id: Date.now(),
      ...leaveData,
      appliedOn: new Date().toISOString(),
      status: leaveData.userRole === 'CEO' ? 'Approved' : 'Pending',
      approvedBy: leaveData.userRole === 'CEO' ? ['CEO'] : []
    };
    leaves.unshift(newLeave);
    localStorage.setItem('mock_leave_requests', JSON.stringify(leaves));
    return newLeave;
  },
  updateLeaveStatus: async (leaveId, status, approvedBy, comments) => {
    const leaves = await mockDataService.getLeaveRequests();
    const index = leaves.findIndex(l => l.id === leaveId);
    if (index !== -1) {
      leaves[index].status = status;
      leaves[index].approvedBy = [...(leaves[index].approvedBy || []), approvedBy];
      leaves[index].approvedOn = new Date().toISOString();
      leaves[index].comments = comments;
      localStorage.setItem('mock_leave_requests', JSON.stringify(leaves));
      return leaves[index];
    }
    throw new Error('Leave not found');
  },
  getHourBreaks: async () => {
    const saved = localStorage.getItem('mock_hour_breaks');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, userId: 4, userName: 'Ravi Das', userRole: 'Member', department: 'Core Systems', date: '2026-06-10', hours: 1.5, reason: 'Doctor appointment', status: 'pending', approvedBy: null },
      { id: 2, userId: 5, userName: 'Priya Sharma', userRole: 'Team Lead', department: 'Core Systems', date: '2026-06-12', hours: 1, reason: 'Bank visit', status: 'approved', approvedBy: 'John Doe' }
    ];
  },
  addHourBreak: async (breakData) => {
    const breaks = await mockDataService.getHourBreaks();
    const newBreak = { id: Date.now(), ...breakData, status: 'pending', approvedBy: null };
    breaks.push(newBreak);
    localStorage.setItem('mock_hour_breaks', JSON.stringify(breaks));
    return newBreak;
  },
  updateBreakStatus: async (breakId, status, approvedBy) => {
    const breaks = await mockDataService.getHourBreaks();
    const index = breaks.findIndex(b => b.id === breakId);
    if (index !== -1) {
      breaks[index].status = status;
      breaks[index].approvedBy = approvedBy;
      breaks[index].approvedOn = new Date().toISOString();
      localStorage.setItem('mock_hour_breaks', JSON.stringify(breaks));
      return breaks[index];
    }
    throw new Error('Break not found');
  },
  deleteHourBreak: async (breakId) => {
    const breaks = await mockDataService.getHourBreaks();
    const filtered = breaks.filter(b => b.id !== breakId);
    localStorage.setItem('mock_hour_breaks', JSON.stringify(filtered));
    return true;
  },
  getHolidays: async () => {
    const saved = localStorage.getItem('mock_holidays');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, name: 'Republic Day', date: '2026-01-26', description: 'National Holiday', isRecurring: true },
      { id: 2, name: 'Independence Day', date: '2026-08-15', description: 'National Holiday', isRecurring: true },
      { id: 3, name: 'Diwali', date: '2026-11-12', description: 'Festival Holiday', isRecurring: false }
    ];
  },
  addHoliday: async (holidayData) => {
    const holidays = await mockDataService.getHolidays();
    const newHoliday = { id: Date.now(), ...holidayData };
    holidays.push(newHoliday);
    localStorage.setItem('mock_holidays', JSON.stringify(holidays));
    return newHoliday;
  },
  sendBulkNotification: async (notification) => {
    console.log('📧 BULK NOTIFICATION SENT to ALL Employees:', notification);
    const notifications = JSON.parse(localStorage.getItem('mock_notifications') || '[]');
    notifications.push({ id: Date.now(), ...notification, sentAt: new Date().toISOString() });
    localStorage.setItem('mock_notifications', JSON.stringify(notifications));
    return true;
  },
  getAllEmployees: async () => {
    return [
      { id: 1, name: 'John Doe', role: 'CEO', department: 'Founding Team', email: 'john@spaceborn.com' },
      { id: 2, name: 'Jane Smith', role: 'Manager', department: 'Platform and DevOps', email: 'jane@spaceborn.com' },
      { id: 3, name: 'Mike Johnson', role: 'Team Lead', department: 'Core Systems', email: 'mike@spaceborn.com' },
      { id: 4, name: 'Ravi Das', role: 'Member', department: 'Core Systems', email: 'ravi@spaceborn.com' },
      { id: 5, name: 'Priya Sharma', role: 'Team Lead', department: 'Core Systems', email: 'priya@spaceborn.com' },
      { id: 6, name: 'Sita Krishnan', role: 'Team Lead', department: 'AI/LLM & Perception', email: 'sita@spaceborn.com' },
      { id: 7, name: 'Anil Mehta', role: 'Team Lead', department: 'Hardware & Integration', email: 'anil@spaceborn.com' }
    ];
  }
};

const LeaveManagement = ({ user, userRole, userDepartment }) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [breaks, setBreaks] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [showBreakForm, setShowBreakForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [breakToDelete, setBreakToDelete] = useState(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'Sick',
    reason: '',
    halfDay: false,
    halfDayType: 'first',
  });
  const [holidayData, setHolidayData] = useState({
    name: '',
    date: '',
    description: '',
    isRecurring: false
  });
  const [breakData, setBreakData] = useState({
    userId: '',
    date: '',
    hours: 1,
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [breakStats, setBreakStats] = useState({ pending: 0, approved: 0, total: 0 });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = authService.getCurrentUser();
    setCurrentUser(userData);
    fetchAllData();
  }, []);

  const showAlert = (message, isSuccess = true) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Keep mock employee list for the "Add Break" form dropdown
      const employeesList = await mockDataService.getAllEmployees();
      setEmployees(employeesList);

      // Leaves/holidays remain mock-based in this component.
      // Hour breaks must be fetched from backend so approval/rejection history is visible.
      const [leaves, holidaysList] = await Promise.all([
        mockDataService.getLeaveRequests(),
        mockDataService.getHolidays()
      ]);

      let breaksList = [];
      try {
        const loggedInUser = authService.getCurrentUser();
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const token = authService.getToken();
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        console.debug('[LeaveManagement] hour-breaks fetch start', {
          userRole,
          userDepartment,
          loggedInUserId: loggedInUser?.id,
          tokenPresent: !!token,
        });

        let url = '';
        if (userRole === 'Member' || userRole === 'Team Lead') {
          // backend expects a userId (stored as numeric userId), not _id
          url = `${API_BASE_URL}/hour-breaks/my/${loggedInUser?.id}`;
        } else {
          url = `${API_BASE_URL}/hour-breaks`;
        }

        const res = await fetch(url, { headers });
        const data = await res.json().catch(() => ({}));

        // normalize payload: backend wraps as { success, message, data }
        if (data && Array.isArray(data.data)) {
          breaksList = data.data;
        } else if (Array.isArray(data)) {
          breaksList = data;
        } else {
          breaksList = [];
        }

        console.debug('[LeaveManagement] hour-breaks result', { raw: data, normalizedCount: breaksList.length });
      } catch (e) {
        console.log('Using mock hour breaks due to API error:', e);
        breaksList = await mockDataService.getHourBreaks();
      }

      // Filter based on user role
      const loggedInUser = authService.getCurrentUser();
      let filteredLeaves = leaves;
      let filteredBreaks = breaksList;

      if (userRole === 'Manager') {
        // Keep leave department filtering as-is.
        filteredLeaves = leaves.filter(l => l.department === userDepartment);

        // Hour breaks: do NOT filter by department here.
        // This component previously ended up showing empty results across roles if `department`
        // field mapping differed between backend and UI.
        filteredBreaks = breaksList;
      } else if (userRole === 'Member' || userRole === 'Team Lead') {
        filteredLeaves = leaves.filter(l => l.userId === loggedInUser?.id);
        filteredBreaks = breaksList.filter(b => String(b.userId) === String(loggedInUser?.id));
      }


      setLeaveRequests(filteredLeaves);
      // IMPORTANT: ensure items have stable ids for action handlers
      const normalizedBreaks = (filteredBreaks || []).map((b, idx) => ({
        ...b,
        id: b.id ?? b._id ?? idx,
      }));
      setBreaks(normalizedBreaks);
      setHolidays(holidaysList);

      const pendingBreaks = normalizedBreaks.filter(b => b.status === 'pending').length;
      const approvedBreaks = normalizedBreaks.filter(b => b.status === 'approved').length;
      setBreakStats({ pending: pendingBreaks, approved: approvedBreaks, total: normalizedBreaks.length });
      setLeaveBalance({ Sick: 12, Casual: 10, Annual: 15, Emergency: 5, Other: 3 });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manager can apply for leave too
  const handleManagerLeave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = formData.halfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    try {
      await mockDataService.addLeaveRequest({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        department: user.department,
        employeeId: user.employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: days,
        type: formData.type,
        reason: formData.reason,
        halfDay: formData.halfDay,
        halfDayType: formData.halfDayType,
      });

      // Send notification to CEO
      await mockDataService.sendBulkNotification({
        title: '📋 Manager Leave Request',
        message: `${user.name} (${user.role}) has requested leave from ${formData.startDate} to ${formData.endDate}. Reason: ${formData.reason}`,
        type: 'leave_request',
        priority: 'high'
      });

      showAlert(`✅ Leave request submitted! CEO has been notified.`);
      setShowApplyForm(false);
      setFormData({ startDate: '', endDate: '', type: 'Sick', reason: '', halfDay: false, halfDayType: 'first' });
      await fetchAllData();
    } catch (error) {
      showAlert('❌ Failed to apply for leave.', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // CEO Leave - Auto Approved & Notified to ALL Employees
  const handleCEOLeave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = formData.halfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    try {
      await mockDataService.addLeaveRequest({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        department: user.department,
        employeeId: user.employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: days,
        type: formData.type,
        reason: formData.reason,
        halfDay: formData.halfDay,
        halfDayType: formData.halfDayType,
      });

      const employeeCount = employees.length;
      await mockDataService.sendBulkNotification({
        title: '📢 CEO Leave Announcement',
        message: `${user.name} (CEO) will be on leave from ${formData.startDate} to ${formData.endDate}. ${formData.halfDay ? '(Half Day)' : ''}\nReason: ${formData.reason}`,
        type: 'announcement',
        priority: 'high'
      });

      showAlert(`✅ CEO Leave approved! Notification sent to all ${employeeCount} employees.`);
      setShowApplyForm(false);
      setFormData({ startDate: '', endDate: '', type: 'Sick', reason: '', halfDay: false, halfDayType: 'first' });
      await fetchAllData();
    } catch (error) {
      showAlert('❌ Failed to apply for leave.', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Regular Employee Leave - Needs Manager Approval then CEO
  const handleEmployeeLeave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = formData.halfDay ? 0.5 : Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (leaveBalance && leaveBalance[formData.type] < days) {
      showAlert(`Insufficient ${formData.type} leave balance. Available: ${leaveBalance[formData.type]} days`, false);
      setIsSubmitting(false);
      return;
    }

    try {
      await mockDataService.addLeaveRequest({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        department: user.department,
        employeeId: user.employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: days,
        type: formData.type,
        reason: formData.reason,
        halfDay: formData.halfDay,
        halfDayType: formData.halfDayType,
      });

      // Notify manager
      await mockDataService.sendBulkNotification({
        title: '📋 New Leave Request',
        message: `${user.name} (${user.role}) has requested ${days} day(s) of ${formData.type} leave from ${formData.startDate} to ${formData.endDate}.`,
        type: 'leave_request',
        priority: 'normal'
      });

      showAlert(`✅ Leave request submitted! Your manager has been notified.`);
      setShowApplyForm(false);
      setFormData({ startDate: '', endDate: '', type: 'Sick', reason: '', halfDay: false, halfDayType: 'first' });
      await fetchAllData();
    } catch (error) {
      showAlert('❌ Failed to apply for leave.', false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getAuthHeaders = () => {
    const token = authService.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const apiPost = async (endpoint, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed');
    return data?.data ?? data;
  };

  const apiPut = async (endpoint, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed');
    return data?.data ?? data;
  };

  const apiDelete = async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed');
    return data?.data ?? data;
  };

  // Employee Hour Break Request (backend)
  const handleEmployeeBreakRequest = async (e) => {
    e.preventDefault();
    if (!breakData.date || !breakData.reason) {
      showAlert('Please fill all required fields', false);
      return;
    }

    try {
      await apiPost('/hour-breaks/apply', {
        userId: user.id,
        userName: user.name,
        employeeId: user.employeeId,
        userRole: user.role,
        department: user.department,
        date: breakData.date,
        hours: breakData.hours,
        reason: breakData.reason,
      });

      showAlert(`✅ Hour break request submitted!`);
      setShowBreakForm(false);
      setBreakData({ userId: '', date: '', hours: 1, reason: '' });
      await fetchAllData();
    } catch (error) {
      showAlert(`❌ Failed to submit break request. ${error.message || ''}`.trim(), false);
    }
  };

  // Manager adding break for team member (backend)
  const handleManagerAddBreak = async (e) => {
    e.preventDefault();
    if (!breakData.userId || !breakData.date || !breakData.reason) {
      showAlert('Please fill all required fields', false);
      return;
    }

      const employee = employees.find(emp => String(emp.id) === String(breakData.userId) || String(emp._id) === String(breakData.userId) || emp.employeeId === breakData.userId);
    if (!employee) {
      showAlert('Selected employee not found', false);
      return;
    }

    try {
      await apiPost('/hour-breaks/apply', {
        // backend expects numeric userId, but UI might hold Mongo _id strings
        // attempt numeric conversion; fallback to employee.id if provided.
        userId: Number.parseInt(employee.id ?? String(breakData.userId).replace(/\D/g, ''), 10),
        userName: employee.name,
        employeeId: employee.employeeId || String(employee.id),
        userRole: employee.role,
        department: employee.department,
        date: breakData.date,
        hours: breakData.hours,
        reason: breakData.reason,
      });

      showAlert(`✅ Hour break request submitted for ${employee.name}!`);
      setShowBreakForm(false);
      setBreakData({ userId: '', date: '', hours: 1, reason: '' });
      await fetchAllData();
    } catch (error) {
      showAlert(`❌ Failed to submit break request. ${error.message || ''}`.trim(), false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    const currentUserObj = authService.getCurrentUser();
    await mockDataService.updateLeaveStatus(leaveId, 'Approved', currentUserObj?.name, 'Approved');
    
    const approvedLeave = leaveRequests.find(l => l.id === leaveId);

    // Send notification to requester
    await mockDataService.sendBulkNotification({
      title: '✅ Leave Request Approved',
      message: `Your ${approvedLeave?.type} leave request has been approved by ${currentUserObj?.name}.`,
      type: 'leave_approved',
      priority: 'normal'
    });

    showAlert(`✅ Leave request approved!`);
    await fetchAllData();
  };

  const handleRejectLeave = async (leaveId) => {
    const comments = window.prompt('Reason for rejection:');
    if (!comments) return;
    const currentUserObj = authService.getCurrentUser();
    await mockDataService.updateLeaveStatus(leaveId, 'Rejected', currentUserObj?.name, comments);
    
    const rejectedLeave = leaveRequests.find(l => l.id === leaveId);
    
    // Send notification to requester
    await mockDataService.sendBulkNotification({
      title: '❌ Leave Request Rejected',
      message: `Your ${rejectedLeave?.type} leave request has been rejected by ${currentUserObj?.name}. Reason: ${comments}`,
      type: 'leave_rejected',
      priority: 'normal'
    });
    
    showAlert(`❌ Leave request rejected.`);
    await fetchAllData();
  };

  const handleApproveBreak = async (breakId) => {
    const currentUserObj = authService.getCurrentUser();
    try {
      await apiPut(`/hour-breaks/${breakId}/status`, {
        status: 'approved',
        approvedBy: currentUserObj?.name || currentUserObj?.fullName,
      });
      showAlert(`✅ Hour break approved!`);
      await fetchAllData();
    } catch (error) {
      showAlert(`❌ Failed to approve break. ${error.message || ''}`.trim(), false);
    }
  };

  const handleRejectBreak = async (breakId) => {
    const comments = window.prompt('Reason for rejection:');
    if (!comments) return;
    const currentUserObj = authService.getCurrentUser();
    try {
      await apiPut(`/hour-breaks/${breakId}/status`, {
        status: 'rejected',
        approvedBy: currentUserObj?.name || currentUserObj?.fullName,
        rejectionReason: comments,
      });
      showAlert(`❌ Hour break rejected.`);
      await fetchAllData();
    } catch (error) {
      showAlert(`❌ Failed to reject break. ${error.message || ''}`.trim(), false);
    }
  };

  const handleDeleteBreakClick = (breakId) => {
    setBreakToDelete(breakId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBreak = async () => {
    if (!breakToDelete) return;
    try {
      await apiDelete(`/hour-breaks/${breakToDelete}`);
      showAlert(`🗑️ Break request deleted.`);
      await fetchAllData();
      setShowDeleteConfirm(false);
      setBreakToDelete(null);
    } catch (error) {
      showAlert(`❌ Failed to delete break. ${error.message || ''}`.trim(), false);
    }
  };

  const handleDeclareHoliday = async (e) => {
    e.preventDefault();
    if (!holidayData.name || !holidayData.date) {
      showAlert('Please fill in holiday name and date', false);
      return;
    }
    await mockDataService.addHoliday(holidayData);
    await mockDataService.sendBulkNotification({
      title: '🎉 Holiday Announcement',
      message: `${holidayData.name} declared on ${holidayData.date}. Enjoy the day off!`
    });
    setShowHolidayForm(false);
    setHolidayData({ name: '', date: '', description: '', isRecurring: false });
    showAlert(`✅ Holiday declared! Notification sent to all employees.`);
    await fetchAllData();
  };

  const getStatusBadge = (request) => {
    if (request.status === 'Approved') return 'bg-green-100 text-green-800';
    if (request.status === 'Rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getBreakStatusBadge = (breakItem) => {
    if (breakItem.status === 'approved') return 'bg-green-100 text-green-800';
    if (breakItem.status === 'rejected') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const canApprove = () => userRole === 'CEO' || userRole === 'Manager';
  const isCEO = userRole === 'CEO';
  const isManager = userRole === 'Manager';
  const isEmployee = userRole === 'Member' || userRole === 'Team Lead';
  const loggedInUser = authService.getCurrentUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in bg-white rounded-lg shadow-lg border-l-4 border-green-500 p-4">
          <p className="text-sm text-gray-700">{notificationMessage}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h2>
            <p className="text-gray-600 mb-4">Are you sure you want to delete this break request?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={confirmDeleteBreak} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-black to-gray-800 px-6 py-5">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Leave Management System</h2>
              <p className="text-gray-300 text-sm mt-0.5">
                {isCEO ? 'CEO leave is auto-approved & notified to all employees' : 
                 isManager ? 'Manager can approve team leaves and request own leave to CEO' : 
                 'Request leave or hour break for manager approval'}
              </p>
            </div>
            <div className="flex gap-2">
              {isCEO && (
                <button onClick={() => { setShowApplyForm(!showApplyForm); setShowHolidayForm(false); setShowBreakForm(false); }} className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Take Leave (CEO)
                </button>
              )}
              {isManager && (
                <button onClick={() => { setShowApplyForm(!showApplyForm); setShowHolidayForm(false); setShowBreakForm(false); }} className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Request Leave
                </button>
              )}
              {isEmployee && (
                <button onClick={() => setShowApplyForm(!showApplyForm)} className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Apply Leave
                </button>
              )}
              {isEmployee && (
                <button onClick={() => setShowBreakForm(!showBreakForm)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Request Break
                </button>
              )}
              {(isCEO || isManager) && (
                <button onClick={() => { setShowBreakForm(!showBreakForm); setShowApplyForm(false); setShowHolidayForm(false); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Add Break
                </button>
              )}
              {isCEO && (
                <button onClick={() => { setShowHolidayForm(!showHolidayForm); setShowApplyForm(false); setShowBreakForm(false); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4" /> Declare Holiday
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CEO Leave Form */}
        {showApplyForm && isCEO && (
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Apply for Leave (CEO)</h3>
              <button onClick={() => setShowApplyForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleCEOLeave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required disabled={formData.halfDay} /></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.halfDay} onChange={(e) => setFormData({...formData, halfDay: e.target.checked})} /><span className="text-sm">Half Day</span></label>
                {formData.halfDay && (
                  <div className="flex gap-3">
                    <label><input type="radio" value="first" checked={formData.halfDayType === 'first'} onChange={(e) => setFormData({...formData, halfDayType: e.target.value})} /> First Half</label>
                    <label><input type="radio" value="second" checked={formData.halfDayType === 'second'} onChange={(e) => setFormData({...formData, halfDayType: e.target.value})} /> Second Half</label>
                  </div>
                )}
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="Sick">Sick Leave</option><option value="Casual">Casual Leave</option><option value="Annual">Annual Leave</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">Your leave will be <strong>auto-approved</strong> and a notification will be sent to <strong>ALL employees</strong> (Managers, Team Leads & Members).</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowApplyForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
                  <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit & Notify All'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manager Leave Form */}
        {showApplyForm && isManager && (
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Leave (Manager)</h3>
              <button onClick={() => setShowApplyForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleManagerLeave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required disabled={formData.halfDay} /></div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.halfDay} onChange={(e) => setFormData({...formData, halfDay: e.target.checked})} /><span className="text-sm">Half Day</span></label>
                {formData.halfDay && (
                  <div className="flex gap-3">
                    <label><input type="radio" value="first" checked={formData.halfDayType === 'first'} onChange={(e) => setFormData({...formData, halfDayType: e.target.value})} /> First Half</label>
                    <label><input type="radio" value="second" checked={formData.halfDayType === 'second'} onChange={(e) => setFormData({...formData, halfDayType: e.target.value})} /> Second Half</label>
                  </div>
                )}
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="Sick">Sick Leave</option><option value="Casual">Casual Leave</option><option value="Annual">Annual Leave</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-800">Your leave request will be sent to <strong>CEO for approval</strong>. CEO will be notified.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowApplyForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-black text-white rounded-lg flex items-center gap-2">
                  <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Employee Leave Form */}
        {showApplyForm && isEmployee && (
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Apply for Leave</h3>
              <button onClick={() => setShowApplyForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleEmployeeLeave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.halfDay} onChange={(e) => setFormData({...formData, halfDay: e.target.checked})} /><span className="text-sm">Half Day</span></label>
                {formData.halfDay && (
                  <div className="flex gap-3">
                    <label><input type="radio" value="first" checked={formData.halfDayType === 'first'} onChange={(e) => setFormData({...formData, halfDayType: e.target.value})} /> First Half</label>
                    <label><input type="radio" value="second" checked={formData.halfDayType === 'second'} onChange={(e) => setFormData({...formData, halfDayType: e.target.value})} /> Second Half</label>
                  </div>
                )}
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label><select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{leaveBalance && Object.entries(leaveBalance).map(([type, balance]) => (<option key={type} value={type}>{type} (Available: {balance})</option>))}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-blue-800">Your request needs approval from your Manager and CEO.</p></div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowApplyForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-black text-white rounded-lg">Submit Request</button></div>
            </form>
          </div>
        )}

        {/* Employee Break Request Form */}
        {showBreakForm && isEmployee && (
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Hour Break</h3>
              <button onClick={() => setShowBreakForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleEmployeeBreakRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={breakData.date} onChange={(e) => setBreakData({...breakData, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Hours *</label><select value={breakData.hours} onChange={(e) => setBreakData({...breakData, hours: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg"><option value={0.5}>0.5 hours</option><option value={1}>1 hour</option><option value={1.5}>1.5 hours</option><option value={2}>2 hours</option></select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label><textarea value={breakData.reason} onChange={(e) => setBreakData({...breakData, reason: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" required placeholder="Please provide a reason for your break request" /></div>
              <div className="bg-blue-50 p-3 rounded-lg"><p className="text-sm text-blue-800">Your break request will be sent to your Manager for approval.</p></div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowBreakForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-black text-white rounded-lg">Submit Request</button>
              </div>
            </form>
          </div>
        )}

        {/* Manager Add Break Form */}
        {showBreakForm && (isCEO || isManager) && !isEmployee && (
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Hour Break for Employee</h3>
              <button onClick={() => setShowBreakForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={isManager ? handleManagerAddBreak : handleManagerAddBreak} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <select value={breakData.userId} onChange={(e) => setBreakData({...breakData, userId: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">-- Select Employee --</option>
                  {employees.filter(emp => emp.role !== 'CEO' && (isCEO ? true : emp.department === userDepartment)).map(emp => (<option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={breakData.date} onChange={(e) => setBreakData({...breakData, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Hours</label><select value={breakData.hours} onChange={(e) => setBreakData({...breakData, hours: parseFloat(e.target.value)})} className="w-full px-3 py-2 border rounded-lg"><option value={0.5}>0.5 hours</option><option value={1}>1 hour</option><option value={2}>2 hours</option></select></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><textarea value={breakData.reason} onChange={(e) => setBreakData({...breakData, reason: e.target.value})} rows="2" className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowBreakForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Submit Request</button></div>
            </form>
          </div>
        )}

        {/* Declare Holiday Form */}
        {showHolidayForm && isCEO && (
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Declare Holiday</h3>
              <button onClick={() => setShowHolidayForm(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleDeclareHoliday} className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label><input type="text" value={holidayData.name} onChange={(e) => setHolidayData({...holidayData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={holidayData.date} onChange={(e) => setHolidayData({...holidayData, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required /></div><div className="flex items-end"><label className="flex items-center gap-2"><input type="checkbox" checked={holidayData.isRecurring} onChange={(e) => setHolidayData({...holidayData, isRecurring: e.target.checked})} /> Recurring Yearly</label></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={holidayData.description} onChange={(e) => setHolidayData({...holidayData, description: e.target.value})} rows="2" className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowHolidayForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">Declare Holiday</button></div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-6">
            <button onClick={() => setActiveTab('requests')} className={`py-3 text-sm font-medium ${activeTab === 'requests' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}>Leave Requests ({leaveRequests.length})</button>
            <button onClick={() => setActiveTab('breaks')} className={`py-3 text-sm font-medium ${activeTab === 'breaks' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}>Hour Breaks ({breaks.length})</button>
            <button onClick={() => setActiveTab('holidays')} className={`py-3 text-sm font-medium ${activeTab === 'holidays' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}>Holidays ({holidays.length})</button>
          </div>
        </div>

        {/* Break Statistics */}
        {activeTab === 'breaks' && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
            <div className="text-center p-3 bg-white rounded-lg border"><div className="text-2xl font-bold text-gray-900">{breakStats.total}</div><div className="text-xs text-gray-500">Total Requests</div></div>
            <div className="text-center p-3 bg-white rounded-lg border"><div className="text-2xl font-bold text-yellow-600">{breakStats.pending}</div><div className="text-xs text-gray-500">Pending</div></div>
            <div className="text-center p-3 bg-white rounded-lg border"><div className="text-2xl font-bold text-green-600">{breakStats.approved}</div><div className="text-xs text-gray-500">Approved</div></div>
          </div>
        )}

        {/* Hour Breaks Table */}
        {activeTab === 'breaks' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
              <tbody className="divide-y">
                {breaks.map(breakItem => (
                  <tr key={breakItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">{breakItem.userName?.charAt(0)}</div><span>{breakItem.userName}</span></div></td>
                    <td className="px-6 py-4 text-gray-600">{breakItem.department}</td>
                    <td className="px-6 py-4">{new Date(breakItem.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><span className="font-medium">{breakItem.hours} hr</span></td>
                    <td className="px-6 py-4 text-gray-600">{breakItem.reason}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getBreakStatusBadge(breakItem)}`}>{breakItem.status}</span></td>
                    <td className="px-6 py-4">
                      {breakItem.status === 'pending' && canApprove() && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveBreak(breakItem.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Approve</button>
                          <button onClick={() => handleRejectBreak(breakItem.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">Reject</button>
                          <button onClick={() => handleDeleteBreakClick(breakItem.id)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {breaks.length === 0 && <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">No hour break requests found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Leave Requests Table */}
        {activeTab === 'requests' && (
          <div className="divide-y">
            {leaveRequests.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No leave requests found.</div>
            ) : (
              leaveRequests.map((request) => (
                <div key={request.id} className="p-5 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold">{request.userName?.charAt(0)}</div>
                        <div><p className="font-semibold">{request.type} Leave • {request.days} days</p>{canApprove() && <p className="text-sm text-gray-500">{request.userName} • {request.employeeId}</p>}</div>
                        <span className={`ml-auto px-2 py-1 text-xs rounded-full ${getStatusBadge(request)}`}>{request.status}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                        <div>📅 From: {new Date(request.startDate).toLocaleDateString()}</div>
                        <div>📅 To: {new Date(request.endDate).toLocaleDateString()}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm"><span className="font-medium">Reason:</span> {request.reason}</p>
                        <p className="text-xs text-gray-400 mt-1">Applied on: {new Date(request.appliedOn).toLocaleString()}</p>
                        {request.approvedBy && request.approvedBy.length > 0 && <p className="text-xs text-green-600 mt-1">Approved by: {request.approvedBy.join(', ')}</p>}
                      </div>
                    </div>
                    {canApprove() && request.status === 'Pending' && (
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => handleApproveLeave(request.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">Approve</button>
                        <button onClick={() => handleRejectLeave(request.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Holidays Tab */}
        {activeTab === 'holidays' && (
          <div className="divide-y">
            {holidays.map(holiday => (
              <div key={holiday.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                <div><p className="font-medium text-gray-900">{holiday.name}</p><p className="text-sm text-gray-500">{new Date(holiday.date).toLocaleDateString()}</p></div>
                {holiday.isRecurring && <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Recurring</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;