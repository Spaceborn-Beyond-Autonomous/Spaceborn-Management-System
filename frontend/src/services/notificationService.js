// src/services/notificationService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock notifications storage
let mockNotifications = JSON.parse(localStorage.getItem('mock_notifications') || '[]');

const saveMockNotifications = () => {
  localStorage.setItem('mock_notifications', JSON.stringify(mockNotifications));
};

export const notificationService = {
  // Send notification to a single user
  sendNotification: async (data) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API request failed');
    } catch (error) {
      console.log('Using mock sendNotification:', data);
      const newNotification = {
        id: Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
        read: false,
      };
      mockNotifications.push(newNotification);
      saveMockNotifications();
      return newNotification;
    }
  },

  // Send bulk notification to all employees
  sendBulkNotification: async (data) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API request failed');
    } catch (error) {
      console.log('Using mock sendBulkNotification:', data);
      const bulkNotification = {
        id: Date.now(),
        ...data,
        sentTo: 'all_employees',
        createdAt: new Date().toISOString(),
      };
      return bulkNotification;
    }
  },

  // Get notifications for a user
  getNotifications: async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API request failed');
    } catch (error) {
      console.log('Using mock getNotifications');
      return mockNotifications.filter(n => n.userId === userId || n.userId === undefined);
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API request failed');
    } catch (error) {
      console.log('Using mock markAsRead');
      const index = mockNotifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        mockNotifications[index].read = true;
        saveMockNotifications();
      }
      return { success: true };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API request failed');
    } catch (error) {
      console.log('Using mock markAllAsRead');
      mockNotifications = mockNotifications.map(n => 
        n.userId === userId || n.userId === undefined ? { ...n, read: true } : n
      );
      saveMockNotifications();
      return { success: true };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API request failed');
    } catch (error) {
      console.log('Using mock deleteNotification');
      mockNotifications = mockNotifications.filter(n => n.id !== notificationId);
      saveMockNotifications();
      return { success: true };
    }
  },

  // Get unread count
  getUnreadCount: async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread-count`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API request failed');
    } catch (error) {
      console.log('Using mock getUnreadCount');
      return { count: mockNotifications.filter(n => !n.read && (n.userId === userId || n.userId === undefined)).length };
    }
  }
};

export default notificationService;