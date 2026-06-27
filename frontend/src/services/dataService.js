// src/services/dataService.js
import api from './api';
import authService from './authService';

class DataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  // Helper method to get cached data
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Helper method to set cached data
  setCached(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // ==================== USER DATA ====================
  
  async getCurrentUser() {
    const cached = this.getCached('currentUser');
    if (cached) return cached;
    
    const result = await api.getCurrentUser();
    if (result.success) {
      this.setCached('currentUser', result.data);
      return result.data;
    }
    return null;
  }

  async updateUserProfile(userData) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return null;
    
    const result = await api.updateUser(currentUser.id, userData);
    if (result.success) {
      this.clearCache(); // Clear cache after update
      return result.data;
    }
    return null;
  }

  // ==================== EMPLOYEE DATA ====================
  
  async getAllEmployees(filters = {}) {
    const cacheKey = `employees_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const result = await api.getEmployees(filters);
    if (result.success) {
      this.setCached(cacheKey, result.data);
      return result.data;
    }
    return [];
  }

  async getEmployeeById(employeeId) {
    const result = await api.getEmployee(employeeId);
    if (result.success) {
      return result.data;
    }
    return null;
  }

  async createEmployee(employeeData) {
    const result = await api.createEmployee(employeeData);
    if (result.success) {
      this.clearCache(); // Clear cache after create
      return result.data;
    }
    return null;
  }

  async updateEmployee(employeeId, employeeData) {
    const result = await api.updateEmployee(employeeId, employeeData);
    if (result.success) {
      this.clearCache(); // Clear cache after update
      return result.data;
    }
    return null;
  }

  async deleteEmployee(employeeId) {
    const result = await api.deleteEmployee(employeeId);
    if (result.success) {
      this.clearCache(); // Clear cache after delete
      return true;
    }
    return false;
  }

  // Get employees by department
  async getEmployeesByDepartment(department) {
    const allEmployees = await this.getAllEmployees();
    return allEmployees.filter(emp => emp.department === department);
  }

  // Get employees by role
  async getEmployeesByRole(role) {
    const allEmployees = await this.getAllEmployees();
    return allEmployees.filter(emp => emp.role === role);
  }

  // ==================== TASK DATA ====================
  
  async getAllTasks(filters = {}) {
    const cacheKey = `tasks_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const result = await api.getTasks(filters);
    if (result.success) {
      this.setCached(cacheKey, result.data);
      return result.data;
    }
    return [];
  }

  async getMyTasks() {
    const cached = this.getCached('myTasks');
    if (cached) return cached;
    
    const result = await api.getMyTasks();
    if (result.success) {
      this.setCached('myTasks', result.data);
      return result.data;
    }
    return [];
  }

  async getTaskById(taskId) {
    const result = await api.getTask(taskId);
    if (result.success) {
      return result.data;
    }
    return null;
  }

  async createTask(taskData) {
    const result = await api.createTask(taskData);
    if (result.success) {
      this.clearCache(); // Clear cache after create
      return result.data;
    }
    return null;
  }

  async updateTask(taskId, taskData) {
    const result = await api.updateTask(taskId, taskData);
    if (result.success) {
      this.clearCache(); // Clear cache after update
      return result.data;
    }
    return null;
  }

  async updateTaskProgress(taskId, progress) {
    const result = await api.updateTaskProgress(taskId, progress);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  async updateTaskStatus(taskId, status) {
    const result = await api.updateTaskStatus(taskId, status);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  async deleteTask(taskId) {
    const result = await api.deleteTask(taskId);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  // Get tasks by status
  async getTasksByStatus(status) {
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => task.status === status);
  }

  // Get tasks assigned to specific employee
  async getTasksByAssignee(employeeId) {
    const allTasks = await this.getAllTasks();
    return allTasks.filter(task => task.assignedTo === employeeId);
  }

  // Get task statistics
  async getTaskStatistics() {
    const allTasks = await this.getAllTasks();
    return {
      total: allTasks.length,
      completed: allTasks.filter(t => t.status === 'Completed').length,
      inProgress: allTasks.filter(t => t.status === 'In progress').length,
      pending: allTasks.filter(t => t.status === 'Pending').length,
      overdue: allTasks.filter(t => t.status === 'Overdue').length,
      completionRate: allTasks.length ? 
        Math.round((allTasks.filter(t => t.status === 'Completed').length / allTasks.length) * 100) : 0
    };
  }

  // ==================== MEETING DATA ====================
  
  async getAllMeetings(filters = {}) {
    const cacheKey = `meetings_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const result = await api.getMeetings(filters);
    if (result.success) {
      this.setCached(cacheKey, result.data);
      return result.data;
    }
    return [];
  }

  async getMeetingById(meetingId) {
    const result = await api.getMeeting(meetingId);
    if (result.success) {
      return result.data;
    }
    return null;
  }

  async createMeeting(meetingData) {
    const result = await api.createMeeting(meetingData);
    if (result.success) {
      this.clearCache();
      return result.data;
    }
    return null;
  }

  async updateMeeting(meetingId, meetingData) {
    const result = await api.updateMeeting(meetingId, meetingData);
    if (result.success) {
      this.clearCache();
      return result.data;
    }
    return null;
  }

  async deleteMeeting(meetingId) {
    const result = await api.deleteMeeting(meetingId);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  // Get upcoming meetings
  async getUpcomingMeetings() {
    const allMeetings = await this.getAllMeetings();
    const today = new Date();
    return allMeetings.filter(meeting => new Date(meeting.date) >= today);
  }

  // Get meetings by department
  async getMeetingsByDepartment(department) {
    const allMeetings = await this.getAllMeetings();
    return allMeetings.filter(meeting => meeting.department === department || meeting.department === 'All');
  }

  // ==================== NOTIFICATION DATA ====================
  
  async getAllNotifications(filters = {}) {
    const cacheKey = `notifications_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const result = await api.getNotifications(filters);
    if (result.success) {
      this.setCached(cacheKey, result.data);
      return result.data;
    }
    return [];
  }

  async markNotificationRead(notificationId) {
    const result = await api.markNotificationRead(notificationId);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  async markAllNotificationsRead() {
    const result = await api.markAllNotificationsRead();
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  async deleteNotification(notificationId) {
    const result = await api.deleteNotification(notificationId);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  // Get unread notifications count
  async getUnreadNotificationsCount() {
    const notifications = await this.getAllNotifications();
    return notifications.filter(n => !n.read).length;
  }

  // Get notifications by category
  async getNotificationsByCategory(category) {
    const allNotifications = await this.getAllNotifications();
    return allNotifications.filter(n => n.category === category);
  }

  // ==================== RESOURCE DATA ====================
  
  async getAllResources() {
    const cached = this.getCached('resources');
    if (cached) return cached;
    
    const result = await api.getResources();
    if (result.success) {
      this.setCached('resources', result.data);
      return result.data;
    }
    return [];
  }

  async getAvailableResources() {
    const cached = this.getCached('availableResources');
    if (cached) return cached;
    
    const result = await api.getAvailableResources();
    if (result.success) {
      this.setCached('availableResources', result.data);
      return result.data;
    }
    return [];
  }

  async getResourceRequests(filters = {}) {
    const cacheKey = `resourceRequests_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const result = await api.getResourceRequests(filters);
    if (result.success) {
      this.setCached(cacheKey, result.data);
      return result.data;
    }
    return [];
  }

  async createResourceRequest(requestData) {
    const result = await api.createResourceRequest(requestData);
    if (result.success) {
      this.clearCache();
      return result.data;
    }
    return null;
  }

  async approveResourceRequest(requestId) {
    const result = await api.approveResourceRequest(requestId);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  async rejectResourceRequest(requestId, reason) {
    const result = await api.rejectResourceRequest(requestId, reason);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  // Get resource statistics
  async getResourceStatistics() {
    const resources = await this.getAllResources();
    const requests = await this.getResourceRequests();
    
    return {
      totalResources: resources.length,
      available: resources.filter(r => r.available > 0).length,
      inUse: resources.filter(r => r.available === 0).length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      approvedRequests: requests.filter(r => r.status === 'approved').length,
      rejectedRequests: requests.filter(r => r.status === 'rejected').length
    };
  }

  // ==================== PROJECT DATA ====================
  
  async getAllProjects(filters = {}) {
    const cacheKey = `projects_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const result = await api.getProjects(filters);
    if (result.success) {
      this.setCached(cacheKey, result.data);
      return result.data;
    }
    return [];
  }

  async getProjectById(projectId) {
    const result = await api.getProject(projectId);
    if (result.success) {
      return result.data;
    }
    return null;
  }

  async createProject(projectData) {
    const result = await api.createProject(projectData);
    if (result.success) {
      this.clearCache();
      return result.data;
    }
    return null;
  }

  async updateProject(projectId, projectData) {
    const result = await api.updateProject(projectId, projectData);
    if (result.success) {
      this.clearCache();
      return result.data;
    }
    return null;
  }

  async deleteProject(projectId) {
    const result = await api.deleteProject(projectId);
    if (result.success) {
      this.clearCache();
      return true;
    }
    return false;
  }

  // Get active projects
  async getActiveProjects() {
    const allProjects = await this.getAllProjects();
    return allProjects.filter(project => project.status === 'active');
  }

  // ==================== TEAM DATA ====================
  
  async getTeamMembers(filters = {}) {
    const cacheKey = `teamMembers_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const result = await api.getTeamMembers(filters);
    if (result.success) {
      this.setCached(cacheKey, result.data);
      return result.data;
    }
    return [];
  }

  async getTeamMemberById(memberId) {
    const result = await api.getTeamMember(memberId);
    if (result.success) {
      return result.data;
    }
    return null;
  }

  async getDepartments() {
    const cached = this.getCached('departments');
    if (cached) return cached;
    
    const result = await api.getDepartments();
    if (result.success) {
      this.setCached('departments', result.data);
      return result.data;
    }
    return [];
  }

  // Get team members by department
  async getTeamMembersByDepartment(department) {
    const allMembers = await this.getTeamMembers();
    return allMembers.filter(member => member.department === department);
  }

  // ==================== DASHBOARD DATA ====================
  
  async getDashboardData(role) {
    let result;
    switch(role) {
      case 'CEO':
        result = await api.getCEODashboard();
        break;
      case 'Manager':
      case 'COO':
        result = await api.getManagerDashboard();
        break;
      case 'Team Lead':
        result = await api.getTeamLeadDashboard();
        break;
      case 'Member':
        result = await api.getMemberDashboard();
        break;
      default:
        result = await api.getDashboardStats();
    }
    
    if (result.success) {
      return result.data;
    }
    return null;
  }

  async getDashboardStats() {
    const cached = this.getCached('dashboardStats');
    if (cached) return cached;
    
    const result = await api.getDashboardStats();
    if (result.success) {
      this.setCached('dashboardStats', result.data);
      return result.data;
    }
    return {
      totalEmployees: 0,
      activeProjects: 0,
      completedTasks: 0,
      pendingTasks: 0
    };
  }

  // ==================== ATTENDANCE DATA ====================
  
  async markAttendance(attendanceData) {
    const result = await api.markAttendance(attendanceData);
    if (result.success) {
      this.clearCache();
      return result.data;
    }
    return null;
  }

  async getAttendance(params = {}) {
    const cacheKey = `attendance_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const result = await api.getAttendance(params);
    if (result.success) {
      this.setCached(cacheKey, result.data);
      return result.data;
    }
    return [];
  }

  // ==================== CONFIGURATION DATA ====================
  
  async getWorkingHours() {
    const cached = this.getCached('workingHours');
    if (cached) return cached;
    
    const result = await api.getWorkingHours();
    if (result.success) {
      this.setCached('workingHours', result.data);
      return result.data;
    }
    return { start: '08:00', end: '23:59' };
  }

  async updateWorkingHours(hoursData) {
    const result = await api.updateWorkingHours(hoursData);
    if (result.success) {
      this.clearCache();
      return result.data;
    }
    return null;
  }
}

export default new DataService();
