import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const ResourceAllocation = ({ userRole = 'CEO' }) => {
  const [resourceRequests, setResourceRequests] = useState([]);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResourceRequests();
    fetchTrackingHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const safeDateString = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN');
  };

  const fetchResourceRequests = async () => {
    try {
      const token = authService.getToken();
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockRequests();
        setIsLoading(false);
        return;
      }

      // Only CEO/Manager should be able to process requests; UI actions will still call APIs below


      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      // Existing backend route used by current implementation
      const response = await fetch(`${API_BASE_URL}/resources/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resource requests');
      }

      const payload = await response.json();
      const requests = Array.isArray(payload) ? payload : payload?.data ?? [];
      setResourceRequests(requests);
    } catch (e) {
      console.error(e);
      setError('Failed to load resource requests');
      loadMockRequests();
    } finally {
      setIsLoading(false);
    }
  };

  const approveRejectRequest = async (requestId, action) => {
    if (!requestId) return;

    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const currentUser = authService.getCurrentUser();

      const endpoint = action === 'approve'
        ? `${API_BASE_URL}/resources/requests/${requestId}/approve`
        : `${API_BASE_URL}/resources/requests/${requestId}/reject`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          action === 'approve'
            ? { approvedByName: currentUser?.name || currentUser?.fullName }
            : { reason: prompt('Please provide a reason for rejection:'), rejectedByName: currentUser?.name || currentUser?.fullName }
        )
      });

      if (!response.ok) throw new Error(`Failed to ${action === 'approve' ? 'approve' : 'reject'} request`);

      // Refresh requests after action
      await fetchResourceRequests();
    } catch (e) {
      console.error(e);
      alert(`Failed to ${action === 'approve' ? 'accept' : 'reject'} request`);
    }
  };

  const handleApproveRequest = async (requestId) => approveRejectRequest(requestId, 'approve');
  const handleRejectRequest = async (requestId) => approveRejectRequest(requestId, 'reject');


  const fetchTrackingHistory = async () => {
    try {
      const token = authService.getToken();

      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockTrackingHistory();
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/resources/tracking`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracking history');
      }

      const data = await response.json();
      setTrackingHistory(data);
    } catch (e) {
      console.error(e);
      loadMockTrackingHistory();
    }
  };

  const loadMockRequests = () => {
    const mockRequests = [
      {
        id: 1,
        requester: 'Ravi Das',
        requesterRole: 'Member',
        department: 'Core Systems',
        resourceName: 'MacBook Pro M3',
        resourceType: 'Hardware',
        quantity: 1,
        priority: 'high',
        reason: 'New team member joining next week',
        status: 'pending',
        requestedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        urgency: 'high'
      },
      {
        id: 2,
        requester: 'Priya Sharma',
        requesterRole: 'Member',
        department: 'Core Systems',
        resourceName: 'Dual Monitor Setup',
        resourceType: 'Hardware',
        quantity: 1,
        priority: 'medium',
        reason: 'Need additional monitor for better productivity',
        status: 'pending',
        requestedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        urgency: 'normal'
      },
      {
        id: 3,
        requester: 'Nisha Kumar',
        requesterRole: 'Team Lead',
        department: 'Hardware & Integration',
        resourceName: 'Figma Pro License',
        resourceType: 'Software',
        quantity: 2,
        priority: 'high',
        reason: 'Two new designers joining the team',
        status: 'approved',
        requestedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        urgency: 'high',
        approvedBy: 'Jane Smith',
        approvedAt: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 4,
        requester: 'Mike Johnson',
        requesterRole: 'Team Lead',
        department: 'Core Systems',
        resourceName: 'AWS Credits',
        resourceType: 'Cloud',
        quantity: 5000,
        priority: 'medium',
        reason: 'Additional cloud resources for testing environment',
        status: 'rejected',
        requestedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        urgency: 'normal',
        rejectedBy: 'John Doe',
        rejectedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        rejectionReason: 'Budget constraints this quarter'
      }
    ];

    setResourceRequests(mockRequests);
  };

  const loadMockTrackingHistory = () => {
    const mockTracking = [
      {
        id: 1,
        resourceName: 'MacBook Pro M3',
        resourceType: 'Hardware',
        action: 'allocated',
        user: 'Ravi Das',
        department: 'Core Systems',
        timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
        details: 'Allocated to new team member'
      },
      {
        id: 2,
        resourceName: 'Figma Pro License',
        resourceType: 'Software',
        action: 'assigned',
        user: 'Sita Krishnan',
        department: 'Hardware & Integration',
        timestamp: new Date(Date.now() - 15 * 86400000).toISOString(),
        details: 'License assigned for design team'
      },
      {
        id: 3,
        resourceName: 'AWS Credits',
        resourceType: 'Cloud',
        action: 'consumed',
        user: 'System',
        department: 'Core Systems',
        timestamp: new Date(Date.now() - 20 * 86400000).toISOString(),
        details: 'Monthly credit consumption: 3,200 credits'
      }
    ];

    setTrackingHistory(mockTracking);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-rose-200 bg-rose-50 text-rose-700',
      medium: 'border-amber-200 bg-amber-50 text-amber-700',
      low: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    };
    return colors[priority] || 'border-gray-200 bg-gray-50 text-gray-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      rejected: 'bg-rose-50 text-rose-700 border-rose-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      allocated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      assigned: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const pendingCount = resourceRequests.filter((r) => r.status === 'pending').length;

  if (isLoading && resourceRequests.length === 0 && trackingHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resource Allocation</h1>
          <p className="text-gray-500 text-sm mt-1">Resource requests and tracking history</p>
          {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Resource Requests
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tracking History
          </button>
        </div>
      </div>

      {/* Resource Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-5">
          {resourceRequests.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                📋
              </div>
              <p className="text-gray-500">No resource requests</p>
              <p className="text-gray-400 text-sm mt-1">All requests have been processed</p>
            </div>
          ) : (
            <>
              {resourceRequests.filter((r) => r.status === 'pending').length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
                    <h3 className="font-medium text-amber-800 text-sm">
                      Pending Requests ({resourceRequests.filter((r) => r.status === 'pending').length})
                    </h3>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {resourceRequests
                      .filter((r) => r.status === 'pending')
                      .map((request) => (
                        <div key={request._id ?? request.id} className="p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${getPriorityColor(
                                    request.priority || 'medium'
                                  )}`}
                                >
                                  {(request.priority || 'medium').toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">{request.resourceType}</span>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-400">
                                  {safeDateString(request.requestedAt || request.createdAt)}
                                </span>
                              </div>

                              <p className="font-medium text-gray-900">
                                {request.requesterName || request.requester} requested {request.quantity}× {request.resourceName}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Requested by: {request.requesterName || request.requester}
                              </p>
                              <p className="text-sm text-gray-600 mt-2">Reason: {request.reason}</p>
                              <p className="text-xs text-gray-400 mt-2">Urgency: {request.urgency || 'normal'}</p>
                            </div>

                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleApproveRequest(request._id ?? request.id)}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request._id ?? request.id)}
                                className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-sm hover:bg-rose-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {resourceRequests.filter((r) => r.status !== 'pending').length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700 text-sm">Processed Requests</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {resourceRequests
                      .filter((r) => r.status !== 'pending')
                      .map((request) => (
                        <div key={request._id ?? request.id} className="p-5 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(
                                    request.status
                                  )}`}
                                >
                                  {String(request.status || '').toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500">{request.resourceType}</span>
                                <span className="text-xs text-gray-300">•</span>
                                <span className="text-xs text-gray-400">{safeDateString(request.requestedAt || request.createdAt)}</span>
                              </div>

                              <p className="font-medium text-gray-900">
                                {request.requesterName || request.requester} requested {request.quantity}× {request.resourceName}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">Reason: {request.reason}</p>
                              {request.approvedBy && (
                                <p className="text-xs text-emerald-600 mt-2">Approved by {request.approvedBy}</p>
                              )}
                              {request.rejectedBy && request.rejectionReason && (
                                <p className="text-xs text-rose-600 mt-2">Rejected by {request.rejectedBy}: {request.rejectionReason}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tracking History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-700 text-sm">Resource Tracking History</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {trackingHistory.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No tracking history available</div>
            ) : (
              trackingHistory.map((track) => (
                <div key={track.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm">📄</div>
<div className="flex-1">
                      <p className="font-medium text-gray-900">{track.resourceName}</p>
                      <p className="text-sm text-gray-600">
• {track.department}
                      </p>
                      {track.details && <p className="text-xs text-gray-400 mt-1">{track.details}</p>}
                      {track.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">{new Date(track.timestamp).toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocation;

