// src/components/Dashboard/CEO/ActivityMonitor.jsx
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import employeeService from '../../../services/employeeService';
import reportService from '../../../services/reportService';
import leaveService from '../../../services/leaveService';
import taskService from '../../../services/taskService';

const ActivityMonitor = ({ userRole = 'CEO' }) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [stats, setStats] = useState({
    totalActivities: 0,
    reports: 0,
    leaves: 0,
    tasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [useMockData, setUseMockData] = useState(true); // Set to false when backend is ready

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [activities, filter, dateRange, searchTerm]);

  // Mock data for development
  const getMockActivities = () => {
    return [
      { id: 1, type: 'report', name: 'Nisha Kumar', initials: 'NK', role: 'Member', department: 'Core Systems', action: 'submitted daily work report', details: 'Completed UI component development and fixed navigation bugs', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 2, type: 'report', name: 'Anil Mehta', initials: 'AM', role: 'Team Lead', department: 'Hardware & Integration', action: 'submitted daily work report', details: 'Reviewed design system and updated component library', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 3, type: 'meeting', name: 'Sita Krishnan', initials: 'SK', role: 'Team Lead', department: 'AI/LLM & Perception', action: 'scheduled meeting', details: 'AI/LLM & Perception Campaign Kickoff - Tomorrow at 10 AM', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
      { id: 4, type: 'leave', name: 'Jane Smith', initials: 'JS', role: 'Manager', department: 'Platform and DevOps', action: 'approved leave request', details: 'Ravi Das - Sick Leave (2 days)', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 5, type: 'task', name: 'Mike Johnson', initials: 'MJ', role: 'Team Lead', department: 'Core Systems', action: 'completed task', details: 'Code review for PR #123', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
      { id: 6, type: 'pending', name: 'Ravi Das', initials: 'RD', role: 'Member', department: 'Core Systems', action: 'applied for leave', details: 'Sick leave (2 days) - Pending approval', timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
      { id: 7, type: 'progress', name: 'Priya Sharma', initials: 'PS', role: 'Team Lead', department: 'Core Systems', action: 'updated task progress', details: 'Build login UI - 75% complete', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: 8, type: 'report', name: 'Sita Krishnan', initials: 'SK', role: 'Team Lead', department: 'AI/LLM & Perception', action: 'submitted daily work report', details: 'AI/LLM & Perception campaign analysis completed', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: 9, type: 'task', name: 'Alex Chen', initials: 'AC', role: 'Member', department: 'Core Systems', action: 'completed task', details: 'Fix navigation bug in header', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 10, type: 'report', name: 'John Doe', initials: 'JD', role: 'CEO', department: 'Platform and DevOps', action: 'submitted weekly report', details: 'Q2 performance review and strategic planning', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: 11, type: 'leave', name: 'John Doe', initials: 'JD', role: 'CEO', department: 'Platform and DevOps', action: 'approved leave request', details: 'Anil Mehta - Annual Leave (5 days)', timestamp: new Date(Date.now() - 5 * 86400000).toISOString() },
      { id: 12, type: 'task', name: 'Nisha Kumar', initials: 'NK', role: 'Member', department: 'Core Systems', action: 'started new task', details: 'Implement authentication module', timestamp: new Date(Date.now() - 6 * 86400000).toISOString() }
    ];
  };

  const fetchActivities = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let activityList = [];

      if (useMockData) {
        // Use mock data for development
        console.log('Using mock data for Activity Monitor');
        activityList = getMockActivities();
      } else {
        // Fetch real data from services
        const [employees, reports, leaveRequests, tasks] = await Promise.all([
          employeeService.getAllEmployees(),
          reportService.getAllReports().catch(() => []),
          leaveService.getAllRequests().catch(() => []),
          taskService.getAllTasks().catch(() => [])
        ]);

        // Report submission activities
        reports.forEach(report => {
          activityList.push({
            id: `report-${report.id}`,
            type: 'report',
            name: report.userName,
            initials: report.userName?.split(' ').map(n => n[0]).join('') || 'U',
            role: report.userRole,
            department: report.department,
            action: 'submitted daily work report',
            details: report.completedTasks?.substring(0, 80) || 'Daily report submitted',
            timestamp: report.submittedAt || report.createdAt,
          });
        });

        // Leave request activities
        leaveRequests.forEach(leave => {
          if (leave.status === 'Approved') {
            activityList.push({
              id: `leave-${leave.id}`,
              type: 'leave',
              name: leave.userName,
              initials: leave.userName?.split(' ').map(n => n[0]).join('') || 'U',
              role: leave.userRole,
              department: leave.department,
              action: 'approved leave request',
              details: `${leave.type} leave (${leave.days} day${leave.days > 1 ? 's' : ''})`,
              timestamp: leave.approvedOn || leave.updatedAt,
            });
          } else if (leave.status === 'Pending') {
            activityList.push({
              id: `leave-pending-${leave.id}`,
              type: 'pending',
              name: leave.userName,
              initials: leave.userName?.split(' ').map(n => n[0]).join('') || 'U',
              role: leave.userRole,
              department: leave.department,
              action: 'applied for leave',
              details: `${leave.type} leave (${leave.days} day${leave.days > 1 ? 's' : ''}) - Pending approval`,
              timestamp: leave.appliedOn,
            });
          }
        });

        // Task activities
        tasks.forEach(task => {
          activityList.push({
            id: `task-${task.id}`,
            type: task.status === 'Completed' ? 'task' : 'progress',
            name: task.assignedToName || 'Team Member',
            initials: task.assignedToName?.split(' ').map(n => n[0]).join('') || 'TM',
            role: task.assignedToRole || 'Member',
            department: task.department,
            action: task.status === 'Completed' ? 'completed task' : 'updated task progress',
            details: task.title,
            timestamp: task.completedAt || task.updatedAt || task.createdAt,
          });
        });
      }

      // Sort by timestamp (newest first)
      activityList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Calculate stats
      const statsData = {
        totalActivities: activityList.length,
        reports: activityList.filter(a => a.type === 'report').length,
        leaves: activityList.filter(a => a.type === 'leave' || a.type === 'pending').length,
        tasks: activityList.filter(a => a.type === 'task' || a.type === 'progress' || a.type === 'meeting').length,
      };

      setStats(statsData);
      setActivities(activityList);

    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities. Using mock data.');
      
      // Fallback mock data
      const mockActivities = getMockActivities();
      setActivities(mockActivities);
      setStats({
        totalActivities: mockActivities.length,
        reports: mockActivities.filter(a => a.type === 'report').length,
        leaves: mockActivities.filter(a => a.type === 'leave' || a.type === 'pending').length,
        tasks: mockActivities.filter(a => a.type === 'task' || a.type === 'progress' || a.type === 'meeting').length,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...activities];

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(a => a.type === filter);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(a => {
        const activityDate = new Date(a.timestamp);
        
        if (dateRange === 'today') {
          return activityDate >= today;
        } else if (dateRange === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return activityDate >= weekAgo;
        } else if (dateRange === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return activityDate >= monthAgo;
        }
        return true;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.name?.toLowerCase().includes(term) ||
        a.action?.toLowerCase().includes(term) ||
        a.details?.toLowerCase().includes(term) ||
        a.department?.toLowerCase().includes(term)
      );
    }

    setFilteredActivities(filtered);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredActivities.map(activity => ({
      'User': activity.name,
      'Role': activity.role,
      'Department': activity.department || 'N/A',
      'Action': activity.action,
      'Details': activity.details,
      'Time': new Date(activity.timestamp).toLocaleString(),
      'Relative Time': formatRelativeTime(activity.timestamp)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // User
      { wch: 12 }, // Role
      { wch: 15 }, // Department
      { wch: 25 }, // Action
      { wch: 50 }, // Details
      { wch: 20 }, // Time
      { wch: 15 }  // Relative Time
    ];
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Report');
    
    const fileName = `activity-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export to CSV (fallback)
  const exportToCSV = () => {
    const headers = ['User', 'Role', 'Department', 'Action', 'Details', 'Time', 'Relative Time'];
    const csvData = filteredActivities.map(a => [
      a.name,
      a.role,
      a.department || 'N/A',
      a.action,
      `"${a.details?.replace(/"/g, '""') || ''}"`,
      new Date(a.timestamp).toLocaleString(),
      formatRelativeTime(a.timestamp)
    ]);
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getRoleBadge = (role) => {
    const colors = {
      'CEO': 'bg-purple-100 text-purple-700',
      'Manager': 'bg-blue-100 text-blue-700',
      'Team Lead': 'bg-green-100 text-green-700',
      'Lead': 'bg-green-100 text-green-700',
      'Member': 'bg-gray-100 text-gray-700'
    };
    const badgeClass = colors[role] || 'bg-gray-100 text-gray-700';
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>{role || 'Member'}</span>;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'report': 'Report',
      'leave': 'Approval',
      'pending': 'Pending',
      'task': 'Task',
      'progress': 'Progress',
      'meeting': 'Meeting'
    };
    return labels[type] || 'Activity';
  };

  const getTypeColor = (type) => {
    const colors = {
      'report': 'bg-blue-50 text-blue-600',
      'leave': 'bg-green-50 text-green-600',
      'pending': 'bg-yellow-50 text-yellow-600',
      'task': 'bg-purple-50 text-purple-600',
      'progress': 'bg-orange-50 text-orange-600',
      'meeting': 'bg-indigo-50 text-indigo-600'
    };
    return colors[type] || 'bg-gray-50 text-gray-600';
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Activity Monitor</h1>
        <p className="text-gray-500 mt-1">Track user activities across the platform</p>
        {useMockData && (
          <div className="mt-2 inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            Demo Mode - Using Mock Data
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.totalActivities}</div>
          <div className="text-sm text-gray-500">Total Activities</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.reports}</div>
          <div className="text-sm text-gray-500">Reports</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">{stats.leaves}</div>
          <div className="text-sm text-gray-500">Leave Actions</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.tasks}</div>
          <div className="text-sm text-gray-500">Tasks & Meetings</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ACTIVITY TYPE</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Activities</option>
              <option value="report">Reports</option>
              <option value="leave">Leave Approvals</option>
              <option value="pending">Pending Requests</option>
              <option value="task">Tasks</option>
              <option value="progress">Progress Updates</option>
              <option value="meeting">Meetings</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">DATE RANGE</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">SEARCH</label>
            <input
              type="text"
              placeholder="Search by name, action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setFilter('all');
                setDateRange('week');
                setSearchTerm('');
              }}
              className="flex-1 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
            <button
              onClick={exportToExcel}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
              title="Export to Excel"
            >
              📊 Excel
            </button>
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2"
              title="Export to CSV"
            >
              📄 CSV
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && filteredActivities.length === 0 ? (
        <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Activities</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchActivities} className="px-4 py-2 bg-black text-white rounded-lg">Try Again</button>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500">No activities found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        /* Activity Feed */
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-6 py-3 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{filteredActivities.length} activities found</span>
              <div className="flex gap-2">
                <button
                  onClick={exportToExcel}
                  className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  📊 Export Excel
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={exportToCSV}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  📄 Export CSV
                </button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold text-sm flex-shrink-0">
                    {activity.initials}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{activity.name}</span>
                      {getRoleBadge(activity.role)}
                      {activity.department && (
                        <span className="text-xs text-gray-400">{activity.department}</span>
                      )}
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{formatRelativeTime(activity.timestamp)}</span>
                    </div>
                    
                    <p className="text-gray-700 text-sm">
                      {activity.action}
                      {activity.details && (
                        <span className="text-gray-500 ml-1">
                          “{activity.details.length > 80 ? activity.details.substring(0, 80) + '...' : activity.details}”
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {/* Type badge */}
                  <div className="flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(activity.type)}`}>
                      {getTypeLabel(activity.type)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityMonitor;