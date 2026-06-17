// src/components/Dashboard/TeamLead/TeamPerformance.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import taskService from '../../../services/taskService';

const TeamPerformance = ({ userRole = 'Team Lead' }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [sortBy, setSortBy] = useState('productivity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [teamStats, setTeamStats] = useState({
    averageProductivity: 0,
    averageCodeQuality: 0,
    totalTasksCompleted: 0,
    topPerformer: null
  });

  useEffect(() => {
    fetchTeamPerformance();
  }, [selectedPeriod, sortBy, sortOrder, searchTerm]);

  const fetchTeamPerformance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token) {
        console.error('No authentication token found');
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const params = new URLSearchParams();
      params.append('period', selectedPeriod);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_BASE_URL}/team-lead/performance?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        let members = data.members || data;
        
        // Sort members
        members = sortMembers(members, sortBy, sortOrder);
        
        setTeamMembers(members);
        calculateTeamStats(members);
      } else {
        throw new Error('Failed to fetch team performance');
      }
      
    } catch (error) {
      console.error('Error fetching team performance:', error);
      setError('Failed to load team performance data');
      
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const sortMembers = (members, by, order) => {
    const sorted = [...members];
    sorted.sort((a, b) => {
      let aVal = a[by];
      let bVal = b[by];
      
      if (by === 'productivity' || by === 'codeQuality') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      } else if (by === 'completed') {
        aVal = a.completed || 0;
        bVal = b.completed || 0;
      } else if (by === 'name') {
        aVal = a.name;
        bVal = b.name;
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    return sorted;
  };

  const calculateTeamStats = (members) => {
    if (members.length === 0) return;
    
    const totalProductivity = members.reduce((sum, m) => sum + (m.productivity || 0), 0);
    const totalCodeQuality = members.reduce((sum, m) => sum + (m.codeQuality || 0), 0);
    const totalTasksCompleted = members.reduce((sum, m) => sum + (m.completed || 0), 0);
    
    const topPerformer = [...members].sort((a, b) => (b.productivity || 0) - (a.productivity || 0))[0];
    
    setTeamStats({
      averageProductivity: Math.round(totalProductivity / members.length),
      averageCodeQuality: Math.round(totalCodeQuality / members.length),
      totalTasksCompleted,
      topPerformer: topPerformer?.name || null
    });
  };

  const loadMockData = () => {
    const mockMembers = [
      { 
        id: 1,
        name: 'Priya Sharma', 
        role: 'Senior Developer', 
        tasks: 28, 
        completed: 26, 
        productivity: 94, 
        codeQuality: 96,
        avatar: 'PS',
        efficiency: 92,
        onTimeDelivery: 96
      },
      { 
        id: 2,
        name: 'Rahul Verma', 
        role: 'Frontend Lead', 
        tasks: 24, 
        completed: 22, 
        productivity: 88, 
        codeQuality: 92,
        avatar: 'RV',
        efficiency: 85,
        onTimeDelivery: 90
      },
      { 
        id: 3,
        name: 'Anjali Nair', 
        role: 'Backend Developer', 
        tasks: 26, 
        completed: 24, 
        productivity: 92, 
        codeQuality: 94,
        avatar: 'AN',
        efficiency: 90,
        onTimeDelivery: 94
      },
      { 
        id: 4,
        name: 'Vikram Singh', 
        role: 'DevOps Engineer', 
        tasks: 20, 
        completed: 18, 
        productivity: 86, 
        codeQuality: 90,
        avatar: 'VS',
        efficiency: 82,
        onTimeDelivery: 88
      },
      { 
        id: 5,
        name: 'Suresh M', 
        role: 'Frontend Developer', 
        tasks: 22, 
        completed: 19, 
        productivity: 84, 
        codeQuality: 88,
        avatar: 'SM',
        efficiency: 80,
        onTimeDelivery: 86
      }
    ];
    
    let filtered = mockMembers;
    if (searchTerm) {
      filtered = mockMembers.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    const sorted = sortMembers(filtered, sortBy, sortOrder);
    setTeamMembers(sorted);
    calculateTeamStats(mockMembers);
  };

  const getProductivityColor = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading && teamMembers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Performance</h1>
        <p className="text-gray-500 mt-1">Individual member performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Avg Productivity</p>
          <p className="text-2xl font-bold text-green-600">{teamStats.averageProductivity}%</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-500 rounded-full h-1.5" style={{ width: `${teamStats.averageProductivity}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Avg Code Quality</p>
          <p className="text-2xl font-bold text-blue-600">{teamStats.averageCodeQuality}%</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-500 rounded-full h-1.5" style={{ width: `${teamStats.averageCodeQuality}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold text-purple-600">{teamStats.totalTasksCompleted}</p>
          <p className="text-xs text-gray-400 mt-1">completed this {selectedPeriod}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Top Performer</p>
          <p className="text-lg font-bold text-orange-600 truncate">{teamStats.topPerformer || 'N/A'}</p>
          <p className="text-xs text-gray-400 mt-1">highest productivity</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 flex-wrap">
            <div className="relative min-w-[250px]">
              <input 
                type="text" 
                placeholder="Search by name or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedPeriod('month');
              setSortBy('productivity');
              setSortOrder('desc');
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && teamMembers.length === 0 ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Performance Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchTeamPerformance}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : teamMembers.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 text-lg">No performance data found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        /* Performance Table */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    Member {getSortIcon('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('completed')}
                  >
                    Tasks {getSortIcon('completed')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('productivity')}
                  >
                    Productivity {getSortIcon('productivity')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('codeQuality')}
                  >
                    Code Quality {getSortIcon('codeQuality')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.avatar || getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">ID: {member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.role}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{member.completed || 0}</span>
                        <span className="text-sm text-gray-400"> / {member.tasks || 0}</span>
                        {member.completed === member.tasks && member.tasks > 0 && (
                          <span className="ml-2 text-xs text-green-600">✓ Complete</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {((member.completed / member.tasks) * 100 || 0).toFixed(0)}% completion
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${getProductivityColor(member.productivity)} rounded-full h-2 transition-all duration-500`}
                            style={{ width: `${member.productivity}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${member.productivity >= 90 ? 'text-green-600' : member.productivity >= 80 ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {member.productivity}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${member.codeQuality}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-blue-600">{member.codeQuality}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${member.efficiency || member.productivity}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-purple-600">{member.efficiency || member.productivity}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                        <span>Details</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPerformance;