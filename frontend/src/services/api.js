// src/services/api.js
import authService from './authService';
import { normalizeDepartments } from '../utils/departments';

class ApiService {
  constructor() {
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.USE_MOCK = process.env.REACT_APP_USE_MOCK_AUTH === 'true';
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const token = authService.getToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, config);
      
      // Handle unauthorized
      if (response.status === 401) {
        authService.clearSession();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return { success: true, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // If mock mode is enabled, return mock data
      if (this.USE_MOCK) {
        return this.getMockData(endpoint);
      }
      
      return { success: false, error: error.message };
    }
  }

  // ==================== AUTHENTICATION ENDPOINTS ====================
  
  async login(employeeId, password, rememberMe = false) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ employeeId, password, rememberMe }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // ==================== USER MANAGEMENT ENDPOINTS ====================
  
  async getUsers() {
    return this.request('/users');
  }

  async getUser(userId) {
    return this.request(`/users/${userId}`);
  }

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateUser(userId, userData) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return this.request(`/users/${userId}`, { method: 'DELETE' });
  }

  // ==================== EMPLOYEE MANAGEMENT ENDPOINTS ====================
  
  async getEmployees(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/employees${queryString ? `?${queryString}` : ''}`);
  }

  async getEmployee(employeeId) {
    return this.request(`/employees/${employeeId}`);
  }

  async createEmployee(employeeData) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(employeeId, employeeData) {
    return this.request(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(employeeId) {
    return this.request(`/employees/${employeeId}`, { method: 'DELETE' });
  }

  // ==================== TASK MANAGEMENT ENDPOINTS ====================
  
  async getTasks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tasks${queryString ? `?${queryString}` : ''}`);
  }

  async getTask(taskId) {
    return this.request(`/tasks/${taskId}`);
  }

  async getMyTasks() {
    return this.request('/tasks/my-tasks');
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId, taskData) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async updateTaskProgress(taskId, progress) {
    return this.request(`/tasks/${taskId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  async updateTaskStatus(taskId, status) {
    return this.request(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, { method: 'DELETE' });
  }

  // ==================== PROJECT MANAGEMENT ENDPOINTS ====================
  
  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects${queryString ? `?${queryString}` : ''}`);
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`);
  }

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId, projectData) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, { method: 'DELETE' });
  }

  // ==================== MEETING MANAGEMENT ENDPOINTS ====================
  
  async getMeetings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/meetings${queryString ? `?${queryString}` : ''}`);
  }

  async getMeeting(meetingId) {
    return this.request(`/meetings/${meetingId}`);
  }

  async createMeeting(meetingData) {
    return this.request('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  }

  async updateMeeting(meetingId, meetingData) {
    return this.request(`/meetings/${meetingId}`, {
      method: 'PUT',
      body: JSON.stringify(meetingData),
    });
  }

  async deleteMeeting(meetingId) {
    return this.request(`/meetings/${meetingId}`, { method: 'DELETE' });
  }

  // ==================== NOTIFICATION ENDPOINTS ====================
  
  async getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications${queryString ? `?${queryString}` : ''}`);
  }

  async markNotificationRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read', { method: 'PUT' });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, { method: 'DELETE' });
  }

  // ==================== RESOURCE MANAGEMENT ENDPOINTS ====================
  
  async getResources(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/resources${queryString ? `?${queryString}` : ''}`);
  }

  async getAvailableResources() {
    return this.request('/resources/available');
  }

  async getResourceRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/resources/requests${queryString ? `?${queryString}` : ''}`);
  }

  async createResourceRequest(requestData) {
    return this.request('/resources/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async approveResourceRequest(requestId) {
    return this.request(`/resources/requests/${requestId}/approve`, { method: 'PUT' });
  }

  async rejectResourceRequest(requestId, reason) {
    return this.request(`/resources/requests/${requestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== DASHBOARD ENDPOINTS ====================
  
  async getCEODashboard() {
    return this.request('/dashboard/ceo');
  }

  async getManagerDashboard() {
    return this.request('/dashboard/manager');
  }

  async getTeamLeadDashboard() {
    return this.request('/dashboard/team-lead');
  }

  async getMemberDashboard() {
    return this.request('/dashboard/member');
  }

  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // ==================== TEAM MANAGEMENT ENDPOINTS ====================
  
  async getTeamMembers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/team-members${queryString ? `?${queryString}` : ''}`);
  }

  async getTeamMember(memberId) {
    return this.request(`/team-members/${memberId}`);
  }

  async getDepartments() {
    const departments = await this.request('/departments');
    return normalizeDepartments(Array.isArray(departments) ? departments : []);
  }

  // ==================== ATTENDANCE ENDPOINTS ====================
  
  async markAttendance(attendanceData) {
    return this.request('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async getAttendance(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/attendance${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== CONFIGURATION ENDPOINTS ====================
  
  async getWorkingHours() {
    return this.request('/config/working-hours');
  }

  async updateWorkingHours(hoursData) {
    return this.request('/config/working-hours', {
      method: 'PUT',
      body: JSON.stringify(hoursData),
    });
  }

  // ==================== MOCK DATA FOR DEVELOPMENT ====================
  
  getMockData(endpoint) {
    const mockData = {
      '/auth/login': {
        token: 'mock-jwt-token',
        user: {
          id: 'EMP001',
          name: 'John Doe',
          role: 'CEO',
          department: 'Platform and DevOps',
          email: 'john.doe@spaceborn.com'
        }
      },
      '/employees': [
        { id: 1, name: 'John Doe', role: 'CEO', department: 'Platform and DevOps', email: 'john.doe@spaceborn.com', employeeId: 'CEO001' },
        { id: 2, name: 'Jane Smith', role: 'Manager', department: 'Platform and DevOps', email: 'jane.smith@spaceborn.com', employeeId: 'MGR001' },
        { id: 3, name: 'Mike Johnson', role: 'Team Lead', department: 'Core Systems', email: 'mike.johnson@spaceborn.com', employeeId: 'LD001' },
        { id: 4, name: 'Ravi Das', role: 'Member', department: 'Core Systems', email: 'ravi.das@spaceborn.com', employeeId: 'EMP001' }
      ],
      '/meetings': [
        { id: 1, title: 'Q2 Sprint Planning', department: 'Core Systems', date: '2026-06-10', time: '10:00 AM' },
        { id: 2, title: 'Hardware & Integration Review', department: 'Hardware & Integration', date: '2026-06-11', time: '2:00 PM' }
      ],
      '/notifications': [
        { id: 1, title: 'Task assigned to you', read: false, category: 'Task' },
        { id: 2, title: 'Meeting scheduled', read: true, category: 'Meeting' }
      ],
      '/tasks': [
        { id: 1, title: 'Complete login page', status: 'In progress', progress: 75 },
        { id: 2, title: 'API Integration', status: 'Pending', progress: 0 }
      ],
      '/dashboard/stats': {
        totalEmployees: 45,
        activeProjects: 12,
        completedTasks: 156,
        pendingTasks: 23
      }
    };

    // Find matching mock data
    for (const [key, value] of Object.entries(mockData)) {
      if (endpoint.startsWith(key)) {
        return { success: true, data: value };
      }
    }

    return { success: true, data: [] };
  }
}

export default new ApiService();
