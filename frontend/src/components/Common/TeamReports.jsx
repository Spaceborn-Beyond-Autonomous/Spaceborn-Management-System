// src/components/Dashboard/Common/TeamReports.jsx
import React, { useState, useEffect } from 'react';
import reportService from '../../../services/reportService';
import leaveService from '../../../services/leaveService';

const TeamReports = ({ userRole, department, user }) => {
  const [reports, setReports] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'leave'
  const [loading, setLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, [userRole, department]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch daily reports
      let reportsData;
      if (userRole === 'CEO') {
        reportsData = await reportService.getAllReports();
      } else {
        reportsData = await reportService.getReportsByDepartment(department);
      }
      setReports(reportsData);

      // Fetch leave requests for approval view
      let leaveData;
      if (userRole === 'CEO') {
        leaveData = await leaveService.getAllRequests();
      } else {
        leaveData = await leaveService.getRequestsByDepartment(department);
      }
      setLeaveRequests(leaveData);

      // Extract unique departments for filter (CEO only)
      if (userRole === 'CEO') {
        const depts = [...new Set(reportsData.map(r => r.department).filter(Boolean))];
        setDepartments(depts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (requestId, comments) => {
    try {
      await leaveService.updateRequestStatus(requestId, 'Approved', comments, user?.name || 'CEO');
      fetchAllData();
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleRejectLeave = async (requestId, comments) => {
    try {
      await leaveService.updateRequestStatus(requestId, 'Rejected', comments, user?.name || 'CEO');
      fetchAllData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getLeaveTypeIcon = (type) => {
    const icons = {
      Sick: '🤒',
      Casual: '🏖️',
      Annual: '🌴',
      Emergency: '🚨',
      Other: '📝',
    };
    return icons[type] || '📅';
  };

  // Group reports by date
  const groupedReports = reports.reduce((acc, report) => {
    if (!acc[report.date]) acc[report.date] = [];
    acc[report.date].push(report);
    return acc;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedReports).sort((a, b) => new Date(b) - new Date(a));

  // Filter reports by department (CEO only)
  const getFilteredReports = () => {
    if (userRole !== 'CEO' || filterDepartment === 'all') {
      return groupedReports;
    }
    const filtered = {};
    Object.entries(groupedReports).forEach(([date, dayReports]) => {
      const filteredReports = dayReports.filter(r => r.department === filterDepartment);
      if (filteredReports.length > 0) {
        filtered[date] = filteredReports;
      }
    });
    return filtered;
  };

  const filteredGroupedReports = getFilteredReports();

  // Get pending leave requests
  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');
  const approvedLeaves = leaveRequests.filter(r => r.status === 'Approved');
  const rejectedLeaves = leaveRequests.filter(r => r.status === 'Rejected');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'daily'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Daily Reports
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'leave'
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📅 Leave Requests
              {pendingLeaves.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Reports Tab */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-black px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">📊 Team Daily Reports</h2>
                <p className="text-gray-400 text-sm">Review team members' daily submissions</p>
              </div>
              {userRole === 'CEO' && departments.length > 0 && (
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:outline-none"
                >
                  <option value="all" className="text-black">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept} className="text-black">{dept}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          <div className="divide-y">
            {sortedDates.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500">No daily reports found</p>
                <p className="text-sm text-gray-400 mt-1">Reports submitted by team members will appear here</p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
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
                  <div className="space-y-3">
                    {filteredGroupedReports[date]?.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-900">{report.userName}</span>
                              <span className="text-sm text-gray-500">({report.userRole})</span>
                              {userRole === 'CEO' && report.department && (
                                <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
                                  {report.department}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              Employee ID: {report.employeeId || 'N/A'}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            Submitted: {new Date(report.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <span className="text-green-600">✅</span>
                            <div>
                              <span className="font-medium text-gray-700">Completed Tasks:</span>
                              <p className="text-gray-600 mt-0.5">{report.completedTasks}</p>
                            </div>
                          </div>
                          {report.ongoingWork && (
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-600">🔄</span>
                              <div>
                                <span className="font-medium text-gray-700">Ongoing Work:</span>
                                <p className="text-gray-600 mt-0.5">{report.ongoingWork}</p>
                              </div>
                            </div>
                          )}
                          {report.issuesFaced && (
                            <div className="flex items-start space-x-2">
                              <span className="text-red-600">⚠️</span>
                              <div>
                                <span className="font-medium text-gray-700">Issues Faced:</span>
                                <p className="text-gray-600 mt-0.5">{report.issuesFaced}</p>
                              </div>
                            </div>
                          )}
                          {report.nextDayPlan && (
                            <div className="flex items-start space-x-2">
                              <span className="text-purple-600">📅</span>
                              <div>
                                <span className="font-medium text-gray-700">Next Day Plan:</span>
                                <p className="text-gray-600 mt-0.5">{report.nextDayPlan}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        {report.status === 'pending' && (
                          <div className="mt-3 pt-3 border-t flex justify-end">
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Pending Review
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'leave' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{pendingLeaves.length}</div>
              <div className="text-sm text-gray-600">Pending Approval</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl font-bold text-green-600">{approvedLeaves.length}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="text-2xl font-bold text-red-600">{rejectedLeaves.length}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>

          {/* Pending Approvals Section */}
          {pendingLeaves.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-200">
                <h3 className="font-semibold text-yellow-800">⏳ Pending Approvals</h3>
              </div>
              <div className="divide-y">
                {pendingLeaves.map((request) => (
                  <div key={request.id} className="p-5 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getLeaveTypeIcon(request.type)}</span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {request.userName} • {request.type} Leave ({request.days} day{request.days > 1 ? 's' : ''})
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.employeeId} • {request.department}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <div>📅 From: {new Date(request.startDate).toLocaleDateString()}</div>
                          <div>📅 To: {new Date(request.endDate).toLocaleDateString()}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Applied on: {new Date(request.appliedOn).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            const comments = prompt('Optional comments for approval:', 'Approved');
                            handleApproveLeave(request.id, comments);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => {
                            const comments = prompt('Reason for rejection:');
                            if (comments) handleRejectLeave(request.id, comments);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Leave Requests */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b">
              <h3 className="font-semibold text-gray-900">📋 All Leave Requests</h3>
            </div>
            <div className="divide-y">
              {leaveRequests.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500">No leave requests found</p>
                </div>
              ) : (
                leaveRequests.map((request) => (
                  <div key={request.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getLeaveTypeIcon(request.type)}</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.userName} ({request.employeeId})
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.type} Leave • {request.days} day(s) • {request.department}
                            </p>
                          </div>
                          <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div>{new Date(request.startDate).toLocaleDateString()} → {new Date(request.endDate).toLocaleDateString()}</div>
                          <div className="mt-1">Reason: {request.reason}</div>
                          {request.comments && (
                            <div className="mt-1 text-gray-500">Comments: {request.comments}</div>
                          )}
                          {request.approvedBy && (
                            <div className="mt-1 text-xs text-gray-400">
                              {request.status === 'Approved' ? 'Approved' : 'Rejected'} by: {request.approvedBy}
                              {request.approvedOn && ` on ${new Date(request.approvedOn).toLocaleString()}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamReports;