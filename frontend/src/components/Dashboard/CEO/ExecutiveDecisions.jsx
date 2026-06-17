// src/components/Dashboard/CEO/ExecutiveDecisions.jsx
import React, { useState, useEffect } from 'react';
import { Target, Check, X, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import authService from '../../../services/authService';

const ExecutiveDecisions = ({ userRole = 'CEO' }) => {
  const [decisions, setDecisions] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    reviewing: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchDecisions();
  }, [filter]);

  const fetchDecisions = async () => {
    setIsLoading(true);
    setError(null);
    
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
      
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`${API_BASE_URL}/executive-decisions?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDecisions(data.decisions || data);
        calculateStats(data.decisions || data);
      } else {
        throw new Error('Failed to fetch decisions');
      }
      
    } catch (error) {
      console.error('Error fetching decisions:', error);
      setError('Failed to load decisions');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (decisionsData) => {
    setStats({
      pending: decisionsData.filter(d => d.status === 'pending').length,
      approved: decisionsData.filter(d => d.status === 'approved').length,
      rejected: decisionsData.filter(d => d.status === 'rejected').length,
      reviewing: decisionsData.filter(d => d.status === 'reviewing').length,
      total: decisionsData.length
    });
  };

  const loadMockData = () => {
    const mockDecisions = [
      { 
        id: 1, 
        title: 'Q3 Budget Allocation', 
        priority: 'High', 
        due: '2026-06-15', 
        department: 'Finance', 
        impact: 'Company-wide', 
        status: 'pending',
        description: 'Allocate Q3 budget across all departments',
        proposedBy: 'CFO',
        proposedAt: '2026-06-01T10:00:00Z',
        impactAnalysis: 'Will affect all departments\' spending capacity'
      },
      { 
        id: 2, 
        title: 'VP of Engineering Hiring', 
        priority: 'High', 
        due: '2026-06-10', 
        department: 'HR', 
        impact: 'Engineering', 
        status: 'pending',
        description: 'Hire new VP of Engineering to lead technical teams',
        proposedBy: 'CTO',
        proposedAt: '2026-06-02T14:00:00Z',
        impactAnalysis: 'Will strengthen technical leadership'
      },
      { 
        id: 3, 
        title: 'Acquisition Opportunity', 
        priority: 'Medium', 
        due: '2026-06-20', 
        department: 'Strategy', 
        impact: 'Growth', 
        status: 'reviewing',
        description: 'Evaluate acquisition of competitor',
        proposedBy: 'Strategy Team',
        proposedAt: '2026-06-03T09:00:00Z',
        impactAnalysis: 'Potential market expansion'
      },
      { 
        id: 4, 
        title: 'New Market Entry', 
        priority: 'Low', 
        due: '2026-06-30', 
        department: 'Sales', 
        impact: 'Revenue', 
        status: 'pending',
        description: 'Expand operations to new geographical market',
        proposedBy: 'Sales Director',
        proposedAt: '2026-06-04T11:00:00Z',
        impactAnalysis: 'Expected revenue growth of 15%'
      },
      { 
        id: 5, 
        title: 'R&D Budget Increase', 
        priority: 'High', 
        due: '2026-06-12', 
        department: 'R&D', 
        impact: 'Innovation', 
        status: 'approved',
        description: 'Increase R&D budget for AI initiatives',
        proposedBy: 'CTO',
        proposedAt: '2026-06-01T08:00:00Z',
        impactAnalysis: 'Accelerate AI product development',
        approvedBy: 'John Doe',
        approvedAt: '2026-06-05T10:00:00Z'
      }
    ];
    
    let filtered = mockDecisions;
    if (filter !== 'all') {
      filtered = mockDecisions.filter(d => d.status === filter);
    }
    
    setDecisions(filtered);
    calculateStats(mockDecisions);
  };

  const approveDecision = async (decisionId) => {
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/executive-decisions/${decisionId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          approvedBy: currentUser?.name,
          comment: comment,
          approvedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setDecisions(decisions.map(d => 
          d.id === decisionId ? { ...d, status: 'approved', approvedBy: currentUser?.name, approvedAt: new Date().toISOString() } : d
        ));
        setShowDetailsModal(false);
        setComment('');
        fetchDecisions(); // Refresh data
        alert('Decision approved successfully!');
      } else {
        throw new Error('Failed to approve decision');
      }
      
    } catch (error) {
      console.error('Error approving decision:', error);
      alert('Failed to approve decision');
    }
  };

  const rejectDecision = async (decisionId) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (!rejectionReason) return;
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/executive-decisions/${decisionId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          rejectedBy: currentUser?.name,
          reason: rejectionReason,
          rejectedAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        setDecisions(decisions.map(d => 
          d.id === decisionId ? { ...d, status: 'rejected', rejectedBy: currentUser?.name, rejectedAt: new Date().toISOString(), rejectionReason } : d
        ));
        setShowDetailsModal(false);
        fetchDecisions();
        alert('Decision rejected');
      } else {
        throw new Error('Failed to reject decision');
      }
      
    } catch (error) {
      console.error('Error rejecting decision:', error);
      alert('Failed to reject decision');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Approved</span>;
      case 'rejected': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">✗ Rejected</span>;
      case 'reviewing': return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Reviewing</span>;
      default: return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (isLoading && decisions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Executive Decisions</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              {stats.pending} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 text-center text-xs">
        <div>
          <span className="text-gray-500">Total</span>
          <p className="font-bold text-gray-900">{stats.total}</p>
        </div>
        <div>
          <span className="text-yellow-600">Pending</span>
          <p className="font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div>
          <span className="text-green-600">Approved</span>
          <p className="font-bold text-green-600">{stats.approved}</p>
        </div>
        <div>
          <span className="text-red-600">Rejected</span>
          <p className="font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pt-3 pb-0 border-b border-gray-100">
        <div className="flex space-x-4">
          {['all', 'pending', 'reviewing', 'approved', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-2 text-sm font-medium transition-colors ${
                filter === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span className="ml-1 text-xs">
                  ({stats[tab === 'reviewing' ? 'reviewing' : tab] || 0})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && decisions.length === 0 ? (
        <div className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchDecisions} className="mt-3 text-blue-600">Try Again</button>
        </div>
      ) : decisions.length === 0 ? (
        <div className="p-8 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No decisions found</p>
        </div>
      ) : (
        /* Decisions List */
        <div className="p-6 space-y-4">
          {decisions.map((decision) => (
            <div key={decision.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{decision.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(decision.priority)}`}>
                      {decision.priority}
                    </span>
                    {getStatusBadge(decision.status)}
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{decision.department}</span>
                    <span>•</span>
                    <span>Impact: {decision.impact}</span>
                    <span>•</span>
                    <span>Due: {formatDate(decision.due)}</span>
                  </div>
                </div>
                {decision.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedDecision(decision);
                        setShowDetailsModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Review
                    </button>
                  </div>
                )}
                {decision.status === 'reviewing' && (
                  <div className="flex items-center space-x-1 text-xs text-blue-600">
                    <Clock className="w-3 h-3" />
                    <span>Under review</span>
                  </div>
                )}
                {decision.status === 'approved' && decision.approvedBy && (
                  <div className="text-right">
                    <span className="text-xs text-green-600">Approved by {decision.approvedBy}</span>
                    <p className="text-xs text-gray-400">{formatDate(decision.approvedAt)}</p>
                  </div>
                )}
                {decision.status === 'rejected' && decision.rejectedBy && (
                  <div className="text-right">
                    <span className="text-xs text-red-600">Rejected by {decision.rejectedBy}</span>
                    <p className="text-xs text-gray-400">{formatDate(decision.rejectedAt)}</p>
                  </div>
                )}
              </div>
              {decision.description && (
                <p className="text-sm text-gray-600 mt-2">{decision.description}</p>
              )}
              {decision.status === 'reviewing' && (
                <div className="mt-2 flex items-center space-x-2 text-xs text-blue-600">
                  <Clock className="w-3 h-3" />
                  <span>Under review by strategy team</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all pending decisions →
        </button>
      </div>

      {/* Decision Details Modal */}
      {showDetailsModal && selectedDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Decision Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedDecision.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedDecision.priority)}`}>
                    {selectedDecision.priority} Priority
                  </span>
                  {getStatusBadge(selectedDecision.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-medium text-gray-900">{selectedDecision.department}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Impact</p>
                  <p className="font-medium text-gray-900">{selectedDecision.impact}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedDecision.due)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Proposed By</p>
                  <p className="font-medium text-gray-900">{selectedDecision.proposedBy || 'N/A'}</p>
                </div>
              </div>
              
              {selectedDecision.description && (
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm text-gray-700">{selectedDecision.description}</p>
                </div>
              )}
              
              {selectedDecision.impactAnalysis && (
                <div>
                  <p className="text-xs text-gray-500">Impact Analysis</p>
                  <p className="text-sm text-gray-700">{selectedDecision.impactAnalysis}</p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-gray-500">Proposed At</p>
                <p className="text-sm text-gray-700">{formatDateTime(selectedDecision.proposedAt)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments (Optional)</label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any comments or notes..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => rejectDecision(selectedDecision.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => approveDecision(selectedDecision.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDecisions;