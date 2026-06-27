import React, { useState, useEffect } from 'react';

const ProgressBar = ({ 
  apiEndpoint,           // API endpoint to fetch data from
  title,
  value = 0,             // Current value (0-100 or custom range)
  maxValue = 100,        // Maximum value
  height = 8,            // Height of progress bar in pixels
  showLabel = true,      // Show percentage label
  showValue = true,      // Show current/max value
  showIcon = true,       // Show icon
  animated = true,       // Animate progress
  striped = false,       // Striped pattern
  color = '#000000',     // Progress color
  backgroundColor = '#E5E7EB', // Background color
  onClick,
  refreshInterval,       // Auto-refresh interval in ms
  department,            // Optional department filter
  userId,                // Optional user filter
  progressType = 'task', // task, leave, report, attendance, goal, sprint, compliance
  size = 'md',           // sm, md, lg
  rounded = true,        // Rounded corners
}) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [targetValue, setTargetValue] = useState(0);

  // Size configurations
  const sizeConfig = {
    sm: { height: 4, fontSize: 'text-xs', iconSize: 'text-sm', padding: 'p-2' },
    md: { height: 8, fontSize: 'text-sm', iconSize: 'text-base', padding: 'p-3' },
    lg: { height: 12, fontSize: 'text-base', iconSize: 'text-lg', padding: 'p-4' }
  };

  // Icon mapping
  const getIcon = (type) => {
    const icons = {
      task: '✅',
      leave: '📅',
      report: '📝',
      attendance: '👥',
      goal: '🎯',
      sprint: '🚀',
      compliance: '📊',
      project: '📁',
      budget: '💰',
      timeline: '⏰'
    };
    return icons[type] || '📈';
  };

  // Color mapping based on progress
  const getProgressColor = (progressValue) => {
    if (progressValue >= 80) return '#10B981'; // Green for good progress
    if (progressValue >= 50) return '#F59E0B'; // Orange for medium progress
    return '#EF4444'; // Red for low progress
  };

  // Fetch data from API
  const fetchProgressData = async () => {
    try {
      setLoading(true);
      let url = apiEndpoint || '/api/analytics/progress';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (department) params.append('department', department);
      if (userId) params.append('userId', userId);
      if (progressType) params.append('type', progressType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch progress data');
      
      const result = await response.json();
      
      // Calculate progress percentage
      let progressValue = 0;
      let currentValue = 0;
      let maxVal = maxValue;
      
      switch (progressType) {
        case 'task':
          currentValue = result.completed || result.current || 0;
          maxVal = result.total || maxValue;
          progressValue = (currentValue / maxVal) * 100;
          break;
        case 'leave':
          currentValue = result.used || result.current || 0;
          maxVal = result.total || maxValue;
          progressValue = (currentValue / maxVal) * 100;
          break;
        case 'report':
          currentValue = result.submitted || result.current || 0;
          maxVal = result.expected || maxValue;
          progressValue = (currentValue / maxVal) * 100;
          break;
        case 'attendance':
          progressValue = result.rate || result.current || 0;
          currentValue = progressValue;
          maxVal = 100;
          break;
        case 'goal':
          currentValue = result.achieved || result.current || 0;
          maxVal = result.target || maxValue;
          progressValue = (currentValue / maxVal) * 100;
          break;
        default:
          progressValue = result.progress || result.value || value;
          currentValue = result.current || value;
          maxVal = result.max || maxValue;
      }
      
      setProgress(Math.min(100, Math.max(0, progressValue)));
      setTargetValue(maxVal);
      setDetails(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError(err.message);
      // Set fallback demo data
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackData = () => {
    const fallbackProgress = {
      task: { value: 65, total: 100, label: 'Tasks Completed' },
      leave: { value: 8, total: 20, label: 'Leave Used' },
      report: { value: 18, total: 22, label: 'Reports Submitted' },
      attendance: { value: 94, total: 100, label: 'Attendance Rate' },
      goal: { value: 3, total: 5, label: 'Goals Achieved' }
    };
    
    const data = fallbackProgress[progressType] || fallbackProgress.task;
    const progressValue = (data.value / data.total) * 100;
    setProgress(Math.min(100, progressValue));
    setTargetValue(data.total);
    setDetails({ current: data.value, total: data.total, label: data.label });
  };

  useEffect(() => {
    if (value > 0 && !apiEndpoint) {
      // Use direct value if provided
      setProgress(Math.min(100, Math.max(0, (value / maxValue) * 100)));
      setTargetValue(maxValue);
      setDetails({ current: value, total: maxValue });
      setLoading(false);
    } else {
      fetchProgressData();
    }
    
    // Auto-refresh if interval provided
    if (refreshInterval && apiEndpoint) {
      const interval = setInterval(fetchProgressData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [apiEndpoint, department, userId, progressType, value, maxValue, refreshInterval]);

  const getStatusMessage = () => {
    if (progress >= 90) return 'Excellent progress! 🎉';
    if (progress >= 70) return 'Great progress! 👍';
    if (progress >= 50) return 'Halfway there! 📍';
    if (progress >= 30) return 'Keep going! 💪';
    return 'Just getting started! 🚀';
  };

  const getProgressColorStyle = () => {
    if (color !== '#000000') return color;
    return getProgressColor(progress);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border ${sizeConfig[size].padding}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !details) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border ${sizeConfig[size].padding}`}>
        <div className="text-center text-red-500 text-sm">
          ⚠️ Failed to load progress data
          <button onClick={fetchProgressData} className="ml-2 text-black underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border ${sizeConfig[size].padding} hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => onClick && onClick({ progress, details, progressType })}
    >
      {/* Header */}
      {(title || showIcon) && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            {showIcon && (
              <span className={sizeConfig[size].iconSize}>
                {getIcon(progressType)}
              </span>
            )}
            {title && (
              <h3 className={`font-semibold text-gray-900 ${sizeConfig[size].fontSize}`}>
                {title}
              </h3>
            )}
            {!title && details?.label && (
              <h3 className={`font-semibold text-gray-900 ${sizeConfig[size].fontSize}`}>
                {details.label}
              </h3>
            )}
          </div>
          {showLabel && (
            <span className={`font-bold ${progress >= 80 ? 'text-green-600' : progress >= 50 ? 'text-orange-600' : 'text-red-600'} ${sizeConfig[size].fontSize}`}>
              {Math.round(progress)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <div 
          className={`overflow-hidden ${rounded ? 'rounded-full' : 'rounded-none'}`}
          style={{ backgroundColor, height: `${sizeConfig[size].height}px` }}
        >
          <div
            className={`h-full transition-all duration-1000 ease-out ${striped ? 'bg-striped' : ''}`}
            style={{
              width: `${progress}%`,
              backgroundColor: getProgressColorStyle(),
              backgroundImage: striped ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.3) 10px, transparent 10px, transparent 20px)' : 'none',
              transition: animated ? 'width 1s ease-in-out' : 'none',
            }}
          />
        </div>
      </div>

      {/* Value Display */}
      {showValue && details && (
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <div className="flex space-x-3">
            <span>📊 {details.current || 0} / {targetValue}</span>
            {details.remaining !== undefined && (
              <span>📋 Remaining: {details.remaining}</span>
            )}
          </div>
          <div className="text-green-600 text-xs">
            {getStatusMessage()}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {details && details.additionalStats && (
        <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-2 text-xs text-gray-500">
          {details.additionalStats.map((stat, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{stat.label}:</span>
              <span className="font-medium text-gray-700">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component for multiple progress bars
export const ProgressBarGroup = ({ 
  apiEndpoint,
  title,
  items = [],
  showLegend = true,
  height = 'md',
  onClickItem 
}) => {
  const [data, setData] = useState(items);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (apiEndpoint) {
      fetchGroupData();
    } else {
      setData(items);
      setLoading(false);
    }
  }, [apiEndpoint, items]);

  const fetchGroupData = async () => {
    try {
      const response = await fetch(apiEndpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const result = await response.json();
      setData(result.items || result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching group data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-2 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      {title && (
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} onClick={() => onClickItem && onClickItem(item, index)}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{item.label}</span>
              <span className="text-gray-500">{item.value}%</span>
            </div>
            <ProgressBar
              value={item.value}
              maxValue={100}
              height={sizeConfig[height].height}
              showLabel={false}
              showValue={false}
              animated={true}
              color={item.color}
              size={height}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;