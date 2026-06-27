// src/services/authService.js

class AuthService {
  constructor() {
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.SESSION_TIMEOUT = parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 8 * 60 * 60 * 1000;
    this.USE_MOCK = process.env.REACT_APP_USE_MOCK_AUTH === 'true';
    
    // Mock user database for development
    this.mockUsers = {
      'CEO001': { password: 'admin123', name: 'John Doe', role: 'CEO', department: 'Platform and DevOps', employeeId: 'CEO001' },
      'MGR001': { password: 'manager123', name: 'Jane Smith', role: 'Manager', department: 'Platform and DevOps', employeeId: 'MGR001' },
      'LD001': { password: 'lead123', name: 'Mike Johnson', role: 'Team Lead', department: 'Core Systems', employeeId: 'LD001' },
      'EMP001': { password: 'member123', name: 'Ravi Das', role: 'Member', department: 'Core Systems', employeeId: 'EMP001' },
      'EMP002': { password: 'member123', name: 'Priya Sharma', role: 'Member', department: 'Core Systems', employeeId: 'EMP002' },
      'EMP003': { password: 'member123', name: 'Nisha Kumar', role: 'Member', department: 'Core Systems', employeeId: 'EMP003' },
      'HR001': { password: 'hr123', name: 'Neha Gupta', role: 'HR', department: 'Robotics & Simulation', employeeId: 'HR001' }
    };
    
    // Bind methods
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.verifyToken = this.verifyToken.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.resetEmployeePassword = this.resetEmployeePassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
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
        return null;
      }
    }
    return null;
  }

  // Store session data
  setSession(user, token, rememberMe = false) {
    const sessionDuration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : this.SESSION_TIMEOUT;
    
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

  // Login user
  async login(employeeId, password, rememberMe = false) {
    // Mock mode for development
    if (this.USE_MOCK) {
      return this.mockLogin(employeeId, password, rememberMe);
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.toUpperCase(), password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.setSession(data.user, data.token, rememberMe);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mock login for development
  async mockLogin(employeeId, password, rememberMe) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = this.mockUsers[employeeId.toUpperCase()];
    
    if (user && user.password === password) {
      const { password: _, ...userWithoutPassword } = user;
      this.setSession(userWithoutPassword, 'mock-token-' + Date.now(), rememberMe);
      return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, error: 'Invalid Employee ID or Password' };
  }

  // Logout user
  async logout() {
    const token = this.getToken();
    
    try {
      if (token && !this.USE_MOCK) {
        await fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  // Verify token and get user data
  async verifyToken() {
    // Mock mode
    if (this.USE_MOCK) {
      const session = localStorage.getItem('userSession');
      if (session) {
        const sessionData = JSON.parse(session);
        return { success: true, user: sessionData };
      }
      return { success: false, error: 'No session found' };
    }

    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'No authentication token found' };
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

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Token verification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Change password for current user
  async changePassword(currentPassword, newPassword) {
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return { success: false, error: 'All password fields are required' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }
    
    if (currentPassword === newPassword) {
      return { success: false, error: 'New password must be different from current password' };
    }
    
    // Mock mode for development
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const currentUser = this.getCurrentUser();
      const user = this.mockUsers[currentUser?.employeeId];
      
      if (user && user.password === currentPassword) {
        // Update mock password (simulate change)
        this.mockUsers[currentUser.employeeId].password = newPassword;
        return { success: true, message: 'Password changed successfully!' };
      }
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Real API call
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
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
      
      return { success: true, message: data.message || 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset employee password (Manager/CEO only)
  async resetEmployeePassword(employeeId, newPassword) {
    // Validate inputs
    if (!employeeId || !newPassword) {
      return { success: false, error: 'Employee ID and new password are required' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    
    // Check if user has permission (CEO or Manager)
    const currentUser = this.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'CEO' && currentUser.role !== 'Manager' && currentUser.role !== 'COO')) {
      return { success: false, error: 'Only CEO, COO and Managers can reset passwords' };
    }
    
    // Mock mode for development
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = this.mockUsers[employeeId.toUpperCase()];
      if (!user) {
        return { success: false, error: 'Employee ID not found' };
      }
      
      // Update mock password
      this.mockUsers[employeeId.toUpperCase()].password = newPassword;
      return { success: true, message: `Password reset successfully for ${user.name}` };
    }
    
    // Real API call
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

  // Forgot password - request reset
  async forgotPassword(employeeId) {
    if (!employeeId) {
      return { success: false, error: 'Employee ID is required' };
    }
    
    // Mock mode
    if (this.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const user = this.mockUsers[employeeId.toUpperCase()];
      if (user) {
        return { 
          success: true, 
          message: `Password reset link has been sent to ${user.name}'s registered email. Manager has been notified.` 
        };
      }
      return { success: true, message: 'If an account exists, a password reset link will be sent.' };
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.toUpperCase() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset request failed');
      }
      
      return { success: true, message: data.message || 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: true, message: 'If an account exists, a password reset link will be sent.' };
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
      return true;
    } catch (error) {
      return false;
    }
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
}

export default new AuthService();
