// src/components/Dashboard/TeamLead/TeamLeadLeaveManagement.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import employeeService from '../../../services/employeeService';

const TeamLeadLeaveManagement = ({ userRole = 'Team Lead' }) => {
  const [activeTab, setActiveTab] = useState('myRequests');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [breakRequests, setBreakRequests] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [stats, setStats] = useState({
    myPendingLeaves: 0,
    myApprovedLeaves: 0,
    myRejectedLeaves: 0,
    teamOnLeave: 0,
    teamOnBreak: 0,
    teamPendingLeaves: 0,
    teamPendingBreaks: 0
  });

  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [breakFormData, setBreakFormData] = useState({
    breakType: 'short',
    date: '',
    startTime: '',
    endTime: '',
    reason: ''
  });

  const leaveTypes = [
    { value: 'annual', label: 'Annual Leave', maxDays: 12 },
    { value: 'sick', label: 'Sick Leave', maxDays: 10 },
    { value: 'casual', label: 'Casual Leave', maxDays: 6 },
    { value: 'emergency', label: 'Emergency Leave', maxDays: 3 }
  ];

  const breakTypes = [
    { value: 'short', label: 'Short Break (30 min)', duration: 30 },
    { value: 'lunch', label: 'Extended Lunch (90 min)', duration: 90 },
    { value: 'personal', label: 'Personal Hour (60 min)', duration: 60 },
    { value: 'medical', label: 'Medical Break (120 min)', duration: 120 }
  ];

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchData();
    fetchTeamMembers();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const [leavesRes, breaksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/team-lead/leave-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/team-lead/break-requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (leavesRes.ok) {
        const leaves = await leavesRes.json();
        setLeaveRequests(leaves);
      }
      
      if (breaksRes.ok) {
        const breaks = await breaksRes.json();
        setBreakRequests(breaks);
      }
      
      calculateStats(leaveRequests, breakRequests);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const employees = await employeeService.getAllEmployees();
      const filtered = employees.filter(emp => emp.department === currentUser?.department && emp.role !== 'Team Lead');
      setTeamMembers(filtered);
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([
        { id: 4, name: 'Ravi Das', role: 'Member', department: 'Core Systems', initials: 'RD', email: 'ravi@spaceborn.com' },
        { id: 5, name: 'Priya Sharma', role: 'Member', department: 'Core Systems', initials: 'PS', email: 'priya@spaceborn.com' },
        { id: 6, name: 'Nisha Kumar', role: 'Member', department: 'Core Systems', initials: 'NK', email: 'nisha@spaceborn.com' },
        { id: 10, name: 'Suresh M', role: 'Member', department: 'Core Systems', initials: 'SM', email: 'suresh@spaceborn.com' }
      ]);
    }
  };

  const loadMockData = () => {
    const department = currentUser?.department || 'Core Systems';
    
    setLeaveRequests([
      { 
        id: 1, 
        userId: 4,
        userName: 'Ravi Das', 
        userInitials: 'RD',
        userRole: 'Member',
        department: department,
        leaveType: 'sick', 
        startDate: '2026-06-15', 
        endDate: '2026-06-16', 
        days: 2, 
        reason: 'Fever and cold, unable to work', 
        status: 'approved',
        appliedOn: '2026-06-10T08:00:00Z',
        approvedBy: 'Manager',
        approvedOn: '2026-06-11T10:00:00Z'
      },
      { 
        id: 2, 
        userId: 5,
        userName: 'Priya Sharma', 
        userInitials: 'PS',
        userRole: 'Member',
        department: department,
        leaveType: 'annual', 
        startDate: '2026-06-20', 
        endDate: '2026-06-22', 
        days: 3, 
        reason: 'Family vacation', 
        status: 'pending',
        appliedOn: '2026-06-12T09:00:00Z'
      },
      { 
        id: 3, 
        userId: 6,
        userName: 'Nisha Kumar', 
        userInitials: 'NK',
        userRole: 'Member',
        department: department,
        leaveType: 'casual', 
        startDate: '2026-06-10', 
        endDate: '2026-06-10', 
        days: 1, 
        reason: 'Personal work', 
        status: 'approved',
        appliedOn: '2026-06-05T14:00:00Z',
        approvedBy: 'Manager'
      },
      {
        id: 4,
        userId: currentUser?.id,
        userName: currentUser?.name,
        userInitials: currentUser?.name?.charAt(0) || 'TL',
        userRole: 'Team Lead',
        department: department,
        leaveType: 'annual',
        startDate: '2026-07-01',
        endDate: '2026-07-05',
        days: 5,
        reason: 'Personal time off',
        status: 'pending',
        appliedOn: '2026-06-13T11:00:00Z'
      },
      {
        id: 5,
        userId: 10,
        userName: 'Suresh M',
        userInitials: 'SM',
        userRole: 'Member',
        department: department,
        leaveType: 'emergency',
        startDate: '2026-06-18',
        endDate: '2026-06-18',
        days: 1,
        reason: 'Family emergency',
        status: 'rejected',
        appliedOn: '2026-06-14T09:00:00Z',
        rejectedBy: 'Manager',
        rejectionReason: 'Short notice, team critical'
      }
    ]);

    setBreakRequests([
      {
        id: 1,
        userId: 4,
        userName: 'Ravi Das',
        userInitials: 'RD',
        department: department,
        breakType: 'short',
        date: '2026-06-14',
        startTime: '14:00',
        endTime: '14:30',
        duration: 30,
        reason: 'Doctor appointment',
        status: 'pending'
      },
      {
        id: 2,
        userId: 5,
        userName: 'Priya Sharma',
        userInitials: 'PS',
        department: department,
        breakType: 'lunch',
        date: '2026-06-14',
        startTime: '13:00',
        endTime: '14:30',
        duration: 90,
        reason: 'Team lunch meeting',
        status: 'approved',
        approvedBy: 'Manager'
      },
      {
        id: 3,
        userId: currentUser?.id,
        userName: currentUser?.name,
        userInitials: currentUser?.name?.charAt(0) || 'TL',
        userRole: 'Team Lead',
        department: department,
        breakType: 'personal',
        date: '2026-06-15',
        startTime: '15:00',
        endTime: '16:00',
        duration: 60,
        reason: 'Personal appointment',
        status: 'pending'
      }
    ]);

    calculateStats(leaveRequests, breakRequests);
  };

  const calculateStats = (leaves, breaks) => {
    const currentUserId = currentUser?.id;
    const today = new Date().toISOString().split('T')[0];
    
    setStats({
      myPendingLeaves: leaves.filter(l => l.userId === currentUserId && l.status === 'pending').length,
      myApprovedLeaves: leaves.filter(l => l.userId === currentUserId && l.status === 'approved').length,
      myRejectedLeaves: leaves.filter(l => l.userId === currentUserId && l.status === 'rejected').length,
      teamOnLeave: leaves.filter(l => l.userId !== currentUserId && l.status === 'approved' && new Date(l.startDate) <= new Date() && new Date(l.endDate) >= new Date()).length,
      teamOnBreak: breaks.filter(b => b.userId !== currentUserId && b.status === 'approved' && b.date === today).length,
      teamPendingLeaves: leaves.filter(l => l.status === 'pending' && l.userId !== currentUserId).length,
      teamPendingBreaks: breaks.filter(b => b.status === 'pending' && b.userId !== currentUserId).length
    });
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    
    const startDate = new Date(leaveFormData.startDate);
    const endDate = new Date(leaveFormData.endDate);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const newRequest = {
      id: Date.now(),
      userId: currentUser?.id,
      userName: currentUser?.name,
      userInitials: currentUser?.name?.charAt(0) || 'TL',
      userRole: 'Team Lead',
      department: currentUser?.department,
      ...leaveFormData,
      days,
      status: 'pending',
      appliedOn: new Date().toISOString()
    };
    
    setLeaveRequests([newRequest, ...leaveRequests]);
    setShowLeaveModal(false);
    setLeaveFormData({ leaveType: 'annual', startDate: '', endDate: '', reason: '' });
    calculateStats([newRequest, ...leaveRequests], breakRequests);
    alert('Leave request submitted! Your Manager has been notified.');
  };

  const handleSubmitBreak = async (e) => {
    e.preventDefault();
    
    const breakTypeInfo = breakTypes.find(b => b.value === breakFormData.breakType);
    
    const newRequest = {
      id: Date.now(),
      userId: currentUser?.id,
      userName: currentUser?.name,
      userInitials: currentUser?.name?.charAt(0) || 'TL',
      userRole: 'Team Lead',
      department: currentUser?.department,
      ...breakFormData,
      duration: breakTypeInfo?.duration || 30,
      status: 'pending',
      appliedOn: new Date().toISOString()
    };
    
    setBreakRequests([newRequest, ...breakRequests]);
    setShowBreakModal(false);
    setBreakFormData({ breakType: 'short', date: '', startTime: '', endTime: '', reason: '' });
    calculateStats(leaveRequests, [newRequest, ...breakRequests]);
    alert('Break request submitted! Your Manager has been notified.');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Pending</span>;
      case 'approved': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Approved</span>;
      case 'rejected': return <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium">Rejected</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave & Break Management</h1>
        <p className="text-gray-500 mt-1">View team leave requests and track availability</p>
        <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs">
          Team Lead View • View Only • Approvals by Manager/CEO
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.myPendingLeaves}</div>
          <div className="text-xs text-gray-500">My Pending Leaves</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.myApprovedLeaves}</div>
          <div className="text-xs text-gray-500">My Approved Leaves</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.teamOnLeave}</div>
          <div className="text-xs text-gray-500">Team on Leave Today</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.teamOnBreak}</div>
          <div className="text-xs text-gray-500">Team on Break Now</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowLeaveModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Request Leave
        </button>
        <button
          onClick={() => setShowBreakModal(true)}
          className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Request Break
        </button>
      </div>

      {/* Info Banner - No Approval Rights */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          You have view-only access to team requests. All approvals are handled by Manager/CEO.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('myRequests')}
            className={`py-2 text-sm font-medium transition-colors ${activeTab === 'myRequests' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
          >
            My Requests
          </button>
          <button
            onClick={() => setActiveTab('teamLeaves')}
            className={`py-2 text-sm font-medium transition-colors ${activeTab === 'teamLeaves' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
          >
            Team Leaves
            {stats.teamPendingLeaves > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">{stats.teamPendingLeaves}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('teamBreaks')}
            className={`py-2 text-sm font-medium transition-colors ${activeTab === 'teamBreaks' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
          >
            Team Breaks
            {stats.teamPendingBreaks > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">{stats.teamPendingBreaks}</span>
            )}
          </button>
        </div>
      </div>

      {/* My Requests Tab */}
      {activeTab === 'myRequests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-700">My Leave Requests</h3>
            </div>
            <div className="divide-y">
              {leaveRequests.filter(l => l.userId === currentUser?.id).length === 0 ? (
                <div className="p-8 text-center text-gray-500">No leave requests</div>
              ) : (
                leaveRequests.filter(l => l.userId === currentUser?.id).map(request => (
                  <div key={request.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{request.leaveType.toUpperCase()}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.days} days)</p>
                        <p className="text-sm text-gray-600 mt-1">Reason: {request.reason}</p>
                        {request.approvedBy && (
                          <p className="text-xs text-emerald-600 mt-1">Approved by {request.approvedBy}</p>
                        )}
                        {request.rejectedBy && request.rejectionReason && (
                          <p className="text-xs text-rose-600 mt-1">Rejected by {request.rejectedBy}: {request.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-700">My Break Requests</h3>
              <p className="text-xs text-gray-400 mt-0.5">Break requests go to Manager/CEO for approval</p>
            </div>
            <div className="divide-y">
              {breakRequests.filter(b => b.userId === currentUser?.id).length === 0 ? (
                <div className="p-8 text-center text-gray-500">No break requests</div>
              ) : (
                breakRequests.filter(b => b.userId === currentUser?.id).map(request => (
                  <div key={request.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{request.breakType.toUpperCase()}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(request.date)} • {request.startTime} - {request.endTime} ({request.duration} min)</p>
                        <p className="text-sm text-gray-600 mt-1">Reason: {request.reason}</p>
                        {request.approvedBy && (
                          <p className="text-xs text-emerald-600 mt-1">Approved by {request.approvedBy}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Leaves Tab - View Only */}
      {activeTab === 'teamLeaves' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-700">Team Member Leave Requests</h3>
            <p className="text-xs text-gray-400 mt-0.5">View only - Approvals handled by Manager/CEO</p>
          </div>
          <div className="divide-y">
            {leaveRequests.filter(l => l.userId !== currentUser?.id).length === 0 ? (
              <div className="p-8 text-center text-gray-500">No team leave requests</div>
            ) : (
              leaveRequests.filter(l => l.userId !== currentUser?.id).map(request => (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {request.userInitials}
                        </div>
                        <span className="font-medium text-gray-900">{request.userName}</span>
                        <span className="text-xs text-gray-400">{request.userRole}</span>
                      </div>
                      <div className="ml-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{request.leaveType.toUpperCase()}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.days} days)</p>
                        <p className="text-sm text-gray-600 mt-1">Reason: {request.reason}</p>
                        {request.approvedBy && (
                          <p className="text-xs text-emerald-600 mt-1">Approved by {request.approvedBy}</p>
                        )}
                        {request.rejectedBy && request.rejectionReason && (
                          <p className="text-xs text-rose-600 mt-1">Rejected by {request.rejectedBy}: {request.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Team Breaks Tab - View Only */}
      {activeTab === 'teamBreaks' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b">
            <h3 className="font-medium text-gray-700">Team Member Break Requests</h3>
            <p className="text-xs text-gray-400 mt-0.5">View only - Approvals handled by Manager/CEO</p>
          </div>
          <div className="divide-y">
            {breakRequests.filter(b => b.userId !== currentUser?.id).length === 0 ? (
              <div className="p-8 text-center text-gray-500">No team break requests</div>
            ) : (
              breakRequests.filter(b => b.userId !== currentUser?.id).map(request => (
                <div key={request.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {request.userInitials}
                        </div>
                        <span className="font-medium text-gray-900">{request.userName}</span>
                        <span className="text-xs text-gray-400">{request.userRole}</span>
                      </div>
                      <div className="ml-10">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{request.breakType.toUpperCase()}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(request.date)} • {request.startTime} - {request.endTime} ({request.duration} min)</p>
                        <p className="text-sm text-gray-600 mt-1">Reason: {request.reason}</p>
                        {request.approvedBy && (
                          <p className="text-xs text-emerald-600 mt-1">Approved by {request.approvedBy}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Request Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Request Leave</h2>
                <button onClick={() => setShowLeaveModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your leave request will be sent to Manager/CEO for approval.
                </p>
              </div>
              
              <form onSubmit={handleSubmitLeave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select
                    value={leaveFormData.leaveType}
                    onChange={(e) => setLeaveFormData({...leaveFormData, leaveType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    {leaveTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={leaveFormData.startDate}
                      onChange={(e) => setLeaveFormData({...leaveFormData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={leaveFormData.endDate}
                      onChange={(e) => setLeaveFormData({...leaveFormData, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    rows="3"
                    required
                    value={leaveFormData.reason}
                    onChange={(e) => setLeaveFormData({...leaveFormData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    placeholder="Please provide a reason for your leave request"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowLeaveModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Request Break Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Request Hour Break</h2>
                <button onClick={() => setShowBreakModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Your break request will be sent to Manager/CEO for approval.
                </p>
              </div>
              
              <form onSubmit={handleSubmitBreak} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Break Type</label>
                  <select
                    value={breakFormData.breakType}
                    onChange={(e) => setBreakFormData({...breakFormData, breakType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    {breakTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={breakFormData.date}
                    onChange={(e) => setBreakFormData({...breakFormData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={breakFormData.startTime}
                      onChange={(e) => setBreakFormData({...breakFormData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={breakFormData.endTime}
                      onChange={(e) => setBreakFormData({...breakFormData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    rows="2"
                    required
                    value={breakFormData.reason}
                    onChange={(e) => setBreakFormData({...breakFormData, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    placeholder="Please provide a reason for your break request"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowBreakModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">Submit Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeadLeaveManagement;