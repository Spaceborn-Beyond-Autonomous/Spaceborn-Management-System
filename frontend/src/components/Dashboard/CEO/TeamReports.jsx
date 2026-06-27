// src/components/Dashboard/CEO/TeamReports.jsx
import React, { useState, useEffect } from 'react';
import reportService from '../../../services/reportService';
import roadmapService from '../../../services/roadmapService';
import { DEPARTMENTS } from '../../../utils/departments';

const CEOTeamReports = ({ userRole = 'CEO', department, user }) => {
  const [reports, setReports] = useState([]);
  const [sharedRoadmaps, setSharedRoadmaps] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalEmployees: 0,
    avgTasksPerDay: 0,
    activeRoadmaps: 0,
    avgProgress: 0,
    pendingReviews: 0
  });

  useEffect(() => {
  fetchAllData();
}, []);

const fetchAllData = async () => {
  setLoading(true);
  try {
    const reportsData = await reportService.getAllReports();
    const safeReports = Array.isArray(reportsData) ? reportsData : [];
    const roadmapsData = await roadmapService.getAllRoadmaps({ status: 'shared' });
    const issuedRoadmaps = roadmapsData.length > 0 ? roadmapsData : getIssuedMockRoadmaps();
    setReports(safeReports);
    setSharedRoadmaps(issuedRoadmaps);
    
    setDepartments(DEPARTMENTS);
    
    const totalReportsCount = safeReports.length;
    const totalEmployeesCount = [...new Set(safeReports.map(r => r.userId))].length;
    const activeRoadmapsCount = issuedRoadmaps.filter(r => ['active', 'shared'].includes(r.status)).length;
    const avgProgressValue = issuedRoadmaps.reduce((sum, r) => sum + (r.overallProgress || 0), 0) / issuedRoadmaps.length || 0;
    
    setStats({
      totalReports: totalReportsCount,
      totalEmployees: totalEmployeesCount,
      avgTasksPerDay: 0,
      activeRoadmaps: activeRoadmapsCount,
      avgProgress: Math.round(avgProgressValue),
      pendingReviews: safeReports.filter(r => !r.reviewed).length
    });
  } catch (error) {
    console.error('Error:', error);
    loadMockData();
  } finally {
    setLoading(false);
  }
};

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getIssuedMockRoadmaps = () => [
    {
      id: 1,
      title: 'SpaceBorn CMS MVP Roadmap',
      version: '2.1',
      description: 'Complete roadmap for SpaceBorn CMS MVP development including core features, milestones, and delivery timeline.',
      startDate: '2026-01-15',
      targetDate: '2026-12-20',
      lastUpdated: '2026-06-10T10:00:00Z',
      status: 'active',
      sharedBy: {
        id: 'lead_001',
        name: 'Priya Sharma',
        role: 'Core Systems Lead',
        email: 'priya.sharma@spaceborn.com',
        avatar: 'PS'
      },
      sharedAt: '2026-06-10T10:00:00Z',
      department: 'Core Systems',
      overallProgress: 45,
      milestones: [
        { id: 1, title: 'Phase 1: Foundation', dueDate: '2026-03-15', status: 'completed', description: 'Basic setup and architecture', progress: 100 },
        { id: 2, title: 'Phase 2: Core Features', dueDate: '2026-06-30', status: 'in-progress', description: 'Authentication, Dashboard, Content Management', progress: 65 },
        { id: 3, title: 'Phase 3: Advanced Features', dueDate: '2026-09-30', status: 'planned', description: 'Analytics, AI Insights, Collaboration', progress: 20 },
        { id: 4, title: 'Phase 4: Polish & Launch', dueDate: '2026-12-20', status: 'planned', description: 'Testing, Optimization, Deployment', progress: 0 }
      ],
      features: [
        { id: 1, name: 'User Authentication', priority: 'high', status: 'completed' },
        { id: 2, name: 'Dashboard UI', priority: 'high', status: 'completed' },
        { id: 3, name: 'Content Management System', priority: 'high', status: 'in-progress' },
        { id: 4, name: 'AI-Powered Insights', priority: 'medium', status: 'planned' }
      ],
      risks: [
        { id: 1, description: 'Third-party API dependency', impact: 'high', mitigation: 'Have fallback strategy', status: 'monitoring' }
      ]
    },
    {
      id: 2,
      title: 'Mobile App MVP Roadmap',
      version: '1.0',
      description: 'Mobile application development roadmap for iOS and Android platforms',
      startDate: '2026-03-01',
      targetDate: '2026-08-31',
      lastUpdated: '2026-06-08T14:30:00Z',
      status: 'active',
      sharedBy: {
        id: 'lead_002',
        name: 'Anil Mehta',
        role: 'Hardware & Integration Head',
        email: 'anil.mehta@spaceborn.com',
        avatar: 'AM'
      },
      sharedAt: '2026-06-08T14:30:00Z',
      department: 'Hardware & Integration',
      overallProgress: 30,
      milestones: [
        { id: 1, title: 'UI/UX Hardware & Integration', dueDate: '2026-04-15', status: 'completed', description: 'Complete mobile app designs', progress: 100 },
        { id: 2, title: 'Development Setup', dueDate: '2026-05-30', status: 'completed', description: 'Setup development environment', progress: 100 },
        { id: 3, title: 'Core Features', dueDate: '2026-07-15', status: 'in-progress', description: 'Implement core app features', progress: 45 }
      ],
      features: [
        { id: 1, name: 'User Onboarding', priority: 'high', status: 'completed' },
        { id: 2, name: 'Push Notifications', priority: 'high', status: 'in-progress' }
      ],
      risks: [
        { id: 1, description: 'App store approval delays', impact: 'medium', mitigation: 'Submit early for review', status: 'monitoring' }
      ]
    }
  ];

  const loadMockData = () => {
    // Mock reports data
    const mockReports = [
      {
        id: 1,
        userId: 'emp_001',
        userName: 'Ravi Das',
        userRole: 'Frontend Developer',
        department: 'Core Systems',
        employeeId: 'ENG001',
        date: '2026-06-10',
        completedTasks: '- Implemented login UI component\n- Fixed responsive layout issues\n- Updated authentication flow',
        ongoingWork: 'Working on dashboard performance optimization',
        issuesFaced: 'API rate limiting causing delays',
        nextDayPlan: 'Complete integration with auth API',
        submittedAt: '2026-06-10T16:30:00Z',
        reviewed: false
      },
      {
        id: 2,
        userId: 'emp_002',
        userName: 'Nisha Kumar',
        userRole: 'Backend Developer',
        department: 'Core Systems',
        employeeId: 'ENG002',
        date: '2026-06-10',
        completedTasks: '- Database schema migration\n- API endpoint optimization\n- Cache layer implementation',
        ongoingWork: 'Working on WebSocket integration',
        issuesFaced: 'No major issues',
        nextDayPlan: 'Complete real-time notifications',
        submittedAt: '2026-06-10T17:00:00Z',
        reviewed: false
      },
      {
        id: 3,
        userId: 'emp_003',
        userName: 'Priya Sharma',
        userRole: 'Core Systems Lead',
        department: 'Core Systems',
        employeeId: 'ENG003',
        date: '2026-06-10',
        completedTasks: '- Team sync meetings\n- Code review for 3 PRs\n- Sprint planning',
        ongoingWork: 'Preparing Q3 roadmap',
        issuesFaced: 'Resource allocation for new project',
        nextDayPlan: 'Client demo preparation',
        submittedAt: '2026-06-10T18:15:00Z',
        reviewed: true
      },
      {
        id: 4,
        userId: 'emp_004',
        userName: 'Pooja B',
        userRole: 'UI Designer',
        department: 'Hardware & Integration',
        employeeId: 'DES001',
        date: '2026-06-10',
        completedTasks: '- Dashboard mockups\n- Hardware & Integration system updates\n- Icon set creation',
        ongoingWork: 'Mobile app designs',
        issuesFaced: 'Hardware & Integration tool compatibility',
        nextDayPlan: 'Complete user flow diagrams',
        submittedAt: '2026-06-10T16:45:00Z',
        reviewed: false
      },
      {
        id: 5,
        userId: 'emp_005',
        userName: 'Anil Mehta',
        userRole: 'Hardware & Integration Lead',
        department: 'Hardware & Integration',
        employeeId: 'DES002',
        date: '2026-06-10',
        completedTasks: '- Hardware & Integration review sessions\n- Client feedback integration\n- Team mentorship',
        ongoingWork: 'Hardware & Integration system documentation',
        issuesFaced: 'Feedback delays from client',
        nextDayPlan: 'Finalize design assets',
        submittedAt: '2026-06-10T17:30:00Z',
        reviewed: false
      }
    ];
    setReports(mockReports);
    
    setDepartments(DEPARTMENTS);
    
    // Mock roadmaps data
    const mockRoadmaps = [
      {
        id: 1,
        title: 'SpaceBorn CMS MVP Roadmap',
        version: '2.1',
        description: 'Complete roadmap for SpaceBorn CMS MVP development including core features, milestones, and delivery timeline.',
        startDate: '2026-01-15',
        targetDate: '2026-12-20',
        lastUpdated: '2026-06-10T10:00:00Z',
        status: 'active',
        sharedBy: {
          id: 'lead_001',
          name: 'Priya Sharma',
          role: 'Core Systems Lead',
          email: 'priya.sharma@spaceborn.com',
          avatar: 'PS'
        },
        sharedAt: '2026-06-10T10:00:00Z',
        department: 'Core Systems',
        overallProgress: 45,
        milestones: [
          { id: 1, title: 'Phase 1: Foundation', dueDate: '2026-03-15', status: 'completed', description: 'Basic setup and architecture', progress: 100 },
          { id: 2, title: 'Phase 2: Core Features', dueDate: '2026-06-30', status: 'in-progress', description: 'Authentication, Dashboard, Content Management', progress: 65 },
          { id: 3, title: 'Phase 3: Advanced Features', dueDate: '2026-09-30', status: 'planned', description: 'Analytics, AI Insights, Collaboration', progress: 20 },
          { id: 4, title: 'Phase 4: Polish & Launch', dueDate: '2026-12-20', status: 'planned', description: 'Testing, Optimization, Deployment', progress: 0 }
        ],
        features: [
          { id: 1, name: 'User Authentication', priority: 'high', status: 'completed' },
          { id: 2, name: 'Dashboard UI', priority: 'high', status: 'completed' },
          { id: 3, name: 'Content Management System', priority: 'high', status: 'in-progress' },
          { id: 4, name: 'AI-Powered Insights', priority: 'medium', status: 'planned' }
        ],
        risks: [
          { id: 1, description: 'Third-party API dependency', impact: 'high', mitigation: 'Have fallback strategy', status: 'monitoring' }
        ]
      },
      {
        id: 2,
        title: 'Mobile App MVP Roadmap',
        version: '1.0',
        description: 'Mobile application development roadmap for iOS and Android platforms',
        startDate: '2026-03-01',
        targetDate: '2026-08-31',
        lastUpdated: '2026-06-08T14:30:00Z',
        status: 'active',
        sharedBy: {
          id: 'lead_002',
          name: 'Anil Mehta',
          role: 'Hardware & Integration Head',
          email: 'anil.mehta@spaceborn.com',
          avatar: 'AM'
        },
        sharedAt: '2026-06-08T14:30:00Z',
        department: 'Hardware & Integration',
        overallProgress: 30,
        milestones: [
          { id: 1, title: 'UI/UX Hardware & Integration', dueDate: '2026-04-15', status: 'completed', description: 'Complete mobile app designs', progress: 100 },
          { id: 2, title: 'Development Setup', dueDate: '2026-05-30', status: 'completed', description: 'Setup development environment', progress: 100 },
          { id: 3, title: 'Core Features', dueDate: '2026-07-15', status: 'in-progress', description: 'Implement core app features', progress: 45 }
        ],
        features: [
          { id: 1, name: 'User Onboarding', priority: 'high', status: 'completed' },
          { id: 2, name: 'Push Notifications', priority: 'high', status: 'in-progress' }
        ],
        risks: [
          { id: 1, description: 'App store approval delays', impact: 'medium', mitigation: 'Submit early for review', status: 'monitoring' }
        ]
      }
    ];
    setSharedRoadmaps(mockRoadmaps);
    
    // Calculate stats
    const totalReportsCount = mockReports.length;
    const totalEmployeesCount = [...new Set(mockReports.map(r => r.userId))].length;
    const avgTasks = (mockReports.reduce((sum, r) => {
      const taskCount = r.completedTasks?.split('\n').filter(t => t.trim()).length || 1;
      return sum + taskCount;
    }, 0) / totalReportsCount || 0).toFixed(1);
    
    const activeRoadmapsCount = mockRoadmaps.filter(r => ['active', 'shared'].includes(r.status)).length;
    const avgProgressValue = mockRoadmaps.reduce((sum, r) => sum + (r.overallProgress || 0), 0) / mockRoadmaps.length || 0;
    
    setStats({
      totalReports: totalReportsCount,
      totalEmployees: totalEmployeesCount,
      avgTasksPerDay: avgTasks,
      activeRoadmaps: activeRoadmapsCount,
      avgProgress: Math.round(avgProgressValue),
      pendingReviews: mockReports.filter(r => !r.reviewed).length
    });
    
    setLoading(false);
  };

  const getFilteredReports = () => {
    let filtered = [...reports];
    
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(r => r.department === filterDepartment);
    }
    
    if (dateFilter) {
      filtered = filtered.filter(r => r.date === dateFilter);
    }
    
    const grouped = filtered.reduce((acc, report) => {
      if (!acc[report.date]) acc[report.date] = [];
      acc[report.date].push(report);
      return acc;
    }, {});
    
    return grouped;
  };

  const getFilteredRoadmaps = () => {
    let filtered = [...sharedRoadmaps];
    
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(r => r.department === filterDepartment);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.sharedBy?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const downloadRoadmap = (roadmap) => {
    const content = `MVP ROADMAP REPORT
==================
Title: ${roadmap.title}
Version: ${roadmap.version}
Issued By: ${roadmap.sharedBy?.name || 'Team Lead'}
Department: ${roadmap.department}
Progress: ${roadmap.overallProgress}%

DESCRIPTION
${roadmap.description}

MILESTONES
${roadmap.milestones.map(m => `- ${m.title}: ${m.status} (${m.progress}%)`).join('\n')}

FEATURES
${roadmap.features.map(f => `- ${f.name} [${f.priority}] - ${f.status}`).join('\n')}

RISKS
${roadmap.risks.map(r => `- ${r.description} (Impact: ${r.impact})`).join('\n')}

ATTACHMENTS
${roadmap.attachments?.length ? roadmap.attachments.map(a => `- ${a.name} (${formatAttachmentSize(a)})`).join('\n') : 'None'}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roadmap.title.replace(/\s/g, '_')}_Roadmap.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToastMessage('Roadmap downloaded successfully', 'success');
  };

  const getMilestoneStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      planned: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || colors.planned;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };
    return badges[priority] || badges.medium;
  };

  const formatAttachmentSize = (attachment) => {
    if (attachment.displaySize) return attachment.displaySize;
    if (typeof attachment.size === 'number') return `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`;
    return attachment.size || 'Unknown size';
  };

  const downloadAttachment = async (roadmap, attachment) => {
    const success = await roadmapService.downloadAttachment(roadmap.id || roadmap._id, attachment.id, attachment.name);
    showToastMessage(
      success ? `${attachment.name} downloaded successfully` : `Could not download ${attachment.name}`,
      success ? 'success' : 'error'
    );
  };

  const filteredGroupedReports = getFilteredReports();
  const sortedDates = Object.keys(filteredGroupedReports).sort((a, b) => new Date(b) - new Date(a));
  const filteredRoadmaps = getFilteredRoadmaps();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Reporters</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Tasks/Day</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgTasksPerDay}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Roadmaps</p>
              <p className="text-2xl font-bold text-purple-600">{stats.activeRoadmaps}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🗺️</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg MVP Progress</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgProgress}%</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎯</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Reviews</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'daily'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>📊</span>
                <span>Daily Reports</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('mvp')}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'mvp'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50/30'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>🚀</span>
                <span>MVP Roadmaps</span>
                {stats.activeRoadmaps > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    {stats.activeRoadmaps}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">Filter by:</span>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {activeTab === 'daily' && (
            <div className="flex items-center space-x-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter('')}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Clear
                </button>
              )}
            </div>
          )}
          
          {activeTab === 'mvp' && (
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search roadmaps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-1.5 pl-10 border border-gray-300 rounded-lg text-sm"
                />
                <svg className="absolute left-3 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Reports Tab */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Daily Reports Overview</h2>
            <p className="text-purple-100 text-sm mt-1">Complete visibility into all team members' daily submissions</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {sortedDates.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">No daily reports found</p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <div className="space-y-4">
                    {filteredGroupedReports[date]?.map((report) => (
                      <div key={report.id} className="border rounded-xl p-5 bg-gray-50">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="font-semibold text-gray-900">{report.userName}</span>
                            <span className="text-sm text-gray-500 ml-2">({report.userRole})</span>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">{report.department}</span>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(report.submittedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p><span className="font-medium">✅ Completed:</span> {report.completedTasks}</p>
                          {report.ongoingWork && <p className="mt-2"><span className="font-medium">🔄 Ongoing:</span> {report.ongoingWork}</p>}
                          {report.issuesFaced && <p className="mt-2"><span className="font-medium">⚠️ Issues:</span> {report.issuesFaced}</p>}
                          {report.nextDayPlan && <p className="mt-2"><span className="font-medium">📅 Next Plan:</span> {report.nextDayPlan}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MVP Roadmaps Tab */}
      {activeTab === 'mvp' && (
        <div className="space-y-6">
          {filteredRoadmaps.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500">No issued roadmaps available</p>
            </div>
          ) : (
            filteredRoadmaps.map(roadmap => (
              <div key={roadmap.id} className="bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{roadmap.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Issued by {roadmap.sharedBy?.name || 'Team Lead'} • {roadmap.department}</p>
                    </div>
                    <button
                      onClick={() => downloadRoadmap(roadmap)}
                      className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      Download
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">{roadmap.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">Progress: {roadmap.overallProgress}%</span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${roadmap.overallProgress}%` }}></div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedRoadmap(roadmap);
                        setShowModal(true);
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && selectedRoadmap && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedRoadmap.title}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600">{selectedRoadmap.description}</p>
              <div>
                <h3 className="font-semibold mb-2">Milestones</h3>
                {selectedRoadmap.milestones.map(m => (
                  <div key={m.id} className="mb-2 p-2 bg-gray-50 rounded">
                    <span className="font-medium">{m.title}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${getMilestoneStatusColor(m.status)}`}>{m.status}</span>
                    <p className="text-sm text-gray-500 mt-1">{m.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                {selectedRoadmap.features.map(f => (
                  <div key={f.id} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-1">
                    <span>{f.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityBadge(f.priority)}`}>{f.priority}</span>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Attachments</h3>
                {selectedRoadmap.attachments?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRoadmap.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between gap-3 p-2 bg-gray-50 rounded">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatAttachmentSize(attachment)}</p>
                        </div>
                        <button
                          onClick={() => downloadAttachment(selectedRoadmap, attachment)}
                          className="shrink-0 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No files attached.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default CEOTeamReports;
