// src/components/Dashboard/Manager/AIInsights.jsx
import React, { useState, useEffect } from 'react';

const AIInsights = ({ userRole = 'Manager' }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [members, setMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [leadSummaries, setLeadSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [liveAnalysis, setLiveAnalysis] = useState(null);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock data for Manager view (only Core Systems department)
    const mockMembers = [
      {
        id: 'member_1',
        name: 'Ravi Das',
        role: 'Frontend Dev',
        department: 'Core Systems',
        avatar: 'RD',
        status: 'on_track',
        taskStats: {
          completed: 15,
          inProgress: 3,
          overdue: 0,
          total: 18
        },
        aiInsights: {
          summary: 'Frontend developer showing consistent progress. Recent commits focused on the authentication module and dashboard optimizations. Code quality has improved by 12% this sprint.',
          productivityScore: 85,
          codeQuality: 88,
          velocity: 92,
          strengths: ['React expertise', 'Clean code practices', 'Fast execution'],
          improvements: ['Unit test coverage', 'Documentation consistency'],
          recommendations: [
            'Take on more complex state management tasks',
            'Lead a knowledge sharing session on React hooks',
            'Focus on performance optimization for dashboard components'
          ],
          recentTasks: [
            { id: 't1', title: 'Implement OAuth2 flow', status: 'completed', completedAt: '2026-06-10' },
            { id: 't2', title: 'Dashboard performance optimization', status: 'in_progress', dueDate: '2026-06-15' },
            { id: 't3', title: 'Fix responsive layout issues', status: 'completed', completedAt: '2026-06-09' }
          ]
        }
      },
      {
        id: 'member_2',
        name: 'Nisha Kumar',
        role: 'Backend Dev',
        department: 'Core Systems',
        avatar: 'NK',
        status: 'overdue',
        taskStats: {
          completed: 12,
          inProgress: 4,
          overdue: 2,
          total: 18
        },
        aiInsights: {
          summary: 'Backend tasks are facing delays primarily due to external API dependencies. The team has identified integration bottlenecks. Recommend code review assistance and pair programming sessions.',
          productivityScore: 65,
          codeQuality: 75,
          velocity: 70,
          strengths: ['DevOps expertise', 'Infrastructure knowledge', 'API design'],
          improvements: ['Task estimation accuracy', 'Cross-team communication'],
          recommendations: [
            'Schedule pair programming sessions with senior backend dev',
            'Break down large tasks into smaller, manageable chunks',
            'Improve estimation accuracy using historical data',
            'Set up daily sync for API dependency updates'
          ],
          recentTasks: [
            { id: 't4', title: 'Database migration script', status: 'overdue', dueDate: '2026-06-08' },
            { id: 't5', title: 'API rate limiting implementation', status: 'in_progress', dueDate: '2026-06-12' },
            { id: 't6', title: 'Cache layer optimization', status: 'completed', completedAt: '2026-06-07' }
          ]
        }
      },
      {
        id: 'member_3',
        name: 'Priya Sharma',
        role: 'Sr.Engineer — Lead',
        department: 'Core Systems',
        avatar: 'PS',
        status: 'on_track',
        taskStats: {
          completed: 28,
          inProgress: 2,
          overdue: 0,
          total: 30
        },
        aiInsights: {
          summary: 'Exceptional leadership performance. Team completed 8 tasks today, bringing Alpha project to 82% completion — ahead of projected milestone.',
          productivityScore: 95,
          codeQuality: 92,
          velocity: 96,
          strengths: ['Leadership', 'Technical expertise', 'Strategic planning', 'Mentorship'],
          improvements: ['Delegation balance', 'Documentation review'],
          recommendations: [
            'Lead cross-team technical initiatives',
            'Establish mentorship program for junior developers',
            'Document best practices for team reference',
            'Prepare for Beta handoff review'
          ],
          recentTasks: [
            { id: 't7', title: 'Sprint planning Q2', status: 'completed', completedAt: '2026-06-10' },
            { id: 't8', title: 'Code review automation setup', status: 'in_progress', dueDate: '2026-06-14' },
            { id: 't9', title: 'Team performance review', status: 'completed', completedAt: '2026-06-09' }
          ]
        }
      }
    ];

    const mockMeetings = [
      {
        id: 'meeting_1',
        title: 'Q2 Sprint Planning',
        department: 'Core Systems',
        date: '2026-06-05',
        time: '10:00 AM',
        status: 'upcoming',
        summary: 'Team committed to 42 story points for Q2 sprint. Focus areas include authentication module enhancement and dashboard performance improvements. Resource allocation reviewed and approved.',
        decisions: [
          'Extend sprint duration by 2 days to accommodate complex auth features',
          'Add two frontend resources to accelerate dashboard work',
          'Implement daily standups for better visibility'
        ],
        actionItems: [
          'Schedule API security review with security team',
          'Update technical documentation for new features',
          'Set up monitoring dashboards for sprint tracking'
        ],
        attendees: ['Priya Sharma', 'Ravi Das', 'Nisha Kumar', 'Product Manager'],
        keyMetrics: {
          storyPoints: 42,
          velocity: 38,
          confidence: 85
        }
      },
      {
        id: 'meeting_3',
        title: 'All-Hands Q2 Review',
        department: 'All',
        date: '2026-06-10',
        time: '11:00 AM',
        status: 'upcoming',
        summary: 'Company-wide Q2 progress review covering all departments. Focus on milestone achievements and resource planning for Q3.',
        decisions: [],
        actionItems: [],
        attendees: ['All Departments'],
        keyMetrics: {}
      }
    ];

    const mockLeadSummaries = [
      {
        id: 'lead_1',
        name: 'Priya Sharma',
        role: 'Core Systems Lead',
        department: 'Core Systems',
        date: '2026-06-11',
        status: 'on_track',
        summary: 'Team completed 8 tasks today, bringing the Alpha project to 82% completion — ahead of the projected milestone. Ravi Das resolved two critical frontend bugs that were blocking QA sign-off. Nisha Kumar completed the database schema migration for the new auth module. No blockers reported. Sprint velocity is trending above average at 94%.',
        expandedSummary: 'Core Systems team continues to demonstrate strong performance. Code quality metrics improved by 8% this week. The frontend optimization efforts are paying off with 15% faster page load times. Backend API response times are within SLA. The team has proactively identified potential bottlenecks in the deployment pipeline and proposed solutions.',
        metrics: {
          tasksDone: 8,
          activeBlockers: 0,
          velocity: 94,
          teamMorale: 88
        },
        recommendations: [
          'Maintain current sprint velocity',
          'Schedule design sync for UI asset handoff',
          'Prepare documentation for Beta release'
        ]
      }
    ];

    setMembers(mockMembers);
    setMeetings(mockMeetings);
    setLeadSummaries(mockLeadSummaries);
    
    if (mockMembers.length > 0 && !selectedMember) {
      setSelectedMember(mockMembers[0]);
    }
    if (mockMeetings.length > 0 && !selectedMeeting) {
      setSelectedMeeting(mockMeetings[0]);
    }
    
    setLiveAnalysis({
      activeUsers: 8,
      meetingsToday: 2,
      pendingReviews: 3,
      tasksCompleted: 32,
      topPerformer: 'Priya Sharma',
      atRiskCount: 1
    });
    
    setIsLoading(false);
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'on_track': return 'text-green-600';
      case 'overdue': return 'text-red-600';
      case 'at_risk': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'on_track':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">On Track</span>;
      case 'overdue':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Overdue</span>;
      case 'at_risk':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">At Risk</span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeadSummaries = leadSummaries.filter(summary =>
    summary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">Manager View</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">AI-powered analytics and recommendations for your team</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 border-b border-gray-200 bg-white">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-0 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'live' 
                ? 'text-purple-600 border-purple-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Live Analysis
          </button>
          <button
            onClick={() => setActiveTab('member')}
            className={`px-0 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'member' 
                ? 'text-purple-600 border-purple-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Member Task Summarization
          </button>
          <button
            onClick={() => setActiveTab('meeting')}
            className={`px-0 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'meeting' 
                ? 'text-purple-600 border-purple-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Meeting Summarization
          </button>
          <button
            onClick={() => setActiveTab('lead')}
            className={`px-0 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'lead' 
                ? 'text-purple-600 border-purple-600' 
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Lead Summaries
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Live Analysis Tab */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Live Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Active Team Members</p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{liveAnalysis?.activeUsers}</p>
                <p className="text-xs text-gray-400 mt-1">Currently online</p>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-2">Today's Meetings</p>
                <p className="text-3xl font-bold text-gray-900">{liveAnalysis?.meetingsToday}</p>
                <p className="text-xs text-gray-400 mt-1">Scheduled</p>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-2">Tasks Completed Today</p>
                <p className="text-3xl font-bold text-green-600">{liveAnalysis?.tasksCompleted}</p>
                <p className="text-xs text-gray-400 mt-1">+12 vs yesterday</p>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-500 mb-2">Pending Reviews</p>
                <p className="text-3xl font-bold text-orange-600">{liveAnalysis?.pendingReviews}</p>
                <p className="text-xs text-gray-400 mt-1">Requires attention</p>
              </div>
            </div>

            {/* Live Activity Feed */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-500">2 min ago</span>
                  <span className="text-gray-700">Ravi Das pushed changes to feature/auth-module</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-500">5 min ago</span>
                  <span className="text-gray-700">Nisha Kumar completed task "Database migration script"</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-500">12 min ago</span>
                  <span className="text-gray-700">New meeting scheduled: Q2 Sprint Planning</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500">Just now</span>
                  <span className="text-gray-700">AI analysis updated for Priya Sharma</span>
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">AI Quick Insight</h3>
              <p className="text-gray-700">
                Your team's productivity is up 12% this week. Priya Sharma is the top performer with 28 tasks completed. 
                Nisha Kumar has 2 overdue tasks that need attention. Consider offering support to help clear the backlog.
              </p>
            </div>
          </div>
        )}

        {/* Member Task Summarization Tab */}
        {activeTab === 'member' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Member List */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <p className="text-sm text-gray-500 mt-1">Select a member to view their AI-generated task analysis</p>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredMembers.map((member) => (
                  <div 
                    key={member.id}
                    className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                      selectedMember?.id === member.id ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{member.taskStats.completed} done</p>
                        {member.taskStats.overdue > 0 && (
                          <p className="text-xs text-red-600">{member.taskStats.overdue} overdue</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">{member.department}</p>
                      {getStatusBadge(member.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
                <p className="text-sm text-gray-500">Automated analysis of member performance</p>
              </div>
              <div className="p-6">
                {selectedMember ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {selectedMember.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{selectedMember.name}</h3>
                        <p className="text-sm text-gray-500">{selectedMember.role} · {selectedMember.department}</p>
                        {getStatusBadge(selectedMember.status)}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedMember.aiInsights.summary}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className={`text-2xl font-bold ${getScoreColor(selectedMember.aiInsights.productivityScore)}`}>
                          {selectedMember.aiInsights.productivityScore}
                        </p>
                        <p className="text-xs text-gray-500">Productivity</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{selectedMember.aiInsights.codeQuality}</p>
                        <p className="text-xs text-gray-500">Code Quality</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{selectedMember.aiInsights.velocity}</p>
                        <p className="text-xs text-gray-500">Velocity</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                        <span>💪</span>
                        <span>Strengths</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.aiInsights.strengths.map((strength, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                        <span>📈</span>
                        <span>Areas for Improvement</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.aiInsights.improvements.map((item, idx) => (
                          <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                        <span>🎯</span>
                        <span>AI Recommendations</span>
                      </h3>
                      <ul className="space-y-2">
                        {selectedMember.aiInsights.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                            <span className="text-purple-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    Select a member to view their AI-generated task analysis
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Meeting Summarization Tab */}
        {activeTab === 'meeting' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
                <p className="text-sm text-gray-500 mt-1">Select a meeting to view its AI-generated briefing</p>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredMeetings.map((meeting) => (
                  <div 
                    key={meeting.id}
                    className={`p-4 cursor-pointer transition hover:bg-gray-50 ${
                      selectedMeeting?.id === meeting.id ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{meeting.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{meeting.department}</p>
                      </div>
                      <span className="text-xs text-gray-400">{meeting.date}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-600">{meeting.time}</p>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">AI Meeting Briefing</h2>
                <p className="text-sm text-gray-500">Automated meeting summarization</p>
              </div>
              <div className="p-6">
                {selectedMeeting ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{selectedMeeting.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedMeeting.date} at {selectedMeeting.time} · {selectedMeeting.department}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedMeeting.summary}</p>
                    </div>

                    {selectedMeeting.decisions && selectedMeeting.decisions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Key Decisions</h4>
                        <ul className="space-y-1">
                          {selectedMeeting.decisions.map((decision, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                              <span className="text-purple-600">✓</span>
                              <span>{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Action Items</h4>
                        <ul className="space-y-1">
                          {selectedMeeting.actionItems.map((item, idx) => (
                            <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                              <span className="text-blue-600">→</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Attendees</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeeting.attendees.map((attendee, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {attendee}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    Select a meeting to view its AI-generated briefing
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lead Summaries Tab */}
        {activeTab === 'lead' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                📋 Daily activity summaries submitted by your team lead.
              </p>
            </div>
            
            {filteredLeadSummaries.map((summary) => (
              <div key={summary.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{summary.name}</h3>
                      <p className="text-sm text-gray-500">{summary.role} · {summary.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{summary.date}</p>
                      {getStatusBadge(summary.status)}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <p className="text-gray-700 text-sm leading-relaxed">{summary.summary}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <span>🤖</span>
                      <span>AI Expanded Summary</span>
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{summary.expandedSummary}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-green-600">{summary.metrics.tasksDone}</p>
                      <p className="text-xs text-gray-500">tasks done today</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className={`text-xl font-bold ${summary.metrics.activeBlockers > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {summary.metrics.activeBlockers}
                      </p>
                      <p className="text-xs text-gray-500">active blockers</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-purple-600">{summary.metrics.velocity}%</p>
                      <p className="text-xs text-gray-500">velocity</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-600">{summary.metrics.teamMorale}%</p>
                      <p className="text-xs text-gray-500">team morale</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
                      <span>💡</span>
                      <span>AI Recommendations</span>
                    </h4>
                    <ul className="space-y-2">
                      {summary.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                          <span className="text-purple-600">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;