// src/components/Dashboard/CEO/TeamsAndRoles.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const TeamsAndRoles = ({ userRole = 'CEO' }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // table, hierarchy, department
  
  // Form data for adding/editing member
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    role: 'Member',
    status: 'Active',
    phone: '',
    joinDate: ''
  });

  // Available options
  const roles = ['Member', 'Lead', 'Manager', 'CEO'];
  const statuses = ['Active', 'Inactive', 'On Leave'];
  const departmentsList = ['Platform and DevOps', 'Core Systems', 'Hardware & Integration', 'Robotics & Simulation', 'AI/LLM & Perception'];

  // Fetch team members from API
  useEffect(() => {
    fetchTeamMembers();
    fetchDepartments();
  }, [selectedDepartment, selectedRole, selectedStatus, searchQuery]);

  const fetchTeamMembers = async () => {
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
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedDepartment !== 'All') params.append('department', selectedDepartment);
      if (selectedRole !== 'All') params.append('role', selectedRole);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_BASE_URL}/team-members?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
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
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
      
    } catch (error) {
      console.error('Error fetching departments:', error);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        setDepartments(['Platform and DevOps', 'Core Systems', 'Hardware & Integration', 'Robotics & Simulation', 'AI/LLM & Perception']);
      }
    }
  };

  // Mock data for development
  const loadMockData = () => {
    const mockMembers = [
      { 
        id: 1, 
        initials: 'RD', 
        name: 'Ravi Das', 
        email: 'ravi.das@spaceborn.com',
        department: 'Core Systems', 
        designation: 'Frontend Developer', 
        role: 'Member', 
        status: 'Active',
        phone: '+91 98765 43213',
        joinDate: '2024-01-05',
        manager: 'Priya Sharma'
      },
      { 
        id: 2, 
        initials: 'NK', 
        name: 'Nisha Kumar', 
        email: 'nisha.kumar@spaceborn.com',
        department: 'Core Systems', 
        designation: 'DevOps Engineer', 
        role: 'Member', 
        status: 'Active',
        phone: '+91 98765 43214',
        joinDate: '2023-08-12',
        manager: 'Priya Sharma'
      },
      { 
        id: 3, 
        initials: 'PS', 
        name: 'Priya Sharma', 
        email: 'priya.sharma@spaceborn.com',
        department: 'Core Systems', 
        designation: 'Senior Engineer', 
        role: 'Lead', 
        status: 'Active',
        phone: '+91 98765 43210',
        joinDate: '2023-01-15',
        manager: 'Jane Smith'
      },
      { 
        id: 4, 
        initials: 'AM', 
        name: 'Anil Mehta', 
        email: 'anil.mehta@spaceborn.com',
        department: 'Hardware & Integration', 
        designation: 'UI/UX Designer', 
        role: 'Member', 
        status: 'Active',
        phone: '+91 98765 43212',
        joinDate: '2023-03-10',
        manager: 'Vikram Singh'
      },
      { 
        id: 5, 
        initials: 'PB', 
        name: 'Pooja B', 
        email: 'pooja.b@spaceborn.com',
        department: 'Hardware & Integration', 
        designation: 'UI Designer', 
        role: 'Member', 
        status: 'Active',
        phone: '+91 98765 43215',
        joinDate: '2023-11-20',
        manager: 'Anil Mehta'
      },
      { 
        id: 6, 
        initials: 'SK', 
        name: 'Sita Krishnan', 
        email: 'sita.krishnan@spaceborn.com',
        department: 'AI/LLM & Perception', 
        designation: 'AI/LLM & Perception Lead', 
        role: 'Lead', 
        status: 'Active',
        phone: '+91 98765 43211',
        joinDate: '2022-06-20',
        manager: 'Anjali Nair'
      }
    ];
    
    setTeamMembers(mockMembers);
  };

  // Add new team member
  const addTeamMember = async (e) => {
    e.preventDefault();
    
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/team-members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const newMember = await response.json();
        setTeamMembers([...teamMembers, newMember]);
        setShowAddMemberForm(false);
        setFormData({
          name: '',
          email: '',
          department: '',
          designation: '',
          role: 'Member',
          status: 'Active',
          phone: '',
          joinDate: ''
        });
        alert('Team member added successfully');
      } else {
        throw new Error('Failed to add team member');
      }
      
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member');
    }
  };

  // Update team member
  const updateTeamMember = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/team-members/${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedMember),
      });
      
      if (response.ok) {
        const updatedMember = await response.json();
        setTeamMembers(teamMembers.map(m => m.id === updatedMember.id ? updatedMember : m));
        setIsEditing(false);
        alert('Team member updated successfully');
      } else {
        throw new Error('Failed to update team member');
      }
      
    } catch (error) {
      console.error('Error updating team member:', error);
      alert('Failed to update team member');
    }
  };

  // Delete team member
  const deleteTeamMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/team-members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== memberId));
        alert('Team member deleted successfully');
      } else {
        throw new Error('Failed to delete team member');
      }
      
    } catch (error) {
      console.error('Error deleting team member:', error);
      alert('Failed to delete team member');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'CEO': return 'bg-purple-100 text-purple-700';
      case 'Manager': return 'bg-blue-100 text-blue-700';
      case 'Lead': return 'bg-indigo-100 text-indigo-700';
      case 'Member': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-red-100 text-red-700';
      case 'On Leave': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Group members by department
  const getDepartmentGroups = () => {
    const groups = {};
    teamMembers.forEach(member => {
      if (!groups[member.department]) {
        groups[member.department] = [];
      }
      groups[member.department].push(member);
    });
    return groups;
  };

  // Get hierarchy data
  const getHierarchyData = () => {
    const ceo = teamMembers.find(m => m.role === 'CEO');
    const managers = teamMembers.filter(m => m.role === 'Manager');
    const leads = teamMembers.filter(m => m.role === 'Lead');
    const members = teamMembers.filter(m => m.role === 'Member');
    
    return { ceo, managers, leads, members };
  };

  const canEditMembers = () => {
    return userRole === 'CEO' || userRole === 'Manager';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const departmentGroups = getDepartmentGroups();
  const hierarchy = getHierarchyData();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams & Roles</h1>
          <p className="text-gray-500 mt-1">Manage team members and their roles</p>
        </div>
        {canEditMembers() && (
          <button
            onClick={() => setShowAddMemberForm(!showAddMemberForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{showAddMemberForm ? 'Cancel' : 'Add Member'}</span>
          </button>
        )}
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Table View
        </button>
        <button
          onClick={() => setViewMode('department')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'department' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Department View
        </button>
        <button
          onClick={() => setViewMode('hierarchy')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            viewMode === 'hierarchy' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Hierarchy View
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMemberForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Team Member</h2>
          <form onSubmit={addTeamMember} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select department</option>
                  {departmentsList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({...formData, designation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddMemberForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="text" 
            placeholder="Search by name or department..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Departments</option>
            {departmentsList.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
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
          <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or add a new member</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MEMBER</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DEPARTMENT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DESIGNATION</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROLE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STATUS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                    setSelectedMember(member);
                    setShowMemberModal(true);
                  }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.designation}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        className="text-blue-600 hover:text-blue-700 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                          setShowMemberModal(true);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'department' ? (
        /* Department View */
        <div className="space-y-6">
          {Object.entries(departmentGroups).map(([department, members]) => (
            <div key={department} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">{department} · {members.length} MEMBERS</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MEMBER</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">DESIGNATION</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROLE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                        setSelectedMember(member);
                        setShowMemberModal(true);
                      }}>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{member.name}</p>
                              <p className="text-xs text-gray-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{member.designation}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Hierarchy View */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-6">
            {/* CEO */}
            {hierarchy.ceo && (
              <div className="text-center">
                <div className="inline-block p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                    {hierarchy.ceo.initials}
                  </div>
                  <p className="font-semibold text-gray-900">{hierarchy.ceo.name}</p>
                  <p className="text-sm text-purple-600">CEO</p>
                </div>
                <div className="flex justify-center my-4">
                  <div className="w-px h-8 bg-gray-300"></div>
                </div>
              </div>
            )}

            {/* Managers */}
            {hierarchy.managers.length > 0 && (
              <div>
                <h3 className="text-center text-sm font-medium text-gray-500 mb-4">MANAGERS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hierarchy.managers.map(manager => (
                    <div key={manager.id} className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                        {manager.initials}
                      </div>
                      <p className="font-medium text-gray-900">{manager.name}</p>
                      <p className="text-sm text-blue-600">Manager</p>
                      <p className="text-xs text-gray-500 mt-1">{manager.department}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leads */}
            {hierarchy.leads.length > 0 && (
              <div>
                <h3 className="text-center text-sm font-medium text-gray-500 mb-4">TEAM LEADS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hierarchy.leads.map(lead => (
                    <div key={lead.id} className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                        {lead.initials}
                      </div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-indigo-600">Team Lead</p>
                      <p className="text-xs text-gray-500 mt-1">{lead.department}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            {hierarchy.members.length > 0 && (
              <div>
                <h3 className="text-center text-sm font-medium text-gray-500 mb-4">TEAM MEMBERS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hierarchy.members.map(member => (
                    <div key={member.id} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                        {member.initials}
                      </div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-600">{member.designation}</p>
                      <p className="text-xs text-gray-500 mt-1">{member.department}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Member Details</h2>
                <button onClick={() => setShowMemberModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {selectedMember.initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedMember.name}</h3>
                      <p className="text-gray-500">{selectedMember.designation}</p>
                      <p className="text-sm text-gray-400">{selectedMember.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Department</label>
                      <p className="text-gray-900 mt-1">{selectedMember.department}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Role</label>
                      <p className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedMember.role)}`}>
                        {selectedMember.role}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Status</label>
                      <p className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedMember.status)}`}>
                        {selectedMember.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Phone</label>
                      <p className="text-gray-900 mt-1">{selectedMember.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Join Date</label>
                      <p className="text-gray-900 mt-1">{formatDate(selectedMember.joinDate)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-medium">Manager</label>
                      <p className="text-gray-900 mt-1">{selectedMember.manager || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {canEditMembers() && (
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Edit Member
                      </button>
                      <button
                        onClick={() => deleteTeamMember(selectedMember.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Delete Member
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={selectedMember.name}
                      onChange={(e) => setSelectedMember({...selectedMember, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={selectedMember.email}
                      onChange={(e) => setSelectedMember({...selectedMember, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={selectedMember.department}
                      onChange={(e) => setSelectedMember({...selectedMember, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {departmentsList.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={selectedMember.designation}
                      onChange={(e) => setSelectedMember({...selectedMember, designation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={selectedMember.role}
                      onChange={(e) => setSelectedMember({...selectedMember, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedMember.status}
                      onChange={(e) => setSelectedMember({...selectedMember, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={selectedMember.phone}
                      onChange={(e) => setSelectedMember({...selectedMember, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateTeamMember}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsAndRoles;