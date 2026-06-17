// src/services/authService.js

class AuthService {
  constructor() {
    // Configuration from environment variables
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.SESSION_TIMEOUT = parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 8 * 60 * 60 * 1000; // 8 hours
    this.TOKEN_REFRESH_THRESHOLD = parseInt(process.env.REACT_APP_TOKEN_REFRESH_THRESHOLD) || 60 * 60 * 1000; // 1 hour
    this.MAX_LOGIN_ATTEMPTS = parseInt(process.env.REACT_APP_MAX_LOGIN_ATTEMPTS) || 5;
    this.LOCKOUT_DURATION = parseInt(process.env.REACT_APP_LOCKOUT_DURATION) || 15 * 60 * 1000; // 15 minutes
    this.USE_MOCK = process.env.REACT_APP_USE_MOCK_AUTH === 'true'; // Mock mode flag
    
    // Track login attempts
    this.loginAttempts = 0;
    this.lockoutUntil = null;
    
    // Mock password reset requests (for Manager approval workflow)
    this.mockResetRequests = [];
    
    // Mock user database (Employee ID based)
    this.mockUsers = {
      'CEO001': { 
        id: 1,
        employeeId: 'CEO001',
        password: 'admin123',
        name: 'John Doe',
        role: 'CEO',
        department: 'Executive',
        email: 'john.doe@spaceborn.com',
        phone: '+1 555 000 0001',
        joinDate: '2020-01-01',
        status: 'Active',
        manager: 'Board'
      },
      'MGR001': { 
        id: 2,
        employeeId: 'MGR001',
        password: 'manager123',
        name: 'Jane Smith',
        role: 'Manager',
        department: 'Operations',
        email: 'jane.smith@spaceborn.com',
        phone: '+1 555 000 0002',
        joinDate: '2021-03-15',
        status: 'Active',
        manager: 'John Doe'
      },
      'LD001': { 
        id: 3,
        employeeId: 'LD001',
        password: 'lead123',
        name: 'Mike Johnson',
        role: 'Team Lead',
        department: 'Engineering',
        email: 'mike.johnson@spaceborn.com',
        phone: '+1 555 000 0003',
        joinDate: '2022-01-10',
        status: 'Active',
        manager: 'Jane Smith'
      },
      'EMP001': { 
        id: 4,
        employeeId: 'EMP001',
        password: 'member123',
        name: 'Ravi Das',
        role: 'Member',
        department: 'Engineering',
        email: 'ravi.das@spaceborn.com',
        phone: '+91 98765 43213',
        joinDate: '2024-01-05',
        status: 'Active',
        manager: 'Mike Johnson'
      },
      'EMP002': { 
        id: 5,
        employeeId: 'EMP002',
        password: 'member123',
        name: 'Priya Sharma',
        role: 'Member',
        department: 'Engineering',
        email: 'priya.sharma@spaceborn.com',
        phone: '+91 98765 43210',
        joinDate: '2023-01-15',
        status: 'Active',
        manager: 'Mike Johnson'
      },
      'EMP003': { 
        id: 6,
        employeeId: 'EMP003',
        password: 'member123',
        name: 'Nisha Kumar',
        role: 'Member',
        department: 'Engineering',
        email: 'nisha.kumar@spaceborn.com',
        phone: '+91 98765 43214',
        joinDate: '2023-08-12',
        status: 'Active',
        manager: 'Mike Johnson'
      },
      'HR001': { 
        id: 7,
        employeeId: 'HR001',
        password: 'hr123',
        name: 'Neha Gupta',
        role: 'HR',
        department: 'HR',
        email: 'neha.gupta@spaceborn.com',
        phone: '+91 98765 43215',
        joinDate: '2022-06-01',
        status: 'Active',
        manager: 'Jane Smith'
      }
    };
    
    // Bind methods
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.resetEmployeePassword = this.resetEmployeePassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.getActiveSessions = this.getActiveSessions.bind(this);
    this.getLoginHistory = this.getLoginHistory.bind(this);
    this.forceLogout = this.forceLogout.bind(this);
    this.getActiveSessionsCount = this.getActiveSessionsCount.bind(this);
    this.getUserSessions = this.getUserSessions.bind(this);
    
    // NEW: Password Reset Approval Workflow Methods
    this.requestPasswordReset = this.requestPasswordReset.bind(this);
    this.getPendingResetRequests = this.getPendingResetRequests.bind(this);
    this.approveResetRequest = this.approveResetRequest.bind(this);
    this.rejectResetRequest = this.rejectResetRequest.bind(this);
    this.getResetRequestStats = this.getResetRequestStats.bind(this);
    this.hasPendingResetRequest = this.hasPendingResetRequest.bind(this);
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Get token from localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Get user from localStorage
  getUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.clearSession();
        return null;
      }
    }
    return null;
  }

  // Store session data
  setSession(user, token, rememberMe = false) {
    const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : this.SESSION_TIMEOUT; // 30 days if remember me
    
    if (token) {
      localStorage.setItem('authToken', token);
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userSession', JSON.stringify({
        ...user,
        isAuthenticated: true,
        timestamp: Date.now(),
        sessionDuration,
        rememberMe
      }));
    }
  }

  // Clear session data
  clearSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userSession');
    localStorage.removeItem('rememberedEmployeeId');
  }

  // Check if account is locked
  isAccountLocked() {
    if (this.lockoutUntil && Date.now() < this.lockoutUntil) {
      const remainingMinutes = Math.ceil((this.lockoutUntil - Date.now()) / 60000);
      return { locked: true, remainingMinutes };
    }
    return { locked: false };
  }

  // Reset login attempts
  resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockoutUntil = null;
  }

  // Generate random password
  generateRandomPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Mock login for development without backend (Employee ID based)
  async mockLogin(employeeId, password, rememberMe = false) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = this.mockUsers[employeeId.toUpperCase()];
    
    if (user && user.password === password) {
      this.resetLoginAttempts();
      
      const { password: _, ...userWithoutPassword } = user;
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmployeeId', employeeId);
      } else {
        localStorage.removeItem('rememberedEmployeeId');
      }
      
      const mockToken = 'mock-jwt-token-' + Date.now();
      this.setSession(userWithoutPassword, mockToken, rememberMe);
      
      return {
        success: true,
        user: userWithoutPassword,
        message: 'Login successful (Mock Mode)'
      };
    }
    
    this.loginAttempts++;
    
    if (this.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      this.lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
      return {
        success: false,
        error: `Too many failed attempts. Account locked for ${this.LOCKOUT_DURATION / 60000} minutes.`
      };
    }
    
    const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - this.loginAttempts;
    return {
      success: false,
      error: `Invalid Employee ID or Password. ${remainingAttempts} attempts remaining.`
    };
  }

  // Login user with Employee ID
  async login(employeeId, password, rememberMe = false) {
    if (this.USE_MOCK) {
      console.log('Using mock authentication (Employee ID based)');
      return await this.mockLogin(employeeId, password, rememberMe);
    }
    
    if (!employeeId || !password) {
      return { success: false, error: 'Employee ID and password are required' };
    }

    const lockStatus = this.isAccountLocked();
    if (lockStatus.locked) {
      return { 
        success: false, 
        error: `Too many failed attempts. Account locked for ${lockStatus.remainingMinutes} minutes.` 
      };
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/test-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId: employeeId.toUpperCase().trim(), 
          password, 
          rememberMe 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.loginAttempts++;
        
        if (this.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
          this.lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
          throw new Error(`Too many failed attempts. Account locked for ${this.LOCKOUT_DURATION / 60000} minutes.`);
        }
        
        const remainingAttempts = this.MAX_LOGIN_ATTEMPTS - this.loginAttempts;
        switch (response.status) {
          case 401:
            throw new Error(`Invalid Employee ID or Password. ${remainingAttempts} attempts remaining.`);
          case 403:
            throw new Error('Account is locked. Please contact your manager.');
          case 429:
            throw new Error('Too many login attempts. Please try again later.');
          default:
            throw new Error(data.message || 'Login failed');
        }
      }

      this.resetLoginAttempts();

      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmployeeId', employeeId);
      } else {
        localStorage.removeItem('rememberedEmployeeId');
      }

      this.setSession(data.user, data.token, rememberMe);

      return { 
        success: true, 
        user: data.user,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get remembered employee ID
  getRememberedEmployeeId() {
    return localStorage.getItem('rememberedEmployeeId') || '';
  }

  // Mock logout
  async mockLogout() {
    this.clearSession();
    return { success: true };
  }

  // Logout user
  async logout() {
    if (this.USE_MOCK) {
      return await this.mockLogout();
    }
    
    const token = this.getToken();
    
    try {
      if (token) {
        await fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        }).catch(err => console.error('Logout API error:', err));
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  // Mock verify token
  async mockVerifyToken() {
    const session = localStorage.getItem('userSession');
    if (session) {
      const sessionData = JSON.parse(session);
      const sessionAge = Date.now() - sessionData.timestamp;
      const timeout = sessionData.rememberMe ? sessionData.sessionDuration : this.SESSION_TIMEOUT;
      
      if (sessionAge >= timeout) {
        this.clearSession();
        return { success: false, error: 'Session expired' };
      }
      
      return { success: true, user: sessionData };
    }
    return { success: false, error: 'No session found' };
  }

  // Verify token and get user data
  async verifyToken() {
    if (this.USE_MOCK) {
      return await this.mockVerifyToken();
    }
    
    const token = this.getToken();
    
    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const sessionAge = Date.now() - sessionData.timestamp;
        const timeout = sessionData.rememberMe ? sessionData.sessionDuration : this.SESSION_TIMEOUT;
        
        if (sessionAge >= timeout) {
          this.clearSession();
          return { success: false, error: 'Session expired' };
        }
      } catch (error) {
        console.error('Session parsing error:', error);
        this.clearSession();
        return { success: false, error: 'Invalid session data' };
      }
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearSession();
          throw new Error('Session expired. Please login again');
        }
        throw new Error(data.message || 'Token verification failed');
      }

      if (data.user) {
        const currentSession = JSON.parse(localStorage.getItem('userSession') || '{}');
        localStorage.setItem('userSession', JSON.stringify({
          ...data.user,
          isAuthenticated: true,
          timestamp: Date.now(),
          sessionDuration: currentSession.sessionDuration || this.SESSION_TIMEOUT,
          rememberMe: currentSession.rememberMe || false
        }));
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mock change password
  async mockChangePassword(currentPassword, newPassword) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentUser = this.getCurrentUser();
    const user = this.mockUsers[currentUser?.employeeId];
    
    if (user && user.password === currentPassword) {
      this.mockUsers[currentUser.employeeId].password = newPassword;
      return {
        success: true,
        message: 'Password changed successfully!'
      };
    }
    return {
      success: false,
      error: 'Current password is incorrect'
    };
  }

  // Change password for current user
  async changePassword(currentPassword, newPassword) {
    if (this.USE_MOCK) {
      return await this.mockChangePassword(currentPassword, newPassword);
    }
    
    const token = this.getToken();
    
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    if (!currentPassword || !newPassword) {
      return { success: false, error: 'All password fields are required' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    if (currentPassword === newPassword) {
      return { success: false, error: 'New password must be different from current password' };
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Current password is incorrect');
        }
        throw new Error(data.message || 'Password change failed');
      }

      return { 
        success: true, 
        message: data.message || 'Password changed successfully' 
      };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset employee password (Manager/CEO only)
  async resetEmployeePassword(employeeId, newPassword) {
    if (!employeeId || !newPassword) {
      return { success: false, error: 'Employee ID and new password are required' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'CEO' && currentUser.role !== 'Manager')) {
      return { success: false, error: 'Only CEO and Managers can reset passwords' };
    }
    
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = this.mockUsers[employeeId.toUpperCase()];
      if (!user) {
        return { success: false, error: 'Employee ID not found' };
      }
      
      this.mockUsers[employeeId.toUpperCase()].password = newPassword;
      return { 
        success: true, 
        message: `Password reset successfully for ${user.name}. New password: ${newPassword}` 
      };
    }
    
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ employeeId: employeeId.toUpperCase(), newPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }
      
      return { success: true, message: data.message || `Password reset successfully for employee ${employeeId}` };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== NEW: PASSWORD RESET APPROVAL WORKFLOW ====================

  // Request password reset (Member calls this - sends request to manager)
  async requestPasswordReset(employeeId, reason = '') {
    if (!employeeId) {
      return { success: false, error: 'Employee ID is required' };
    }
    
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = this.mockUsers[employeeId.toUpperCase()];
      if (!user) {
        return { success: false, error: 'Employee ID not found' };
      }
      
      // Check for existing pending request
      const existingRequest = this.mockResetRequests.find(
        r => r.employeeId === employeeId.toUpperCase() && r.status === 'pending'
      );
      
      if (existingRequest) {
        return { success: false, error: 'You already have a pending reset request. Please wait for manager approval.' };
      }
      
      // Create new reset request
      const newRequest = {
        id: Date.now(),
        employeeId: employeeId.toUpperCase(),
        employeeName: user.name,
        employeeEmail: user.email,
        department: user.department,
        role: user.role,
        reason: reason,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };
      
      this.mockResetRequests.push(newRequest);
      
      // Find manager for this department
      const manager = Object.values(this.mockUsers).find(
        u => u.department === user.department && u.role === 'Manager'
      );
      
      // Simulate notification to manager
      if (manager) {
        console.log(`[MOCK] Password reset request notification sent to manager: ${manager.name} (${manager.email})`);
      }
      
      return { 
        success: true, 
        message: `Password reset request submitted. Your manager has been notified and will review your request.`,
        requestId: newRequest.id
      };
    }
    
    // Real API call
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.toUpperCase(), reason }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      
      return { success: true, message: data.message, requestId: data.requestId };
    } catch (error) {
      console.error('Request password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get pending reset requests (Manager/CEO only)
  async getPendingResetRequests() {
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'CEO' && currentUser.role !== 'Manager')) {
      return [];
    }
    
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let requests = [...this.mockResetRequests];
      
      // Managers only see their department's requests
      if (currentUser.role === 'Manager') {
        requests = requests.filter(r => r.department === currentUser.department);
      }
      
      // Only show pending requests
      return requests.filter(r => r.status === 'pending');
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/password-resets/pending`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to fetch requests');
      return await response.json();
    } catch (error) {
      console.error('Get pending requests error:', error);
      return [];
    }
  }

  // Approve reset request and generate new password (Manager/CEO only)
  async approveResetRequest(requestId, comments = '') {
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'CEO' && currentUser.role !== 'Manager')) {
      return { success: false, error: 'Unauthorized' };
    }
    
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const request = this.mockResetRequests.find(r => r.id === requestId);
      if (!request) {
        return { success: false, error: 'Request not found' };
      }
      
      if (request.status !== 'pending') {
        return { success: false, error: 'Request already processed' };
      }
      
      // Generate new random password
      const newPassword = this.generateRandomPassword();
      
      // Update user password
      const user = this.mockUsers[request.employeeId];
      if (user) {
        user.password = newPassword;
        user.tempPassword = true;
      }
      
      // Update request status
      request.status = 'approved';
      request.approvedBy = currentUser.name;
      request.approvedAt = new Date().toISOString();
      request.comments = comments;
      request.newPassword = newPassword;
      
      // Simulate sending email with new password
      console.log(`[MOCK] Password reset email sent to ${request.employeeEmail}`);
      console.log(`[MOCK] New password: ${newPassword}`);
      
      return { 
        success: true, 
        message: `Password reset approved. New password has been sent to ${request.employeeName}'s email.`,
        newPassword
      };
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/password-resets/${requestId}/approve`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ comments }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Approval failed');
      }
      
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Approve request error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reject reset request (Manager/CEO only)
  async rejectResetRequest(requestId, reason = '') {
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'CEO' && currentUser.role !== 'Manager')) {
      return { success: false, error: 'Unauthorized' };
    }
    
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const request = this.mockResetRequests.find(r => r.id === requestId);
      if (!request) {
        return { success: false, error: 'Request not found' };
      }
      
      if (request.status !== 'pending') {
        return { success: false, error: 'Request already processed' };
      }
      
      request.status = 'rejected';
      request.rejectedBy = currentUser.name;
      request.rejectedAt = new Date().toISOString();
      request.rejectionReason = reason;
      
      // Simulate sending rejection email
      console.log(`[MOCK] Password reset request rejected notification sent to ${request.employeeEmail}`);
      console.log(`[MOCK] Reason: ${reason || 'No reason provided'}`);
      
      return { success: true, message: `Password reset request rejected.` };
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/password-resets/${requestId}/reject`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Rejection failed');
      }
      
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Reject request error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get reset request statistics (Manager/CEO only)
  async getResetRequestStats() {
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'CEO' && currentUser.role !== 'Manager')) {
      return { pending: 0, approvedToday: 0, totalMonth: 0 };
    }
    
    if (this.USE_MOCK) {
      let requests = [...this.mockResetRequests];
      
      if (currentUser.role === 'Manager') {
        requests = requests.filter(r => r.department === currentUser.department);
      }
      
      const today = new Date().toDateString();
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      
      return {
        pending: requests.filter(r => r.status === 'pending').length,
        approvedToday: requests.filter(r => {
          if (r.status !== 'approved') return false;
          const approvedDate = new Date(r.approvedAt).toDateString();
          return approvedDate === today;
        }).length,
        totalMonth: requests.filter(r => {
          const requestDate = new Date(r.requestedAt);
          return requestDate.getMonth() === thisMonth && requestDate.getFullYear() === thisYear;
        }).length
      };
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/password-resets/stats`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      return { pending: 0, approvedToday: 0, totalMonth: 0 };
    }
  }

  // Check if user has a pending reset request
  async hasPendingResetRequest(employeeId) {
    if (this.USE_MOCK) {
      return this.mockResetRequests.some(
        r => r.employeeId === employeeId.toUpperCase() && r.status === 'pending'
      );
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/password-resets/check?employeeId=${employeeId}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.hasPending;
    } catch (error) {
      console.error('Check pending request error:', error);
      return false;
    }
  }

  // Forgot password - request reset (alias for requestPasswordReset)
  async forgotPassword(employeeId) {
    return this.requestPasswordReset(employeeId);
  }

  // Refresh token
  async refreshToken() {
    if (this.USE_MOCK) {
      return { success: true, token: 'mock-refreshed-token-' + Date.now() };
    }
    
    const token = this.getToken();
    
    if (!token) {
      return { success: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.clearSession();
        }
        throw new Error(data.message || 'Token refresh failed');
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        const session = localStorage.getItem('userSession');
        if (session) {
          const sessionData = JSON.parse(session);
          localStorage.setItem('userSession', JSON.stringify({
            ...sessionData,
            timestamp: Date.now()
          }));
        }
        return { success: true, token: data.token };
      }
      
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user from localStorage
  getCurrentUser() {
    return this.getUser();
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const session = localStorage.getItem('userSession');
    
    if (!token || !session) {
      return false;
    }

    try {
      const sessionData = JSON.parse(session);
      const sessionAge = Date.now() - sessionData.timestamp;
      const timeout = sessionData.rememberMe ? sessionData.sessionDuration : this.SESSION_TIMEOUT;
      
      if (sessionAge >= timeout) {
        this.clearSession();
        return false;
      }
    } catch (error) {
      return false;
    }
    
    return true;
  }

  // Get user role
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  // Check if user has specific role
  hasRole(role) {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    const userRole = this.getUserRole();
    return roles.includes(userRole);
  }

  // Update user data in localStorage
  updateUser(userData) {
    const currentUser = this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      const session = localStorage.getItem('userSession');
      if (session) {
        const sessionData = JSON.parse(session);
        localStorage.setItem('userSession', JSON.stringify({
          ...sessionData,
          ...updatedUser,
          timestamp: Date.now()
        }));
      }
      return true;
    }
    return false;
  }

  // Get session time remaining in minutes
  getSessionTimeRemaining() {
    const session = localStorage.getItem('userSession');
    if (!session) return 0;
    
    try {
      const sessionData = JSON.parse(session);
      const sessionAge = Date.now() - sessionData.timestamp;
      const timeout = sessionData.rememberMe ? sessionData.sessionDuration : this.SESSION_TIMEOUT;
      const remaining = timeout - sessionAge;
      
      return Math.max(0, Math.floor(remaining / 60000));
    } catch (error) {
      return 0;
    }
  }

  // Check if mock mode is enabled
  isMockMode() {
    return this.USE_MOCK;
  }

  // Get all mock users (for manager to reset passwords)
  getMockUsers() {
    return this.mockUsers;
  }

  // ========== LOGIN MANAGEMENT METHODS ==========

  // Get all active sessions (Manager/Admin only)
  async getActiveSessions() {
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentUser = this.getCurrentUser();
      const sessions = [];
      
      Object.values(this.mockUsers).forEach(user => {
        if (user.employeeId !== currentUser?.employeeId) {
          sessions.push({
            id: Math.floor(Math.random() * 1000),
            employeeId: user.employeeId,
            name: user.name,
            role: user.role,
            department: user.department,
            loginTime: new Date(Date.now() - Math.random() * 3600000).toLocaleString(),
            lastActivity: new Date(Date.now() - Math.random() * 1800000).toLocaleString(),
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            device: ['Chrome / Windows', 'Firefox / Mac', 'Safari / iOS', 'Edge / Windows'][Math.floor(Math.random() * 4)],
            status: 'active',
            sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`
          });
        }
      });
      
      if (currentUser) {
        sessions.push({
          id: 999,
          employeeId: currentUser.employeeId,
          name: currentUser.name,
          role: currentUser.role,
          department: currentUser.department,
          loginTime: new Date().toLocaleString(),
          lastActivity: new Date().toLocaleString(),
          ipAddress: '127.0.0.1',
          device: navigator.userAgent,
          status: 'active',
          sessionId: 'current_session',
          isCurrentUser: true
        });
      }
      
      return sessions;
    }
    
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/sessions/active`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch active sessions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      throw error;
    }
  }

  // Get login history
  async getLoginHistory(params = {}) {
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const history = [];
      const now = new Date();
      
      Object.values(this.mockUsers).forEach((user, index) => {
        for (let i = 0; i < 3; i++) {
          const loginDate = new Date(now);
          loginDate.setDate(now.getDate() - Math.floor(Math.random() * 7));
          loginDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
          
          const logoutDate = new Date(loginDate);
          logoutDate.setHours(loginDate.getHours() + Math.floor(Math.random() * 8) + 4);
          
          const duration = Math.floor((logoutDate - loginDate) / 60000);
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          
          history.push({
            id: history.length + 1,
            employeeId: user.employeeId,
            name: user.name,
            role: user.role,
            department: user.department,
            loginTime: loginDate.toLocaleString(),
            logoutTime: i === 0 && Math.random() > 0.3 ? null : logoutDate.toLocaleString(),
            duration: i === 0 && Math.random() > 0.3 ? 'Active' : `${hours}h ${minutes}m`,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            status: i === 0 && Math.random() > 0.3 ? 'active' : ['completed', 'completed', 'forced'][Math.floor(Math.random() * 3)]
          });
        }
      });
      
      let filteredHistory = history;
      if (params.employeeId) {
        filteredHistory = filteredHistory.filter(h => h.employeeId === params.employeeId);
      }
      if (params.from) {
        const fromDate = new Date(params.from);
        filteredHistory = filteredHistory.filter(h => new Date(h.loginTime) >= fromDate);
      }
      if (params.to) {
        const toDate = new Date(params.to);
        filteredHistory = filteredHistory.filter(h => new Date(h.loginTime) <= toDate);
      }
      
      return filteredHistory.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
    }
    
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.API_BASE_URL}/auth/login-history${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch login history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching login history:', error);
      throw error;
    }
  }

  // Force logout a user (Manager/Admin only)
  async forceLogout(sessionId) {
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentUser = this.getCurrentUser();
      if (!currentUser || (currentUser.role !== 'CEO' && currentUser.role !== 'Manager')) {
        throw new Error('Only CEO and Managers can force logout users');
      }
      
      return {
        success: true,
        message: 'User has been forced logged out'
      };
    }
    
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'CEO' && currentUser.role !== 'Manager')) {
      throw new Error('Only CEO and Managers can force logout users');
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/sessions/${sessionId}/revoke`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to force logout');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error force logging out:', error);
      throw error;
    }
  }

  // Get active sessions count
  async getActiveSessionsCount() {
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const currentUser = this.getCurrentUser();
      let count = Object.keys(this.mockUsers).length;
      if (currentUser) {
        count = count - 1;
      }
      return { count: Math.max(1, count) };
    }
    
    const token = this.getToken();
    if (!token) {
      return { count: 0 };
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/sessions/active/count`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions count');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching sessions count:', error);
      return { count: 0 };
    }
  }

  // Get session details for a specific user (Manager/Admin only)
  async getUserSessions(employeeId) {
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const user = this.mockUsers[employeeId.toUpperCase()];
      if (!user) {
        throw new Error('User not found');
      }
      
      const sessions = [];
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        sessions.push({
          id: Math.floor(Math.random() * 1000),
          employeeId: user.employeeId,
          name: user.name,
          loginTime: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
          lastActivity: new Date(Date.now() - Math.random() * 3600000).toLocaleString(),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          device: ['Chrome / Windows', 'Firefox / Mac', 'Safari / iOS'][Math.floor(Math.random() * 3)],
          status: 'active',
          sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`
        });
      }
      
      return sessions;
    }
    
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/users/${employeeId}/sessions`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user sessions');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;