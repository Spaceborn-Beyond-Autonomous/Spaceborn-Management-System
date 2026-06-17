// src/components/Dashboard/TeamLead/TeamLeadDashboard.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const TeamLeadDashboard = () => {
  const [teamLeadData, setTeamLeadData] = useState({
    name: '',
    initials: '',
    role: '',
    title: '',
    description: '',
    openTasks: 0,
    overdueTasks: 0,
    inProgress: 0,
    blocked: 0,
    completedThisWeek: 0,
    blockedTasks: [],
    teamMembers: [],
    dailySummaries: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [sendingReport, setSendingReport] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [reportData, setReportData] = useState({
    summary: '',
    highlights: '',
    challenges: '',
    tomorrowPlan: ''
  });

  // Fetch team lead dashboard data - DIRECTLY LOAD MOCK DATA FIRST
  useEffect(() => {
    // Load mock data immediately for testing
    loadMockData();
    
    // Try to fetch from API if available
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token || !currentUser) {
        console.log('No auth token, using mock data');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Try to fetch profile
      try {
        const profileResponse = await fetch(`${API_BASE_URL}/team-lead/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setTeamLeadData(prev => ({
            ...prev,
            name: profile.name,
            initials: profile.initials,
            title: profile.title,
            description: profile.description
          }));
        }
      } catch (err) {   
        console.log('Profile fetch failed, using mock');
      }

      // Try to fetch stats
      try {
        const statsResponse = await fetch(`${API_BASE_URL}/team-lead/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          setTeamLeadData(prev => ({
            ...prev,
            openTasks: stats.openTasks,
            overdueTasks: stats.overdueTasks,
            inProgress: stats.inProgress,
            blocked: stats.blocked,
            completedThisWeek: stats.completedThisWeek
          }));
        }
      } catch (err) {
        console.log('Stats fetch failed, using mock');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Mock data for development - DIRECT DATA
  const loadMockData = () => {
    const currentUser = authService.getCurrentUser();
    
    setTeamLeadData({
      name: currentUser?.name || 'Priya Sharma',
      initials: currentUser?.name?.split(' ').map(n => n[0]).join('') || 'PS',
      role: 'Team Lead',
      title: 'Sr. Engineer — Team Lead · Engineering',
      description: 'Leading the Engineering team with a focus on delivery excellence, mentoring, and maintaining technical standards across all projects.',
      openTasks: 19,
      overdueTasks: 5,
      inProgress: 7,
      blocked: 1,
      completedThisWeek: 11,
      blockedTasks: [
        { id: 1, title: 'DB Schema Design', status: 'Overdue', priority: 'high', assignedTo: 'Suresh M', dueDate: '2026-05-24' },
        { id: 2, title: 'API Gateway Configuration', status: 'Blocked', priority: 'high', assignedTo: 'Nisha Kumar', dueDate: '2026-06-07' }
      ],
      teamMembers: [
        { id: 1, initials: 'RD', name: 'Ravi Das', role: 'Software Engineer', email: 'ravi.das@spaceborn.com', tasksCompleted: 12, tasksInProgress: 2, tasks: 1 },
        { id: 2, initials: 'NK', name: 'Nisha Kumar', role: 'DevOps Engineer', email: 'nisha.kumar@spaceborn.com', tasksCompleted: 8, tasksInProgress: 3, tasks: 1 },
        { id: 3, initials: 'AM', name: 'Anil Mehta', role: 'Frontend Developer', email: 'anil.mehta@spaceborn.com', tasksCompleted: 15, tasksInProgress: 1, tasks: 0 },
        { id: 4, initials: 'PB', name: 'Pooja B', role: 'UI/UX Designer', email: 'pooja.b@spaceborn.com', tasksCompleted: 10, tasksInProgress: 2, tasks: 0 },
        { id: 5, initials: 'AS', name: 'Arjun Singh', role: 'Backend Developer', email: 'arjun.singh@spaceborn.com', tasksCompleted: 9, tasksInProgress: 3, tasks: 0 }
      ],
      dailySummaries: [
        { id: 1, initials: 'RD', name: 'Ravi Das', summary: 'Login UI 74% complete. Auth API integration started. Waiting on backend endpoint.', date: '2026-06-08' },
        { id: 2, initials: 'NK', name: 'Nisha Kumar', summary: 'Fixed 3 critical bugs in payment module. Unit tests pending. On track.', date: '2026-06-08' },
        { id: 3, initials: 'AS', name: 'Arjun Singh', summary: 'DB migration done. Query performance up 40%. Schema updates next sprint.', date: '2026-06-08' }
      ]
    });
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSendReportToCEO = async (e) => {
    e.preventDefault();
    setSendingReport(true);
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const reportPayload = {
        teamLeadId: currentUser?.id,
        teamLeadName: currentUser?.name,
        department: currentUser?.department,
        date: new Date().toISOString(),
        summary: reportData.summary,
        highlights: reportData.highlights,
        challenges: reportData.challenges,
        tomorrowPlan: reportData.tomorrowPlan,
        stats: {
          openTasks: teamLeadData.openTasks,
          overdueTasks: teamLeadData.overdueTasks,
          inProgress: teamLeadData.inProgress,
          blocked: teamLeadData.blocked,
          completedThisWeek: teamLeadData.completedThisWeek,
          teamMembers: teamLeadData.teamMembers.length
        },
        blockedTasks: teamLeadData.blockedTasks,
        teamSummaries: teamLeadData.dailySummaries
      };
      
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        console.log('📧 Daily Report Sent to CEO:', reportPayload);
        
        // Store in localStorage for demo
        const sentReports = JSON.parse(localStorage.getItem('sent_daily_reports') || '[]');
        sentReports.unshift({
          id: Date.now(),
          ...reportPayload,
          sentAt: new Date().toISOString()
        });
        localStorage.setItem('sent_daily_reports', JSON.stringify(sentReports));
        
        alert(`✅ Daily report sent to CEO successfully!\n\nReport includes:\n- ${teamLeadData.dailySummaries.length} team summaries\n- ${teamLeadData.openTasks} open tasks\n- ${teamLeadData.completedThisWeek} completed this week`);
        
        setShowSendModal(false);
        setReportData({ summary: '', highlights: '', challenges: '', tomorrowPlan: '' });
        setSendingReport(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/team-lead/daily-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportPayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`✅ Daily report sent to CEO successfully!`);
        setShowSendModal(false);
        setReportData({ summary: '', highlights: '', challenges: '', tomorrowPlan: '' });
      } else {
        throw new Error('Failed to send report');
      }
      
    } catch (error) {
      console.error('Error sending report:', error);
      alert('❌ Failed to send report. Please try again.');
    } finally {
      setSendingReport(false);
    }
  };

  // Get active members count
  const activeMembers = teamLeadData.teamMembers.filter(m => m.tasksInProgress > 0 || m.tasks > 0).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {teamLeadData.initials}
            </div>
            <div className="flex-1">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{teamLeadData.name}</h1>
                <p className="text-sm text-purple-600 font-medium mt-1">{teamLeadData.role}</p>
                <p className="text-sm text-gray-500">{teamLeadData.title}</p>
              </div>
              <p className="text-gray-600 mt-3">{teamLeadData.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Daily Report to CEO
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">{teamLeadData.openTasks}</div>
          <div className="text-sm text-gray-600">OPEN TASKS</div>
          <div className="text-xs text-rose-500">{teamLeadData.overdueTasks} overdue</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{teamLeadData.inProgress}</div>
          <div className="text-sm text-gray-600">IN PROGRESS</div>
          <div className="text-xs text-emerald-500">on timeline</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-rose-600">{teamLeadData.blocked}</div>
          <div className="text-sm text-gray-600">BLOCKED</div>
          <div className="text-xs text-rose-500">need attention</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-emerald-600">{teamLeadData.completedThisWeek}</div>
          <div className="text-sm text-gray-600">COMPLETED THIS WEEK</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{teamLeadData.teamMembers.length}</div>
          <div className="text-sm text-gray-600">TEAM MEMBERS</div>
          <div className="text-xs text-gray-400">{activeMembers} active</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Blocked/Overdue Tasks */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Blocked / Overdue Tasks</h2>
            <p className="text-sm text-gray-500 mt-1">Tasks requiring immediate attention</p>
          </div>
          <div className="p-6">
            {teamLeadData.blockedTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No blocked or overdue tasks</p>
            ) : (
              <div className="space-y-3">
                {teamLeadData.blockedTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600 mt-1">Assigned to: {task.assignedTo}</p>
                        <p className="text-xs text-gray-500 mt-1">Due: {formatDate(task.dueDate)}</p>
                      </div>
                      <span className="px-2 py-1 bg-rose-200 text-rose-800 rounded-full text-xs">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Team Members */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-gray-900">Team Members</h2>
                <p className="text-sm text-gray-500 mt-1">Click on a member to view details</p>
              </div>
              <span className="text-sm text-purple-600">{activeMembers} active</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {teamLeadData.teamMembers.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedMember(member);
                    setShowMemberModal(true);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {member.initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(member.tasksInProgress > 0 || member.tasks > 0) && (
                      <span className="text-sm font-medium text-purple-600">{member.tasks || member.tasksInProgress} task</span>
                    )}
                    <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Summaries */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-900">Daily Summaries</h2>
            <p className="text-sm text-gray-500 mt-1">Latest updates from team members</p>
          </div>
          <button
            onClick={() => setShowSendModal(true)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            Send to CEO →
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {teamLeadData.dailySummaries.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No daily summaries available
            </div>
          ) : (
            teamLeadData.dailySummaries.map((summary) => (
              <div key={summary.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                    {summary.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-gray-900">{summary.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(summary.date)}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{summary.summary}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send Daily Report Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Send Daily Report to CEO</h2>
                <button onClick={() => setShowSendModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-700">
                  This report will include: {teamLeadData.dailySummaries.length} team summaries, 
                  {teamLeadData.openTasks} open tasks, {teamLeadData.completedThisWeek} completed this week
                </p>
              </div>
              
              <form onSubmit={handleSendReportToCEO} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Today's Summary</label>
                  <textarea
                    rows="3"
                    value={reportData.summary}
                    onChange={(e) => setReportData({...reportData, summary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    placeholder="Overall summary of today's progress..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Highlights</label>
                  <textarea
                    rows="2"
                    value={reportData.highlights}
                    onChange={(e) => setReportData({...reportData, highlights: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    placeholder="What went well today? Achievements, milestones..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Challenges / Blockers</label>
                  <textarea
                    rows="2"
                    value={reportData.challenges}
                    onChange={(e) => setReportData({...reportData, challenges: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    placeholder="Any challenges faced? Need CEO attention?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tomorrow's Plan</label>
                  <textarea
                    rows="2"
                    value={reportData.tomorrowPlan}
                    onChange={(e) => setReportData({...reportData, tomorrowPlan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    placeholder="What's planned for tomorrow?"
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Report Preview</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>📊 Team Stats: {teamLeadData.openTasks} open tasks, {teamLeadData.inProgress} in progress</p>
                    <p>👥 Team Members: {teamLeadData.teamMembers.length} members</p>
                    <p>📝 Team Summaries: {teamLeadData.dailySummaries.length} updates</p>
                    <p>⚠️ Blocked Tasks: {teamLeadData.blockedTasks.length}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowSendModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={sendingReport} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center gap-2">
                    {sendingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Team Member Details</h2>
                <button onClick={() => setShowMemberModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {selectedMember.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMember.name}</h3>
                    <p className="text-gray-500">{selectedMember.role}</p>
                    <p className="text-sm text-gray-400">{selectedMember.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{selectedMember.tasksCompleted}</p>
                    <p className="text-xs text-gray-500">Tasks Completed</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{selectedMember.tasksInProgress}</p>
                    <p className="text-xs text-gray-500">In Progress</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Assign New Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeadDashboard;