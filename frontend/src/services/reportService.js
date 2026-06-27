// src/services/reportService.js
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
  
  const data = await response.json();
  return data.data || data;
};

export const reportService = {
  submitReport: async (reportData) => {
    return apiRequest('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  getTodayReport: async (userId) => {
    try {
      return await apiRequest(`/reports/user/${userId}/today`);
    } catch (e) {
      return null;
    }
  },

  getUserReports: async (userId) => {
    return apiRequest(`/reports/user/${userId}`);
  },

  getReportsByDepartment: async (department) => {
    return apiRequest(`/reports/department/${encodeURIComponent(department)}`);
  },

  getAllReports: async () => {
    return apiRequest('/reports');
  },

  updateReport: async (reportId, updatedData) => {
    return apiRequest(`/reports/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData),
    });
  },

  deleteReport: async (reportId) => {
    return apiRequest(`/reports/${reportId}`, {
      method: 'DELETE',
    });
  },

  getComplianceReport: async (department = null) => {
    let url = '/reports/compliance';
    if (department) url += `?department=${encodeURIComponent(department)}`;
    try {
      return await apiRequest(url);
    } catch (e) {
      return { submittedThisMonth: 0, expectedThisMonth: 22, percentage: 0, streak: 0 };
    }
  },
};

export default reportService;