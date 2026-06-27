// src/components/Dashboard/Member/Resources.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const Resources = ({ userRole = 'Member' }) => {
  const [formData, setFormData] = useState({
    resourceType: '',
    reason: '',
    duration: '',
    priority: 'medium',
    quantity: 1,
    specifications: ''
  });
  
  const [myRequests, setMyRequests] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('my-requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchMyRequests();
    fetchAvailableResources();
  }, []);

  // Fetch user's resource requests
  const fetchMyRequests = async () => {
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token) {
        console.error('No authentication token found');
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/resources/my-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const payload = await response.json();
        // Backend returns: { success, count, data }
        const requests = Array.isArray(payload) ? payload : (payload?.data ?? []);
        setMyRequests(requests);
        
        // Update stats
        const pending = requests.filter(r => r.status === 'pending').length;
        const approved = requests.filter(r => r.status === 'approved').length;
        const rejected = requests.filter(r => r.status === 'rejected').length;
        
        setStats({
          totalRequests: requests.length,
          pendingRequests: pending,
          approvedRequests: approved,
          rejectedRequests: rejected
        });
      } else {
        throw new Error('Failed to fetch requests');
      }
      
    } catch (error) {
      console.error('Error fetching my requests:', error);
      setError('Failed to load your requests');
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
    const currentUser = authService.getCurrentUser();
    
    const mockRequests = [
      { 
        id: 1,
        name: 'GPU Server A',
        type: 'Hardware',
        quantity: 1,
        reason: 'Need for ML model training and testing',
        duration: '2 weeks',
        priority: 'high',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'pending',
        requestor: currentUser?.name || 'Ravi Das',
        requestorId: currentUser?.id || 1,
        initials: currentUser?.name?.split(' ').map(n => n[0]).join('') || 'RD'
      },
      { 
        id: 2,
        name: 'AWS Credits',
        type: 'Software',
        quantity: 500,
        reason: 'Cloud computing resources for staging environment',
        duration: '1 month',
        priority: 'medium',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'approved',
        requestor: currentUser?.name || 'Ravi Das',
        requestorId: currentUser?.id || 1,
        approvedBy: 'Jane Smith',
        approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        initials: currentUser?.name?.split(' ').map(n => n[0]).join('') || 'RD'
      },
      { 
        id: 3,
        name: 'Figma License',
        type: 'Software',
        quantity: 1,
        reason: 'UI/UX design work for new features',
        duration: '1 year',
        priority: 'low',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'rejected',
        requestor: currentUser?.name || 'Ravi Das',
        requestorId: currentUser?.id || 1,
        rejectedBy: 'Jane Smith',
        rejectedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
        rejectionReason: 'Budget constraints for Q2',
        initials: currentUser?.name?.split(' ').map(n => n[0]).join('') || 'RD'
      }
    ];
    
    setMyRequests(mockRequests);
    
    setStats({
      totalRequests: mockRequests.length,
      pendingRequests: mockRequests.filter(r => r.status === 'pending').length,
      approvedRequests: mockRequests.filter(r => r.status === 'approved').length,
      rejectedRequests: mockRequests.filter(r => r.status === 'rejected').length
    });
  };

  const loadMockResources = () => {
    setAvailableResources([
      { id: 1, name: 'AWS Credits', type: 'Software', available: 5000, total: 10000, unit: 'credits', description: 'Cloud computing credits for AWS services' },
      { id: 2, name: 'MacBook Pro', type: 'Hardware', available: 3, total: 20, unit: 'units', description: 'MacBook Pro M3 for development' },
      { id: 3, name: 'GPU Server', type: 'Hardware', available: 2, total: 8, unit: 'servers', description: 'High-performance GPU servers for ML' },
      { id: 4, name: 'Figma Pro', type: 'Software', available: 10, total: 15, unit: 'licenses', description: 'Figma Pro design licenses' },
      { id: 5, name: 'Meeting Room A', type: 'Facility', available: 1, total: 3, unit: 'rooms', description: 'Conference room for team meetings' }
    ]);
  };

  // Submit new resource request
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.resourceType || !formData.reason || !formData.duration) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token) {
        alert('Please login to submit a request');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const requesterId =
        currentUser?.id ||
        currentUser?._id ||
        currentUser?.userId;

      const requesterName =
        currentUser?.name ||
        currentUser?.fullName ||
        currentUser?.userName ||
        currentUser?.employeeName;

      const requesterRole =
        currentUser?.role ||
        currentUser?.requesterRole;

      if (!requesterId || !requesterName || !requesterRole) {
        alert('Cannot submit request: missing current user details. Please re-login.');
        return;
      }

      const requestData = {
        // Match backend ResourceRequest schema.
        resourceName: formData.resourceType,
        resourceType: formData.resourceType,
        quantity: formData.quantity,
        reason: formData.reason,
        priority: formData.priority,
        approvalLevel: 'TeamLead',
        requester: requesterId,
        requesterName,
        requesterRole,
        department: currentUser?.department || ''
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
        const payload = await response.json();
        const newRequest = payload?.data ?? payload;
        setMyRequests([newRequest, ...myRequests]);
        setStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          pendingRequests: prev.pendingRequests + 1
        }));
        setFormData({
          resourceType: '',
          reason: '',
          duration: '',
          priority: 'medium',
          quantity: 1,
          specifications: ''
        });
        setShowRequestForm(false);
        alert('Resource request submitted successfully! Your manager will review it.');
      } else {
        throw new Error('Failed to submit request');
      }
      
    } catch (error) {
      console.error('Error submitting request:', error);
      // Fallback for development
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        const currentUser = authService.getCurrentUser();
        const newRequest = {
          id: myRequests.length + 1,
          name: formData.resourceType,
          type: 'Other',
          quantity: formData.quantity,
          reason: formData.reason,
          duration: formData.duration,
          priority: formData.priority,
          date: new Date().toISOString(),
          status: 'pending',
          requestor: currentUser?.name || 'Current User',
          initials: currentUser?.name?.split(' ').map(n => n[0]).join('') || 'CU'
        };
        setMyRequests([newRequest, ...myRequests]);
        setStats(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          pendingRequests: prev.pendingRequests + 1
        }));
        setFormData({
          resourceType: '',
          reason: '',
          duration: '',
          priority: 'medium',
          quantity: 1,
          specifications: ''
        });
        setShowRequestForm(false);
        alert('Resource request submitted! (Mock Mode)');
      } else {
        alert('Failed to submit request. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high': return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">⚠️ High</span>;
      case 'medium': return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">🟡 Medium</span>;
      case 'low': return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">🟢 Low</span>;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
          <p className="text-gray-500 mt-1">Request and manage resources</p>
        </div>
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{showRequestForm ? 'Cancel' : 'Request Resource'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.totalRequests}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-green-600">{stats.approvedRequests}</div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-2xl font-bold text-red-600">{stats.rejectedRequests}</div>
          <div className="text-sm text-gray-600">Rejected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'my-requests' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Requests ({myRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'available' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Available Resources ({availableResources.length})
        </button>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Request a Resource</h2>
          <p className="text-sm text-gray-500 mb-6">Submit a request to your Manager for approval</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">RESOURCE TYPE *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., GPU Server, AWS Credits, Software License"
                  value={formData.resourceType}
                  onChange={(e) => setFormData({...formData, resourceType: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">QUANTITY</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PRIORITY</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">REQUESTED DURATION *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., 2 weeks, 3 days, Permanent"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">SPECIFICATIONS (Optional)</label>
                <textarea 
                  rows="2"
                  placeholder="Any specific requirements or specifications..."
                  value={formData.specifications}
                  onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'my-requests' && (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 text-lg">No resource requests yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Request Resource" to get started</p>
            </div>
          ) : (
            myRequests.map((request) => (
              <div key={request._id ?? request.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {request.initials || request.requesterName?.charAt?.(0) || (typeof request.requestor === 'string' ? request.requestor.charAt(0) : request.requestor?.name?.charAt?.(0)) || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.name || request.resourceName}</h3>
                        <p className="text-sm text-gray-500">{request.type || request.resourceType || 'Resource'}</p>
                      </div>
                      <span className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {(request.status || 'unknown').charAt(0).toUpperCase() + (request.status || 'unknown').slice(1) }
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-2">{request.reason}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="text-xs text-gray-400">Requested: {formatDate(request.date || request.requestedAt || request.createdAt)}</span>
                      {request.duration && (
                        <span className="text-xs text-gray-400">Duration: {request.duration}</span>
                      )}
                      {request.quantity > 1 && (
                        <span className="text-xs text-gray-400">Quantity: {request.quantity}</span>
                      )}
                      {getPriorityBadge(request.priority)}
                    </div>
                    
                    {request.status === 'approved' && request.approvedBy && (
                      <p className="text-xs text-green-600 mt-2">✓ Approved by {request.approvedBy}</p>
                    )}
                    
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-600">
                          <span className="font-medium">Rejection Reason:</span> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Available Resources Tab */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableResources.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🖥️</div>
              <p className="text-gray-500 text-lg">No resources available</p>
              <p className="text-sm text-gray-400 mt-1">Check back later for resource availability</p>
            </div>
          ) : (
            availableResources.map(resource => (
              <div key={resource.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{resource.type}</p>
                    {resource.description && (
                      <p className="text-xs text-gray-400 mt-1">{resource.description}</p>
                    )}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-green-600">{resource.available} / {resource.total || resource.available} {resource.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        resourceType: resource.name,
                        quantity: 1
                      });
                      setShowRequestForm(true);
                      setActiveTab('my-requests');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Request this Resource
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Resources;

