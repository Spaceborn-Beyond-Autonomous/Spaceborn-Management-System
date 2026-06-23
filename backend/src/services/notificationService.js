const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper for API calls
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: { ...defaultOptions.headers, ...options.headers },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export const notificationService = {
  // Get all notifications
  getNotifications: async (category = 'All', status = 'all') => {
    try {
      let params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (status !== 'all') params.append('status', status);
      
      return await apiRequest(`/notifications?${params.toString()}`);
    } catch (error) {
      console.log('Using mock getNotifications');
      return getMockNotifications(category, status);
    }
  },

  // Get my notifications
  getMyNotifications: async (role) => {
    try {
      return await apiRequest(`/notifications/my?role=${role}`);
    } catch (error) {
      console.log('Using mock getMyNotifications');
      return getMockNotifications('All', 'all');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      return await apiRequest(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.log('Using mock markAsRead');
      return { success: true };
    }
  },

  // Mark all as read
  markAllAsRead: async (userId, role) => {
    try {
      return await apiRequest(`/notifications/read-all`, {
        method: 'PUT',
        body: JSON.stringify({ userId, role }),
      });
    } catch (error) {
      console.log('Using mock markAllAsRead');
      return { success: true };
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      return await apiRequest(`/notifications/${notificationId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.log('Using mock deleteNotification');
      return { success: true };
    }
  },

  // Clear all notifications
  clearAllNotifications: async (userId, role) => {
    try {
      return await apiRequest(`/notifications/clear-all`, {
        method: 'DELETE',
        body: JSON.stringify({ userId, role }),
      });
    } catch (error) {
      console.log('Using mock clearAllNotifications');
      return { success: true };
    }
  },

  // Get unread count
  getUnreadCount: async (userId, role) => {
    try {
      return await apiRequest(`/notifications/unread-count?userId=${userId}&role=${role}`);
    } catch (error) {
      console.log('Using mock getUnreadCount');
      const mock = getMockNotifications('All', 'unread');
      return { count: mock.filter(n => !n.read).length };
    }
  },
};

// Mock data helper
const getMockNotifications = (category = 'All', status = 'all') => {
  const mockNotifications = [
    { id: 1, title: 'Ravi Das updated progress on "Build login UI" to 74%', description: 'Task progress has been updated', time: '2026-06-08T08:30:00Z', category: 'Task', read: false, priority: 'medium', actionUrl: '/tasks/1', actionLabel: 'View Task' },
    { id: 2, title: 'Resource request: GPU Server A is pending approval', description: 'Your resource request is awaiting approval', time: '2026-06-08T06:15:00Z', category: 'Resource', read: false, priority: 'medium', actionUrl: '/resources/requests', actionLabel: 'Check Status' },
    { id: 3, title: 'New member Arjun Singh added to Core Systems', description: 'A new team member has joined your department', time: '2026-06-08T04:00:00Z', category: 'Account', read: false, priority: 'low', actionUrl: '/team/members', actionLabel: 'View Team' },
    { id: 4, title: 'Meeting "Q2 Sprint Planning" scheduled for June 5', description: 'You have been invited to a meeting', time: '2026-06-07T10:00:00Z', category: 'Meeting', read: true, priority: 'medium', actionUrl: '/meetings/1', actionLabel: 'View Meeting' },
    { id: 5, title: 'DB schema design is overdue — action required', description: 'Please complete the task as soon as possible', time: '2026-06-06T09:00:00Z', category: 'Task', read: false, priority: 'high', actionUrl: '/tasks/5', actionLabel: 'View Task' },
    { id: 6, title: 'Beta project flagged at risk — needs attention', description: 'Project is behind schedule', time: '2026-06-06T14:30:00Z', category: 'Project', read: false, priority: 'high', actionUrl: '/projects/beta', actionLabel: 'View Project' },
    { id: 7, title: 'Priya Sharma submitted daily team summary', description: 'Daily summary report is ready for review', time: '2026-06-05T16:00:00Z', category: 'Summary', read: true, priority: 'low', actionUrl: '/summaries/daily', actionLabel: 'View Summary' },
    { id: 8, title: 'System maintenance scheduled for June 15', description: 'The system will be down for maintenance', time: '2026-06-05T08:00:00Z', category: 'System', read: true, priority: 'low', actionUrl: null, actionLabel: null }
  ];

  let filtered = mockNotifications;
  if (category !== 'All') {
    filtered = filtered.filter(n => n.category === category);
  }
  if (status === 'unread') {
    filtered = filtered.filter(n => !n.read);
  } else if (status === 'read') {
    filtered = filtered.filter(n => n.read);
  }
  return filtered;
};

export default notificationService;