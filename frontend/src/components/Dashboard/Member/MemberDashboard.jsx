// src/components/Dashboard/Member/MemberDashboard.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const MemberDashboard = () => {
  const [memberData, setMemberData] = useState({
    name: '',
    role: '',
    title: '',
    description: '',
    myTasks: [],
    sprintOverview: {
      overallProgress: 0,
      tasksOnTime: 0,
      hoursLogged: 0
    },
    upcomingDeadlines: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch member dashboard data from API
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token || !currentUser) {
        console.error('No authentication token or user found');
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/member/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setMemberData(prev => ({
          ...prev,
          name: profile.name,
          role: profile.role,
          title: profile.title,
          description: profile.description
        }));
      }

      // Fetch my tasks
      const tasksResponse = await fetch(`${API_BASE_URL}/member/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        setMemberData(prev => ({
          ...prev,
          myTasks: tasks
        }));
      }

      // Fetch sprint overview
      const sprintResponse = await fetch(`${API_BASE_URL}/member/sprint-overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (sprintResponse.ok) {
        const sprintData = await sprintResponse.json();
        setMemberData(prev => ({
          ...prev,
          sprintOverview: sprintData
        }));
      }

      // Fetch upcoming deadlines
      const deadlinesResponse = await fetch(`${API_BASE_URL}/member/upcoming-deadlines`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (deadlinesResponse.ok) {
        const deadlines = await deadlinesResponse.json();
        setMemberData(prev => ({
          ...prev,
          upcomingDeadlines: deadlines
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      
      // If API fails and mock mode is enabled, load mock data
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development (only used when backend is not available)
  const loadMockData = () => {
    const currentUser = authService.getCurrentUser();
    
    setMemberData({
      name: currentUser?.name || 'Ravi Das',
      role: currentUser?.role || 'Member',
      title: `${currentUser?.department || 'Engineering'} · Joined ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      description: 'Frontend developer passionate about building clean, accessible interfaces. Currently focused on the authentication and dashboard modules.',
      myTasks: [
        { 
          id: 1,
          name: 'Build login UI', 
          status: 'In progress', 
          progress: 74, 
          dueDate: 'May 28, 2026',
          priority: 'high'
        },
        { 
          id: 2,
          name: 'API Integration', 
          status: 'Not started', 
          progress: 0, 
          dueDate: 'Jun 5, 2026',
          priority: 'medium'
        },
        { 
          id: 3,
          name: 'Code Review', 
          status: 'Completed', 
          progress: 100, 
          dueDate: 'May 25, 2026',
          priority: 'low'
        }
      ],
      sprintOverview: {
        overallProgress: 68,
        tasksOnTime: 85,
        hoursLogged: 72
      },
      upcomingDeadlines: [
        { id: 1, name: 'Build login UI', dueDate: 'May 28', priority: 'high' },
        { id: 2, name: 'API Integration', dueDate: 'Jun 5', priority: 'medium' }
      ]
    });
  };

  // Update task progress
  const updateTaskProgress = async (taskId, newProgress) => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/member/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress }),
      });
      
      if (response.ok) {
        // Update local state
        setMemberData(prev => ({
          ...prev,
          myTasks: prev.myTasks.map(task => 
            task.id === taskId ? { ...task, progress: newProgress } : task
          )
        }));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'not started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error && memberData.name === '') {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header - Member Theme (Cyan) */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {memberData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{memberData.name}</h1>
                <p className="text-sm text-cyan-600 font-medium mt-1">{memberData.role}</p>
                <p className="text-sm text-gray-500">{memberData.title}</p>
              </div>
            </div>
            <p className="text-gray-600 mt-3">{memberData.description}</p>
          </div>
        </div>
      </div>

      {/* My Tasks Section */}
      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">My tasks</h2>
        </div>
        <div className="p-6">
          {memberData.myTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks assigned</p>
          ) : (
            <div className="space-y-4">
              {memberData.myTasks.map((task) => (
                <div key={task.id} className={`flex items-center justify-between p-4 rounded-lg ${getPriorityColor(task.priority)}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="font-medium text-gray-900">{task.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Due {task.dueDate}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 rounded-full h-2 transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const newProgress = prompt('Enter new progress (0-100):', task.progress);
                        if (newProgress !== null && !isNaN(newProgress) && newProgress >= 0 && newProgress <= 100) {
                          updateTaskProgress(task.id, parseInt(newProgress));
                        }
                      }}
                      className="px-3 py-1 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 transition"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sprint Overview and Upcoming Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sprint Overview */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Sprint overview</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Overall progress</span>
                <span className="font-medium">{memberData.sprintOverview.overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-cyan-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${memberData.sprintOverview.overallProgress}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tasks on time</span>
                <span className="font-medium text-green-600">{memberData.sprintOverview.tasksOnTime}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${memberData.sprintOverview.tasksOnTime}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Hours logged</span>
                <span className="font-medium text-purple-600">{memberData.sprintOverview.hoursLogged}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${Math.min(100, memberData.sprintOverview.hoursLogged)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Upcoming deadlines</h2>
          </div>
          <div className="p-6">
            {memberData.upcomingDeadlines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {memberData.upcomingDeadlines.map((deadline) => (
                  <div 
                    key={deadline.id} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      deadline.priority === 'high' ? 'bg-red-50 border-red-200' :
                      deadline.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{deadline.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">{deadline.dueDate}</span>
                      {deadline.priority === 'high' && (
                        <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded-full text-xs">Urgent</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;