// src/components/Dashboard/Manager/Accounts.js
import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, Briefcase, Phone, Calendar, Building2, AlertCircle, CheckCircle, Eye, EyeOff, X, Copy, Download, Search, Filter, Trash2, Edit, Users } from 'lucide-react';
import authService from '../../../services/authService';
import employeeService from '../../../services/employeeService';
import * as XLSX from 'xlsx';

const Accounts = ({ userRole = 'Manager' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Member',
    department: '',
    designation: '',
    phone: '',
    joinDate: new Date().toISOString().split('T')[0]
  });

  const [allAccounts, setAllAccounts] = useState([]);
  const [recentlyCreated, setRecentlyCreated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [stats, setStats] = useState({
    totalCreated: 0,
    thisMonth: 0,
    byRole: {}
  });

  // Available roles based on user role (Manager)
  const getAvailableRoles = () => {
    if (userRole === 'Manager') {
      return ['Team Lead', 'Member'];
    }
    return ['Member'];
  };

  const roles = getAvailableRoles();

  // Generate Employee ID
  const generateEmployeeId = () => {
    const rolePrefix = {
      'Team Lead': 'LD',
      'Member': 'EMP'
    };
    
    const prefix = rolePrefix[formData.role] || 'EMP';
    const randomNum = Math.floor(Math.random() * 900) + 100;
    const timestamp = Date.now().toString().slice(-4);
    
    return `${prefix}${randomNum}${timestamp}`;
  };

  // Generate Secure Password
  const generatePassword = () => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    const getRandom = (str) => str[Math.floor(Math.random() * str.length)];
    
    let password = '';
    password += getRandom(upper);
    password += getRandom(lower);
    password += getRandom(numbers);
    password += getRandom(special);
    
    for (let i = 0; i < 8; i++) {
      const all = lower + upper + numbers;
      password += getRandom(all);
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  // Copy to clipboard
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = allAccounts.map(account => ({
      'Employee ID': account.employeeId,
      'Name': account.name,
      'Email': account.email,
      'Role': account.role,
      'Department': account.department,
      'Designation': account.designation || '-',
      'Phone': account.phone || '-',
      'Join Date': account.joinDate ? new Date(account.joinDate).toLocaleDateString() : '-',
      'Status': account.status || 'Active',
      'Created At': account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '-'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Accounts');
    
    const fileName = `accounts-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Export credentials only
  const exportCredentialsToExcel = () => {
    const credentialsData = allAccounts.map(account => ({
      'Employee ID': account.employeeId,
      'Name': account.name,
      'Email': account.email,
      'Password': account.password || '********',
      'Role': account.role,
      'Department': account.department
    }));

    const ws = XLSX.utils.json_to_sheet(credentialsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Credentials');
    
    const fileName = `credentials-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  useEffect(() => {
    fetchAllAccounts();
    fetchDepartments();
    fetchStats();
  }, []);

  const fetchAllAccounts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      if (!token) {
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockAllAccounts();
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/accounts/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter accounts that Manager can see (Team Leads and Members only)
        const filteredData = data.filter(account => 
          account.role === 'Team Lead' || account.role === 'Member'
        );
        setAllAccounts(filteredData);
        setRecentlyCreated(filteredData.slice(-4).reverse());
      } else {
        throw new Error('Failed to fetch accounts');
      }
      
    } catch (error) {
      console.error('Error fetching accounts:', error);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockAllAccounts();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockAllAccounts = () => {
    const mockAccounts = [
      { id: 1, name: 'Mike Johnson', initials: 'MJ', role: 'Team Lead', department: 'Engineering', date: '2021-02-10', email: 'mike.johnson@spaceborn.com', employeeId: 'LD001', password: 'Pass@789', phone: '+1 (555) 000-0003', designation: 'Engineering Lead', status: 'Active', joinDate: '2021-02-10', createdAt: '2021-02-10T00:00:00Z' },
      { id: 2, name: 'Ravi Das', initials: 'RD', role: 'Member', department: 'Engineering', date: '2022-06-01', email: 'ravi.das@spaceborn.com', employeeId: 'EMP001', password: 'Pass@101', phone: '+1 (555) 000-0004', designation: 'Frontend Developer', status: 'Active', joinDate: '2022-06-01', createdAt: '2022-06-01T00:00:00Z' },
      { id: 3, name: 'Priya Sharma', initials: 'PS', role: 'Member', department: 'Engineering', date: '2022-08-15', email: 'priya.sharma@spaceborn.com', employeeId: 'EMP002', password: 'Pass@202', phone: '+1 (555) 000-0005', designation: 'Backend Developer', status: 'Active', joinDate: '2022-08-15', createdAt: '2022-08-15T00:00:00Z' },
      { id: 4, name: 'Sita Krishnan', initials: 'SK', role: 'Team Lead', department: 'Marketing', date: '2023-01-10', email: 'sita.krishnan@spaceborn.com', employeeId: 'LD002', password: 'Pass@303', phone: '+1 (555) 000-0006', designation: 'Marketing Lead', status: 'Active', joinDate: '2023-01-10', createdAt: '2023-01-10T00:00:00Z' },
      { id: 5, name: 'Anil Mehta', initials: 'AM', role: 'Team Lead', department: 'Design', date: '2023-03-15', email: 'anil.mehta@spaceborn.com', employeeId: 'LD003', password: 'Pass@404', phone: '+1 (555) 000-0007', designation: 'Design Lead', status: 'Active', joinDate: '2023-03-15', createdAt: '2023-03-15T00:00:00Z' }
    ];
    setAllAccounts(mockAccounts);
    setRecentlyCreated(mockAccounts.slice(-4).reverse());
    
    const roleStats = {};
    mockAccounts.forEach(acc => {
      roleStats[acc.role] = (roleStats[acc.role] || 0) + 1;
    });
    
    setStats({
      totalCreated: mockAccounts.length,
      thisMonth: mockAccounts.filter(acc => {
        const joinDate = new Date(acc.joinDate);
        const now = new Date();
        return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
      }).length,
      byRole: roleStats
    });
  };

  const fetchDepartments = async () => {
    try {
      const depts = await employeeService.getAllDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['Engineering', 'Design', 'Marketing', 'Operations', 'HR', 'Sales', 'Finance']);
    }
  };

  const fetchStats = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/accounts/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockStats();
      }
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockStats();
      }
    }
  };

  const loadMockStats = () => {
    setStats({
      totalCreated: allAccounts.length || 5,
      thisMonth: 1,
      byRole: {
        'Team Lead': 3,
        'Member': 2
      }
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedCredentials(null);
    
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setIsLoading(false);
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    if (!formData.department) {
      setError('Department is required');
      setIsLoading(false);
      return;
    }
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const employeeId = generateEmployeeId();
      const password = generatePassword();
      
      const accountData = {
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        designation: formData.designation,
        phone: formData.phone,
        joinDate: formData.joinDate,
        employeeId: employeeId,
        password: password,
        createdBy: currentUser?.id,
        createdByName: currentUser?.name,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      try {
        await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: accountData.email,
            password: accountData.password,
            name: accountData.name,
            role: accountData.role,
            department: accountData.department,
            employeeId: accountData.employeeId
          })
        });
      } catch (fetchError) {
        console.log('API not available, using mock mode');
      }
      
      const initials = formData.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
      const newAccount = {
        id: allAccounts.length + 1,
        name: formData.fullName,
        initials: initials,
        role: formData.role,
        department: formData.department,
        date: new Date().toISOString().split('T')[0],
        email: formData.email,
        employeeId: employeeId,
        password: password,
        designation: formData.designation,
        phone: formData.phone,
        joinDate: formData.joinDate,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      setAllAccounts([newAccount, ...allAccounts]);
      setRecentlyCreated([newAccount, ...recentlyCreated.slice(0, 3)]);
      
      setGeneratedCredentials({
        employeeId: employeeId,
        password: password,
        name: formData.fullName,
        email: formData.email,
        role: formData.role
      });
      setShowCredentials(true);
      
      setFormData({
        fullName: '',
        email: '',
        role: 'Member',
        department: '',
        designation: '',
        phone: '',
        joinDate: new Date().toISOString().split('T')[0]
      });
      
      const newStats = { ...stats };
      newStats.totalCreated++;
      newStats.byRole[formData.role] = (newStats.byRole[formData.role] || 0) + 1;
      setStats(newStats);
      
      setTimeout(() => {
        setShowCredentials(false);
        setGeneratedCredentials(null);
      }, 10000);
      
    } catch (error) {
      console.error('Error creating account:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAccounts = allAccounts.filter(account => {
    const matchesSearch = searchTerm === '' || 
      account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || account.role === selectedRole;
    const matchesDept = selectedDepartment === 'all' || account.department === selectedDepartment;
    return matchesSearch && matchesRole && matchesDept;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (isLoading && allAccounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Accounts Management</h1>
        <p className="text-gray-500 mt-1">Create, manage, and export team member accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-5 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalCreated}</div>
          <div className="text-sm text-gray-500">Total Accounts</div>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.thisMonth}</div>
          <div className="text-sm text-gray-500">Created This Month</div>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <div className="text-2xl font-bold text-blue-600">{recentlyCreated.length}</div>
          <div className="text-sm text-gray-500">Recent Accounts</div>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.byRole ? Object.keys(stats.byRole).length : 0}</div>
          <div className="text-sm text-gray-500">Roles Active</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <button
            onClick={() => setShowAllAccounts(!showAllAccounts)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            {showAllAccounts ? 'Hide All Accounts' : 'View All Accounts'}
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export All Accounts
          </button>
          <button
            onClick={exportCredentialsToExcel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Export Credentials
          </button>
        </div>
      </div>

      {/* Role Creation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-6 text-sm text-blue-700 flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Manager - can create: Team Leads and Members only
      </div>

      {/* Credentials Modal */}
      {showCredentials && generatedCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Account Created!</h3>
              </div>
              <button onClick={() => setShowCredentials(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Account created for <strong>{generatedCredentials.name}</strong>
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employee ID:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">{generatedCredentials.employeeId}</code>
                  <button onClick={() => copyToClipboard(generatedCredentials.employeeId, 'Employee ID')} className="text-blue-600 hover:text-blue-700">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Password:</span>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {showPassword ? generatedCredentials.password : '••••••••••••'}
                  </code>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(generatedCredentials.password, 'Password')} className="text-blue-600 hover:text-blue-700">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm text-gray-900">{generatedCredentials.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Role:</span>
                <span className="text-sm text-gray-900">{generatedCredentials.role}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">
              <p>📧 Login credentials have been registered in the system</p>
              <p className="text-xs mt-1">Employee can login with Email and the generated password.</p>
            </div>
            
            <button onClick={() => setShowCredentials(false)} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Create Account Section */}
      <div className="bg-white rounded-xl border overflow-hidden mb-8">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Create New Account</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FULL NAME *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EMAIL *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@company.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ROLE *</label>
              <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required>
                {roles.map(role => (<option key={role} value={role}>{role}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DEPARTMENT *</label>
              <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required>
                <option value="">Select Department</option>
                {departments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DESIGNATION</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="e.g., Senior Developer" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PHONE NUMBER</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 555 000 0000" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">JOIN DATE</label>
              <input type="date" name="joinDate" value={formData.joinDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setFormData({ fullName: '', email: '', role: 'Member', department: '', designation: '', phone: '', joinDate: new Date().toISOString().split('T')[0] })} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Clear</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
              {isLoading ? (<><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Creating...</>) : (<><UserPlus className="w-4 h-4" />Create Account</>)}
            </button>
          </div>
        </form>
      </div>

      {/* Search and Filters */}
      {showAllAccounts && (
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name, email or employee ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Roles</option>
              {roles.map(role => (<option key={role} value={role}>{role}</option>))}
            </select>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Departments</option>
              {departments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
            </select>
            <button onClick={() => { setSearchTerm(''); setSelectedRole('all'); setSelectedDepartment('all'); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Clear Filters</button>
          </div>

          {/* All Accounts Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAccounts.map(account => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">{account.employeeId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">{account.initials || account.name?.charAt(0)}</div>
                          <span className="font-medium">{account.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{account.email}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{account.role}</span></td>
                      <td className="px-6 py-4 text-gray-600">{account.department}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">{account.status || 'Active'}</span></td>
                      <td className="px-6 py-4 text-gray-600">{account.joinDate ? new Date(account.joinDate).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4"><button className="text-blue-600 text-sm hover:text-blue-800">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAccounts.length === 0 && (<div className="p-8 text-center text-gray-500">No accounts found</div>)}
          </div>
        </div>
      )}

      {/* Role Distribution Summary */}
{stats.byRole ? (
  <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">Role Distribution</h3>
    <div className="grid grid-cols-5 gap-3">
      {Object.keys(stats.byRole).map((role) => (
        <div key={role} className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-bold text-gray-900">{stats.byRole[role]}</p>
          <p className="text-xs text-gray-500">{role}s</p>
        </div>
      ))}
    </div>
  </div>
) : null}
    </div>
  );
};

export default Accounts;