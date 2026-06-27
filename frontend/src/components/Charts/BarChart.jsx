import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BarChart = ({ 
  apiEndpoint,           // API endpoint to fetch data from
  title, 
  height = 300,
  showLegend = true,
  onClick,
  refreshInterval,      // Auto-refresh interval in ms
  department,           // Optional department filter
  startDate,           // Optional date range
  endDate,
  chartType = 'reports' // reports, leave, tasks, attendance
}) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Fetch data from API
  const fetchChartData = async () => {
    try {
      setLoading(true);
      let url = apiEndpoint || '/api/analytics/charts';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (department) params.append('department', department);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (chartType) params.append('type', chartType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch chart data');
      
      const result = await response.json();
      
      // Transform API data to chart format
      const transformedData = transformData(result, chartType);
      setChartData(transformedData);
      setStats(result.stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError(err.message);
      // Set fallback demo data for development
      setChartData(getFallbackData(chartType));
    } finally {
      setLoading(false);
    }
  };

  // Transform API response to chart format
  const transformData = (apiData, type) => {
    switch (type) {
      case 'reports':
        return {
          labels: apiData.labels || apiData.departments || [],
          datasets: [{
            label: 'Reports Submitted',
            data: apiData.data || apiData.reportCounts || [],
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderColor: 'rgb(0, 0, 0)',
          }]
        };
      
      case 'leave':
        return {
          labels: apiData.labels || apiData.months || [],
          datasets: [
            {
              label: 'Leave Requests',
              data: apiData.requests || [],
              backgroundColor: 'rgba(245, 158, 11, 0.8)',
              borderColor: 'rgb(245, 158, 11)',
            },
            {
              label: 'Approved',
              data: apiData.approved || [],
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderColor: 'rgb(16, 185, 129)',
            },
            {
              label: 'Rejected',
              data: apiData.rejected || [],
              backgroundColor: 'rgba(239, 68, 68, 0.8)',
              borderColor: 'rgb(239, 68, 68)',
            }
          ]
        };
      
      case 'tasks':
        return {
          labels: apiData.labels || apiData.teams || [],
          datasets: [{
            label: 'Tasks Completed',
            data: apiData.data || apiData.completed || [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
          }]
        };
      
      case 'attendance':
        return {
          labels: apiData.labels || apiData.weeks || [],
          datasets: [{
            label: 'Attendance Rate (%)',
            data: apiData.data || apiData.rates || [],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)',
          }]
        };
      
      default:
        return {
          labels: apiData.labels || [],
          datasets: [{
            label: apiData.datasetLabel || 'Data',
            data: apiData.data || [],
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }]
        };
    }
  };

  // Fallback data for development/offline
  const getFallbackData = (type) => {
    switch (type) {
      case 'reports':
        return {
          labels: ['Platform and DevOps', 'Core Systems', 'Hardware & Integration', 'Robotics & Simulation', 'AI/LLM & Perception'],
          datasets: [{
            label: 'Reports Submitted',
            data: [45, 32, 28, 15, 20],
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }]
        };
      case 'leave':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            { label: 'Requests', data: [12, 19, 15, 17, 14, 22], backgroundColor: 'rgba(245, 158, 11, 0.8)' },
            { label: 'Approved', data: [10, 15, 12, 14, 12, 18], backgroundColor: 'rgba(16, 185, 129, 0.8)' },
            { label: 'Rejected', data: [2, 4, 3, 3, 2, 4], backgroundColor: 'rgba(239, 68, 68, 0.8)' }
          ]
        };
      default:
        return {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{ label: 'Data', data: [10, 15, 12, 18], backgroundColor: 'rgba(0, 0, 0, 0.8)' }]
        };
    }
  };

  useEffect(() => {
    fetchChartData();
    
    // Auto-refresh if interval provided
    if (refreshInterval) {
      const interval = setInterval(fetchChartData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [apiEndpoint, department, startDate, endDate, chartType, refreshInterval]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: showLegend,
        labels: {
          font: { size: 12 },
          usePointStyle: true,
        },
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16, weight: 'bold' },
        color: '#1F2937',
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#FFFFFF',
        bodyColor: '#D1D5DB',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            let value = context.raw;
            return `${label}: ${value} ${chartType === 'attendance' ? '%' : ''}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#E5E7EB' },
        title: {
          display: true,
          text: chartType === 'attendance' ? 'Percentage (%)' : 'Count',
          color: '#6B7280',
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    onClick: (event, elements) => {
      if (onClick && elements.length > 0 && chartData) {
        const index = elements[0].index;
        onClick(chartData.labels[index], index);
      }
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !chartData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex justify-center items-center" style={{ height: `${height}px` }}>
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-red-500 text-sm">Failed to load chart data</p>
            <button 
              onClick={fetchChartData}
              className="mt-2 text-sm text-black underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      {/* Stats Summary */}
      {stats && (
        <div className="mb-4 grid grid-cols-3 gap-3 pb-3 border-b">
          <div className="text-center">
            <div className="text-xl font-bold text-black">{stats.total || 0}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{stats.average || 0}</div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.growth || 0}%</div>
            <div className="text-xs text-gray-500">Growth</div>
          </div>
        </div>
      )}
      
      <div style={{ height: `${height}px` }}>
        {chartData && <Bar data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default BarChart;