// src/components/Dashboard/Manager/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import taskService from '../../../services/taskService';
import employeeService from '../../../services/employeeService';
import LoginManagement from './LoginManagement';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    departmentProgress: [],
    upcomingMeetings: [],
    resourceRequests: [],
    actionItems: [],
    recentActivity: []
  });
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingApprovals: 0,
    resourceRequests: 0,
    activeSessions: 0,
    teamMembers: 0,
    projectsActive: 0,
    sprintVelocity: 0
  });
  
  const [topPerformers, setTopPerformers] = useState([]);
  const [teamHealth, setTeamHealth] = useState({
    newJoinees: 0,
    terminated: 0,
    onLeave: 0,
    satisfaction: 0
  });
  const [completedActions, setCompletedActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchDashboardData();
    fetchActiveSessionsCount();
    fetchTeamHealth();
  }, [selectedDepartment, dateRange]);

  const fetchActiveSessionsCount = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/auth/sessions/active/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, activeSessions: data.count }));
      } else {
        setStats(prev => ({ ...prev, activeSessions: 3 }));
      }
    } catch (error) {
      console.error('Error fetching active sessions count:', error);
      setStats(prev => ({ ...prev, activeSessions: 3 }));
    }
  };

  const fetchTeamHealth = async () => {
    try {
      const employees = await employeeService.getAllEmployees();
      const teamMembers = employees.filter(emp => emp.role !== 'CEO');
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const newJoinees = teamMembers.filter(emp => {
        const joinDate = new Date(emp.joinDate);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
      }).length;
      
      const terminated = teamMembers.filter(emp => emp.status === 'Terminated').length;
      const onLeave = teamMembers.filter(emp => emp.status === 'On Leave').length;
      
      setTeamHealth({
        newJoinees,
        terminated,
        onLeave,
        satisfaction: 85
      });
      
      setStats(prev => ({ ...prev, teamMembers: teamMembers.length }));
    } catch (error) {
      console.error('Error fetching team health:', error);
      setTeamHealth({ newJoinees: 0, terminated: 0, onLeave: 0, satisfaction: 85 });
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Fetch all data in parallel
      const [progressRes, meetingsRes, resourcesRes, actionsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE_URL}/manager/department-progress?range=${dateRange}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/manager/upcoming-meetings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/manager/resource-requests`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/manager/action-items`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/manager/recent-activity?range=${dateRange}`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      // Process each response
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setDashboardData(prev => ({ ...prev, departmentProgress: progressData }));
      }
      
      if (meetingsRes.ok) {
        const meetingsData = await meetingsRes.json();
        setDashboardData(prev => ({ ...prev, upcomingMeetings: meetingsData }));
      }
      
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setDashboardData(prev => ({ ...prev, resourceRequests: resourcesData }));
        setStats(prev => ({ ...prev, resourceRequests: resourcesData.filter(r => r.status === 'pending').length }));
      }
      
      if (actionsRes.ok) {
        const actionsData = await actionsRes.json();
        setDashboardData(prev => ({ ...prev, actionItems: actionsData }));
      }
      
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setDashboardData(prev => ({ ...prev, recentActivity: activityData }));
      }
      
      // Fetch task statistics
      const tasksRes = await taskService.getTaskStatistics();
      setStats(prev => ({
        ...prev,
        totalTasks: tasksRes.total,
        completedTasks: tasksRes.completed,
        pendingApprovals: dashboardData.actionItems.filter(a => a.status === 'pending').length
      }));
      
      fetchTopPerformers();
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const employees = await employeeService.getAllEmployees();
      const teamMembers = employees.filter(emp => emp.role !== 'CEO');
      
      const performers = teamMembers.map(member => ({
        name: member.name,
        role: member.role,
        department: member.department,
        tasks: Math.floor(Math.random() * 50) + 10,
        initials: member.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U',
        avatar: member.name?.charAt(0) || 'U'
      })).sort((a, b) => b.tasks - a.tasks).slice(0, 5);
      
      setTopPerformers(performers);
    } catch (error) {
      console.error('Error fetching top performers:', error);
      setTopPerformers([
        { name: 'Priya Sharma', role: 'Senior Engineer', department: 'Core Systems', tasks: 31, initials: 'PS', avatar: 'P' },
        { name: 'Ravi Das', role: 'Frontend Developer', department: 'Core Systems', tasks: 28, initials: 'RD', avatar: 'R' },
        { name: 'Nisha Kumar', role: 'Backend Developer', department: 'Core Systems', tasks: 22, initials: 'NK', avatar: 'N' }
      ]);
    }
  };

  const loadMockData = () => {
    const user = authService.getCurrentUser();
    const managerDepartment = user?.department || 'Core Systems';
    
    setDashboardData({
      departmentProgress: [
        { name: managerDepartment, members: 8, progress: 78, completedTasks: 156, pendingTasks: 44 },
        { name: 'Hardware & Integration', members: 4, progress: 65, completedTasks: 78, pendingTasks: 42 },
        { name: 'QA', members: 3, progress: 82, completedTasks: 89, pendingTasks: 19 }
      ],
      upcomingMeetings: [
        { id: 1, date: '5', month: 'Jun', title: 'Sprint Planning', dept: managerDepartment, time: '10:00 AM', status: 'Pending', duration: '1 hour' },
        { id: 2, date: '6', month: 'Jun', title: 'Code Review', dept: managerDepartment, time: '2:00 PM', status: 'Pending', duration: '45 min' },
        { id: 3, date: '10', month: 'Jun', title: 'Team Sync', dept: managerDepartment, time: '11:00 AM', status: 'Pending', duration: '30 min' }
      ],
      resourceRequests: [
        { id: 1, item: 'MacBook Pro M3', requester: 'Ravi Das', date: '2', month: 'Jun', status: 'pending', priority: 'high', department: managerDepartment },
        { id: 2, item: 'AWS Credits', requester: 'Nisha Kumar', date: '4', month: 'Jun', status: 'pending', priority: 'medium', department: managerDepartment },
        { id: 3, item: 'Monitor Setup', requester: 'Suresh M', date: '1', month: 'Jun', status: 'approved', priority: 'low', department: managerDepartment }
      ],
      actionItems: [
        { id: 1, title: 'Review sprint goals', due: 'Today', priority: 'High', status: 'pending', category: 'review' },
        { id: 2, title: 'Approve resource requests (2)', due: 'Today', priority: 'High', status: 'pending', category: 'approval' },
        { id: 3, title: 'Team performance review', due: 'Jun 5', priority: 'Medium', status: 'pending', category: 'review' },
        { id: 4, title: 'Update project timeline', due: 'Jun 7', priority: 'Medium', status: 'pending', category: 'task' },
        { id: 5, title: 'Schedule team building', due: 'Jun 9', priority: 'Low', status: 'pending', category: 'task' }
      ],
      recentActivity: [
        { id: 1, action: 'Ravi Das completed login module', time: new Date(Date.now() - 2 * 3600000).toISOString(), user: 'Ravi Das', type: 'milestone' },
        { id: 2, action: 'Sprint review completed', time: new Date(Date.now() - 6 * 3600000).toISOString(), user: 'Team', type: 'review' },
        { id: 3, action: 'New member joined team', time: new Date(Date.now() - 1 * 86400000).toISOString(), user: 'HR', type: 'hire' }
      ]
    });
    
    setStats({
      totalTasks: 89,
      completedTasks: 45,
      pendingApprovals: 3,
      resourceRequests: 2,
      activeSessions: 3,
      teamMembers: 8,
      projectsActive: 5,
      sprintVelocity: 72
    });
    
    setTopPerformers([
      { name: 'Priya Sharma', role: 'Senior Engineer', department: 'Core Systems', tasks: 31, initials: 'PS', avatar: 'P' },
      { name: 'Ravi Das', role: 'Frontend Developer', department: 'Core Systems', tasks: 28, initials: 'RD', avatar: 'R' },
      { name: 'Nisha Kumar', role: 'Backend Developer', department: 'Core Systems', tasks: 22, initials: 'NK', avatar: 'N' },
      { name: 'Suresh M', role: 'Database Admin', department: 'Core Systems', tasks: 18, initials: 'SM', avatar: 'S' },
      { name: 'Alex Chen', role: 'QA Engineer', department: 'Core Systems', tasks: 15, initials: 'AC', avatar: 'A' }
    ]);
  };

  const approveResourceRequest = async (requestId) => {
    try {
      setDashboardData(prev => ({
        ...prev,
        resourceRequests: prev.resourceRequests.map(r =>
          r.id === requestId ? { ...r, status: 'approved' } : r
        )
      }));
      alert('Resource request approved');
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const completeActionItem = async (actionId) => {
    try {
      setDashboardData(prev => ({
        ...prev,
        actionItems: prev.actionItems.map(a =>
          a.id === actionId ? { ...a, status: 'completed' } : a
        )
      }));
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  const toggleAction = (index) => {
    if (completedActions.includes(index)) {
      setCompletedActions(completedActions.filter(i => i !== index));
    } else {
      setCompletedActions([...completedActions, index]);
      if (dashboardData.actionItems[index]) {
        completeActionItem(dashboardData.actionItems[index].id);
      }
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const managerName = currentUser?.name || 'Manager';

  const renderOverview = () => (
    <>
      {/* Manager Profile Section */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{managerName}</h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-sm font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{currentUser?.role || 'Manager'}</span>
          <span className="text-sm text-gray-500">All departments</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{stats.teamMembers} Team Members</span>
        </div>
        <p className="text-gray-600 text-sm mt-3">
          Leading company-wide operations, focusing on delivery excellence, team growth, and cross-functional collaboration.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Team Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
          <p className="text-xs text-green-600 mt-1">{stats.completedTasks} completed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Sprint Velocity</p>
          <p className="text-2xl font-bold text-blue-600">{stats.sprintVelocity}%</p>
          <p className="text-xs text-gray-400 mt-1">Team average</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Active Projects</p>
          <p className="text-2xl font-bold text-gray-900">{stats.projectsActive}</p>
          <p className="text-xs text-gray-400 mt-1">In progress</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Pending Approvals</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
          <p className="text-xs text-gray-400 mt-1">Action required</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500">Active Sessions</p>
          <p className="text-2xl font-bold text-purple-600">{stats.activeSessions}</p>
          <p className="text-xs text-gray-400 mt-1">Team members online</p>
        </div>
      </div>

      {/* Team Health & Top Performers Row */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Team headcount & health</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.teamMembers}</div>
                <div className="text-xs text-gray-500">Team Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{teamHealth.newJoinees}</div>
                <div className="text-xs text-gray-500">New this month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{teamHealth.terminated}</div>
                <div className="text-xs text-gray-500">Terminated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{teamHealth.onLeave}</div>
                <div className="text-xs text-gray-500">On Leave</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Team Satisfaction</span>
                <span className="font-medium text-gray-900">{teamHealth.satisfaction}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 rounded-full h-2" style={{ width: `${teamHealth.satisfaction}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">🏆 Top Performers — This Month</h3>
          </div>
          <div className="p-5 space-y-4">
            {topPerformers.map((performer, idx) => (
              <div key={idx} className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-600' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      idx === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-600' :
                      'bg-gradient-to-br from-blue-500 to-purple-500'
                    }`}>
                      {performer.initials}
                    </div>
                    {idx === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">👑</div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{performer.name}</div>
                    <div className="text-xs text-gray-500">{performer.role} · {performer.department}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{performer.tasks}</div>
                  <div className="text-xs text-gray-400">tasks</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Progress */}
      <div className="bg-white rounded-xl border border-gray-200 mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Team progress — current sprint</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-200 rounded-lg"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </div>
        <div className="p-6 space-y-5">
          {dashboardData.departmentProgress.map((dept, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{dept.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">{dept.members} members</span>
                  <span className="text-sm font-semibold text-blue-600">{dept.progress}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-blue-600 rounded-full h-2.5 transition-all duration-500" style={{ width: `${dept.progress}%` }}></div>
              </div>
              {dept.completedTasks && (
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>{dept.completedTasks} completed</span>
                  <span>{dept.pendingTasks} pending</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">📅 Upcoming meetings</h2>
          </div>
          <div className="p-6 space-y-4">
            {dashboardData.upcomingMeetings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming meetings</p>
            ) : (
              dashboardData.upcomingMeetings.map((meeting, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="text-center min-w-[50px]">
                    <div className="text-xl font-bold text-gray-900">{meeting.date}</div>
                    <div className="text-xs text-gray-500">{meeting.month}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                    <p className="text-xs text-gray-500">{meeting.dept} · {meeting.time}</p>
                    {meeting.duration && <p className="text-xs text-gray-400">{meeting.duration}</p>}
                    <span className="text-xs text-yellow-600 mt-1 inline-block">{meeting.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resource Requests */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">📦 Resource requests</h2>
          </div>
          <div className="p-6 space-y-4">
            {dashboardData.resourceRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending requests</p>
            ) : (
              dashboardData.resourceRequests.map((request, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="text-center min-w-[50px]">
                    <div className="text-xl font-bold text-gray-900">{request.date}</div>
                    <div className="text-xs text-gray-500">{request.month}</div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{request.item}</p>
                    <p className="text-xs text-gray-500">{request.requester}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs ${request.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                        {request.status === 'pending' ? 'Pending' : 'Approved'}
                      </span>
                      {request.status === 'pending' && (
                        <button
                          onClick={() => approveResourceRequest(request.id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">✅ Your action items</h2>
          </div>
          <div className="p-6 space-y-3">
            {dashboardData.actionItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No action items</p>
            ) : (
              dashboardData.actionItems.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <button onClick={() => toggleAction(idx)} className="mt-0.5">
                    <div className={`w-4 h-4 rounded border ${completedActions.includes(idx) || item.status === 'completed' ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                      {(completedActions.includes(idx) || item.status === 'completed') && (
                        <span className="text-white text-xs flex items-center justify-center">✓</span>
                      )}
                    </div>
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${completedActions.includes(idx) || item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500">Due: {item.due}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.priority === 'High' ? 'bg-red-100 text-red-700' : 
                    item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">📋 Recent activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {dashboardData.recentActivity.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No recent activity</div>
          ) : (
            dashboardData.recentActivity.map((activity, i) => (
              <div key={i} className="flex justify-between items-center px-6 py-3 hover:bg-gray-50 transition">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-700">{activity.action}</p>
                  <span className="text-xs text-gray-400">by {activity.user || activity.requester || 'Team'}</span>
                </div>
                <p className="text-xs text-gray-400">{formatRelativeTime(activity.time)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

  if (isLoading && dashboardData.departmentProgress.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && dashboardData.departmentProgress.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('login-management')}
            className={`py-2 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'login-management'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Login Management
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'login-management' && <LoginManagement userRole="Manager" />}
    </div>
  );
};

export default ManagerDashboard;
