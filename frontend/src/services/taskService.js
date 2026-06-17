// src/services/taskService.js
import authService from './authService';

class TaskService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
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

  // Clear specific cache or all cache
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Generic API request method
  async apiRequest(endpoint, options = {}) {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(`${this.API_BASE_URL}${endpoint}`, config);
      
      // Handle unauthorized
      if (response.status === 401) {
        authService.clearSession();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      // Handle no content responses
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== TASK CRUD OPERATIONS ====================

  // Get all tasks with optional filters
  async getAllTasks(filters = {}) {
    const cacheKey = `all_tasks_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const data = await this.apiRequest(url);
    
    this.setCached(cacheKey, data);
    return data;
  }

  // Get task by ID
  async getTaskById(id) {
    if (!id) return null;
    
    const cacheKey = `task_${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/tasks/${id}`);
    this.setCached(cacheKey, data);
    return data;
  }

  // Create new task
  async createTask(taskData) {
    if (!taskData || !taskData.title) {
      throw new Error('Task title is required');
    }
    
    const data = await this.apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...taskData,
        createdAt: new Date().toISOString(),
        status: taskData.status || 'Pending',
        progress: taskData.progress || 0
      })
    });
    
    this.clearCache(); // Clear all cache since task list changed
    return data;
  }

  // Update task
  async updateTask(id, taskData) {
    if (!id) throw new Error('Task ID is required');
    
    const data = await this.apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...taskData,
        updatedAt: new Date().toISOString()
      })
    });
    
    this.clearCache(); // Clear all cache since task data changed
    return data;
  }

  // Update task progress
  async updateTaskProgress(id, progress) {
    if (!id) throw new Error('Task ID is required');
    if (progress < 0 || progress > 100) throw new Error('Progress must be between 0 and 100');
    
    const data = await this.apiRequest(`/tasks/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress })
    });
    
    this.clearCache();
    return data;
  }

  // Update task status
  async updateTaskStatus(id, status) {
    if (!id) throw new Error('Task ID is required');
    
    const validStatuses = ['Pending', 'In progress', 'Completed', 'Overdue', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    const data = await this.apiRequest(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    
    this.clearCache();
    return data;
  }

  // Delete task
  async deleteTask(id) {
    if (!id) throw new Error('Task ID is required');
    
    const data = await this.apiRequest(`/tasks/${id}`, {
      method: 'DELETE'
    });
    
    this.clearCache();
    return data;
  }

  // ==================== TASK QUERIES BY RELATION ====================

  // Get tasks by assignee
  async getTasksByAssignee(assigneeId) {
    if (!assigneeId) return [];
    
    const cacheKey = `tasks_assignee_${assigneeId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/tasks/assignee/${assigneeId}`);
    this.setCached(cacheKey, data);
    return data;
  }

  // Get my tasks (assigned to current user)
  async getMyTasks() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.id) return [];
    
    return this.getTasksByAssignee(currentUser.id);
  }

  // Get tasks by department
  async getTasksByDepartment(department) {
    if (!department) return [];
    
    const cacheKey = `tasks_department_${department}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/tasks/department/${encodeURIComponent(department)}`);
    this.setCached(cacheKey, data);
    return data;
  }

  // Get tasks by status
  async getTasksByStatus(status) {
    return this.getAllTasks({ status });
  }

  // Get tasks by priority
  async getTasksByPriority(priority) {
    const validPriorities = ['high', 'medium', 'low', 'High', 'Medium', 'Low'];
    if (!validPriorities.includes(priority)) {
      throw new Error(`Invalid priority: ${priority}`);
    }
    return this.getAllTasks({ priority });
  }

  // Get tasks by creator
  async getTasksByCreator(creatorId) {
    if (!creatorId) return [];
    
    const cacheKey = `tasks_creator_${creatorId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/tasks/creator/${creatorId}`);
    this.setCached(cacheKey, data);
    return data;
  }

  // ==================== DUE DATE FILTERS ====================

  // Get overdue tasks
  async getOverdueTasks() {
    const allTasks = await this.getAllTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdue = allTasks.filter(task => {
      if (task.status === 'Completed') return false;
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    });
    
    return overdue;
  }

  // Get tasks due today
  async getTasksDueToday() {
    const allTasks = await this.getAllTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueToday = allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate < tomorrow && task.status !== 'Completed';
    });
    
    return dueToday;
  }

  // Get tasks due this week
  async getTasksDueThisWeek() {
    const allTasks = await this.getAllTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const dueThisWeek = allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= endOfWeek && task.status !== 'Completed';
    });
    
    return dueThisWeek;
  }

  // ==================== TASK STATISTICS ====================

  // Get task statistics from API
  async getTaskStats() {
    try {
      const data = await this.apiRequest('/tasks/stats');
      return data;
    } catch (error) {
      console.error('Error fetching task stats:', error);
      // Fallback to calculating from all tasks
      const allTasks = await this.getAllTasks();
      return this.calculateStats(allTasks);
    }
  }

  // Calculate statistics from tasks array
  calculateStats(tasks) {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      inProgress: tasks.filter(t => t.status === 'In progress').length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      overdue: tasks.filter(t => t.status === 'Overdue' || 
        (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed')).length,
      highPriority: tasks.filter(t => t.priority === 'high' || t.priority === 'High').length,
      mediumPriority: tasks.filter(t => t.priority === 'medium' || t.priority === 'Medium').length,
      lowPriority: tasks.filter(t => t.priority === 'low' || t.priority === 'Low').length,
      completionRate: tasks.length ? 
        Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0,
      averageProgress: tasks.length ? 
        Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / tasks.length) : 0
    };
  }

  // Get user's task statistics
  async getMyTaskStats() {
    const myTasks = await this.getMyTasks();
    return this.calculateStats(myTasks);
  }

  // Get tasks by date range
  async getTasksByDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    return this.getAllTasks({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }

  // ==================== TASK ACTIONS ====================

  // Mark task as completed
  async completeTask(id) {
    return this.updateTaskStatus(id, 'Completed');
  }

  // Mark task as in progress
  async startTask(id) {
    return this.updateTaskStatus(id, 'In progress');
  }

  // Mark task as pending
  async pendingTask(id) {
    return this.updateTaskStatus(id, 'Pending');
  }

  // Assign task to employee
  async assignTask(id, assigneeId, assigneeName = null) {
    if (!id) throw new Error('Task ID is required');
    if (!assigneeId) throw new Error('Assignee ID is required');
    
    const task = await this.getTaskById(id);
    if (!task) throw new Error('Task not found');
    
    return this.updateTask(id, { 
      assignedTo: assigneeId,
      assignedToName: assigneeName,
      status: 'Pending'
    });
  }

  // ==================== DAILY LOGS ====================

  // Add daily log to task
  async addDailyLog(taskId, logData) {
    if (!taskId) throw new Error('Task ID is required');
    if (!logData || !logData.content) throw new Error('Log content is required');
    
    const data = await this.apiRequest(`/tasks/${taskId}/logs`, {
      method: 'POST',
      body: JSON.stringify({
        ...logData,
        createdAt: new Date().toISOString()
      })
    });
    
    this.clearCache(`task_${taskId}`);
    return data;
  }

  // Get daily logs for task
  async getDailyLogs(taskId) {
    if (!taskId) return [];
    
    const cacheKey = `task_logs_${taskId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/tasks/${taskId}/logs`);
    this.setCached(cacheKey, data);
    return data;
  }

  // Get my daily logs for today
  async getMyDailyLogs() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return [];
    
    const today = new Date().toISOString().split('T')[0];
    const allLogs = await this.apiRequest('/tasks/my-logs');
    return allLogs.filter(log => log.date === today || new Date(log.createdAt).toISOString().split('T')[0] === today);
  }

  // ==================== TASK COMMENTS ====================

  // Add comment to task
  async addComment(taskId, comment) {
    if (!taskId) throw new Error('Task ID is required');
    if (!comment) throw new Error('Comment is required');
    
    const currentUser = authService.getCurrentUser();
    const data = await this.apiRequest(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({
        comment,
        author: currentUser?.name || 'Unknown',
        authorId: currentUser?.id,
        timestamp: new Date().toISOString()
      })
    });
    
    this.clearCache(`task_${taskId}`);
    return data;
  }

  // Get task comments
  async getTaskComments(taskId) {
    if (!taskId) return [];
    
    const cacheKey = `task_comments_${taskId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/tasks/${taskId}/comments`);
    this.setCached(cacheKey, data);
    return data;
  }

  // ==================== SEARCH & FILTER ====================

  // Search tasks
  async searchTasks(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return [];
    
    const cacheKey = `tasks_search_${searchTerm.toLowerCase()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/tasks/search?q=${encodeURIComponent(searchTerm)}`);
    this.setCached(cacheKey, data);
    return data;
  }

  // Get tasks with advanced filters
  async getTasksWithFilters(filters = {}) {
    return this.getAllTasks(filters);
  }

  // ==================== BULK OPERATIONS ====================

  // Bulk update task status
  async bulkUpdateStatus(taskIds, status) {
    if (!taskIds || taskIds.length === 0) throw new Error('Task IDs are required');
    
    const data = await this.apiRequest('/tasks/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({ taskIds, status })
    });
    
    this.clearCache();
    return data;
  }

  // Bulk delete tasks
  async bulkDeleteTasks(taskIds) {
    if (!taskIds || taskIds.length === 0) throw new Error('Task IDs are required');
    
    const data = await this.apiRequest('/tasks/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ taskIds })
    });
    
    this.clearCache();
    return data;
  }

  // ==================== EXPORT METHODS ====================

  // Export tasks to CSV
  async exportToCSV(filters = {}) {
    const tasks = await this.getTasksWithFilters(filters);
    
    if (!tasks || tasks.length === 0) {
      return '';
    }
    
    const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Progress', 'Created At'];
    const rows = tasks.map(task => [
      task.id || '',
      `"${(task.title || '').replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""').substring(0, 100)}"`,
      task.status || '',
      task.priority || '',
      task.assignedToName || task.assignedTo || '',
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
      `${task.progress || 0}%`,
      task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    return csvContent;
  }

  // ==================== REFRESH METHODS ====================

  // Refresh all task data
  async refreshAllTasks() {
    this.clearCache();
    return this.getAllTasks();
  }

  // Refresh single task
  async refreshTask(taskId) {
    if (!taskId) return null;
    
    this.clearCache(`task_${taskId}`);
    return this.getTaskById(taskId);
  }

  // ==================== DASHBOARD SPECIFIC ====================

  // Get tasks for CEO dashboard
  async getTasksForDashboard() {
    const allTasks = await this.getAllTasks();
    
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const tasksThisWeek = allTasks.filter(t => {
      const taskDate = new Date(t.createdAt || t.updatedAt);
      return taskDate >= oneWeekAgo;
    });
    
    const tasksThisWeekCompleted = tasksThisWeek.filter(t => t.status === 'Completed');
    const tasksThisWeekPercentage = tasksThisWeek.length > 0 
      ? Math.round((tasksThisWeekCompleted.length / tasksThisWeek.length) * 100)
      : 0;
    
    const overdueTasks = allTasks.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    }).length;
    
    return {
      tasksThisWeek: tasksThisWeekPercentage,
      overdueTasks,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.status === 'Completed').length,
      inProgressTasks: allTasks.filter(t => t.status === 'In progress').length
    };
  }
}

export default new TaskService();