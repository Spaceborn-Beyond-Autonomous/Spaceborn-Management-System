import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, TrendingUp, FolderKanban, 
  AlertCircle, Calendar, Target, Laptop,
  CheckCircle2, Clock, AlertTriangle, Star,
  Activity, ChevronRight, Database,
  Bell, Search, LogOut
} from 'lucide-react';
import ShiftTimer from '../../Common/ShiftTimer';
import authService from '../../../services/authService';
import employeeService from '../../../services/employeeService';
import reportService from '../../../services/reportService';
import leaveService from '../../../services/leaveService';
import taskService from '../../../services/taskService';
import projectService from '../../../services/projectService';
import meetingService from '../../../services/meetingService';
import resourceService from '../../../services/resourceService';
import { DEPARTMENTS } from '../utils/departments';

const CEODashboard = ({ userRole = 'CEO', user, onLogout }) => {
  const [dashboardData, setDashboardData] = useState({
    totalMembers: 0,
    departments: 0,
    sprintVelocity: 0,
    activeProjects: 0,
    tasksThisWeek: 0,
    overdueTasks: 0,
    resourceUtilization: 0,
    resourceConflicts: 0,
    pendingApprovals: 0,
    departmentProgress: [],
    atRiskProjects: [],
    topPerformers: [],
    upcomingMeetings: [],
    resourceRequests: [],
    actionItems: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel from real APIs
      const [employees, reports, leaveRequests, tasks, projects, meetings, resources] = await Promise.all([
        employeeService.getAllEmployees(),
        reportService.getAllReports(),
        leaveService.getAllRequests(),
        taskService.getAllTasks().catch(() => []),
        projectService.getAllProjects().catch(() => []),
        meetingService.getAllMeetings().catch(() => []),
        resourceService.getAllRequests().catch(() => [])
      ]);

      // Calculate real stats from API data
      const departments = DEPARTMENTS;
      const totalMembers = employees.length;
      
      // Calculate active projects from projects API
      const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
      
      // Calculate at-risk projects
      const atRiskProjects = projects
        .filter(p => p.status === 'at-risk' || p.health === 'critical')
        .map(p => ({ name: p.name, completion: p.completion || p.progress || 0, status: 'at-risk' }));
      
      // Calculate department progress from actual report data
      const departmentProgress = departments.map(dept => {
        const deptEmployees = employees.filter(emp => emp.department === dept);
        const deptReports = reports.filter(r => r.department === dept);
        const reportRate = deptEmployees.length > 0 
          ? Math.round((deptReports.length / (deptEmployees.length * 22)) * 100) 
          : 0;
        
        return {
          name: dept,
          members: deptEmployees.length,
          progress: Math.min(reportRate, 100)
        };
      });
      
      // Calculate top performers (based on report submissions + task completions)
      const performerMap = new Map();
      
      reports.forEach(report => {
        const key = report.userId || report.userName;
        if (!performerMap.has(key)) {
          performerMap.set(key, {
            name: report.userName,
            role: report.userRole,
            tasks: 0,
            initials: report.userName?.split(' ').map(n => n[0]).join('') || 'U'
          });
        }
        performerMap.get(key).tasks++;
      });
      
      tasks.filter(t => t.status === 'Completed').forEach(task => {
        const key = task.assignedTo || task.assignedToName;
        if (key && performerMap.has(key)) {
          performerMap.get(key).tasks++;
        }
      });
      
      const topPerformers = Array.from(performerMap.values())
        .sort((a, b) => b.tasks - a.tasks)
        .slice(0, 3);
      
      // Calculate task statistics
      const today = new Date();
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const tasksThisWeek = tasks.filter(t => {
        const taskDate = new Date(t.createdAt || t.dueDate);
        return taskDate >= oneWeekAgo;
      });
      const completedThisWeek = tasksThisWeek.filter(t => t.status === 'Completed').length;
      const tasksThisWeekPercentage = tasksThisWeek.length > 0 
        ? Math.round((completedThisWeek / tasksThisWeek.length) * 100) 
        : 0;
      
      const overdueTasks = tasks.filter(t => {
        if (t.status === 'Completed') return false;
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < today;
      }).length;
      
      // Calculate resource utilization
      const totalResources = resources.length;
      const allocatedResources = resources.filter(r => r.status === 'allocated' || r.status === 'in-use').length;
      const resourceUtilization = totalResources > 0 ? Math.round((allocatedResources / totalResources) * 100) : 0;
      const resourceConflicts = resources.filter(r => r.hasConflict === true || r.conflict === true).length;
      
      // Calculate pending approvals from leave requests
      const pendingApprovals = leaveRequests.filter(l => l.status === 'Pending').length;
      
      // Calculate sprint velocity from tasks
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const totalTasks = tasks.length;
      const sprintVelocity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Get upcoming meetings (next 7 days)
      const next7Days = new Date(today);
      next7Days.setDate(next7Days.getDate() + 7);
      const upcomingMeetings = meetings
        .filter(m => new Date(m.date) >= today && new Date(m.date) <= next7Days)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
        .map(m => ({
          date: m.date,
          title: m.title,
          dept: m.department || m.dept,
          time: m.time
        }));
      
      // Get resource requests
      const resourceRequests = resources
        .filter(r => r.status === 'pending' || r.status === 'requested')
        .slice(0, 5)
        .map(r => ({
          item: r.item || r.name,
          requester: r.requesterName || r.requestedBy,
          status: r.status
        }));
      
      // Get action items (high priority tasks assigned to CEO)
      const actionItems = tasks
        .filter(t => t.status !== 'Completed' && (t.assignedTo === currentUser?.id || t.priority === 'High'))
        .slice(0, 5)
        .map(t => ({
          title: t.title,
          priority: t.priority || 'Medium',
          due: t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'
        }));
      
      // Calculate recent activity from reports, tasks, and leaves
      const activities = [
        ...reports.slice(0, 2).map(r => ({
          action: `${r.userName} submitted daily report`,
          time: r.submittedAt || r.createdAt
        })),
        ...tasks.filter(t => t.status === 'Completed').slice(0, 2).map(t => ({
          action: `${t.assignedToName || 'Someone'} completed: ${t.title}`,
          time: t.completedAt || t.updatedAt
        })),
        ...leaveRequests.filter(l => l.status === 'Approved').slice(0, 2).map(l => ({
          action: `${l.userName}'s leave request approved`,
          time: l.approvedOn || l.updatedAt
        }))
      ];
      
      const recentActivity = activities
        .filter(a => a.time)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6);
      
      // Calculate new this month and terminated counts
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const newThisMonth = employees.filter(emp => {
        const joinDate = new Date(emp.joinDate);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
      }).length;
      
      const terminatedCount = employees.filter(emp => emp.status === 'Terminated').length;
      
      setDashboardData({
        totalMembers,
        departments: departments.length,
        sprintVelocity: sprintVelocity || 0,
        activeProjects: activeProjects || 0,
        tasksThisWeek: tasksThisWeekPercentage || 0,
        overdueTasks: overdueTasks || 0,
        resourceUtilization: resourceUtilization || 0,
        resourceConflicts: resourceConflicts || 0,
        pendingApprovals: pendingApprovals || 0,
        departmentProgress,
        atRiskProjects: atRiskProjects.length > 0 ? atRiskProjects : [],
        topPerformers: topPerformers.length > 0 ? topPerformers : [],
        upcomingMeetings: upcomingMeetings.length > 0 ? upcomingMeetings : [],
        resourceRequests: resourceRequests.length > 0 ? resourceRequests : [],
        actionItems: actionItems.length > 0 ? actionItems : [],
        recentActivity: recentActivity.length > 0 ? recentActivity : []
      });
      
      setCurrentUser(user || authService.getCurrentUser());
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Recently';
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && dashboardData.totalMembers === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchAllData} className="px-4 py-2 bg-black text-white rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div>
        {/* Stats Grid - Shows REAL data from database */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold">{dashboardData.totalMembers}</div>
            <div className="text-sm text-gray-600">Total Members</div>
          </div>
          <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold">{dashboardData.departments}</div>
            <div className="text-sm text-gray-600">Departments</div>
          </div>
          <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold">{dashboardData.sprintVelocity}%</div>
            <div className="text-sm text-gray-600">Sprint Velocity</div>
            <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
              <div className="bg-green-500 h-1 rounded-full" style={{ width: `${dashboardData.sprintVelocity}%` }}></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold">{dashboardData.activeProjects}</div>
            <div className="text-sm text-gray-600">Active Projects</div>
            <p className="text-xs text-red-500 mt-1">{dashboardData.atRiskProjects.length} at risk</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">Tasks This Week</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardData.tasksThisWeek}%</p>
            <p className="text-sm text-red-600 mt-1">{dashboardData.overdueTasks} overdue</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">Resource Utilization</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardData.resourceUtilization}%</p>
            <p className="text-sm text-orange-600 mt-1">{dashboardData.resourceConflicts} conflicts flagged</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-gray-500">Pending Approvals</span>
              <AlertCircle className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{dashboardData.pendingApprovals}</p>
            <p className="text-sm text-gray-500 mt-1">leave requests</p>
          </div>
        </div>

        {/* Department Progress - Shows REAL data */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Department progress — this sprint</h2>
          </div>
          <div className="p-6 space-y-5">
            {dashboardData.departmentProgress.length > 0 ? (
              dashboardData.departmentProgress.map((dept, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{dept.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{dept.members} members</span>
                      <span className="text-sm font-semibold text-blue-600">{dept.progress}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-2.5 transition-all duration-1000"
                      style={{ width: `${dept.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No department data available</div>
            )}
          </div>
        </div>

        {/* Team Headcount & Health + Top Performers */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Team headcount & health</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.totalMembers}</p>
                  <p className="text-xs text-gray-600 mt-1">Active</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-600">+{dashboardData.newThisMonth || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">New this month</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-3xl font-bold text-red-600">{dashboardData.terminatedCount || 0}</p>
                  <p className="text-xs text-gray-600 mt-1">Terminated</p>
                </div>
              </div>

              <div className="border-t pt-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-700">Top performers this sprint</p>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="space-y-3">
                  {dashboardData.topPerformers.length > 0 ? (
                    dashboardData.topPerformers.map((performer, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                            {performer.initials}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{performer.name}</p>
                            <p className="text-xs text-gray-500">{performer.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-semibold text-gray-900">{performer.tasks} reports</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">No performer data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h2 className="font-semibold text-gray-900">Upcoming meetings</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {dashboardData.upcomingMeetings.length > 0 ? (
                dashboardData.upcomingMeetings.map((meeting, i) => (
                  <div key={i} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group">
                    <div className="text-center min-w-[55px]">
                      <p className="text-sm font-bold text-blue-600">
                        {new Date(meeting.date).getDate()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(meeting.date).toLocaleString('default', { month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{meeting.title}</p>
                      <p className="text-xs text-gray-500">{meeting.dept} · {meeting.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No upcoming meetings</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Recent activity</h2>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-gray-700">{activity.action}</p>
                  </div>
                  <p className="text-xs text-gray-400">{formatRelativeTime(activity.time)}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No recent activity</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEODashboard;
