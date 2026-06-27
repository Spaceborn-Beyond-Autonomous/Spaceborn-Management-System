// src/components/Dashboard/CEO/RiskRegister.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '../../../services/authService';

const RiskRegister = ({ userRole = 'CEO' }) => {
  const [risks, setRisks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    riskScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchRisks();
  }, [filterSeverity, filterStatus]);

  const fetchRisks = async () => {
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
      if (filterSeverity !== 'all') params.append('severity', filterSeverity);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`${API_BASE_URL}/risks?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRisks(data.risks || data);
        calculateStats(data.risks || data);
      } else {
        throw new Error('Failed to fetch risks');
      }
      
    } catch (error) {
      console.error('Error fetching risks:', error);
      setError('Failed to load risk data');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (risksData) => {
    const total = risksData.length;
    const high = risksData.filter(r => r.severity === 'high').length;
    const medium = risksData.filter(r => r.severity === 'medium').length;
    const low = risksData.filter(r => r.severity === 'low').length;
    
    // Calculate risk score (weighted average)
    const riskScore = risksData.length > 0 
      ? Math.round((high * 100 + medium * 50 + low * 25) / total)
      : 0;
    
    setStats({ total, high, medium, low, riskScore });
  };

  const loadMockData = () => {
    const mockRisks = [
      { 
        id: 1, 
        title: 'Talent retention in Core Systems', 
        severity: 'high', 
        probability: 70, 
        impact: 'Schedule delays', 
        mitigation: 'Retention bonuses, career growth programs',
        trend: 'increasing',
        status: 'active',
        owner: 'HR Department',
        mitigationStatus: 'in-progress',
        createdAt: '2026-06-01',
        updatedAt: '2026-06-08',
        riskScore: 85
      },
      { 
        id: 2, 
        title: 'Market competition increasing', 
        severity: 'medium', 
        probability: 80, 
        impact: 'Market share loss', 
        mitigation: 'Aggressive marketing, product differentiation',
        trend: 'stable',
        status: 'active',
        owner: 'AI/LLM & Perception Department',
        mitigationStatus: 'planned',
        createdAt: '2026-06-01',
        updatedAt: '2026-06-07',
        riskScore: 65
      },
      { 
        id: 3, 
        title: 'Supply chain disruption', 
        severity: 'low', 
        probability: 30, 
        impact: 'Product delivery delays', 
        mitigation: 'Alternative suppliers, inventory buffer',
        trend: 'decreasing',
        status: 'monitoring',
        owner: 'Platform and DevOps',
        mitigationStatus: 'completed',
        createdAt: '2026-06-01',
        updatedAt: '2026-06-06',
        riskScore: 30
      },
      { 
        id: 4, 
        title: 'Cybersecurity threat', 
        severity: 'high', 
        probability: 45, 
        impact: 'Data breach, compliance issues', 
        mitigation: 'Security audit, employee training, MFA implementation',
        trend: 'increasing',
        status: 'active',
        owner: 'IT Security',
        mitigationStatus: 'in-progress',
        createdAt: '2026-06-01',
        updatedAt: '2026-06-08',
        riskScore: 75
      }
    ];
    
    let filtered = mockRisks;
    if (filterSeverity !== 'all') {
      filtered = mockRisks.filter(r => r.severity === filterSeverity);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }
    
    setRisks(filtered);
    calculateStats(mockRisks);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProbabilityBarColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="w-3 h-3 text-red-500" />;
    if (trend === 'decreasing') return <TrendingDown className="w-3 h-3 text-green-500" />;
    return <AlertCircle className="w-3 h-3 text-yellow-500" />;
  };

  const getMitigationStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">✓ Mitigated</span>;
      case 'in-progress':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">In Progress</span>;
      case 'planned':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">Planned</span>;
      default:
        return null;
    }
  };

  if (isLoading && risks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900">Risk Register</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
              {stats.high} High Risks
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 text-center text-xs">
        <div>
          <span className="text-gray-500">Total Risks</span>
          <p className="font-bold text-gray-900">{stats.total}</p>
        </div>
        <div>
          <span className="text-red-600">High</span>
          <p className="font-bold text-red-600">{stats.high}</p>
        </div>
        <div>
          <span className="text-yellow-600">Medium</span>
          <p className="font-bold text-yellow-600">{stats.medium}</p>
        </div>
        <div>
          <span className="text-green-600">Low</span>
          <p className="font-bold text-green-600">{stats.low}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pt-3 pb-2 border-b border-gray-100">
        <div className="flex flex-wrap gap-3">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            onClick={() => {
              setFilterSeverity('all');
              setFilterStatus('all');
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && risks.length === 0 ? (
        <div className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">{error}</p>
          <button onClick={fetchRisks} className="mt-3 text-orange-600">Try Again</button>
        </div>
      ) : risks.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-500">No risks identified</p>
        </div>
      ) : (
        /* Risks List */
        <div className="p-6 space-y-4">
          {risks.map((risk) => (
            <div key={risk.id} className={`border rounded-lg p-4 ${getSeverityColor(risk.severity)} hover:shadow-md transition cursor-pointer`} onClick={() => {
              setSelectedRisk(risk);
              setShowDetailsModal(true);
            }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{risk.title}</h3>
                    {getTrendIcon(risk.trend)}
                    {getMitigationStatusBadge(risk.mitigationStatus)}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">Impact: {risk.impact}</p>
                  <p className="text-xs text-gray-500 mt-1">Owner: {risk.owner}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{risk.probability}%</div>
                  <div className="text-xs text-gray-600">Probability</div>
                  {risk.riskScore && (
                    <div className="text-xs font-medium text-orange-600 mt-1">Score: {risk.riskScore}</div>
                  )}
                </div>
              </div>
              
              {/* Probability Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`rounded-full h-1.5 ${getProbabilityBarColor(risk.severity)} transition-all duration-500`}
                    style={{ width: `${risk.probability}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Mitigation: {risk.mitigation}</p>
                  <button 
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRisk(risk);
                      setShowDetailsModal(true);
                    }}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Risk Score: 
              <span className={`font-bold ml-1 ${
                stats.riskScore >= 70 ? 'text-red-600' :
                stats.riskScore >= 40 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {stats.riskScore}
              </span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Mitigation Rate: 
              <span className="font-bold ml-1 text-green-600">
                {risks.filter(r => r.mitigationStatus === 'completed').length}/{stats.total}
              </span>
            </span>
          </div>
          <button className="text-orange-600 hover:text-orange-700 font-medium">
            Full Risk Assessment →
          </button>
        </div>
      </div>

      {/* Risk Details Modal */}
      {showDetailsModal && selectedRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Risk Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedRisk.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedRisk.severity)}`}>
                    {selectedRisk.severity.toUpperCase()} Severity
                  </span>
                  {getTrendIcon(selectedRisk.trend)}
                  {getMitigationStatusBadge(selectedRisk.mitigationStatus)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Probability</p>
                  <p className="font-medium text-gray-900">{selectedRisk.probability}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className={`rounded-full h-1.5 ${getProbabilityBarColor(selectedRisk.severity)}`}
                      style={{ width: `${selectedRisk.probability}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk Score</p>
                  <p className="font-medium text-gray-900">{selectedRisk.riskScore || Math.round(selectedRisk.probability * 1.2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Impact</p>
                  <p className="font-medium text-gray-900">{selectedRisk.impact}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Owner</p>
                  <p className="font-medium text-gray-900">{selectedRisk.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">{selectedRisk.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="font-medium text-gray-900">{selectedRisk.updatedAt}</p>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Mitigation Plan</p>
                <p className="text-sm text-gray-700">{selectedRisk.mitigation}</p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskRegister;