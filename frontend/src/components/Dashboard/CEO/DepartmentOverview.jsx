// src/components/Dashboard/CEO/DepartmentOverview.jsx
import React, { useState, useEffect } from 'react';
import { Building2, Users, TrendingUp, DollarSign, MoreVertical, ChevronDown, ChevronUp, Target, Clock, Award, AlertCircle } from 'lucide-react';
import authService from '../../../services/authService';

const DepartmentOverview = ({ userRole = 'CEO' }) => {
  const [expandedDept, setExpandedDept] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('progress');
  const [departments, setDepartments] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalMembers: 0,
    totalDepartments: 0,
    averageProgress: 0,
    activeProjects: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const metrics = {
    progress: { label: 'Sprint Progress', unit: '%', color: 'blue' },
    velocity: { label: 'Team Velocity', unit: '%', color: 'green' },
    satisfaction: { label: 'Satisfaction', unit: '%', color: 'purple' },
    budget: { label: 'Budget Utilization', unit: '%', color: 'orange' }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  const fetchDepartmentData = async () => {
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
      
      const response = await fetch(`${API_BASE_URL}/departments/overview`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
        setSummaryStats(data.summary || {});
        setLastUpdated(data.lastUpdated || new Date().toISOString());
      } else {
        throw new Error('Failed to fetch department data');
      }
      
    } catch (error) {
      console.error('Error fetching department data:', error);
      setError('Failed to load department data');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    setDepartments([
      { 
        id: 1, 
        name: 'Core Systems', 
        lead: 'Priya Sharma',
        leadAvatar: 'PS',
        members: 48, 
        progress: 82, 
        budget: 2400000, 
        spent: 1800000,
        velocity: 82,
        satisfaction: 88,
        projects: 12,
        completion: 75,
        tasks: { completed: 156, total: 190 },
        topPerformer: 'Priya Sharma',
        risk: 'Low'
      },
      { 
        id: 2, 
        name: 'Hardware & Integration', 
        lead: 'Anil Mehta',
        leadAvatar: 'AM',
        members: 12, 
        progress: 65, 
        budget: 800000, 
        spent: 600000,
        velocity: 65,
        satisfaction: 85,
        projects: 6,
        completion: 60,
        tasks: { completed: 89, total: 110 },
        topPerformer: 'Anil Mehta',
        risk: 'Medium'
      },
      { 
        id: 3, 
        name: 'AI/LLM & Perception', 
        lead: 'Sita Krishnan',
        leadAvatar: 'SK',
        members: 18, 
        progress: 91, 
        budget: 1200000, 
        spent: 900000,
        velocity: 91,
        satisfaction: 91,
        projects: 8,
        completion: 88,
        tasks: { completed: 124, total: 140 },
        topPerformer: 'Sita Krishnan',
        risk: 'Low'
      },
      { 
        id: 4, 
        name: 'Platform and DevOps', 
        lead: 'Vikram Singh',
        leadAvatar: 'VS',
        members: 30, 
        progress: 54, 
        budget: 1500000, 
        spent: 1100000,
        velocity: 54,
        satisfaction: 76,
        projects: 10,
        completion: 50,
        tasks: { completed: 98, total: 150 },
        topPerformer: 'Vikram Singh',
        risk: 'High'
      },
      { 
        id: 5, 
        name: 'Robotics & Simulation', 
        lead: 'Neha Gupta',
        leadAvatar: 'NG',
        members: 10, 
        progress: 78, 
        budget: 500000, 
        spent: 400000,
        velocity: 78,
        satisfaction: 82,
        projects: 4,
        completion: 72,
        tasks: { completed: 67, total: 85 },
        topPerformer: 'Neha Gupta',
        risk: 'Low'
      }
    ]);
    setSummaryStats({
      totalMembers: 118,
      totalDepartments: 5,
      averageProgress: 74,
      activeProjects: 40
    });
    setLastUpdated(new Date().toISOString());
  };

  const getMetricValue = (dept, metric) => {
    switch(metric) {
      case 'progress': return dept.progress;
      case 'velocity': return dept.velocity;
      case 'satisfaction': return dept.satisfaction;
      case 'budget': return dept.budget ? Math.round((dept.spent / dept.budget) * 100) : 0;
      default: return dept.progress;
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (value) => {
    if (value >= 75) return 'bg-green-500';
    if (value >= 50) return 'bg-blue-500';
    if (value >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading && departments.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && departments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Department Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchDepartmentData} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  const onTrackCount = departments.filter(d => d.risk === 'Low').length;
  const atRiskCount = departments.filter(d => d.risk === 'Medium' || d.risk === 'High').length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Department Overview</h2>
              <p className="text-xs text-gray-500 mt-0.5">Performance across all departments</p>
              {lastUpdated && (
                <p className="text-xs text-gray-400 mt-0.5">Updated: {formatDate(lastUpdated)}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={selectedMetric}
            >
              {Object.entries(metrics).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{summaryStats.totalMembers}</p>
          <p className="text-xs text-gray-500">Total Members</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{summaryStats.totalDepartments}</p>
          <p className="text-xs text-gray-500">Departments</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{summaryStats.averageProgress}%</p>
          <p className="text-xs text-gray-500">Avg Progress</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{summaryStats.activeProjects}</p>
          <p className="text-xs text-gray-500">Active Projects</p>
        </div>
      </div>

      {/* Departments List */}
      <div className="divide-y divide-gray-100">
        {departments.map((dept) => {
          const isExpanded = expandedDept === dept.id;
          const metricValue = getMetricValue(dept, selectedMetric);
          
          return (
            <div key={dept.id} className="hover:bg-gray-50 transition-colors">
              {/* Department Row */}
              <div 
                className="px-6 py-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Department Icon */}
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  {/* Department Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{dept.name}</p>
                        <p className="text-xs text-gray-500">Lead: {dept.lead}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        {/* Member count */}
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{dept.members}</span>
                        </div>
                        {/* Projects count */}
                        <div className="flex items-center space-x-1">
                          <Target className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{dept.projects}</span>
                        </div>
                        {/* Metric value */}
                        <div className="text-right min-w-[60px]">
                          <p className="text-sm font-semibold text-gray-900">
                            {metricValue}{metrics[selectedMetric]?.unit}
                          </p>
                          <p className="text-xs text-gray-500">{metrics[selectedMetric]?.label}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Sprint Progress</span>
                        <span className="font-medium text-gray-700">{dept.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div 
                          className={`rounded-full h-2 transition-all duration-500 ${getProgressColor(dept.progress)}`}
                          style={{ width: `${dept.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-4 border-t border-gray-100 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {/* Budget Card */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-600">Budget</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(dept.budget)}</p>
                      <p className="text-xs text-gray-500">Spent: {formatCurrency(dept.spent)}</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-green-500 rounded-full h-1"
                            style={{ width: `${(dept.spent / dept.budget) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Tasks Card */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-600">Tasks</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{dept.tasks?.completed || 0}/{dept.tasks?.total || 0}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 rounded-full h-1"
                            style={{ width: `${((dept.tasks?.completed || 0) / (dept.tasks?.total || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Top Performer Card */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-gray-600">Top Performer</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(dept.topPerformer || dept.lead)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dept.topPerformer || dept.lead}</p>
                          <p className="text-xs text-gray-500">{dept.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Risk Card */}
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-gray-600">Risk Level</span>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(dept.risk)}`}>
                        {dept.risk} Risk
                      </span>
                      <button className="block mt-2 text-xs text-blue-600 hover:text-blue-700">
                        View Details →
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-200">
                    <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100">
                      View Team
                    </button>
                    <button className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50">
                      Department Report →
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Average Performance: {summaryStats.averageProgress}%</span>
            <span>•</span>
            <span>On Track: {onTrackCount} depts</span>
            <span>•</span>
            <span>At Risk: {atRiskCount} depts</span>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Departments →
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentOverview;