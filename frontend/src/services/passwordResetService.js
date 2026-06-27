// src/services/passwordResetService.js
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class PasswordResetService {
  // Request password reset (from login page)
  async requestReset(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error requesting reset:', error);
      throw error;
    }
  }

  // Get all pending reset requests (for Manager)
  async getPendingRequests() {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/password-resets/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch requests');
      return await response.json();
    } catch (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
  }

  // Approve password reset request (by Manager)
  async approveRequest(requestId, comments) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/password-resets/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      });

      if (!response.ok) throw new Error('Approval failed');
      return await response.json();
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  // Reject password reset request (by Manager)
  async rejectRequest(requestId, reason) {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/password-resets/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Rejection failed');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }

  // Get reset request statistics
  async getRequestStats() {
    try {
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/password-resets/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { pending: 0, approved: 0, rejected: 0 };
    }
  }

  // Check if user has pending request
  async hasPendingRequest(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/password-resets/check?email=${email}`);
      if (!response.ok) return false;
      const data = await response.json();
      return data.hasPending;
    } catch (error) {
      console.error('Error checking pending request:', error);
      return false;
    }
  }
}

export default new PasswordResetService();