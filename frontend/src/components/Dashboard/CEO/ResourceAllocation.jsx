// src/components/Dashboard/CEO/ResourceAllocation.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const ResourceAllocation = ({ userRole = 'CEO' }) => {
  const [resources, setResources] = useState([]);
  const [resourceRequests, setResourceRequests] = useState([]);
  const [stats, setStats] = useState({
    budgetUsed: 0,
    budgetTotal: 0,
    equipmentUsed: 0,
    equipmentTotal: 0,
    cloudCreditsUtilization: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceTypes, setResourceTypes] = useState([]);
  const [activeTab, setActiveTab] = useState('resources');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    resourceName: '',
    resourceType: 'Hardware',
    quantity: 1,
    priority: 'medium',
    reason: '',
    department: '',
    urgency: 'normal'
  });
  const [departments, setDepartments] = useState([]);
  const [trackingHistory, setTrackingHistory] = useState([]);

  useEffect(() => {
    fetchResources();
    fetchResourceRequests();
    fetchStats();
    fetchResourceTypes();
    fetchDepartments();
    fetchTrackingHistory();
  }, [filter, typeFilter, searchTerm]);

  const fetchResources = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_BASE_URL}/resources/allocation?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        throw new Error('Failed to fetch resources');
      }
      
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources');
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResourceRequests = async () => {
    try {
      const token = authService.getToken();
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockRequests();
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/resources/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResourceRequests(data);
      } else {
        loadMockRequests();
      }
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      loadMockRequests();
    }
  };

  const fetchTrackingHistory = async () => {
    try {
      const token = authService.getToken();
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockTrackingHistory();
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/resources/tracking`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrackingHistory(data);
      } else {
        loadMockTrackingHistory();
      }
      
    } catch (error) {
      console.error('Error fetching tracking history:', error);
      loadMockTrackingHistory();
    }
  };

  const fetchStats = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/resources/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockStats();
      }
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      loadMockStats();
    }
  };

  const fetchResourceTypes = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/resources/types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResourceTypes(data);
      } else if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        setResourceTypes(['Hardware', 'Software', 'Cloud', 'Facility', 'License']);
      }
      
    } catch (error) {
      console.error('Error fetching resource types:', error);
      setResourceTypes(['Hardware', 'Software', 'Cloud', 'Facility', 'License']);
    }
  };

  const fetchDepartments = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = authService.getToken();
      
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['Core Systems', 'Hardware & Integration', 'AI/LLM & Perception', 'Platform and DevOps', 'Robotics & Simulation', 'Robotics & Simulation', 'Robotics & Simulation']);
    }
  };

  const loadMockData = () => {
    const isCEO = userRole === 'CEO';
    
    const mockResources = [
      { 
        id: 1, 
        name: 'MacBook Pro M3', 
        type: 'Hardware', 
        allocated: isCEO ? 45 : 8, 
        total: isCEO ? 48 : 10, 
        status: 'Available',
        allocatedTo: ['Core Systems', 'Hardware & Integration', 'Management'],
        utilization: isCEO ? 93.75 : 80,
        cost: isCEO ? '₹2,08,000 each' : '₹2,08,000 each',
        department: isCEO ? 'All' : 'Core Systems'
      },
      { 
        id: 2, 
        name: 'AWS Credits', 
        type: 'Cloud', 
        allocated: isCEO ? 32000 : 12000, 
        total: isCEO ? 50000 : 15000, 
        status: 'Available',
        unit: 'credits',
        utilization: isCEO ? 64 : 80,
        cost: isCEO ? '₹41,66,667' : '₹12,50,000',
        department: 'All',
        allocatedTo: ['All Departments']
      },
      { 
        id: 3, 
        name: 'Office Monitors', 
        type: 'Hardware', 
        allocated: isCEO ? 12 : 5, 
        total: isCEO ? 15 : 8, 
        status: 'Limited',
        allocatedTo: ['Core Systems', 'Hardware & Integration'],
        utilization: isCEO ? 80 : 62.5,
        cost: '₹25,000 each',
        department: isCEO ? 'All' : 'Core Systems'
      },
      { 
        id: 4, 
        name: 'GitHub Enterprise', 
        type: 'License', 
        allocated: isCEO ? 48 : 12, 
        total: isCEO ? 48 : 12, 
        status: 'Fully Used',
        allocatedTo: ['All Departments'],
        utilization: 100,
        cost: '₹3,33,000/month',
        department: 'All'
      },
      { 
        id: 5, 
        name: 'Figma Pro', 
        type: 'Software', 
        allocated: isCEO ? 12 : 4, 
        total: isCEO ? 15 : 5, 
        status: 'Available',
        allocatedTo: ['Hardware & Integration', 'AI/LLM & Perception'],
        utilization: isCEO ? 80 : 80,
        cost: '₹6,250/user/month',
        department: isCEO ? 'All' : 'Hardware & Integration'
      },
      { 
        id: 6, 
        name: 'Meeting Rooms', 
        type: 'Facility', 
        allocated: isCEO ? 3 : 2, 
        total: isCEO ? 5 : 3, 
        status: 'Available',
        allocatedTo: ['All Departments'],
        utilization: isCEO ? 60 : 66.7,
        cost: 'N/A',
        department: 'All'
      }
    ];
    
    let filtered = mockResources;
    if (filter !== 'all') {
      filtered = mockResources.filter(r => r.status === filter);
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setResources(filtered);
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
    
    if (filter !== 'all') {
      setResourceRequests(mockRequests.filter(r => r.status === filter));
    } else {
      setResourceRequests(mockRequests);
    }
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

  const loadMockStats = () => {
    const isCEO = userRole === 'CEO';
    setStats({
      budgetUsed: isCEO ? 15000000 : 3750000,
      budgetTotal: isCEO ? 20833333 : 6250000,
      equipmentUsed: isCEO ? 28 : 15,
      equipmentTotal: isCEO ? 35 : 23,
      cloudCreditsUtilization: isCEO ? 64 : 80,
      totalResources: isCEO ? 48 : 6,
      utilizedResources: isCEO ? 32 : 4,
      availableResources: isCEO ? 16 : 2,
      pendingRequests: 2
    });
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setResourceRequests(resourceRequests.map(req =>
        req.id === requestId 
          ? { ...req, status: 'approved', approvedBy: authService.getCurrentUser()?.name, approvedAt: new Date().toISOString() }
          : req
      ));
      alert('Resource request approved successfully');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      setResourceRequests(resourceRequests.map(req =>
        req.id === requestId 
          ? { ...req, status: 'rejected', rejectedBy: authService.getCurrentUser()?.name, rejectedAt: new Date().toISOString(), rejectionReason: reason }
          : req
      ));
      alert('Resource request rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    const currentUser = authService.getCurrentUser();
    const newRequest = {
      id: resourceRequests.length + 1,
      requester: currentUser?.name,
      requesterRole: currentUser?.role,
      department: currentUser?.department,
      ...requestFormData,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    
    setResourceRequests([newRequest, ...resourceRequests]);
    setShowRequestModal(false);
    setRequestFormData({
      resourceName: '',
      resourceType: 'Hardware',
      quantity: 1,
      priority: 'medium',
      reason: '',
      department: currentUser?.department || '',
      urgency: 'normal'
    });
    alert('Resource request submitted successfully');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Available': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Limited': 'bg-amber-50 text-amber-700 border-amber-200',
      'Fully Used': 'bg-rose-50 text-rose-700 border-rose-200',
      'pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'rejected': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-rose-50 text-rose-700 border-rose-200',
      'medium': 'bg-amber-50 text-amber-700 border-amber-200',
      'low': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    return colors[priority] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getUtilizationColor = (utilization) => {
    if (utilization < 70) return 'text-emerald-600';
    if (utilization < 90) return 'text-amber-600';
    return 'text-rose-600';
  };

  const formatIndianCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading && resources.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const statsData = {
    pendingRequests: resourceRequests.filter(r => r.status === 'pending').length,
    approvedRequests: resourceRequests.filter(r => r.status === 'approved').length,
    rejectedRequests: resourceRequests.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resource Allocation</h1>
          <p className="text-gray-500 text-sm mt-1">Track resources, manage requests, and monitor utilization across the organization</p>
        </div>
        {userRole !== 'CEO' && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Request Resource
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Budget Utilization</p>
              <p className="text-2xl font-semibold text-gray-900">{formatIndianCurrency(stats.budgetUsed)}</p>
              <p className="text-xs text-gray-400 mt-1">of {formatIndianCurrency(stats.budgetTotal)}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-lg">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-gray-900 rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${(stats.budgetUsed / stats.budgetTotal) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Equipment Assets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.equipmentUsed}/{stats.equipmentTotal}</p>
              <p className="text-xs text-gray-400 mt-1">{((stats.equipmentUsed / stats.equipmentTotal) * 100).toFixed(0)}% utilized</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-lg">
              💻
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cloud Resources</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cloudCreditsUtilization}%</p>
              <p className="text-xs text-gray-400 mt-1">utilization rate</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-lg">
              ☁️
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-gray-900 rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${stats.cloudCreditsUtilization}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="text-2xl font-semibold text-amber-600">{statsData.pendingRequests}</p>
              <p className="text-xs text-gray-400 mt-1">{statsData.approvedRequests} approved, {statsData.rejectedRequests} rejected</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-lg">
              📋
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-3 text-sm font-medium transition-colors ${activeTab === 'resources' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Resource Inventory
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`py-3 text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'requests' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Resource Requests
            {statsData.pendingRequests > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {statsData.pendingRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 text-sm font-medium transition-colors ${activeTab === 'history' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Tracking History
          </button>
        </div>
      </div>

      {/* Resource Inventory Tab */}
      {activeTab === 'resources' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
              >
                <option value="all">All Types</option>
                {resourceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="Limited">Limited</option>
                <option value="Fully Used">Fully Used</option>
              </select>
              <button
                onClick={() => {
                  setFilter('all');
                  setTypeFilter('all');
                  setSearchTerm('');
                }}
                className="px-3 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Resources Table */}
          {error && resources.length === 0 ? (
            <div className="bg-white rounded-lg border border-rose-200 p-8 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-rose-600 text-xl">!</span>
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-1">Unable to Load Resources</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button onClick={fetchResources} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800">Try Again</button>
            </div>
          ) : resources.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                📦
              </div>
              <p className="text-gray-500">No resources found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resources.map((resource) => {
                      const utilization = resource.utilization || (resource.allocated / resource.total) * 100;
                      return (
                        <tr key={resource.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">{resource.name}</p>
                              {resource.cost && <p className="text-xs text-gray-400 mt-0.5">{resource.cost}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{resource.type}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {resource.allocated.toLocaleString('en-IN')}
                            {resource.unit && <span className="text-xs text-gray-400 ml-0.5">{resource.unit}</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {resource.total.toLocaleString('en-IN')}
                            {resource.unit && <span className="text-xs text-gray-400 ml-0.5">{resource.unit}</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-100 rounded-full h-1.5">
                                <div 
                                  className="bg-gray-900 rounded-full h-1.5 transition-all duration-300"
                                  style={{ width: `${utilization}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${getUtilizationColor(utilization)}`}>
                                {utilization.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(resource.status)}`}>
                              {resource.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {resource.allocatedTo?.map((dept, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                  {dept === 'All Departments' ? 'All' : dept}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Resource Requests Tab */}
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
              {/* Pending Requests */}
              {resourceRequests.filter(r => r.status === 'pending').length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
                    <h3 className="font-medium text-amber-800 text-sm">Pending Requests ({resourceRequests.filter(r => r.status === 'pending').length})</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {resourceRequests.filter(r => r.status === 'pending').map((request) => (
                      <div key={request.id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                                {request.priority.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-500">{request.resourceType}</span>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-gray-400">{new Date(request.requestedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                            <p className="font-medium text-gray-900">{request.requester} requested {request.quantity}× {request.resourceName}</p>
                            <p className="text-sm text-gray-500 mt-1">Department: {request.department}</p>
                            <p className="text-sm text-gray-600 mt-2">Reason: {request.reason}</p>
                            <p className="text-xs text-gray-400 mt-2">Urgency: {request.urgency}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
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

              {/* Processed Requests */}
              {resourceRequests.filter(r => r.status !== 'pending').length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700 text-sm">Processed Requests</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {resourceRequests.filter(r => r.status !== 'pending').map((request) => (
                      <div key={request.id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${getStatusColor(request.status)}`}>
                                {request.status.toUpperCase()}
                              </span>
                              <span className="text-sm text-gray-500">{request.resourceType}</span>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-xs text-gray-400">{new Date(request.requestedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                            <p className="font-medium text-gray-900">{request.requester} requested {request.quantity}× {request.resourceName}</p>
                            <p className="text-sm text-gray-600 mt-1">Reason: {request.reason}</p>
                            {request.approvedBy && (
                              <p className="text-xs text-emerald-600 mt-2">Approved by {request.approvedBy} on {new Date(request.approvedAt).toLocaleDateString('en-IN')}</p>
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

      {/* Tracking History Tab */}
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
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-sm">
                      📄
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{track.resourceName}</p>
                      <p className="text-sm text-gray-600">
                        <span className="capitalize">{track.action}</span> to {track.user} • {track.department}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{track.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(track.timestamp).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Request Resource Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowRequestModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Request Resource</h2>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Name</label>
                <input
                  type="text"
                  value={requestFormData.resourceName}
                  onChange={(e) => setRequestFormData({...requestFormData, resourceName: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                  placeholder="Enter resource name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                <select
                  value={requestFormData.resourceType}
                  onChange={(e) => setRequestFormData({...requestFormData, resourceType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                >
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={requestFormData.quantity}
                  onChange={(e) => setRequestFormData({...requestFormData, quantity: parseInt(e.target.value)})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={requestFormData.priority}
                  onChange={(e) => setRequestFormData({...requestFormData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Request</label>
                <textarea
                  rows="3"
                  value={requestFormData.reason}
                  onChange={(e) => setRequestFormData({...requestFormData, reason: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm resize-none"
                  placeholder="Please provide a detailed reason for this request"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowRequestModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceAllocation;