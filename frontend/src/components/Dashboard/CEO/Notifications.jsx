// src/components/Dashboard/Manager/Notifications.jsx
import React, { useState, useEffect, useCallback } from 'react';
import authService from '../../../services/authService';

const Notifications = ({ userRole = 'Manager' }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const tabs = ['All', 'Task', 'Resource', 'Leave', 'Meeting', 'Report', 'Project', 'Summary', 'System'];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      if (!token) {
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
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
        const notificationsData = Array.isArray(data.notifications)
  ? data.notifications
  : Array.isArray(data)
  ? data
  : [];

setNotifications(notificationsData);
        setUnreadCount(data.unreadCount ?? notificationsData.filter(n => !n.read).length);
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
  }, [activeTab, filter]);

  const loadMockData = () => {
    const mockNotifications = [
      { 
        id: 1, 
        title: 'Task Progress Update',
        message: 'Ravi Das updated progress on "Build login UI" to 74%',
        description: 'Task progress has been updated',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'Task',
        read: false,
        priority: 'high',
        actionUrl: '/tasks/1',
        actionLabel: 'View Task',
        details: {
          taskName: 'Build login UI',
          assignedTo: 'Ravi Das',
          progress: 74,
          status: 'In Progress',
          dueDate: '2026-06-15',
          priority: 'High',
          description: 'Build the complete login UI with validation and error handling'
        }
      },
      { 
        id: 2, 
        title: 'Resource Request',
        message: 'Resource request: GPU Server A is pending approval',
        description: 'A new resource request requires your attention',
        time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        category: 'Resource',
        read: false,
        priority: 'high',
        actionUrl: '/resources/requests',
        actionLabel: 'Review Request',
        details: {
          resourceType: 'GPU Server A',
          requester: 'Nisha Kumar',
          department: 'Core Systems',
          purpose: 'ML Model Training',
          urgency: 'High',
          estimatedCost: '$500/month'
        }
      },
      { 
        id: 3, 
        title: 'New Team Member',
        message: 'New member Arjun Singh added to Core Systems',
        description: 'A new team member has joined your department',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Account',
        read: true,
        priority: 'low',
        actionUrl: '/team/members',
        actionLabel: 'View Team',
        details: {
          memberName: 'Arjun Singh',
          role: 'Software Engineer',
          department: 'Core Systems',
          startDate: '2026-06-08',
          reportingTo: 'Priya Sharma',
          email: 'arjun.singh@company.com'
        }
      },
      { 
        id: 4, 
        title: 'Meeting Scheduled',
        message: 'Meeting "Q2 Sprint Planning" scheduled for tomorrow at 10:00 AM',
        description: 'A new meeting has been scheduled for your team',
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Meeting',
        read: false,
        priority: 'medium',
        actionUrl: '/meetings/1',
        actionLabel: 'View Meeting',
        details: {
          meetingTitle: 'Q2 Sprint Planning',
          date: '2026-06-10',
          time: '10:00 AM',
          duration: '2 hours',
          location: 'Conference Room A / Zoom',
          agenda: ['Review Q1 progress', 'Plan Q2 sprints', 'Resource allocation'],
          attendees: ['Priya Sharma', 'Ravi Das', 'Nisha Kumar', 'Arjun Singh']
        }
      },
      { 
        id: 5, 
        title: 'Task Overdue',
        message: 'DB schema design is overdue — action required',
        description: 'Please complete the task as soon as possible',
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Task',
        read: false,
        priority: 'high',
        actionUrl: '/tasks/5',
        actionLabel: 'View Task',
        details: {
          taskName: 'DB Schema Hardware & Integration',
          assignedTo: 'Nisha Kumar',
          dueDate: '2026-06-06',
          status: 'Overdue',
          priority: 'High',
          description: 'Hardware & Integration the database schema for the new auth module'
        }
      },
      { 
        id: 6, 
        title: 'Project Risk Alert',
        message: 'Beta project flagged at risk — needs attention',
        description: 'Project is behind schedule',
        time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Project',
        read: true,
        priority: 'high',
        actionUrl: '/projects/beta',
        actionLabel: 'View Project',
        details: {
          projectName: 'Beta Project',
          status: 'At Risk',
          completion: 45,
          dueDate: '2026-06-30',
          risks: ['Resource bottleneck', 'Client feedback pending'],
          recommendations: ['Reassign resources', 'Extend deadline']
        }
      },
      { 
        id: 7, 
        title: 'Daily Summary',
        message: 'Priya Sharma submitted daily team summary',
        description: 'Daily summary report is ready for review',
        time: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Summary',
        read: true,
        priority: 'low',
        actionUrl: '/summaries/daily',
        actionLabel: 'View Summary',
        details: {
          author: 'Priya Sharma',
          date: '2026-06-07',
          department: 'Core Systems',
          highlights: ['8 tasks completed', 'No blockers', 'Alpha at 82%'],
          metrics: { velocity: 94, quality: 88, morale: 85 }
        }
      },
      { 
        id: 8, 
        title: 'System Maintenance',
        message: 'System maintenance scheduled for June 15, 2026',
        description: 'The system will be down for scheduled maintenance',
        time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'System',
        read: true,
        priority: 'low',
        actionUrl: null,
        actionLabel: null,
        details: {
          maintenanceDate: '2026-06-15',
          duration: '4 hours',
          startTime: '02:00 AM',
          impact: 'All services will be unavailable',
          reason: 'Security updates and performance optimization'
        }
      }
    ];
    
    let filtered = mockNotifications;
    if (activeTab !== 'All') {
      filtered = mockNotifications.filter(n => n.category === activeTab);
    }
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read);
    }
    
    setNotifications(filtered);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = authService.getToken();
      if (token && process.env.REACT_APP_USE_MOCK_AUTH !== 'true') {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('Marked as read', 'success');
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) {
      showToast('No unread notifications', 'info');
      return;
    }
    
    try {
      const token = authService.getToken();
      if (token && process.env.REACT_APP_USE_MOCK_AUTH !== 'true') {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      showToast(`Marked ${unreadNotifications.length} notifications as read`, 'success');
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast('Failed to mark all as read', 'error');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Delete this notification?')) return;
    
    const deletedNotif = notifications.find(n => n.id === notificationId);
    
    try {
      const token = authService.getToken();
      if (token && process.env.REACT_APP_USE_MOCK_AUTH !== 'true') {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        
        await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
      
      setNotifications(prevNotifications =>
        prevNotifications.filter(notif => notif.id !== notificationId)
      );
      if (deletedNotif && !deletedNotif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      showToast('Notification deleted', 'success');
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('Failed to delete notification', 'error');
    }
  };

  const viewDetails = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      Task: 'bg-blue-100 text-blue-700',
      Resource: 'bg-purple-100 text-purple-700',
      Account: 'bg-green-100 text-green-700',
      Meeting: 'bg-yellow-100 text-yellow-700',
      Leave: 'bg-rose-100 text-rose-700',
      Report: 'bg-cyan-100 text-cyan-700',
      Project: 'bg-red-100 text-red-700',
      Summary: 'bg-gray-100 text-gray-700',
      System: 'bg-indigo-100 text-indigo-700'
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

  const getPriorityBadge = (priority) => {
    if (priority === 'high') {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">⚠️ Urgent</span>;
    }
    if (priority === 'medium') {
      return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">🟡 Medium</span>;
    }
    return null;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Auto refresh: poll unread count and refetch when it increases
  useEffect(() => {
    let intervalId = null;

    const pollUnread = async () => {
      try {
        const token = authService.getToken();
        if (!token) return;

        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;
        const data = await response.json();
        const latestCount = data?.count ?? 0;

        setUnreadCount((prev) => {
          if (latestCount > prev) fetchNotifications();
          return latestCount;
        });
      } catch (e) {
        // ignore
      }
    };

    intervalId = setInterval(pollUnread, 5000);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchNotifications]);


  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          <p className="mt-4 text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === 'success' ? 'bg-green-600' : 
            toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}>
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {unreadCount > 0 
                      ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                      : 'All caught up!'}
                  </p>
                </div>
              </div>
            </div>
            
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const count = tab === 'All' 
                ? notifications.length 
                : notifications.filter(n => n.category === tab).length;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap
                    transition-all duration-200
                    ${activeTab === tab
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab}</span>
                  {count > 0 && (
                    <span className={`
                      ml-1 px-1.5 py-0.5 text-xs rounded-full
                      ${activeTab === tab
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize
                ${filter === f
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {f}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white text-purple-600 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && notifications.length === 0 && (
          <div className="bg-white rounded-xl border border-red-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Notifications</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchNotifications} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && notifications.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications found</h3>
            <p className="text-gray-500">
              {activeTab !== 'All' 
                ? `No ${activeTab.toLowerCase()} notifications available` 
                : filter !== 'all'
                ? `No ${filter} notifications`
                : "You're all caught up!"}
            </p>
          </div>
        )}

        {/* Notifications List */}
        {!error && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`
                  group bg-white rounded-xl border transition-all duration-200
                  ${!notification.read ? 'shadow-md border-purple-200' : 'border-gray-200 hover:shadow-md'}
                  ${getPriorityColor(notification.priority)}
                `}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${getCategoryColor(notification.category)}
                        `}>
                          {notification.category}
                        </span>
                        {getPriorityBadge(notification.priority)}
                        {!notification.read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1 animate-pulse"></span>
                            New
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.description && (
                        <p className="text-xs text-gray-500 mb-3">
                          {notification.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-400">
                          {formatRelativeTime(notification.time)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => viewDetails(notification)}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                      >
                        View Details
                      </button>
                      
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {!error && notifications.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Showing {notifications.length} notification{notifications.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(selectedNotification.category)}`}>
                  {selectedNotification.category === 'Task' && '📋'}
                  {selectedNotification.category === 'Resource' && '🖥️'}
                  {selectedNotification.category === 'Account' && '👤'}
                  {selectedNotification.category === 'Meeting' && '📅'}
                  {selectedNotification.category === 'Leave' && '🗓️'}
                  {selectedNotification.category === 'Report' && '📄'}
                  {selectedNotification.category === 'Project' && '🚀'}
                  {selectedNotification.category === 'Summary' && '📊'}
                  {selectedNotification.category === 'System' && '⚙️'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedNotification.title}</h2>
                  <p className="text-sm text-gray-500">{selectedNotification.category}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-4">
              {/* Message */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-800">{selectedNotification.message}</p>
                {selectedNotification.description && (
                  <p className="text-gray-500 text-sm mt-2">{selectedNotification.description}</p>
                )}
              </div>

              {/* Details based on category */}
              {selectedNotification.details && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Details</h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                    {Object.entries(selectedNotification.details).map(([key, value]) => (
                      <div key={key} className="flex items-start space-x-2 text-sm">
                        <span className="font-medium text-gray-600 min-w-[120px] capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-gray-800">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time & Priority */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(selectedNotification.time)}
                  </span>
                  {getPriorityBadge(selectedNotification.priority)}
                </div>
                
                {selectedNotification.actionUrl && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      window.location.href = selectedNotification.actionUrl;
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    {selectedNotification.actionLabel || 'View Full Details'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Notifications;
