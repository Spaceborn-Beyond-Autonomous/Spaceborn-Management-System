// src/components/Dashboard/CEO/Resources.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const Resources = ({ userRole = 'CEO' }) => {
  const [requests, setRequests] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('requests'); // requests, available, my-requests
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [stats, setStats] = useState({
    totalResources: 0,
    inUse: 0,
    available: 0,
    conflicts: 0,
    pendingRequests: 0
  });

  // Form data for new resource request
  const [formData, setFormData] = useState({
    resourceType: '',
    reason: '',
    duration: '',
    priority: 'medium',
    quantity: 1,
    specifications: ''
  });

  // Fetch all data
  useEffect(() => {
    fetchResourceRequests();
    fetchAvailableResources();
  }, []);

  // Fetch resource requests
  const fetchResourceRequests = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        console.error('No authentication token found');
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Fetch all resource requests (for CEO/Manager) or user's requests (for Member)
      const endpoint = (userRole === 'CEO' || userRole === 'Manager') 
        ? `${API_BASE_URL}/resources/all-requests`
        : `${API_BASE_URL}/resources/my-requests`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
        
        // Update pending requests count
        const pending = data.filter(r => r.status === 'pending').length;
        setStats(prev => ({ ...prev, pendingRequests: pending }));
      } else {
        throw new Error('Failed to fetch resource requests');
      }
      
    } catch (error) {
      console.error('Error fetching resource requests:', error);
      setError('Failed to load resource requests');
      
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    }
  };

  // Fetch available resources
  const fetchAvailableResources = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/resources/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const resources = await response.json();
        setAvailableResources(resources);
        
        // Update stats
        const total = resources.reduce((sum, r) => sum + r.total, 0);
        const inUse = resources.reduce((sum, r) => sum + (r.total - r.available), 0);
        const available = resources.reduce((sum, r) => sum + r.available, 0);
        
        setStats(prev => ({
          ...prev,
          totalResources: total,
          inUse: inUse,
          available: available
        }));
      }
      
    } catch (error) {
      console.error('Error fetching available resources:', error);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockResources();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const loadMockData = () => {
    const mockRequests = [
      { 
        id: 1, 
        initials: 'RD', 
        name: 'Ravi Das', 
        item: 'GPU Server A', 
        description: 'Machine learning model training', 
        status: 'pending',
        priority: 'high',
        requestDate: '2026-06-05',
        quantity: 1,
        duration: '2 weeks'
      },
      { 
        id: 2, 
        initials: 'NK', 
        name: 'Nisha Kumar', 
        item: 'Testing device', 
        description: 'Mobile app testing on real devices', 
        status: 'pending',
        priority: 'medium',
        requestDate: '2026-06-06',
        quantity: 3,
        duration: '1 month'
      },
      { 
        id: 3, 
        initials: 'SM', 
        name: 'Suresh M', 
        item: 'Meeting Room C', 
        description: 'Client presentation and demo', 
        status: 'approved',
        priority: 'high',
        requestDate: '2026-06-04',
        quantity: 1,
        duration: '2 hours',
        approvedBy: 'Jane Smith',
        approvedAt: '2026-06-05'
      },
      { 
        id: 4, 
        initials: 'PB', 
        name: 'Pooja B', 
        item: 'Software license', 
        description: 'Adobe Creative Cloud for design work', 
        status: 'rejected',
        priority: 'low',
        requestDate: '2026-06-03',
        quantity: 1,
        duration: '1 year',
        rejectedBy: 'Jane Smith',
        rejectedAt: '2026-06-04',
        rejectionReason: 'Budget constraints'
      }
    ];
    
    setRequests(mockRequests);
    setStats(prev => ({ ...prev, pendingRequests: mockRequests.filter(r => r.status === 'pending').length }));
  };

  const loadMockResources = () => {
    setAvailableResources([
      { id: 1, name: 'AWS Credits', type: 'Software', available: 5000, total: 10000, unit: 'credits' },
      { id: 2, name: 'MacBook Pro', type: 'Hardware', available: 5, total: 20, unit: 'units' },
      { id: 3, name: 'GPU Server', type: 'Hardware', available: 2, total: 8, unit: 'servers' },
      { id: 4, name: 'Figma Pro', type: 'Software', available: 8, total: 15, unit: 'licenses' },
      { id: 5, name: 'Meeting Rooms', type: 'Facility', available: 3, total: 5, unit: 'rooms' }
    ]);
    
    setStats({
      totalResources: 58,
      inUse: 40,
      available: 18,
      conflicts: 3,
      pendingRequests: 2
    });
  };

  // Submit new resource request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token) {
        alert('Please login to submit a request');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const requestData = {
        ...formData,
        name: currentUser.name,
        initials: currentUser.name.split(' ').map(n => n[0]).join(''),
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      const response = await fetch(`${API_BASE_URL}/resources/requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (response.ok) {
        const newRequest = await response.json();
        setRequests([newRequest, ...requests]);
        setShowRequestForm(false);
        setFormData({
          resourceType: '',
          reason: '',
          duration: '',
          priority: 'medium',
          quantity: 1,
          specifications: ''
        });
        alert('Resource request submitted successfully!');
      } else {
        throw new Error('Failed to submit request');
      }
      
    } catch (error) {
      console.error('Error submitting request:', error);
      
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        const currentUser = authService.getCurrentUser();
        const newRequest = {
          id: requests.length + 1,
          initials: currentUser.name.split(' ').map(n => n[0]).join(''),
          name: currentUser.name,
          item: formData.resourceType,
          description: formData.reason,
          status: 'pending',
          priority: formData.priority,
          requestDate: new Date().toISOString().split('T')[0],
          quantity: formData.quantity,
          duration: formData.duration
        };
        setRequests([newRequest, ...requests]);
        setShowRequestForm(false);
        setFormData({
          resourceType: '',
          reason: '',
          duration: '',
          priority: 'medium',
          quantity: 1,
          specifications: ''
        });
        alert('Resource request submitted! (Mock Mode)');
      } else {
        alert('Failed to submit request. Please try again.');
      }
    }
  };

  // Approve request (for managers/CEO)
  const approveRequest = async (requestId) => {
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/resources/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approvedBy: currentUser.name })
      });
      
      if (response.ok) {
        setRequests(requests.map(req =>
          req.id === requestId ? { ...req, status: 'approved', approvedBy: currentUser.name, approvedAt: new Date().toISOString() } : req
        ));
        setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
        alert('Request approved successfully');
      }
      
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  // Reject request (for managers/CEO)
  const rejectRequest = async (requestId) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/resources/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectedBy: currentUser.name, reason: rejectionReason }),
      });
      
      if (response.ok) {
        setRequests(requests.map(req =>
          req.id === requestId ? { ...req, status: 'rejected', rejectedBy: currentUser.name, rejectedAt: new Date().toISOString(), rejectionReason } : req
        ));
        setStats(prev => ({ ...prev, pendingRequests: prev.pendingRequests - 1 }));
        alert('Request rejected');
      }
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': 
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">Pending</span>;
      case 'approved': 
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">Approved</span>;
      case 'rejected': 
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">Rejected</span>;
      default: 
        return <span className="text-gray-600 text-sm">{status}</span>;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-yellow-500';
      case 'low': return 'border-l-4 border-l-green-500';
      default: return '';
    }
  };

  const canApproveRequests = () => {
    return userRole === 'CEO' || userRole === 'Manager';
  };

  const canRequestResources = () => {
    return true; // All users can request resources
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-500 mt-1">Manage and request resources</p>
        </div>
        {canRequestResources() && (
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{showRequestForm ? 'Cancel' : 'Request Resource'}</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-gray-900">{stats.totalResources}</div>
          <div className="text-sm text-gray-600">TOTAL RESOURCES</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.inUse}</div>
          <div className="text-sm text-gray-600">IN USE</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.available}</div>
          <div className="text-sm text-gray-600">AVAILABLE</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="text-3xl font-bold text-red-600">{stats.conflicts || stats.pendingRequests}</div>
          <div className="text-sm text-gray-600">{stats.conflicts ? 'CONFLICTS FLAGGED' : 'PENDING REQUESTS'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Resource Requests ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'available' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Available Resources
        </button>
        {canApproveRequests() && (
          <button
            onClick={() => setActiveTab('all-requests')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'all-requests' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Requests ({requests.length})
          </button>
        )}
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Request a Resource</h2>
          <p className="text-sm text-gray-500 mb-6">Submit a request for resources you need</p>

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">RESOURCE TYPE *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., GPU Server, AWS Credits, Software License"
                  value={formData.resourceType}
                  onChange={(e) => setFormData({...formData, resourceType: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QUANTITY</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PRIORITY</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">REASON / USAGE *</label>
                <textarea 
                  rows="3"
                  required
                  placeholder="Explain why you need this resource..."
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">DURATION *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 2 weeks, 3 days, Permanent"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">SPECIFICATIONS (Optional)</label>
                <textarea 
                  rows="2"
                  placeholder="Any specific requirements or specifications..."
                  value={formData.specifications}
                  onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resource Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Pending Resource Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Requests waiting for approval</p>
          </div>
          <div className="divide-y divide-gray-100">
            {requests.filter(r => r.status === 'pending').length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No pending requests
              </div>
            ) : (
              requests.filter(r => r.status === 'pending').map((request) => (
                <div key={request.id} className={`px-6 py-4 hover:bg-gray-50 transition ${getPriorityColor(request.priority)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {request.initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{request.name} — {request.item}</p>
                        <p className="text-sm text-gray-500">{request.description}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-400">Quantity: {request.quantity}</span>
                          <span className="text-xs text-gray-400">Duration: {request.duration}</span>
                          <span className="text-xs text-gray-400">Requested: {request.requestDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(request.status)}
                        {canApproveRequests() && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => approveRequest(request.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectRequest(request.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>
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
      )}

      {/* Available Resources Tab */}
      {activeTab === 'available' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">Available Resources</h2>
            <p className="text-sm text-gray-500 mt-1">Resources currently available for use</p>
          </div>
          <div className="divide-y divide-gray-100">
            {availableResources.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No resources available
              </div>
            ) : (
              availableResources.map((resource) => (
                <div key={resource.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{resource.name}</p>
                      <p className="text-sm text-gray-500">{resource.type}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Available: {resource.available} / {resource.total} {resource.unit}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFormData({
                          ...formData,
                          resourceType: resource.name,
                          quantity: 1
                        });
                        setShowRequestForm(true);
                        setActiveTab('requests');
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* All Requests Tab (CEO/Manager only) */}
      {activeTab === 'all-requests' && canApproveRequests() && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">All Resource Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Complete history of all resource requests</p>
          </div>
          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No requests found
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className={`px-6 py-4 hover:bg-gray-50 transition ${getPriorityColor(request.priority)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {request.initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{request.name} — {request.item}</p>
                        <p className="text-sm text-gray-500">{request.description}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-400">Quantity: {request.quantity}</span>
                          <span className="text-xs text-gray-400">Duration: {request.duration}</span>
                          <span className="text-xs text-gray-400">Requested: {request.requestDate}</span>
                        </div>
                        {request.status === 'approved' && request.approvedBy && (
                          <p className="text-xs text-green-600 mt-1">Approved by {request.approvedBy}</p>
                        )}
                        {request.status === 'rejected' && request.rejectionReason && (
                          <p className="text-xs text-red-600 mt-1">Rejected: {request.rejectionReason}</p>
                        )}
                      </div>
                      <div>
                        {getStatusBadge(request.status)}
                      </div>
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

export default Resources;