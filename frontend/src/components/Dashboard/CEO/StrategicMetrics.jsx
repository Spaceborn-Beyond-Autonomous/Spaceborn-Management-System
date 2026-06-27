// src/components/Dashboard/CEO/StrategicMetrics.jsx
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, PieChart, Target, AlertCircle } from 'lucide-react';
import authService from '../../../services/authService';

const StrategicMetrics = ({ userRole = 'CEO' }) => {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('quarter');
  const [summary, setSummary] = useState({
    overallProgress: 0,
    onTrackCount: 0,
    atRiskCount: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, [period]);

  const fetchMetrics = async () => {
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
      
      const response = await fetch(`${API_BASE_URL}/strategic-metrics?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics || []);
        setSummary(data.summary || {});
      } else {
        throw new Error('Failed to fetch strategic metrics');
      }
      
    } catch (error) {
      console.error('Error fetching strategic metrics:', error);
      setError('Failed to load strategic metrics');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    setMetrics([
      {
        id: 1,
        icon: 'DollarSign',
        label: 'Annual Revenue',
        value: 28400000,
        displayValue: '$28.4M',
        change: '+23%',
        color: 'green',
        target: 30000000,
        displayTarget: '$30M',
        progress: 78,
        status: 'on-track',
        trend: 'up'
      },
      {
        id: 2,
        icon: 'TrendingUp',
        label: 'Market Share',
        value: 15.4,
        displayValue: '15.4%',
        change: '+2.1%',
        color: 'blue',
        target: 18,
        displayTarget: '18%',
        progress: 62,
        status: 'at-risk',
        trend: 'up'
      },
      {
        id: 3,
        icon: 'PieChart',
        label: 'Profit Margin',
        value: 20,
        displayValue: '20%',
        change: '+5%',
        color: 'purple',
        target: 25,
        displayTarget: '25%',
        progress: 80,
        status: 'on-track',
        trend: 'up'
      },
      {
        id: 4,
        icon: 'Target',
        label: 'NPS Score',
        value: 72,
        displayValue: '72',
        change: '+8 pts',
        color: 'orange',
        target: 80,
        displayTarget: '80',
        progress: 90,
        status: 'excellent',
        trend: 'up'
      },
      {
        id: 5,
        icon: 'DollarSign',
        label: 'Customer Acquisition Cost',
        value: 450,
        displayValue: '$450',
        change: '-12%',
        color: 'red',
        target: 400,
        displayTarget: '$400',
        progress: 75,
        status: 'on-track',
        trend: 'down'
      },
      {
        id: 6,
        icon: 'TrendingUp',
        label: 'Customer Lifetime Value',
        value: 3200,
        displayValue: '$3.2K',
        change: '+18%',
        color: 'green',
        target: 3500,
        displayTarget: '$3.5K',
        progress: 85,
        status: 'on-track',
        trend: 'up'
      }
    ]);
    setSummary({
      overallProgress: 78,
      onTrackCount: 4,
      atRiskCount: 1,
      excellentCount: 1
    });
  };

  const getIconComponent = (iconName) => {
    const icons = {
      DollarSign: DollarSign,
      TrendingUp: TrendingUp,
      PieChart: PieChart,
      Target: Target
    };
    return icons[iconName] || DollarSign;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'excellent': return 'text-green-600';
      case 'on-track': return 'text-blue-600';
      case 'at-risk': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressBarColor = (status) => {
    switch(status) {
      case 'excellent': return 'bg-green-500';
      case 'on-track': return 'bg-blue-500';
      case 'at-risk': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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

  const formatPercentage = (value) => {
    return `${value}%`;
  };

  const formatValue = (metric) => {
    if (metric.label.includes('Revenue') || metric.label.includes('Cost') || metric.label.includes('Value')) {
      return formatCurrency(metric.value);
    }
    if (metric.label.includes('Margin') || metric.label.includes('Share')) {
      return formatPercentage(metric.value);
    }
    return metric.displayValue || metric.value.toString();
  };

  const formatTarget = (metric) => {
    if (metric.label.includes('Revenue') || metric.label.includes('Cost') || metric.label.includes('Value')) {
      return formatCurrency(metric.target);
    }
    if (metric.label.includes('Margin') || metric.label.includes('Share')) {
      return formatPercentage(metric.target);
    }
    return metric.displayTarget || metric.target.toString();
  };

  if (isLoading && metrics.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && metrics.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-gray-600">{error}</p>
        <button onClick={fetchMetrics} className="mt-3 text-blue-600">Try Again</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Strategic KPIs</h2>
            <p className="text-sm text-gray-500 mt-1">
              {period === 'quarter' ? 'Q2 2024' : period === 'year' ? 'YTD 2024' : 'This Month'} Performance vs Targets
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="text-center">
          <p className="text-xs text-gray-500">Overall Progress</p>
          <p className="text-lg font-bold text-blue-600">{summary.overallProgress}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">On Track</p>
          <p className="text-lg font-bold text-green-600">{summary.onTrackCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">At Risk</p>
          <p className="text-lg font-bold text-red-600">{summary.atRiskCount}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, i) => {
            const Icon = getIconComponent(metric.icon);
            const isPositiveChange = metric.change?.startsWith('+') || metric.trend === 'up';
            const changeColor = isPositiveChange ? 'text-green-600' : 'text-red-600';
            
            return (
              <div key={metric.id || i} className="space-y-3 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className={`p-2 bg-${metric.color}-50 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${metric.color}-600`} />
                  </div>
                  <span className={`text-sm font-semibold ${changeColor}`}>
                    {metric.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatValue(metric)}</p>
                  <p className="text-sm text-gray-600 mt-1">{metric.label}</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Target: {formatTarget(metric)}</span>
                    <span className={`font-medium ${getStatusColor(metric.status)}`}>
                      {metric.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`${getProgressBarColor(metric.status)} rounded-full h-1.5 transition-all duration-1000`}
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                </div>
                {metric.status === 'at-risk' && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Below target - Action required
                    </p>
                  </div>
                )}
                {metric.status === 'excellent' && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Exceeding expectations
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">Data source: Finance & Analytics</span>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View Detailed Report →
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategicMetrics;