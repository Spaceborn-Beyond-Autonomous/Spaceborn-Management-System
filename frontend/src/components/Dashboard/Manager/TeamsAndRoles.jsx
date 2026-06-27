// src/components/Dashboard/Manager/TeamsAndRoles.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Eye, UserX, ChevronRight, Filter, Users, 
  Briefcase, Shield, Building2, AlertCircle 
} from 'lucide-react';
import employeeService from '../../../services/employeeService';
import authService from '../../../services/authService';
import { normalizeDepartment } from '../../../utils/departments';

const TeamsAndRoles = ({ userRole = 'Manager' }) => {
  const [activeTab, setActiveTab] = useState('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedMember, setSelectedMember] = useState(null);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState(['Platform and DevOps', 'Core Systems', 'Hardware & Integration', 'Robotics & Simulation', 'AI/LLM & Perception', 'All']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [memberToTerminate, setMemberToTerminate] = useState(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    name: '',
    email: '',
    designation: '',
    role: 'Member',
    phone: '',
    joinDate: ''
  });
  useEffect(() => {
    fetchAllData();
  }, [activeTab, selectedDepartment, searchQuery]);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch employees from service
      const employees = await employeeService.getAllEmployees();
      const filteredEmployees = employees;
      const uniqueDepartments = [
        'All',
        ...new Set(employees.map(emp => normalizeDepartment(emp.department)).filter(Boolean))
      ];
      setDepartments(uniqueDepartments);
      
      if (activeTab === 'teams') {
        // Calculate teams/departments from employees across the company
        const deptMap = new Map();
        
        filteredEmployees.forEach(emp => {
          if (!emp.department) return;
          
          if (!deptMap.has(emp.department)) {
            deptMap.set(emp.department, {
              id: emp.department.toLowerCase().replace(/\s/g, '-'),
              name: emp.department,
              lead: null,
              members: 0,
              projects: 0,
              velocity: 0,
              satisfaction: 0,
              employees: []
            });
          }
          
          const dept = deptMap.get(emp.department);
          dept.employees.push(emp);
          dept.members++;
          
          if (emp.role === 'Team Lead' || emp.role === 'Lead') {
            dept.lead = emp.name;
          }
        });
        
        // Calculate department metrics
        const teamsList = Array.from(deptMap.values()).map(dept => ({
          ...dept,
          projects: Math.floor(Math.random() * 10) + 2,
          velocity: Math.floor(Math.random() * 30) + 60,
          satisfaction: Math.floor(Math.random() * 25) + 70
        }));
        
        setTeams(teamsList);
      }
      
      if (activeTab === 'members') {
        // Filter members based on search and department
        let filteredMembers = [...filteredEmployees];
        
        if (selectedDepartment !== 'All') {
          filteredMembers = filteredMembers.filter(member => normalizeDepartment(member.department) === selectedDepartment);
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredMembers = filteredMembers.filter(m => 
            m.name?.toLowerCase().includes(query) ||
            m.department?.toLowerCase().includes(query) ||
            m.role?.toLowerCase().includes(query) ||
            m.email?.toLowerCase().includes(query)
          );
        }
        
        // Enhance member data with additional info
        const enhancedMembers = filteredMembers.map(member => ({
          ...member,
          tasks: Math.floor(Math.random() * 25) + 5,
          avatar: member.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
        }));
        
        setMembers(enhancedMembers);
      }
      
      if (activeTab === 'roles') {
        // Roles from employee data across the company
        const roleMap = new Map();
        
        filteredEmployees.forEach(emp => {
          if (!roleMap.has(emp.role)) {
            roleMap.set(emp.role, {
              id: emp.role.toLowerCase().replace(/\s/g, '-'),
              name: emp.role,
              level: getRoleLevel(emp.role),
              members: 0,
              permissions: getRolePermissions(emp.role),
              description: getRoleDescription(emp.role)
            });
          }
          roleMap.get(emp.role).members++;
        });
        
        setRoles(Array.from(roleMap.values()));
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please refresh the page.');
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    const user = authService.getCurrentUser();
    const managerDepartment = user?.department || 'Core Systems';
    
    if (activeTab === 'teams') {
      const mockTeams = [
        {
          id: managerDepartment.toLowerCase().replace(/\s/g, '-'),
          name: managerDepartment,
          lead: 'Mike Johnson',
          members: 8,
          projects: 5,
          velocity: 78,
          satisfaction: 85,
          employees: []
        }
      ];
      setTeams(mockTeams);
    }
    
    if (activeTab === 'members') {
      const mockMembers = [
        { id: 1, name: 'Ravi Das', email: 'ravi.das@spaceborn.com', department: managerDepartment, role: 'Member', designation: 'Frontend Developer', status: 'Active', joinDate: '2024-01-05', phone: '+91 98765 43213', tasks: 24, avatar: 'RD' },
        { id: 2, name: 'Nisha Kumar', email: 'nisha.kumar@spaceborn.com', department: managerDepartment, role: 'Member', designation: 'Backend Developer', status: 'Active', joinDate: '2023-08-12', phone: '+91 98765 43214', tasks: 18, avatar: 'NK' },
        { id: 3, name: 'Priya Sharma', email: 'priya.sharma@spaceborn.com', department: managerDepartment, role: 'Lead', designation: 'Senior Engineer', status: 'Active', joinDate: '2023-01-15', phone: '+91 98765 43210', tasks: 32, avatar: 'PS' },
        { id: 4, name: 'Suresh M', email: 'suresh.m@spaceborn.com', department: managerDepartment, role: 'Member', designation: 'Database Engineer', status: 'Active', joinDate: '2023-11-20', phone: '+91 98765 43215', tasks: 15, avatar: 'SM' },
        { id: 5, name: 'Alex Chen', email: 'alex.chen@spaceborn.com', department: managerDepartment, role: 'Member', designation: 'QA Engineer', status: 'Active', joinDate: '2023-03-10', phone: '+91 98765 43212', tasks: 20, avatar: 'AC' }
      ];
      
      let filtered = mockMembers;
      if (searchQuery) {
        filtered = mockMembers.filter(m => 
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.designation.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setMembers(filtered);
    }
    
    if (activeTab === 'roles') {
      const mockRoles = [
        { id: 'lead', name: 'Lead', level: 3, members: 1, permissions: 'Team Access, Sprint Management, Task Assignment' },
        { id: 'member', name: 'Member', level: 2, members: 4, permissions: 'Task Management, Profile View, Reports View' }
      ];
      setRoles(mockRoles);
    }
  };

  const getRoleLevel = (role) => {
    const levels = {
      'CEO': 5,
      'Manager': 4,
      'Team Lead': 3,
      'Lead': 3,
      'Member': 2,
      'Developer': 2
    };
    return levels[role] || 2;
  };

  const getRolePermissions = (role) => {
    const permissions = {
      'CEO': 'Full Access, Strategic Decisions, Financial View, All Approvals',
      'Manager': 'Company Access, Resource Allocation, Approvals, Reports',
      'Team Lead': 'Team Access, Sprint Management, Task Assignment, Reviews',
      'Lead': 'Team Access, Sprint Management, Task Assignment',
      'Member': 'Task Management, Profile View, Reports View',
      'Developer': 'Task Management, Code Review, Sprint View'
    };
    return permissions[role] || 'Basic Access';
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      'CEO': 'Full company control and strategic decision making',
      'Manager': 'Department management and resource allocation',
      'Team Lead': 'Team leadership and sprint management',
      'Lead': 'Team leadership and task coordination',
      'Member': 'Individual contributor with task management',
      'Developer': 'Development tasks and code contributions'
    };
    return descriptions[role] || 'Standard role with basic permissions';
  };

  const fetchMemberDetails = (member) => {
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const handleTerminate = (member) => {
    setMemberToTerminate(member);
    setShowTerminateConfirm(true);
  };

  const confirmTerminate = async () => {
    try {
      await employeeService.updateEmployee(memberToTerminate.id, { 
        ...memberToTerminate, 
        status: 'Terminated' 
      });
      
      await fetchAllData();
      setShowTerminateConfirm(false);
      setMemberToTerminate(null);
      alert(`${memberToTerminate.name} has been terminated.`);
    } catch (error) {
      console.error('Error terminating employee:', error);
      alert('Failed to terminate employee. Please try again.');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    try {
      const user = authService.getCurrentUser();
      const newMember = {
        ...newMemberData,
        department: user?.department,
        status: 'Active',
        role: newMemberData.role,
        joinDate: newMemberData.joinDate || new Date().toISOString().split('T')[0]
      };
      
      const result = await employeeService.addEmployee(newMember);
      
      if (result) {
        await fetchAllData();
        setShowAddMemberModal(false);
        setNewMemberData({
          name: '',
          email: '',
          designation: '',
          role: 'Member',
          phone: '',
          joinDate: ''
        });
        alert('Team member added successfully!');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add team member');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      'CEO': 'bg-purple-100 text-purple-700',
      'Manager': 'bg-blue-100 text-blue-700',
      'Team Lead': 'bg-green-100 text-green-700',
      'Lead': 'bg-green-100 text-green-700',
      'Member': 'bg-gray-100 text-gray-700',
      'Developer': 'bg-cyan-100 text-cyan-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const managerDepartment = 'all departments';

  if (isLoading && (activeTab === 'teams' ? teams.length === 0 : activeTab === 'members' ? members.length === 0 : roles.length === 0)) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <p className="text-gray-500 mt-1">Manage team members, departments, and access roles across the company</p>
        <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs">
          Manager View - All departments
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Departments</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{teams.length}</div>
          <div className="text-xs text-gray-400 mt-1">{managerDepartment}</div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">Team Members</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{members.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-500">Roles Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{roles.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('teams')} 
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'teams' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Department ({teams.length})
          </button>
          <button 
            onClick={() => setActiveTab('members')} 
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Team Members ({members.length})
          </button>
          <button 
            onClick={() => setActiveTab('roles')} 
            className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'roles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Roles & Permissions ({roles.length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {(activeTab === 'teams' || activeTab === 'members') && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder={`Search by name or ${activeTab === 'teams' ? 'department' : 'member'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            {activeTab === 'members' && (
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <button 
              onClick={() => setShowAddMemberModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Member
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchAllData} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
        </div>
      )}

      {/* Department Table */}
      {!error && activeTab === 'teams' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Velocity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Satisfaction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teams.map(team => (
                  <tr key={team.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{team.name}</td>
                    <td className="px-6 py-4 text-gray-600">{team.lead || 'Not Assigned'}</td>
                    <td className="px-6 py-4 text-gray-600">{team.members}</td>
                    <td className="px-6 py-4 text-gray-600">{team.projects}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{team.velocity}%</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${team.velocity}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{team.satisfaction}%</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${team.satisfaction}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setSelectedDepartment(team.name);
                          setActiveTab('members');
                        }}
                        className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {teams.length === 0 && (
            <div className="p-8 text-center text-gray-500">No department data available</div>
          )}
        </div>
      )}

      {/* Team Members Table */}
      {!error && activeTab === 'members' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-3 border-b bg-gray-50">
            <span className="text-sm text-gray-500">{members.length} TEAM MEMBERS</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(member.role)}`}>
                        {member.role === 'Team Lead' ? 'Lead' : member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.designation || member.role}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{member.status || 'Active'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => fetchMemberDetails(member)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View
                        </button>
                        {member.role !== 'Manager' && member.role !== 'CEO' && (
                          <button 
                            onClick={() => handleTerminate(member)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Terminate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {members.length === 0 && (
            <div className="p-8 text-center text-gray-500">No team members found</div>
          )}
          <div className="px-6 py-3 border-t bg-gray-50 text-right">
            <p className="text-xs text-gray-400">Terminations available for misconduct or performance issues</p>
          </div>
        </div>
      )}

      {/* Roles Table */}
      {!error && activeTab === 'roles' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roles.map(role => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{role.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Level {role.level}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{role.members}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">{role.permissions}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 text-sm hover:text-blue-800">View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {roles.length === 0 && (
            <div className="p-8 text-center text-gray-500">No roles found</div>
          )}
        </div>
      )}

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMemberModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedMember.name}</h2>
              <button onClick={() => setShowMemberModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {selectedMember.avatar}
              </div>
              <div>
                <p className="text-gray-600">{selectedMember.designation || selectedMember.role}</p>
                <p className="text-gray-500 text-sm">{selectedMember.department}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm text-gray-900">{selectedMember.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Tasks Completed</span>
                <span className="text-sm font-semibold text-green-600">{selectedMember.tasks || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Phone</span>
                <span className="text-sm text-gray-900">{selectedMember.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Join Date</span>
                <span className="text-sm text-gray-900">{selectedMember.joinDate ? new Date(selectedMember.joinDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <button onClick={() => setShowMemberModal(false)} className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setShowAddMemberModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full mx-4 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
                <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Member will be added to your profile department</p>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newMemberData.name}
                  onChange={(e) => setNewMemberData({...newMemberData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newMemberData.email}
                  onChange={(e) => setNewMemberData({...newMemberData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="email@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={newMemberData.designation}
                  onChange={(e) => setNewMemberData({...newMemberData, designation: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., Senior Developer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  required
                  value={newMemberData.role}
                  onChange={(e) => setNewMemberData({...newMemberData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Member">Member</option>
                  <option value="Lead">Team Lead</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newMemberData.phone}
                  onChange={(e) => setNewMemberData({...newMemberData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <input
                  type="date"
                  value={newMemberData.joinDate}
                  onChange={(e) => setNewMemberData({...newMemberData, joinDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddMemberModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Termination Confirmation Modal */}
      {showTerminateConfirm && memberToTerminate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Termination</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to terminate <span className="font-semibold">{memberToTerminate.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowTerminateConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmTerminate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsAndRoles;
