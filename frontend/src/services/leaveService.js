// src/services/leaveService.js
// Backend-compatible version - works with any REST API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper for API calls
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

// Mock data storage for development (when backend is not available)
let mockHolidays = JSON.parse(localStorage.getItem('mock_holidays') || '[]');
let mockHourBreaks = JSON.parse(localStorage.getItem('mock_hour_breaks') || '[]');

const saveMockData = () => {
  localStorage.setItem('mock_holidays', JSON.stringify(mockHolidays));
  localStorage.setItem('mock_hour_breaks', JSON.stringify(mockHourBreaks));
};

// Initialize mock data if empty
if (mockHolidays.length === 0) {
  mockHolidays = [
    { id: 1, name: 'Republic Day', date: '2026-01-26', description: 'National Holiday', isRecurring: true },
    { id: 2, name: 'Independence Day', date: '2026-08-15', description: 'National Holiday', isRecurring: true },
    { id: 3, name: 'Gandhi Jayanti', date: '2026-10-02', description: 'National Holiday', isRecurring: true },
    { id: 4, name: 'Diwali', date: '2026-11-12', description: 'Festival Holiday', isRecurring: false },
  ];
  saveMockData();
}

export const leaveService = {
  // ==================== LEAVE REQUESTS ====================
  
  // Apply for leave
  applyLeave: async (requestData) => {
    try {
      return await apiRequest('/leaves', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
    } catch (error) {
      // Fallback for development
      console.log('Using mock applyLeave');
      const newRequest = {
        id: Date.now(),
        ...requestData,
        createdAt: new Date().toISOString(),
      };
      return newRequest;
    }
  },

  // Get all leave requests for a user
  getUserRequests: async (userId) => {
    try {
      return await apiRequest(`/leaves/user/${userId}`);
    } catch (error) {
      console.log('Using mock getUserRequests');
      return [];
    }
  },

  // Get requests by department (for managers)
  getRequestsByDepartment: async (department) => {
    try {
      return await apiRequest(`/leaves/department/${encodeURIComponent(department)}`);
    } catch (error) {
      console.log('Using mock getRequestsByDepartment');
      return [];
    }
  },

  // Get all requests (for CEO)
  getAllRequests: async () => {
    try {
      return await apiRequest('/leaves');
    } catch (error) {
      console.log('Using mock getAllRequests');
      return [];
    }
  },

  // Get pending requests for a specific approver role
  getPendingRequestsForApprover: async (role, department = null) => {
    try {
      let url = `/leaves/pending/${role}`;
      if (department) {
        url += `?department=${encodeURIComponent(department)}`;
      }
      return await apiRequest(url);
    } catch (error) {
      console.log('Using mock getPendingRequestsForApprover');
      return [];
    }
  },

  // Update request status (approve/reject with two-level approval)
  updateRequestStatus: async (requestId, action, comments, approvedBy) => {
    try {
      return await apiRequest(`/leaves/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          action,
          comments,
          approvedBy,
        }),
      });
    } catch (error) {
      console.log('Using mock updateRequestStatus');
      return { success: true };
    }
  },

  // Get pending requests for approval (legacy method - kept for compatibility)
  getPendingRequests: async (department = null) => {
    try {
      let url = '/leaves/pending/all';
      if (department) {
        url += `?department=${encodeURIComponent(department)}`;
      }
      return await apiRequest(url);
    } catch (error) {
      console.log('Using mock getPendingRequests');
      return [];
    }
  },

  // Get leave balance for a user
  getLeaveBalance: async (userId) => {
    try {
      return await apiRequest(`/leaves/balance/${userId}`);
    } catch (error) {
      console.log('Using mock getLeaveBalance');
      return {
        Sick: 12,
        Casual: 10,
        Annual: 15,
        Emergency: 5,
        Other: 3,
      };
    }
  },

  // Get leave statistics for dashboard
  getLeaveStatistics: async (department = null) => {
    try {
      let url = '/leaves/statistics';
      if (department) {
        url += `?department=${encodeURIComponent(department)}`;
      }
      return await apiRequest(url);
    } catch (error) {
      console.log('Using mock getLeaveStatistics');
      return {
        pending: 3,
        approved: 15,
        rejected: 2,
        totalDays: 45
      };
    }
  },

  // Get leave requests by date range
  getRequestsByDateRange: async (startDate, endDate, department = null) => {
    try {
      let url = `/leaves/date-range?start=${startDate}&end=${endDate}`;
      if (department) {
        url += `&department=${encodeURIComponent(department)}`;
      }
      return await apiRequest(url);
    } catch (error) {
      console.log('Using mock getRequestsByDateRange');
      return [];
    }
  },

  // Get leave requests by status
  getRequestsByStatus: async (status, department = null) => {
    try {
      let url = `/leaves/status/${status}`;
      if (department) {
        url += `?department=${encodeURIComponent(department)}`;
      }
      return await apiRequest(url);
    } catch (error) {
      console.log('Using mock getRequestsByStatus');
      return [];
    }
  },

  // Cancel a leave request (only if pending)
  cancelLeaveRequest: async (requestId) => {
    try {
      return await apiRequest(`/leaves/${requestId}/cancel`, {
        method: 'POST',
      });
    } catch (error) {
      console.log('Using mock cancelLeaveRequest');
      return { success: true };
    }
  },

  // Get leave summary for a user (yearly)
  getLeaveSummary: async (userId, year = null) => {
    try {
      let url = `/leaves/summary/${userId}`;
      if (year) {
        url += `?year=${year}`;
      }
      return await apiRequest(url);
    } catch (error) {
      console.log('Using mock getLeaveSummary');
      return {
        totalTaken: 8,
        remaining: 17,
        breakdown: {
          Sick: 2,
          Casual: 3,
          Annual: 3,
          Emergency: 0,
          Other: 0
        }
      };
    }
  },

  // ==================== HOLIDAYS ====================
  
  // Get all holidays
  getHolidays: async () => {
    try {
      return await apiRequest('/holidays');
    } catch (error) {
      console.log('Using mock getHolidays');
      return mockHolidays;
    }
  },

  // Add a new holiday
  addHoliday: async (holidayData) => {
    try {
      return await apiRequest('/holidays', {
        method: 'POST',
        body: JSON.stringify(holidayData),
      });
    } catch (error) {
      console.log('Using mock addHoliday');
      const newHoliday = { id: Date.now(), ...holidayData };
      mockHolidays.push(newHoliday);
      saveMockData();
      return newHoliday;
    }
  },

  // Update a holiday
  updateHoliday: async (holidayId, holidayData) => {
    try {
      return await apiRequest(`/holidays/${holidayId}`, {
        method: 'PUT',
        body: JSON.stringify(holidayData),
      });
    } catch (error) {
      console.log('Using mock updateHoliday');
      const index = mockHolidays.findIndex(h => h.id === holidayId);
      if (index !== -1) {
        mockHolidays[index] = { ...mockHolidays[index], ...holidayData };
        saveMockData();
        return mockHolidays[index];
      }
      throw new Error('Holiday not found');
    }
  },

  // Delete a holiday
  deleteHoliday: async (holidayId) => {
    try {
      return await apiRequest(`/holidays/${holidayId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.log('Using mock deleteHoliday');
      mockHolidays = mockHolidays.filter(h => h.id !== holidayId);
      saveMockData();
      return { success: true };
    }
  },

  // ==================== HOUR BREAKS ====================
  
  // Get all hour breaks
  getHourBreaks: async () => {
    try {
      return await apiRequest('/hour-breaks');
    } catch (error) {
      console.log('Using mock getHourBreaks');
      return mockHourBreaks;
    }
  },

  // Get hour breaks for a specific user
  getUserHourBreaks: async (userId) => {
    try {
      return await apiRequest(`/hour-breaks/user/${userId}`);
    } catch (error) {
      console.log('Using mock getUserHourBreaks');
      return mockHourBreaks.filter(b => b.userId === userId);
    }
  },

  // Add an hour break
  addHourBreak: async (breakData) => {
    try {
      return await apiRequest('/hour-breaks', {
        method: 'POST',
        body: JSON.stringify(breakData),
      });
    } catch (error) {
      console.log('Using mock addHourBreak');
      const newBreak = { 
        id: Date.now(), 
        ...breakData, 
        createdAt: new Date().toISOString(),
        status: 'approved'
      };
      mockHourBreaks.push(newBreak);
      saveMockData();
      return newBreak;
    }
  },

  // Update an hour break
  updateHourBreak: async (breakId, breakData) => {
    try {
      return await apiRequest(`/hour-breaks/${breakId}`, {
        method: 'PUT',
        body: JSON.stringify(breakData),
      });
    } catch (error) {
      console.log('Using mock updateHourBreak');
      const index = mockHourBreaks.findIndex(b => b.id === breakId);
      if (index !== -1) {
        mockHourBreaks[index] = { ...mockHourBreaks[index], ...breakData };
        saveMockData();
        return mockHourBreaks[index];
      }
      throw new Error('Break not found');
    }
  },

  // Delete an hour break
  deleteHourBreak: async (breakId) => {
    try {
      return await apiRequest(`/hour-breaks/${breakId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.log('Using mock deleteHourBreak');
      mockHourBreaks = mockHourBreaks.filter(b => b.id !== breakId);
      saveMockData();
      return { success: true };
    }
  },

  // Get break statistics
  getBreakStatistics: async (department = null) => {
    try {
      let url = '/hour-breaks/statistics';
      if (department) {
        url += `?department=${encodeURIComponent(department)}`;
      }
      return await apiRequest(url);
    } catch (error) {
      console.log('Using mock getBreakStatistics');
      return {
        totalBreaks: mockHourBreaks.length,
        totalHours: mockHourBreaks.reduce((sum, b) => sum + (b.hours || 0), 0),
        averageBreakTime: 1.5
      };
    }
  },
};

export default leaveService;