// src/services/employeeService.js
import authService from './authService';
import { DEPARTMENTS, normalizeDepartment, normalizeDepartmentFields, normalizeDepartments } from '../utils/departments';

class EmployeeService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.useMockData = process.env.REACT_APP_USE_MOCK_AUTH === 'true';
  }

  // Mock data for development
  getMockEmployees() {
    return [
      { id: 1, name: 'John Doe', role: 'CEO', department: 'Platform and DevOps', email: 'john.doe@spaceborn.com', employeeId: 'CEO001', phone: '+1 (555) 000-0001', joinDate: '2020-01-15', status: 'Active', manager: 'N/A' },
      { id: 2, name: 'Jane Smith', role: 'Manager', department: 'Platform and DevOps', email: 'jane.smith@spaceborn.com', employeeId: 'MGR001', phone: '+1 (555) 000-0002', joinDate: '2020-03-20', status: 'Active', manager: 'John Doe' },
      { id: 3, name: 'Mike Johnson', role: 'Team Lead', department: 'Core Systems', email: 'mike.johnson@spaceborn.com', employeeId: 'LD001', phone: '+1 (555) 000-0003', joinDate: '2021-02-10', status: 'Active', manager: 'Jane Smith' },
      { id: 4, name: 'Ravi Das', role: 'Member', department: 'Core Systems', email: 'ravi.das@spaceborn.com', employeeId: 'EMP001', phone: '+1 (555) 000-0004', joinDate: '2022-06-01', status: 'Active', manager: 'Mike Johnson' },
      { id: 5, name: 'Priya Sharma', role: 'Member', department: 'Core Systems', email: 'priya.sharma@spaceborn.com', employeeId: 'EMP002', phone: '+1 (555) 000-0005', joinDate: '2022-08-15', status: 'Active', manager: 'Mike Johnson' },
      { id: 6, name: 'Sita Krishnan', role: 'Member', department: 'AI/LLM & Perception', email: 'sita.krishnan@spaceborn.com', employeeId: 'EMP003', phone: '+1 (555) 000-0006', joinDate: '2023-01-10', status: 'Active', manager: 'Jane Smith' },
      { id: 7, name: 'Anil Mehta', role: 'Member', department: 'Hardware & Integration', email: 'anil.mehta@spaceborn.com', employeeId: 'EMP004', phone: '+1 (555) 000-0007', joinDate: '2023-03-15', status: 'Active', manager: 'Jane Smith' },
      { id: 8, name: 'Sarah Williams', role: 'Team Lead', department: 'Robotics & Simulation', email: 'sarah.williams@spaceborn.com', employeeId: 'LD002', phone: '+1 (555) 000-0008', joinDate: '2021-05-20', status: 'Active', manager: 'Jane Smith' },
      { id: 9, name: 'David Brown', role: 'Member', department: 'Robotics & Simulation', email: 'david.brown@spaceborn.com', employeeId: 'EMP005', phone: '+1 (555) 000-0009', joinDate: '2022-09-01', status: 'Active', manager: 'Sarah Williams' },
      { id: 10, name: 'Emily Davis', role: 'Member', department: 'Robotics & Simulation', email: 'emily.davis@spaceborn.com', employeeId: 'EMP006', phone: '+1 (555) 000-0010', joinDate: '2023-03-15', status: 'Active', manager: 'Sarah Williams' },
      { id: 11, name: 'Alex Chen', role: 'Member', department: 'Core Systems', email: 'alex.chen@spaceborn.com', employeeId: 'EMP007', phone: '+1 (555) 000-0011', joinDate: '2023-01-10', status: 'Active', manager: 'Mike Johnson' },
      { id: 12, name: 'Nisha Kumar', role: 'Member', department: 'Platform and DevOps', email: 'nisha.kumar@spaceborn.com', employeeId: 'EMP008', phone: '+1 (555) 000-0012', joinDate: '2022-11-15', status: 'Active', manager: 'Jane Smith' }
    ];
  }

  getMockDepartments() {
    return DEPARTMENTS;
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

  // Generic API request method with mock fallback
  async apiRequest(endpoint, options = {}) {
    // If using mock data, return mock responses
    if (this.useMockData) {
      console.log(`[MOCK] API Request to ${endpoint}`);
      return this.getMockResponse(endpoint, options);
    }

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
      
      if (response.status === 401) {
        authService.clearSession();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return normalizeDepartmentFields(data?.data ?? data?.employees ?? data);
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      // Fallback to mock data on error
      return this.getMockResponse(endpoint, options);
    }
  }

  // Get mock response based on endpoint
  getMockResponse(endpoint, options) {
    const employees = this.getMockEmployees();
    const departments = this.getMockDepartments();

    if (endpoint === '/employees' || endpoint.startsWith('/employees?')) {
      return employees;
    }
    
    if (endpoint.includes('/employees/departments')) {
      return departments;
    }
    
    if (endpoint.includes('/employees/stats')) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      return {
        total: employees.length,
        active: employees.filter(e => e.status === 'Active').length,
        departments: departments.length,
        newThisMonth: employees.filter(e => {
          const joinDate = new Date(e.joinDate);
          return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
        }).length,
        departmentList: departments,
        roleDistribution: [
          { role: 'CEO', count: employees.filter(e => e.role === 'CEO').length },
          { role: 'Manager', count: employees.filter(e => e.role === 'Manager').length },
          { role: 'Team Lead', count: employees.filter(e => e.role === 'Team Lead').length },
          { role: 'Member', count: employees.filter(e => e.role === 'Member').length }
        ]
      };
    }
    
    if (endpoint.includes('/employees/department/')) {
      const dept = endpoint.split('/department/')[1];
      return employees.filter(e => e.department === decodeURIComponent(dept));
    }
    
    if (endpoint.includes('/employees/role/')) {
      const role = endpoint.split('/role/')[1];
      return employees.filter(e => e.role === role);
    }
    
    if (endpoint.match(/\/employees\/\d+$/)) {
      const id = parseInt(endpoint.split('/').pop());
      return employees.find(e => e.id === id) || null;
    }
    
    if (options.method === 'POST' && endpoint === '/employees') {
      const body = JSON.parse(options.body);
      const newEmployee = { id: employees.length + 1, ...body };
      return newEmployee;
    }
    
    if (options.method === 'PUT' && endpoint.includes('/employees/')) {
      const id = parseInt(endpoint.split('/').pop());
      const body = JSON.parse(options.body);
      return { id, ...body };
    }
    
    return employees;
  }

  // ==================== EMPLOYEE CRUD OPERATIONS ====================

  async getAllEmployees(filters = {}) {
    const cacheKey = `all_employees_${JSON.stringify(filters)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const url = `/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const data = await this.apiRequest(url);
    
    const normalizedData = normalizeDepartmentFields(data);
    this.setCached(cacheKey, normalizedData);
    return normalizedData;
  }

  async getEmployeeById(id) {
    if (!id) return null;
    
    const cacheKey = `employee_${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/employees/${id}`);
    this.setCached(cacheKey, data);
    return data;
  }

  async getEmployeeByEmail(email) {
    if (!email) return null;
    
    const cacheKey = `employee_email_${email}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/employees/email/${encodeURIComponent(email)}`);
    this.setCached(cacheKey, data);
    return data;
  }

  async getEmployeeByEmployeeId(employeeId) {
    if (!employeeId) return null;
    
    const cacheKey = `employee_empid_${employeeId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/employees/employee-id/${employeeId}`);
    this.setCached(cacheKey, data);
    return data;
  }

  async createEmployee(employeeData) {
    if (!employeeData || !employeeData.name || !employeeData.email || !employeeData.role) {
      throw new Error('Name, email, and role are required');
    }
    
    const data = await this.apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify({
        ...employeeData,
        createdAt: new Date().toISOString(),
        status: employeeData.status || 'Active',
        leaveBalance: employeeData.leaveBalance || {
          Sick: 12,
          Casual: 10,
          Annual: 15,
          Emergency: 5,
          Other: 3
        }
      })
    });
    
    this.clearCache();
    return data;
  }

  async addEmployee(employeeData) {
    return this.createEmployee(employeeData);
  }

  async updateEmployee(id, employeeData) {
    if (!id) throw new Error('Employee ID is required');
    
    const data = await this.apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...employeeData,
        updatedAt: new Date().toISOString()
      })
    });
    
    this.clearCache();
    return data;
  }

  async deleteEmployee(id) {
    if (!id) throw new Error('Employee ID is required');
    
    const data = await this.apiRequest(`/employees/${id}`, {
      method: 'DELETE'
    });
    
    this.clearCache();
    return data;
  }

  async uploadEmployeeDocument(id, file, documentType, googleAccessToken) {
    if (!id) throw new Error('Employee ID is required');
    if (!file) throw new Error('Document file is required');
    if (!documentType) throw new Error('Document type is required');

    const token = authService.getToken();
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    if (googleAccessToken) {
      formData.append('googleAccessToken', googleAccessToken);
    }

    const response = await fetch(`${this.API_BASE_URL}/employees/${id}/documents`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(googleAccessToken && { 'X-Google-Access-Token': googleAccessToken })
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Upload failed with status ${response.status}`);
    }

    this.clearCache();
    return normalizeDepartmentFields(data?.data?.employee ?? data?.employee ?? data);
  }

  // ==================== EMPLOYEE QUERIES ====================

  async getEmployeesByDepartment(department) {
    if (!department) return [];
    
    const cacheKey = `employees_department_${department}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const normalizedDepartment = normalizeDepartment(department);
    const data = await this.apiRequest(`/employees/department/${encodeURIComponent(normalizedDepartment)}`);
    const normalizedData = normalizeDepartmentFields(data);
    this.setCached(cacheKey, normalizedData);
    return normalizedData;
  }

  async getEmployeesByRole(role) {
    if (!role) return [];
    
    const cacheKey = `employees_role_${role}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/employees/role/${role}`);
    this.setCached(cacheKey, data);
    return data;
  }

  async getEmployeesByManager(managerId) {
    if (!managerId) return [];
    
    const cacheKey = `employees_manager_${managerId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/employees/manager/${managerId}`);
    this.setCached(cacheKey, data);
    return data;
  }

  async getEmployeesByStatus(status) {
    if (!status) return [];
    return this.getAllEmployees({ status });
  }

  async getMyTeam() {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || !currentUser.id) return [];
    return this.getEmployeesByManager(currentUser.id);
  }

  // ==================== DEPARTMENT QUERIES ====================

  async getAllDepartments() {
    const cacheKey = 'all_departments';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest('/employees/departments');
    const departments = normalizeDepartments(Array.isArray(data) ? data : DEPARTMENTS);
    this.setCached(cacheKey, departments);
    return departments;
  }

  async getDepartmentStats() {
    const cacheKey = 'department_stats';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const employees = await this.getAllEmployees();
    const departments = DEPARTMENTS;
    
    const stats = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      return {
        name: dept,
        total: deptEmployees.length,
        active: deptEmployees.filter(emp => emp.status === 'Active').length,
        managers: deptEmployees.filter(emp => emp.role === 'Manager' || emp.role === 'Team Lead').length,
        members: deptEmployees.filter(emp => emp.role === 'Member').length
      };
    });
    
    this.setCached(cacheKey, stats);
    return stats;
  }

  // ==================== EMPLOYEE STATISTICS ====================

  async getEmployeeStats() {
    const cacheKey = 'employee_stats';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const data = await this.apiRequest('/employees/stats');
      this.setCached(cacheKey, data);
      return data;
    } catch (error) {
      const employees = await this.getAllEmployees();
      const stats = this.calculateStats(employees);
      this.setCached(cacheKey, stats);
      return stats;
    }
  }

  calculateStats(employees) {
    const departments = DEPARTMENTS;
    const roles = [...new Set(employees.map(emp => emp.role).filter(Boolean))];
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return {
      total: employees.length,
      active: employees.filter(emp => emp.status === 'Active').length,
      inactive: employees.filter(emp => emp.status === 'Inactive').length,
      onLeave: employees.filter(emp => emp.status === 'On Leave').length,
      terminated: employees.filter(emp => emp.status === 'Terminated').length,
      departments: departments.length,
      departmentList: departments,
      roles: roles.length,
      roleList: roles,
      newThisMonth: employees.filter(emp => {
        const joinDate = new Date(emp.joinDate);
        return joinDate.getMonth() === currentMonth && 
               joinDate.getFullYear() === currentYear;
      }).length,
      departmentDistribution: departments.map(dept => ({
        department: dept,
        count: employees.filter(emp => emp.department === dept).length
      }))
    };
  }

  // ==================== LEAVE BALANCE METHODS ====================

  async getLeaveBalance(employeeId) {
    if (!employeeId) return null;
    
    const cacheKey = `leave_balance_${employeeId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    try {
      const data = await this.apiRequest(`/employees/${employeeId}/leave-balance`);
      this.setCached(cacheKey, data);
      return data;
    } catch (error) {
      const defaultBalance = { Sick: 12, Casual: 10, Annual: 15, Emergency: 5, Other: 3 };
      return defaultBalance;
    }
  }

  async updateLeaveBalance(employeeId, leaveType, days) {
    if (!employeeId) throw new Error('Employee ID is required');
    if (!leaveType) throw new Error('Leave type is required');
    if (!days || days <= 0) throw new Error('Days must be positive');
    
    const data = await this.apiRequest(`/employees/${employeeId}/leave-balance`, {
      method: 'PATCH',
      body: JSON.stringify({ leaveType, days })
    });
    
    this.clearCache(`leave_balance_${employeeId}`);
    return data;
  }

  // ==================== SEARCH & FILTER ====================

  async searchEmployees(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return [];
    
    const cacheKey = `employees_search_${searchTerm.toLowerCase()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    const data = await this.apiRequest(`/employees/search?q=${encodeURIComponent(searchTerm)}`);
    this.setCached(cacheKey, data);
    return data;
  }

  async getEmployeesWithFilters(filters = {}) {
    return this.getAllEmployees(filters);
  }

  // ==================== DASHBOARD SPECIFIC ====================

  async getEmployeesForDashboard() {
    const employees = await this.getAllEmployees();
    const departments = await this.getAllDepartments();
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const newThisMonth = employees.filter(emp => {
      const joinDate = new Date(emp.joinDate);
      return joinDate.getMonth() === currentMonth && 
             joinDate.getFullYear() === currentYear;
    }).length;
    
    const terminatedCount = employees.filter(emp => emp.status === 'Terminated').length;
    const activeCount = employees.filter(emp => emp.status === 'Active').length;
    
    const departmentProgress = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      return {
        name: dept,
        members: deptEmployees.length,
        progress: 0
      };
    });
    
    return {
      totalMembers: employees.length,
      departments: departments.length,
      activeCount,
      newThisMonth,
      terminatedCount,
      departmentProgress,
      employeesByDepartment: departmentProgress
    };
  }
}

export default new EmployeeService();
