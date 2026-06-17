// src/components/Dashboard/CEO/Notifications.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const Notifications = ({ userRole = 'CEO' }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read

  const tabs = ['All', 'Task', 'Resource', 'Account', 'Meeting', 'System', 'Project'];

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
  }, [activeTab, filter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token) {
        console.error('No authentication token found');
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (activeTab !== 'All') params.append('category', activeTab);
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`${API_BASE_URL}/notifications?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || data);
        setUnreadCount(data.unreadCount || data.filter(n => !n.read).length);
      } else {
        throw new Error('Failed to fetch notifications');
      }
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
      
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const loadMockData = () => {
    const mockNotifications = [
      { 
        id: 1, 
        title: 'Ravi Das updated progress on "Build login UI" to 74%', 
        description: 'Task progress has been updated',
        time: '2026-06-08T08:30:00Z', 
        category: 'Task',
        read: false,
        priority: 'medium',
        actionUrl: '/tasks/1',
        actionLabel: 'View Task'
      },
      { 
        id: 2, 
        title: 'Resource request from Nisha Kumar approved', 
        description: 'Your resource request has been approved by manager',
        time: '2026-06-06T14:20:00Z', 
        category: 'Resource',
        read: true,
        priority: 'low',
        actionUrl: '/resources/requests',
        actionLabel: 'View Request'
      },
      { 
        id: 3, 
        title: 'New member Arjun Singh added to Engineering', 
        description: 'A new team member has joined your department',
        time: '2026-06-08T06:00:00Z', 
        category: 'Account',
        read: false,
        priority: 'low',
        actionUrl: '/team/members',
        actionLabel: 'View Team'
      },
      { 
        id: 4, 
        title: 'Meeting "Q2 Sprint Planning" scheduled for June 5', 
        description: 'A new meeting has been scheduled for your team',
        time: '2026-06-07T10:00:00Z', 
        category: 'Meeting',
        read: true,
        priority: 'medium',
        actionUrl: '/meetings/1',
        actionLabel: 'View Meeting'
      },
      { 
        id: 5, 
        title: 'DB schema design is overdue — action required', 
        description: 'Please complete the task as soon as possible',
        time: '2026-06-06T09:00:00Z', 
        category: 'Task',
        read: false,
        priority: 'high',
        actionUrl: '/tasks/5',
        actionLabel: 'View Task'
      },
      { 
        id: 6, 
        title: 'System maintenance scheduled for June 15', 
        description: 'The system will be down for maintenance from 2 AM to 4 AM',
        time: '2026-06-05T08:00:00Z', 
        category: 'System',
        read: true,
        priority: 'low',
        actionUrl: null,
        actionLabel: null
      },
      { 
        id: 7, 
        title: 'You have been assigned to "Frontend Redesign" project', 
        description: 'You are now a member of the Frontend Redesign project',
        time: '2026-06-04T11:30:00Z', 
        category: 'Project',
        read: false,
        priority: 'medium',
        actionUrl: '/projects/3',
        actionLabel: 'View Project'
      }
    ];
    
    // Filter by category
    let filtered = mockNotifications;
    if (activeTab !== 'All') {
      filtered = mockNotifications.filter(n => n.category === activeTab);
    }
    
    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    }
    
    setNotifications(filtered);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notif => ({ ...notif, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const deletedNotif = notifications.find(n => n.id === notificationId);
        setNotifications(prevNotifications =>
          prevNotifications.filter(notif => notif.id !== notificationId)
        );
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category) => {
    const colors = {
      Task: 'bg-blue-100 text-blue-700',
      Resource: 'bg-purple-100 text-purple-700',
      Account: 'bg-green-100 text-green-700',
      Meeting: 'bg-yellow-100 text-yellow-700',
      System: 'bg-gray-100 text-gray-700',
      Project: 'bg-orange-100 text-orange-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      // Navigate to the action URL
      window.location.href = notification.actionUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
                {notifications.filter(n => n.category === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
            filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
            filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
            filter === 'read' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Read
        </button>
      </div>

      {/* Error State */}
      {error && notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Notifications</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : notifications.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-500 text-lg">No notifications found</p>
          <p className="text-gray-400 text-sm mt-2">
            {activeTab !== 'All' ? `No ${activeTab.toLowerCase()} notifications available` : 'You\'re all caught up!'}
          </p>
        </div>
      ) : (
        /* Notifications List */
        <div className="space-y-3">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition cursor-pointer ${getPriorityColor(notification.priority)} ${!notification.read ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900 font-medium">{notification.title}</p>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  {notification.description && (
                    <p className="text-sm text-gray-500 mt-1">{notification.description}</p>
                  )}
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notification.category)}`}>
                      {notification.category}
                    </span>
                    <span className="text-xs text-gray-400">{formatRelativeTime(notification.time)}</span>
                    {notification.priority === 'high' && (
                      <span className="text-xs text-red-600 font-medium">⚠️ Urgent</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {notification.actionLabel && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notification);
                      }}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {notification.actionLabel}
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete notification"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;