import authService from './authService';
import { getInitialsFromName } from '../utils/taskMapper';

class UserService {
  constructor() {
    this.API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  async apiRequest(endpoint, options = {}) {
    const token = authService.getToken();
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      authService.clearSession();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.message || `Request failed with status ${response.status}`);
    }

    return payload?.data ?? payload;
  }

  normalizeUser(user) {
    if (!user) return null;

    const id = user._id ?? user.id;
    const name = user.name || user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

    return {
      ...user,
      _id: id,
      id,
      name,
      role: user.role || 'Member',
      department: user.department || '',
      email: user.email || '',
      initials: user.initials || getInitialsFromName(name),
    };
  }

  normalizeUserList(users) {
    return (Array.isArray(users) ? users : [])
      .map(user => this.normalizeUser(user))
      .filter(user => user?.id && user.name);
  }

  async getUsers(filters = {}) {
    const query = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });

    const data = await this.apiRequest(`/users${query.toString() ? `?${query.toString()}` : ''}`);
    return this.normalizeUserList(data);
  }

  async getAssignableUsers() {
    return this.getUsers();
  }

  async getDepartmentMembers(department) {
    if (!department) return [];
    return this.getUsers({ department, role: 'Member' });
  }
}

export default new UserService();
