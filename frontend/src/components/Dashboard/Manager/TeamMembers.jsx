// src/components/Dashboard/TeamLead/TeamMembers.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import employeeService from '../../../services/employeeService';

const TeamMembers = ({ userRole = 'Team Lead' }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    totalTasks: 0
  });

  useEffect(() => {
    fetchTeamMembers();
  }, [searchTerm, filterRole, filterStatus]);

  const fetchTeamMembers = async () => {
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
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole !== 'all') params.append('role', filterRole);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      // Get team members under this team lead
      const response = await fetch(`${API_BASE_URL}/team-lead/team-members?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
        calculateStats(data);
      } else {
        throw new Error('Failed to fetch team members');
      }
      
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to load team members');
      
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (members) => {
    setStats({
      total: members.length,
      active: members.filter(m => m.status === 'Active').length,
      onLeave: members.filter(m => m.status === 'On Leave').length,
      totalTasks: members.reduce((sum, m) => sum + (m.tasksCompleted || 0), 0)
    });
  };

  const loadMockData = () => {
    const mockMembers = [
      { 
        id: 1, 
        name: 'Priya Sharma', 
        role: 'Senior Developer', 
        email: 'priya.sharma@spaceborn.com', 
        status: 'Active', 
        joinDate: '2023-01-15', 
        tasksCompleted: 28,
        tasksInProgress: 2,
        phone: '+91 98765 43210',
        department: 'Core Systems'
      },
      { 
        id: 2, 
        name: 'Rahul Verma', 
        role: 'Frontend Lead', 
        email: 'rahul.verma@spaceborn.com', 
        status: 'Active', 
        joinDate: '2023-02-10', 
        tasksCompleted: 24,
        tasksInProgress: 3,
        phone: '+91 98765 43211',
        department: 'Core Systems'
      },
      { 
        id: 3, 
        name: 'Anjali Nair', 
        role: 'Backend Developer', 
        email: 'anjali.nair@spaceborn.com', 
        status: 'Active', 
        joinDate: '2023-03-05', 
        tasksCompleted: 26,
        tasksInProgress: 1,
        phone: '+91 98765 43212',
        department: 'Core Systems'
      },
      { 
        id: 4, 
        name: 'Vikram Singh', 
        role: 'DevOps Engineer', 
        email: 'vikram.singh@spaceborn.com', 
        status: 'Active', 
        joinDate: '2023-04-12', 
        tasksCompleted: 20,
        tasksInProgress: 4,
        phone: '+91 98765 43213',
        department: 'Core Systems'
      },
      { 
        id: 5, 
        name: 'Suresh M', 
        role: 'Frontend Developer', 
        email: 'suresh.m@spaceborn.com', 
        status: 'Active', 
        joinDate: '2023-05-20', 
        tasksCompleted: 22,
        tasksInProgress: 2,
        phone: '+91 98765 43214',
        department: 'Core Systems'
      },
      { 
        id: 6, 
        name: 'Neha Gupta', 
        role: 'QA Engineer', 
        email: 'neha.gupta@spaceborn.com', 
        status: 'On Leave', 
        joinDate: '2023-06-15', 
        tasksCompleted: 18,
        tasksInProgress: 0,
        phone: '+91 98765 43215',
        department: 'Core Systems'
      }
    ];
    
    let filtered = mockMembers;
    if (searchTerm) {
      filtered = mockMembers.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRole !== 'all') {
      filtered = filtered.filter(m => m.role === filterRole);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }
    
    setTeamMembers(filtered);
    calculateStats(mockMembers);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
      case 'On Leave':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">On Leave</span>;
      case 'Inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Inactive</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const roleOptions = ['all', 'Senior Developer', 'Frontend Lead', 'Backend Developer', 'DevOps Engineer', 'Frontend Developer', 'QA Engineer'];
  const statusOptions = ['all', 'Active', 'On Leave', 'Inactive'];

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
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-500 mt-1">Engineering department team members</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
          <p className="text-sm text-green-600">Active</p>
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 text-center">
          <p className="text-sm text-yellow-600">On Leave</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.onLeave}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
          <p className="text-sm text-blue-600">Total Tasks</p>
          <p className="text-2xl font-bold text-blue-700">{stats.totalTasks}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search by name, email or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roleOptions.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : role}
              </option>
            ))}
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </option>
            ))}
          </select>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilterRole('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Clear Filters
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Team Members</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchTeamMembers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : teamMembers.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No team members found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        /* Team Members Table */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr 
                    key={member.id} 
                    className="hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setSelectedMember(member)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">ID: {member.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.role}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{member.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900">{member.tasksCompleted || 0}</span>
                        {member.tasksInProgress > 0 && (
                          <span className="text-xs text-gray-400">({member.tasksInProgress} in progress)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(member.joinDate)}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1">
                        <span>View</span>
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

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedMember(null)}>
          <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Member Details</h2>
                <button onClick={() => setSelectedMember(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {getInitials(selectedMember.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedMember.name}</h3>
                  <p className="text-gray-500">{selectedMember.role}</p>
                  <div className="mt-1">{getStatusBadge(selectedMember.status)}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm text-gray-900">{selectedMember.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Phone</span>
                  <span className="text-sm text-gray-900">{selectedMember.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Department</span>
                  <span className="text-sm text-gray-900">{selectedMember.department || 'Core Systems'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Join Date</span>
                  <span className="text-sm text-gray-900">{formatDate(selectedMember.joinDate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Tasks Completed</span>
                  <span className="text-sm font-semibold text-green-600">{selectedMember.tasksCompleted || 0}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Tasks In Progress</span>
                  <span className="text-sm font-semibold text-yellow-600">{selectedMember.tasksInProgress || 0}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;