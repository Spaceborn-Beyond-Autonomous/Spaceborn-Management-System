// src/components/Dashboard/CEO/CompanyHealth.jsx
import React, { useState, useEffect } from 'react';
import { Heart, Users, Smile, TrendingUp, AlertCircle, CheckCircle, Activity, Battery } from 'lucide-react';
import authService from '../../../services/authService';

const CompanyHealth = ({ userRole = 'CEO' }) => {
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [overallScore, setOverallScore] = useState(0);
  const [healthStatus, setHealthStatus] = useState('');
  const [departmentHealth, setDepartmentHealth] = useState([]);
  const [riskLevel, setRiskLevel] = useState('');
  const [trend, setTrend] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchCompanyHealth();
  }, []);

  const fetchCompanyHealth = async () => {
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
      
      const response = await fetch(`${API_BASE_URL}/company-health`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealthMetrics(data.metrics || []);
        setOverallScore(data.overallScore || 0);
        setHealthStatus(data.healthStatus || '');
        setDepartmentHealth(data.departmentHealth || []);
        setRiskLevel(data.riskLevel || '');
        setTrend(data.trend || '');
        setLastUpdated(data.lastUpdated || new Date().toISOString());
      } else {
        throw new Error('Failed to fetch company health data');
      }
      
    } catch (error) {
      console.error('Error fetching company health:', error);
      setError('Failed to load company health data');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    setHealthMetrics([
      { 
        label: 'Employee Satisfaction', 
        value: 86, 
        change: '+5%', 
        status: 'good', 
        icon: 'Smile',
        color: 'green',
        description: 'Based on quarterly survey'
      },
      { 
        label: 'Customer Satisfaction', 
        value: 4.8, 
        change: '+0.3', 
        status: 'good', 
        icon: 'Users',
        color: 'green',
        description: 'Out of 5.0 rating'
      },
      { 
        label: 'Retention Rate', 
        value: 94, 
        change: '+2%', 
        status: 'good', 
        icon: 'Activity',
        color: 'green',
        description: 'Year to date'
      },
      { 
        label: 'Time to Hire', 
        value: 18, 
        change: '-3 days', 
        status: 'warning', 
        icon: 'Clock',
        color: 'yellow',
        description: 'Average days to fill position'
      },
      { 
        label: 'Employee NPS', 
        value: 72, 
        change: '+8', 
        status: 'good', 
        icon: 'TrendingUp',
        color: 'green',
        description: 'eNPS score'
      },
      { 
        label: 'Absenteeism Rate', 
        value: 3.2, 
        change: '-0.5%', 
        status: 'good', 
        icon: 'Calendar',
        color: 'green',
        description: 'Last 30 days'
      }
    ]);
    setOverallScore(86);
    setHealthStatus('Healthy Organization');
    setDepartmentHealth([
      { name: 'Core Systems', score: 88, trend: '+2%', status: 'good' },
      { name: 'Hardware & Integration', score: 85, trend: '+1%', status: 'good' },
      { name: 'AI/LLM & Perception', score: 91, trend: '+5%', status: 'excellent' },
      { name: 'Platform and DevOps', score: 76, trend: '-1%', status: 'warning' },
      { name: 'HR', score: 82, trend: '+3%', status: 'good' }
    ]);
    setRiskLevel('Low Risk Level');
    setTrend('+5%');
    setLastUpdated(new Date().toISOString());
  };

  const getStatusColor = (status, color) => {
    if (status === 'good' || status === 'excellent') {
      return color === 'green' ? 'bg-green-50 border-green-200' : 'bg-emerald-50 border-emerald-200';
    }
    if (status === 'warning') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getIconColor = (status, color) => {
    if (status === 'good' || status === 'excellent') {
      return color === 'green' ? 'text-green-600' : 'text-emerald-600';
    }
    if (status === 'warning') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'excellent': return 'bg-emerald-100 text-emerald-700';
      case 'good': return 'bg-green-100 text-green-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Smile: Smile,
      Users: Users,
      Activity: Activity,
      Clock: Clock,
      TrendingUp: TrendingUp,
      Calendar: Calendar
    };
    return icons[iconName] || Activity;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && healthMetrics.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Health Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchCompanyHealth} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Heart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Company Health Score</h2>
              <p className="text-xs text-gray-500 mt-0.5">Overall organizational wellness</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{overallScore}<span className="text-sm text-gray-500">/100</span></p>
              <p className="text-xs text-green-600">{trend} from last quarter</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Health Score Circle */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={overallScore >= 80 ? "#10b981" : overallScore >= 60 ? "#f59e0b" : "#ef4444"}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - overallScore/100)}`}
                className="transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">{overallScore}</span>
              <span className="text-sm text-gray-500">Overall</span>
            </div>
          </div>
        </div>
        <div className="text-center mt-4">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusBadgeColor(
            overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : 'warning'
          )}`}>
            <div className={`w-2 h-2 rounded-full ${
              overallScore >= 80 ? 'bg-green-500' : overallScore >= 60 ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-xs font-medium">{healthStatus}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Based on {healthMetrics.length} key metrics across all departments</p>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-1">Last updated: {formatDate(lastUpdated)}</p>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthMetrics.map((metric, i) => {
            const Icon = getIconComponent(metric.icon);
            const isGood = metric.status === 'good' || metric.status === 'excellent';
            const isIncrease = metric.change?.startsWith('+') || metric.change?.startsWith('-') === false;
            
            return (
              <div 
                key={i} 
                className={`p-4 rounded-xl border ${getStatusColor(metric.status, metric.color)} hover:shadow-md transition-all cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-white ${getStatusColor(metric.status, metric.color)}`}>
                    <Icon className={`w-4 h-4 ${getIconColor(metric.status, metric.color)}`} />
                  </div>
                  {isGood ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <span className={`text-xs font-medium ${
                      isIncrease ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health Breakdown */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Health by Department</span>
          <button className="text-xs text-blue-600 hover:text-blue-700">View All →</button>
        </div>
        <div className="space-y-3">
          {departmentHealth.map((dept, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm text-gray-700">{dept.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`rounded-full h-1.5 transition-all ${
                      dept.score >= 80 ? 'bg-green-500' : dept.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${dept.score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{dept.score}%</span>
                {dept.trend && (
                  <span className={`text-xs ${dept.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {dept.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Indicator */}
      <div className={`px-6 py-4 bg-gradient-to-r ${
        riskLevel === 'Low Risk Level' ? 'from-green-50 to-green-100 border-green-200' :
        riskLevel === 'Medium Risk Level' ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
        'from-red-50 to-red-100 border-red-200'
      } border-t`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              riskLevel === 'Low Risk Level' ? 'bg-green-500' :
              riskLevel === 'Medium Risk Level' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              riskLevel === 'Low Risk Level' ? 'text-green-800' :
              riskLevel === 'Medium Risk Level' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {riskLevel}
            </span>
          </div>
          <button className={`text-xs font-medium ${
            riskLevel === 'Low Risk Level' ? 'text-green-700 hover:text-green-800' :
            riskLevel === 'Medium Risk Level' ? 'text-yellow-700 hover:text-yellow-800' : 'text-red-700 hover:text-red-800'
          }`}>
            View Risk Assessment →
          </button>
        </div>
      </div>
    </div>
  );
};

// Clock and Calendar icons
const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export default CompanyHealth;