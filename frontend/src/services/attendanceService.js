// src/services/attendanceService.js
import authService from './authService';

class AttendanceService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 2 * 60 * 1000;
    this.USE_MOCK = process.env.REACT_APP_USE_MOCK_AUTH === 'true';
  }

  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  // Mock data for development
  getMockAttendance(filters = {}) {
    const mockAttendance = [
      { id: 1, name: 'John Doe', role: 'CEO', department: 'Executive', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present', hoursWorked: 9 },
      { id: 2, name: 'Jane Smith', role: 'Manager', department: 'Operations', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'late', hoursWorked: 9.25 },
      { id: 3, name: 'Mike Johnson', role: 'Team Lead', department: 'Engineering', checkIn: '08:45 AM', checkOut: '05:30 PM', status: 'present', hoursWorked: 8.75 },
      { id: 4, name: 'Ravi Das', role: 'Member', department: 'Engineering', checkIn: '', checkOut: '', status: 'absent', hoursWorked: 0 },
      { id: 5, name: 'Priya Sharma', role: 'Member', department: 'Engineering', checkIn: '09:30 AM', checkOut: '', status: 'working-from-home', hoursWorked: 4.5 },
      { id: 6, name: 'Nisha Kumar', role: 'Member', department: 'Engineering', checkIn: '', checkOut: '', status: 'on-leave', hoursWorked: 0 }
    ];
    
    let filtered = [...mockAttendance];
    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(a => a.department === filters.department);
    }
    return filtered;
  }

  getMockStats() {
    return {
      present: 3,
      absent: 1,
      late: 1,
      onLeave: 1,
      workingFromHome: 1,
      totalEmployees: 7
    };
  }

  getMockDepartmentStats() {
    return [
      { department: 'Engineering', present: 2, absent: 1, late: 0, onLeave: 1, total: 4 },
      { department: 'Operations', present: 0, absent: 0, late: 1, onLeave: 0, total: 1 },
      { department: 'Executive', present: 1, absent: 0, late: 0, onLeave: 0, total: 1 }
    ];
  }

  getMockLiveStatus() {
    return [
      { id: 1, name: 'John Doe', status: 'active', lastActive: '2 minutes ago', currentTask: 'Reviewing reports' },
      { id: 2, name: 'Jane Smith', status: 'active', lastActive: '5 minutes ago', currentTask: 'In meeting' },
      { id: 3, name: 'Mike Johnson', status: 'active', lastActive: '1 minute ago', currentTask: 'Code review' },
      { id: 4, name: 'Ravi Das', status: 'idle', lastActive: '30 minutes ago', currentTask: 'Break' }
    ];
  }

  // Replace all API functions with ones that handle response format:

async getAllAttendance(filters = {}) {
  if (this.USE_MOCK) {
    return this.getMockAttendance(filters);
  }

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = authService.getToken();
  
  try {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/attendance${params ? `?${params}` : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Handle { success: true, data: [...] } format
      return data.data || data;
    }
    throw new Error('Failed');
  } catch (error) {
    console.log('Using mock - API error:', error.message);
    return this.getMockAttendance(filters);
  }
}

async getAttendanceStats(date = null) {
  if (this.USE_MOCK) return this.getMockStats();
  
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const token = authService.getToken();
    const url = date ? `${API_BASE_URL}/attendance/stats?date=${date}` : `${API_BASE_URL}/attendance/stats`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    
    if (response.ok) {
      const data = await response.json();
      return data.data || data;
    }
  } catch (error) {
    return this.getMockStats();
  }
  return this.getMockStats();
}

async getAttendanceByDepartment(date = null) {
  if (this.USE_MOCK) return this.getMockDepartmentStats();
  
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const token = authService.getToken();
    const url = date ? `${API_BASE_URL}/attendance/by-department?date=${date}` : `${API_BASE_URL}/attendance/by-department`;
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    
    if (response.ok) {
      const data = await response.json();
      return data.data || data;
    }
  } catch (error) {
    return this.getMockDepartmentStats();
  }
  return this.getMockDepartmentStats();
}

async getLiveAttendance() {
  return [];
}
  async markAttendance(employeeId, attendanceData) {
    // If in mock mode, simulate success
    if (this.USE_MOCK) {
      console.log('Mock marking attendance for:', employeeId, attendanceData);
      this.clearCache();
      return { success: true, message: 'Attendance marked successfully (mock)' };
    }

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const token = authService.getToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employeeId, ...attendanceData })
      });
      
      if (response.ok) {
        this.clearCache();
        return await response.json();
      }
      throw new Error('Failed to mark attendance');
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw new Error('Failed to mark attendance');
    }
  }
}

const attendanceServiceInstance = new AttendanceService();
export default attendanceServiceInstance;