import React, { useEffect, useState } from 'react';
import authService from '../../../services/authService';
import GoogleDriveViewer from '../../Common/GoogleDriveViewer';

const CEODashboard = ({ user, onLogout }) => {
  const [showDriveViewer, setShowDriveViewer] = useState(false);
  
  const [stats, setStats] = useState({
    totalMembers: 12,
    departments: 5,
    sprintVelocity: 78,
    activeProjects: 24,
    tasksThisWeek: 78,
    overdueTasks: 1,
    resourceUtilization: 86,
    resourceConflicts: 3,
    pendingApprovals: 2
  });

  // Mock data for display
  const atRiskProjects = [{ name: 'Project Beta — Hardware & Integration', completion: 45 }];
  const delayedProjects = [{ name: 'Project Delta — Ops', completion: 30 }];
  const departmentProgress = [
    { name: 'Core Systems', members: 48, progress: 82 },
    { name: 'Hardware & Integration', members: 12, progress: 65 }
  ];
  const topPerformers = [
    { name: 'Sita Krishnan', role: 'AI/LLM & Perception', tasks: 31, initials: 'SK' },
    { name: 'Priya Sharma', role: 'Core Systems', tasks: 28, initials: 'PS' },
    { name: 'Anil Mehta', role: 'Hardware & Integration', tasks: 22, initials: 'AM' }
  ];
  const upcomingMeetings = [
    { date: '2026-06-05', title: 'Q2 Sprint Planning', dept: 'Core Systems', time: '10:00 AM' },
    { date: '2026-06-06', title: 'Hardware & Integration System Review', dept: 'Hardware & Integration', time: '2:00 PM' },
    { date: '2026-06-10', title: 'All-Hands Q2', dept: 'All', time: '9:00 AM' }
  ];
  const resourceRequests = [
    { date: '2026-06-02', item: 'MacBook Pro M3', requester: 'Ravi Das', status: 'pending' },
    { date: '2026-06-01', item: 'AWS Dev Credits', requester: 'Nisha Kumar', status: 'pending' },
    { date: '2026-06-01', item: 'Figma Pro License', requester: 'Pooja B', status: 'approved' }
  ];
  const actionItems = [
    { title: 'Review Beta project risk plan', priority: 'High', due: 'Today' },
    { title: 'Approve resource requests (2)', priority: 'High', due: 'Today' },
    { title: 'Sign off on Q2 sprint goals', priority: 'Medium', due: 'Jun 5' },
    { title: 'Performance review — Ravi Das', priority: 'Medium', due: 'Jun 7' },
    { title: 'Confirm all-hands agenda', priority: 'Low', due: 'Jun 9' }
  ];
  const recentActivity = [
    { action: 'Priya Sharma completed Alpha milestone', time: '2h ago' },
    { action: 'Beta project marked at risk', time: '6h ago' },
    { action: 'New member joined Core Systems team', time: '4h ago' },
    { action: 'Resource conflict resolved by Manager', time: '1d ago' },
    { action: 'Hardware & Integration sprint review completed', time: '8h ago' },
    { action: 'AI/LLM & Perception campaign exceeded targets', time: '1d ago' }
  ];

  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = authService.getToken();

      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        return;
      }

      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/dashboard/ceo`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`CEO dashboard request failed with ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
        setStats(prev => ({ ...prev, ...(data.stats || {}) }));
      } catch (error) {
        console.error('Error fetching CEO dashboard:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const liveAtRiskProjects = dashboardData?.atRiskProjects || atRiskProjects;
  const liveDelayedProjects = dashboardData?.delayedProjects || delayedProjects;
  const liveDepartmentProgress = dashboardData?.departmentProgress || departmentProgress;
  const liveTopPerformers = dashboardData?.topPerformers || topPerformers;
  const liveUpcomingMeetings = dashboardData?.upcomingMeetings || upcomingMeetings;
  const liveResourceRequests = dashboardData?.resourceRequests || resourceRequests;
  const liveActionItems = dashboardData?.actionItems || actionItems;
  const liveRecentActivity = dashboardData?.recentActivity || recentActivity;
  const teamHealth = dashboardData?.teamHealth || { active: 138, newThisMonth: 4, terminated: 2 };

  const formatMeetingDate = (dateString) => {
    if (!dateString) return 'TBD';
    if (String(dateString).includes('-')) return String(dateString).split('-').slice(1, 3).join(' ');
    return dateString;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Dashboard Title with Drive Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setShowDriveViewer(!showDriveViewer)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9m-4 0h.01M9 14h6" />
          </svg>
          <span>{showDriveViewer ? 'Hide Documents' : 'Employee Documents'}</span>
        </button>
      </div>

      {/* Google Drive Viewer - Toggle */}
      {showDriveViewer && (
        <div className="mb-6">
          <GoogleDriveViewer />
        </div>
      )}

      {/* CEO Profile Section */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'John Doe'}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded">CEO</span>
          <span className="text-sm text-gray-500">All Departments</span>
        </div>
        <p className="text-gray-600 text-sm mt-3">
          Driving company vision, culture, and growth across all departments. Focused on building a high-performance, people-first organization.
        </p>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">ACTIVE PROJECTS</div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeProjects}</div>
          <div className="text-xs text-red-500 mt-1">{liveAtRiskProjects.length} at risk · {liveDelayedProjects.length} delayed</div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">TASKS THIS WEEK</div>
          <div className="text-3xl font-bold text-gray-900">{stats.tasksThisWeek}%</div>
          <div className="text-xs text-red-500 mt-1">{stats.overdueTasks} overdue</div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">RESOURCE UTILIZATION</div>
          <div className="text-3xl font-bold text-gray-900">{stats.resourceUtilization}%</div>
          <div className="text-xs text-orange-500 mt-1">{stats.resourceConflicts} conflicts flagged</div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="text-sm font-medium text-gray-500 mb-1">PENDING APPROVALS</div>
          <div className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</div>
          <div className="text-xs text-gray-400 mt-1">resource requests</div>
        </div>
      </div>

      {/* Attention Required & Department Progress */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 bg-red-50 border-b">
            <h3 className="font-semibold text-gray-900">Attention required</h3>
          </div>
          <div className="divide-y">
            {liveAtRiskProjects.map((project, i) => (
              <div key={i} className="px-5 py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-sm text-gray-500">{project.completion}% complete</div>
                </div>
                <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded">At risk</span>
              </div>
            ))}
            {liveDelayedProjects.map((project, i) => (
              <div key={i} className="px-5 py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{project.name}</div>
                  <div className="text-sm text-gray-500">{project.completion}% complete</div>
                </div>
                <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Delayed</span>
              </div>
            ))}
            <div className="px-5 py-3 text-sm text-gray-600">
              • {stats.overdueTasks} task past due date
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Department progress — this sprint</h3>
          </div>
          <div className="p-5 space-y-4">
            {liveDepartmentProgress.map((dept, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{dept.name}</span>
                  <span className="text-gray-500">{dept.members} members</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${dept.progress}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{dept.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Headcount & Top Performers */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Team headcount & health</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{teamHealth.active}</div>
                <div className="text-xs text-gray-500">Active across {stats.departments} depts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{teamHealth.newThisMonth}</div>
                <div className="text-xs text-gray-500">New this month onboarding</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{teamHealth.terminated}</div>
                <div className="text-xs text-gray-500">Terminated this quarter</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Top performers</h3>
          </div>
          <div className="p-5 space-y-4">
            {liveTopPerformers.map((performer, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                    {performer.initials}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{performer.name}</div>
                    <div className="text-xs text-gray-500">{performer.role}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{performer.tasks} tasks</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Column Section */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Upcoming meetings</h3>
          </div>
          <div className="divide-y">
            {liveUpcomingMeetings.map((meeting, i) => (
              <div key={i} className="px-5 py-3">
                <div className="text-xs text-gray-400">{formatMeetingDate(meeting.date)}</div>
                <div className="text-sm font-medium text-gray-900">{meeting.title}</div>
                <div className="text-xs text-gray-500">{meeting.dept} · {meeting.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Resource requests</h3>
          </div>
          <div className="divide-y">
            {liveResourceRequests.map((request, i) => (
              <div key={i} className="px-5 py-3">
                <div className="text-xs text-gray-400">{request.date}</div>
                <div className="text-sm font-medium text-gray-900">{request.item}</div>
                <div className="text-xs text-gray-500">{request.requester}</div>
                <div className="text-xs mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {request.status === 'pending' ? 'Pending' : 'Approved'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Your action items</h3>
          </div>
          <div className="divide-y">
            {liveActionItems.map((item, idx) => (
              <div key={idx} className="px-5 py-3">
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Due: {item.due}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900 text-sm">Recent activity</h3>
        </div>
        <div className="divide-y">
          {liveRecentActivity.map((activity, i) => (
            <div key={i} className="px-5 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-700">{activity.action}</span>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
