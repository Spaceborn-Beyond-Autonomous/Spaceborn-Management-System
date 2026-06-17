import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ 
  apiEndpoint,           // API endpoint to fetch data from
  title, 
  height = 300,
  showLegend = true,
  showGrid = true,
  fillArea = false,      // Fill area under lines
  smoothLines = true,    // Smooth curves
  onClick,
  refreshInterval,      // Auto-refresh interval in ms
  department,           // Optional department filter
  startDate,           // Optional date range
  endDate,
  chartType = 'reports', // reports, leave, attendance, productivity, trends
  period = 'weekly'     // daily, weekly, monthly, yearly
}) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Color palette
  const colorPalette = {
    primary: {
      line: '#000000',
      fill: 'rgba(0, 0, 0, 0.1)',
      point: '#000000',
    },
    secondary: {
      line: '#3B82F6',
      fill: 'rgba(59, 130, 246, 0.1)',
      point: '#3B82F6',
    },
    tertiary: {
      line: '#10B981',
      fill: 'rgba(16, 185, 129, 0.1)',
      point: '#10B981',
    },
    quaternary: {
      line: '#F59E0B',
      fill: 'rgba(245, 158, 11, 0.1)',
      point: '#F59E0B',
    },
    quinary: {
      line: '#EF4444',
      fill: 'rgba(239, 68, 68, 0.1)',
      point: '#EF4444',
    },
  };

  // Fetch data from API
  const fetchChartData = async () => {
    try {
      setLoading(true);
      let url = apiEndpoint || '/api/analytics/line-chart';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (department) params.append('department', department);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (chartType) params.append('type', chartType);
      if (period) params.append('period', period);
      
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
      console.error('Error fetching line chart data:', err);
      setError(err.message);
      // Set fallback demo data for development
      setChartData(getFallbackData(chartType, period));
      setStats(getFallbackStats());
    } finally {
      setLoading(false);
    }
  };

  // Transform API response to chart format
  const transformData = (apiData, type) => {
    let labels = [];
    let datasets = [];

    switch (type) {
      case 'reports':
        labels = apiData.labels || apiData.periods || [];
        datasets = [{
          label: 'Reports Submitted',
          data: apiData.data || apiData.counts || [],
          borderColor: colorPalette.primary.line,
          backgroundColor: fillArea ? colorPalette.primary.fill : 'transparent',
          borderWidth: 3,
          pointBackgroundColor: colorPalette.primary.point,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: smoothLines ? 0.4 : 0,
          fill: fillArea,
        }];
        break;
      
      case 'leave':
        labels = apiData.labels || apiData.periods || [];
        datasets = [
          {
            label: 'Leave Requests',
            data: apiData.requests || [],
            borderColor: colorPalette.secondary.line,
            backgroundColor: fillArea ? colorPalette.secondary.fill : 'transparent',
            borderWidth: 2,
            pointBackgroundColor: colorPalette.secondary.point,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 3,
            tension: smoothLines ? 0.4 : 0,
            fill: false,
          },
          {
            label: 'Approved',
            data: apiData.approved || [],
            borderColor: colorPalette.tertiary.line,
            borderWidth: 2,
            pointBackgroundColor: colorPalette.tertiary.point,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 3,
            tension: smoothLines ? 0.4 : 0,
            fill: false,
          },
          {
            label: 'Rejected',
            data: apiData.rejected || [],
            borderColor: colorPalette.quinary.line,
            borderWidth: 2,
            pointBackgroundColor: colorPalette.quinary.point,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 3,
            tension: smoothLines ? 0.4 : 0,
            fill: false,
          }
        ];
        break;
      
      case 'attendance':
        labels = apiData.labels || apiData.periods || [];
        datasets = [{
          label: 'Attendance Rate (%)',
          data: apiData.data || apiData.rates || [],
          borderColor: colorPalette.tertiary.line,
          backgroundColor: fillArea ? colorPalette.tertiary.fill : 'transparent',
          borderWidth: 3,
          pointBackgroundColor: colorPalette.tertiary.point,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: smoothLines ? 0.4 : 0,
          fill: fillArea,
          yAxisID: 'y',
        }];
        break;
      
      case 'productivity':
        labels = apiData.labels || apiData.periods || [];
        datasets = [
          {
            label: 'Tasks Completed',
            data: apiData.completed || [],
            borderColor: colorPalette.primary.line,
            borderWidth: 3,
            pointBackgroundColor: colorPalette.primary.point,
            pointRadius: 4,
            tension: smoothLines ? 0.4 : 0,
            yAxisID: 'y',
          },
          {
            label: 'Tasks Pending',
            data: apiData.pending || [],
            borderColor: colorPalette.quaternary.line,
            borderWidth: 2,
            pointBackgroundColor: colorPalette.quaternary.point,
            pointRadius: 3,
            tension: smoothLines ? 0.4 : 0,
            borderDash: [5, 5],
            yAxisID: 'y',
          }
        ];
        break;
      
      case 'trends':
        labels = apiData.labels || apiData.periods || [];
        datasets = [{
          label: apiData.datasetLabel || 'Trend',
          data: apiData.data || apiData.trends || [],
          borderColor: colorPalette.secondary.line,
          backgroundColor: fillArea ? colorPalette.secondary.fill : 'transparent',
          borderWidth: 3,
          pointBackgroundColor: colorPalette.secondary.point,
          pointRadius: 3,
          tension: smoothLines ? 0.4 : 0,
          fill: fillArea,
        }];
        break;
      
      default:
        labels = apiData.labels || [];
        datasets = [{
          label: apiData.datasetLabel || 'Data',
          data: apiData.data || [],
          borderColor: colorPalette.primary.line,
          borderWidth: 2,
          tension: smoothLines ? 0.4 : 0,
        }];
    }

    return { labels, datasets };
  };

  // Fallback data for development
  const getFallbackData = (type, period) => {
    const periods = {
      daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weekly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      yearly: ['2020', '2021', '2022', '2023', '2024']
    };

    const labels = periods[period] || periods.weekly;

    switch (type) {
      case 'reports':
        return {
          labels: labels,
          datasets: [{
            label: 'Reports Submitted',
            data: [12, 19, 15, 17, 14, 22, 18].slice(0, labels.length),
            borderColor: colorPalette.primary.line,
            borderWidth: 3,
            pointBackgroundColor: colorPalette.primary.point,
            tension: smoothLines ? 0.4 : 0,
          }]
        };
      
      case 'leave':
        return {
          labels: labels,
          datasets: [
            {
              label: 'Leave Requests',
              data: [5, 8, 6, 7, 9, 4].slice(0, labels.length),
              borderColor: colorPalette.secondary.line,
              borderWidth: 2,
            },
            {
              label: 'Approved',
              data: [4, 7, 5, 6, 8, 3].slice(0, labels.length),
              borderColor: colorPalette.tertiary.line,
              borderWidth: 2,
            },
            {
              label: 'Rejected',
              data: [1, 1, 1, 1, 1, 1].slice(0, labels.length),
              borderColor: colorPalette.quinary.line,
              borderWidth: 2,
            }
          ]
        };
      
      default:
        return {
          labels: labels,
          datasets: [{
            label: 'Data',
            data: [10, 15, 12, 18, 14, 20, 16].slice(0, labels.length),
            borderColor: colorPalette.primary.line,
            borderWidth: 2,
          }]
        };
    }
  };

  const getFallbackStats = () => {
    return {
      average: 15.5,
      total: 108,
      growth: 12.5,
      peak: 22,
      lowest: 8
    };
  };

  useEffect(() => {
    fetchChartData();
    
    // Auto-refresh if interval provided
    if (refreshInterval) {
      const interval = setInterval(fetchChartData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [apiEndpoint, department, startDate, endDate, chartType, period, refreshInterval]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        display: showLegend,
        labels: {
          font: { size: 12, weight: 'normal' },
          usePointStyle: true,
          boxWidth: 10,
          padding: 15,
        },
      },
      title: {
        display: !!title,
        text: title,
        font: { size: 16, weight: 'bold' },
        color: '#1F2937',
        padding: { top: 10, bottom: 20 },
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
            if (chartType === 'attendance') {
              return `${label}: ${value}%`;
            }
            return `${label}: ${value}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: showGrid,
          color: '#E5E7EB',
          drawBorder: true,
        },
        title: {
          display: true,
          text: chartType === 'attendance' ? 'Percentage (%)' : 'Count',
          color: '#6B7280',
          font: { size: 12 },
        },
        ticks: {
          callback: function(value) {
            if (chartType === 'attendance') {
              return value + '%';
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: showGrid,
          color: '#E5E7EB',
        },
        title: {
          display: true,
          text: period === 'daily' ? 'Day' : period === 'weekly' ? 'Week' : period === 'monthly' ? 'Month' : 'Year',
          color: '#6B7280',
          font: { size: 12 },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    onClick: (event, elements) => {
      if (onClick && elements.length > 0 && chartData) {
        const index = elements[0].index;
        onClick(chartData.labels[index], index, elements);
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
        <div className="mb-4 grid grid-cols-4 gap-3 pb-3 border-b">
          <div className="text-center">
            <div className="text-xl font-bold text-black">{stats.total || 0}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.average || 0}</div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {stats.growth > 0 ? '+' : ''}{stats.growth || 0}%
            </div>
            <div className="text-xs text-gray-500">Growth</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{stats.peak || 0}</div>
            <div className="text-xs text-gray-500">Peak</div>
          </div>
        </div>
      )}
      
      <div style={{ height: `${height}px` }}>
        {chartData && <Line data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default LineChart;