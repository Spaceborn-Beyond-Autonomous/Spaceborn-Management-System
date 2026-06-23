// src/components/Dashboard/Manager/TeamReports.jsx
import React, { useState, useEffect } from 'react';
import reportService from '../../../services/reportService';
import roadmapService from '../../../services/roadmapService';

const ManagerTeamReports = ({ userRole = 'Manager', department, user }) => {
  const isExecutiveViewer = userRole === 'COO';
  const roadmapAudienceText = isExecutiveViewer ? 'COO View' : 'Manager View';
  const issuedByText = isExecutiveViewer ? 'team leads' : 'your team lead';
  const [reports, setReports] = useState([]);
  const [sharedRoadmaps, setSharedRoadmaps] = useState([]);
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    teamMembers: 0,
    completionRate: 0,
    activeRoadmaps: 0,
    avgProgress: 0,
    pendingReviews: 0
  });

  useEffect(() => {
    fetchAllData();
  }, [department, userRole]);

  const showToastMessage = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch reports for the department, or all reports for COO.
      const reportsData = isExecutiveViewer
        ? await reportService.getAllReports()
        : await reportService.getReportsByDepartment(department);
      setReports(reportsData);
      
      // Get team members
      const members = [...new Set(reportsData.map(r => r.userName))];
      setTeamMembers(members);
      
      // Fetch issued roadmaps for the department, or all issued roadmaps for COO.
      const roadmapsData = await fetchSharedRoadmaps();
      
      // Calculate stats
      calculateStats(reportsData, roadmapsData);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedRoadmaps = async () => {
    try {
      const filters = { status: 'shared' };
      if (!isExecutiveViewer && department) filters.department = department;
      const data = await roadmapService.getAllRoadmaps(filters);

      if (data.length > 0) {
        setSharedRoadmaps(data);
        return data;
      }
      return loadMockRoadmaps();
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      return loadMockRoadmaps();
    }
  };

  const loadMockData = () => {
    const mockReports = [
      {
        id: 1,
        userId: 'emp_001',
        userName: 'Ravi Das',
        userRole: 'Frontend Developer',
        department: department || 'Core Systems',
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
        department: department || 'Core Systems',
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
        department: department || 'Core Systems',
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
        department: department || 'Hardware & Integration',
        employeeId: 'DES001',
        date: '2026-06-10',
        completedTasks: '- Dashboard mockups\n- Hardware & Integration system updates\n- Icon set creation',
        ongoingWork: 'Mobile app designs',
        issuesFaced: 'Hardware & Integration tool compatibility',
        nextDayPlan: 'Complete user flow diagrams',
        submittedAt: '2026-06-10T16:45:00Z',
        reviewed: false
      }
    ];
    
    const deptFiltered = isExecutiveViewer || !department
      ? mockReports
      : mockReports.filter(r => r.department === department);
    setReports(deptFiltered);
    
    const members = [...new Set(deptFiltered.map(r => r.userName))];
    setTeamMembers(members);
  };

  const loadMockRoadmaps = () => {
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
          { id: 1, name: 'User Authentication', priority: 'high', status: 'completed', completionDate: '2026-03-15' },
          { id: 2, name: 'Dashboard UI', priority: 'high', status: 'completed', completionDate: '2026-04-20' },
          { id: 3, name: 'Content Management System', priority: 'high', status: 'in-progress', expectedCompletion: '2026-07-15' },
          { id: 4, name: 'AI-Powered Insights', priority: 'medium', status: 'planned', expectedCompletion: '2026-09-30' }
        ],
        risks: [
          { id: 1, description: 'Third-party API dependency', impact: 'high', mitigation: 'Have fallback and caching strategy', status: 'monitoring', owner: 'Nisha Kumar' },
          { id: 2, description: 'Resource constraints', impact: 'medium', mitigation: 'Cross-training team members', status: 'mitigated', owner: 'Priya Sharma' }
        ],
        weeklyUpdates: [
          { week: 23, date: '2026-06-07', progress: 45, completedFeatures: ['User Authentication'], nextWeekPlan: ['Complete Dashboard UI'], blockers: [], teamHealth: 85 }
        ],
        attachments: []
      }
    ];
    
    // Filter roadmaps by department
    const deptFiltered = isExecutiveViewer || !department
      ? mockRoadmaps
      : mockRoadmaps.filter(r => r.department === department);
    setSharedRoadmaps(deptFiltered);
    calculateStats(reports, deptFiltered);
    return deptFiltered;
  };

  const calculateStats = (reportsData, roadmapsData) => {
    const totalReportsCount = reportsData.length;
    const teamMembersCount = [...new Set(reportsData.map(r => r.userName))].length;
    const completionRateValue = teamMembersCount > 0 ? ((totalReportsCount / (teamMembersCount * 30)) * 100).toFixed(1) : 0;
    const activeRoadmapsCount = roadmapsData.filter(r => ['active', 'shared'].includes(r.status)).length;
    const avgProgressValue = roadmapsData.reduce((sum, r) => sum + (r.overallProgress || 0), 0) / roadmapsData.length || 0;
    
    setStats({
      totalReports: totalReportsCount,
      teamMembers: teamMembersCount,
      completionRate: completionRateValue,
      activeRoadmaps: activeRoadmapsCount,
      avgProgress: Math.round(avgProgressValue),
      pendingReviews: reportsData.filter(r => !r.reviewed).length
    });
  };

  const getFilteredReports = () => {
    let filtered = [...reports];
    
    if (selectedMember !== 'all') {
      filtered = filtered.filter(r => r.userName === selectedMember);
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
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.sharedBy?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const downloadRoadmap = (roadmap) => {
    const content = `MVP ROADMAP REPORT - ${roadmapAudienceText.toUpperCase()}
===================================

BASIC INFORMATION
-----------------
Title: ${roadmap.title}
Version: ${roadmap.version}
Status: ${roadmap.status.toUpperCase()}
Department: ${roadmap.department}
Lead: ${roadmap.sharedBy?.name || 'Team Lead'} (${roadmap.sharedBy?.role || 'Team Lead'})
Issued On: ${new Date(roadmap.sharedAt).toLocaleString()}

DESCRIPTION
-----------
${roadmap.description}

TIMELINE
--------
Start Date: ${new Date(roadmap.startDate).toLocaleDateString()}
Target Date: ${new Date(roadmap.targetDate).toLocaleDateString()}
Overall Progress: ${roadmap.overallProgress}%
Last Updated: ${new Date(roadmap.lastUpdated).toLocaleDateString()}

MILESTONES
----------
${roadmap.milestones.map(m => `✓ ${m.title}
   Due: ${new Date(m.dueDate).toLocaleDateString()}
   Status: ${m.status}
   Progress: ${m.progress}%
   Description: ${m.description}
`).join('\n')}

FEATURES
--------
${roadmap.features.map(f => `• ${f.name}
   Priority: ${f.priority.toUpperCase()}
   Status: ${f.status}
   ${f.completionDate ? `Completed: ${new Date(f.completionDate).toLocaleDateString()}` : ''}
   ${f.expectedCompletion ? `Expected: ${new Date(f.expectedCompletion).toLocaleDateString()}` : ''}
`).join('\n')}

RISKS & MITIGATION
-----------------
${roadmap.risks.map(r => `⚠ ${r.description}
   Impact: ${r.impact.toUpperCase()}
   Status: ${r.status}
   Mitigation: ${r.mitigation}
   Owner: ${r.owner || 'Not assigned'}
`).join('\n')}

Report Generated: ${new Date().toLocaleString()}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roadmap.title.replace(/\s/g, '_')}_Roadmap_Manager_View.txt`;
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
          <p className="mt-4 text-gray-600">Loading team data...</p>
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

      {/* Team Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.teamMembers}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Report Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.completionRate}%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
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
        
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
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
        
        <div className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
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
                <span>Team Reports</span>
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

      {/* Daily Reports Tab */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">📊 Team Daily Reports</h2>
                <p className="text-purple-100 text-sm">Review your team's daily submissions • {department} Department</p>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:outline-none"
                >
                  <option value="all" className="text-black">All Members</option>
                  {teamMembers.map(member => (
                    <option key={member} value={member} className="text-black">{member}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:outline-none"
                  placeholder="Filter by date"
                />
                {dateFilter && (
                  <button
                    onClick={() => setDateFilter('')}
                    className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {sortedDates.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">No daily reports found for your team</p>
                <p className="text-sm text-gray-400 mt-1">Team members haven't submitted any reports yet</p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {filteredGroupedReports[date]?.length || 0} report(s)
                    </span>
                  </div>
                  <div className="space-y-4">
                    {filteredGroupedReports[date]?.map((report) => (
                      <div key={report.id} className="border rounded-xl p-5 bg-gray-50 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-lg">{report.userName}</span>
                              <span className="text-sm text-gray-500">({report.userRole})</span>
                              <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                                ID: {report.employeeId || 'N/A'}
                              </span>
                              {!report.reviewed && (
                                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                                  Pending Review
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(report.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                              <span className="text-green-600 text-lg">✅</span>
                              <div>
                                <p className="font-medium text-gray-700">Completed Tasks</p>
                                <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{report.completedTasks}</p>
                              </div>
                            </div>
                            {report.ongoingWork && (
                              <div className="flex items-start space-x-2">
                                <span className="text-blue-600 text-lg">🔄</span>
                                <div>
                                  <p className="font-medium text-gray-700">Ongoing Work</p>
                                  <p className="text-gray-600 text-sm mt-1">{report.ongoingWork}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            {report.issuesFaced && (
                              <div className="flex items-start space-x-2">
                                <span className="text-red-600 text-lg">⚠️</span>
                                <div>
                                  <p className="font-medium text-gray-700">Issues Faced</p>
                                  <p className="text-gray-600 text-sm mt-1">{report.issuesFaced}</p>
                                </div>
                              </div>
                            )}
                            {report.nextDayPlan && (
                              <div className="flex items-start space-x-2">
                                <span className="text-purple-600 text-lg">📅</span>
                                <div>
                                  <p className="font-medium text-gray-700">Next Day Plan</p>
                                  <p className="text-gray-600 text-sm mt-1">{report.nextDayPlan}</p>
                                </div>
                              </div>
                            )}
                          </div>
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
          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search roadmaps by title or lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {filteredRoadmaps.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📭</span>
              </div>
              <p className="text-gray-500 text-lg">No issued roadmaps available</p>
              <p className="text-sm text-gray-400 mt-1">Roadmaps issued by {issuedByText} will appear here</p>
            </div>
          ) : (
            filteredRoadmaps.map(roadmap => (
              <div key={roadmap.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{roadmap.title}</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">v{roadmap.version}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          roadmap.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {roadmap.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{roadmap.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRoadmap(roadmap);
                          setShowModal(true);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => downloadRoadmap(roadmap)}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Download Roadmap"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Issued Info Bar */}
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-4 flex-wrap gap-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {roadmap.sharedBy?.avatar || 'TL'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{roadmap.sharedBy?.name || 'Team Lead'}</p>
                          <p className="text-xs text-gray-500">{roadmap.sharedBy?.role || 'Team Lead'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">Issued: {new Date(roadmap.sharedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Overall Progress</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${roadmap.overallProgress}%` }}></div>
                          </div>
                          <span className="text-sm font-semibold text-purple-600">{roadmap.overallProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{roadmap.milestones.length}</p>
                      <p className="text-xs text-gray-600">Total Milestones</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {roadmap.milestones.filter(m => m.status === 'completed').length}
                      </p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{roadmap.features.length}</p>
                      <p className="text-xs text-gray-600">Features</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{roadmap.risks.length}</p>
                      <p className="text-xs text-gray-600">Active Risks</p>
                    </div>
                  </div>

                  {/* Timeline Preview */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Start:</span>
                        <span>{new Date(roadmap.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex-1 mx-4 h-px bg-gray-200"></div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Target:</span>
                        <span>{new Date(roadmap.targetDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Roadmap Details Modal */}
      {showModal && selectedRoadmap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRoadmap.title}</h2>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-sm text-gray-500">Version {selectedRoadmap.version}</p>
                  <span className="text-gray-300">|</span>
                  <p className="text-sm text-gray-500">Issued by {selectedRoadmap.sharedBy?.name || 'Team Lead'}</p>
                  <span className="text-gray-300">|</span>
                  <p className="text-sm text-gray-500">{new Date(selectedRoadmap.sharedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">📋 Description</h3>
                <p className="text-gray-700">{selectedRoadmap.description}</p>
              </div>

              {/* Progress Overview */}
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">📊 Progress Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Overall Completion</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${selectedRoadmap.overallProgress}%` }}></div>
                      </div>
                      <span className="text-lg font-bold text-purple-600">{selectedRoadmap.overallProgress}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Timeline Status</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Start: {new Date(selectedRoadmap.startDate).toLocaleDateString()}</span>
                      <span className="text-gray-400">→</span>
                      <span>Target: {new Date(selectedRoadmap.targetDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🎯 Milestones</h3>
                <div className="space-y-3">
                  {selectedRoadmap.milestones.map(milestone => (
                    <div key={milestone.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                          {milestone.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Progress:</span>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${milestone.progress}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{milestone.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">✨ Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedRoadmap.features.map(feature => (
                    <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{feature.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {feature.status === 'completed' ? `Completed: ${new Date(feature.completionDate).toLocaleDateString()}` : 
                           feature.expectedCompletion ? `Expected: ${new Date(feature.expectedCompletion).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityBadge(feature.priority)}`}>
                          {feature.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          feature.status === 'completed' ? 'bg-green-100 text-green-700' :
                          feature.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {feature.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">⚠️ Risks & Mitigation</h3>
                <div className="space-y-3">
                  {selectedRoadmap.risks.map(risk => (
                    <div key={risk.id} className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                      <p className="font-medium text-gray-900">{risk.description}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm">
                        <span className="text-orange-700">Impact: {risk.impact.toUpperCase()}</span>
                        <span className="text-gray-500">Status: {risk.status}</span>
                        {risk.owner && <span className="text-gray-500">Owner: {risk.owner}</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Mitigation: {risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                {selectedRoadmap.attachments?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedRoadmap.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl p-3">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{attachment.name}</p>
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

              {/* Weekly Updates */}
              {selectedRoadmap.weeklyUpdates && selectedRoadmap.weeklyUpdates.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">📈 Weekly Progress Updates</h3>
                  <div className="space-y-3">
                    {selectedRoadmap.weeklyUpdates.map((update, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Week {update.week} - {new Date(update.date).toLocaleDateString()}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Progress:</span>
                            <span className="font-semibold text-purple-600">{update.progress}%</span>
                            <span className="text-sm text-gray-500">Team Health:</span>
                            <span className="font-semibold text-green-600">{update.teamHealth}%</span>
                          </div>
                        </div>
                        {update.completedFeatures.length > 0 && (
                          <p className="text-sm text-gray-600">✅ Completed: {update.completedFeatures.join(', ')}</p>
                        )}
                        <p className="text-sm text-gray-600">📅 Next Plan: {update.nextWeekPlan.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => downloadRoadmap(selectedRoadmap)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Full Report</span>
              </button>
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default ManagerTeamReports;
