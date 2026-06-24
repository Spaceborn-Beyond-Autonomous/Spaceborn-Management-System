// src/App.js
import React, { useState, useEffect } from 'react';
import ShiftTimer from './components/Common/ShiftTimer';
import LoginSystem from './components/Login/LoginSystem';
import LogoutButton from './components/Login/LogoutButton';
import SessionManager from './components/Login/SessionManager';
import ProtectedRoute from './components/Login/ProtectedRoute';
import authService from './services/authService';
import employeeService from './services/employeeService';
import { normalizeDepartmentFields } from './utils/departments';

// Common Components
import DailyWorkReport from './components/Common/DailyWorkReport';
import LeaveManagement from './components/Common/LeaveManagement';

// CEO Imports
import CEODashboard from './components/Dashboard/CEO/CEODashboard';
import TaskManagement from './components/Dashboard/CEO/TaskManagement';
import Projects from './components/Dashboard/CEO/Projects';
import TeamsAndRoles from './components/Dashboard/CEO/TeamsAndRoles';
import Accounts from './components/Dashboard/CEO/Accounts';
import Meetings from './components/Dashboard/CEO/Meetings';
import AIInsights from './components/Dashboard/CEO/AIInsights';
import Notifications from './components/Dashboard/CEO/Notifications.jsx';
import ActivityMonitor from './components/Dashboard/CEO/ActivityMonitor';
import ResourceAllocation from './components/Dashboard/CEO/ResourceAllocation';
import AttendanceView from './components/Dashboard/CEO/AttendanceView';
import CEOTeamReports from './components/Dashboard/CEO/TeamReports';
import AutomationDashboard from './components/Dashboard/CEO/AutomationDashboard';

// Manager Imports
import ManagerDashboard from './components/Dashboard/Manager/ManagerDashboard';
import ManagerTaskManagement from './components/Dashboard/Manager/TaskManagement.jsx';
import ManagerProjects from './components/Dashboard/Manager/Projects';
import ManagerTeamsAndRoles from './components/Dashboard/Manager/TeamsAndRoles';
import ManagerAccounts from './components/Dashboard/Manager/Accounts';
import ManagerMeetings from './components/Dashboard/Manager/Meetings';
import ManagerAIInsights from './components/Dashboard/Manager/AIInsights';
import ManagerNotifications from './components/Dashboard/Manager/Notifications.jsx';
import ManagerActivityMonitor from './components/Dashboard/Manager/ActivityMonitor';
import EmployeeManagement from './components/Dashboard/Manager/EmployeeManagement';
import ManagerTeamReports from './components/Dashboard/Manager/TeamReports';
import ManagerAttendanceView from './components/Dashboard/Manager/AttendanceView';
import ManagerAutomationDashboard from './components/Dashboard/Manager/AutomationDashboard';
import PasswordResetRequests from './components/Dashboard/Manager/PasswordResetRequests';

// COO Imports
import COODashboard from './components/Dashboard/COO/COODashboard';
import COOTaskManagement from './components/Dashboard/COO/TaskManagement.jsx';
import COOProjects from './components/Dashboard/COO/Projects';
import COOTeamsAndRoles from './components/Dashboard/COO/TeamsAndRoles';
import COOResourceAllocation from './components/Dashboard/COO/ResourceAllocation';
import COOAccounts from './components/Dashboard/COO/Accounts';
import COOMeetings from './components/Dashboard/COO/Meetings';
import COOAIInsights from './components/Dashboard/COO/AIInsights';
import COONotifications from './components/Dashboard/COO/Notifications.jsx';
import COOActivityMonitor from './components/Dashboard/COO/ActivityMonitor';
import COOEmployeeManagement from './components/Dashboard/COO/EmployeeManagement';
import COOTeamReports from './components/Dashboard/COO/TeamReports';
import COOAttendanceView from './components/Dashboard/COO/AttendanceView';
import COOAutomationDashboard from './components/Dashboard/COO/AutomationDashboard';
import COOPasswordResetRequests from './components/Dashboard/COO/PasswordResetRequests';

// Team Lead Imports
import TeamLeadDashboard from './components/Dashboard/TeamLead/TeamLeadDashboard';
import TeamLeadTaskManagement from './components/Dashboard/TeamLead/TaskManagement.jsx';
import TeamLeadTeamsAndRoles from './components/Dashboard/TeamLead/TeamsAndRoles';

import TeamLeadResources from './components/Dashboard/TeamLead/Resources';
import TeamLeadMeetings from './components/Dashboard/TeamLead/Meetings';
import TeamLeadNotifications from './components/Dashboard/TeamLead/Notifications.jsx';
import MVPRoadmap from './components/Dashboard/TeamLead/MVPRoadmap';

// Member Imports
import MemberDashboard from './components/Dashboard/Member/MemberDashboard';
import MemberTaskManagement from './components/Dashboard/Member/TaskManagement';
import MemberResources from './components/Dashboard/Member/Resources';
import MemberMeetings from './components/Dashboard/Member/Meetings';
import MemberNotifications from './components/Dashboard/Member/Notifications.jsx';
import MemberProfileView from './components/Dashboard/Member/MemberProfileView';

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [completedActions, setCompletedActions] = useState([]);
  const [managerActiveMenu, setManagerActiveMenu] = useState('Dashboard');
  const [teamLeadActiveMenu, setTeamLeadActiveMenu] = useState('Dashboard');
  const [memberActiveMenu, setMemberActiveMenu] = useState('Dashboard');
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [pendingResetCount, setPendingResetCount] = useState(0);

  // Fetch employees using employeeService
  const fetchEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([
        { id: 1, name: 'John Doe', role: 'CEO', department: 'Platform and DevOps', email: 'john.doe@spaceborn.com', employeeId: 'CEO001', phone: '+1 (555) 000-0001', joinDate: '2020-01-15', status: 'Active', manager: 'N/A' },
        { id: 2, name: 'Jane Smith', role: 'Manager', department: 'Platform and DevOps', email: 'jane.smith@spaceborn.com', employeeId: 'MGR001', phone: '+1 (555) 000-0002', joinDate: '2020-03-20', status: 'Active', manager: 'John Doe' },
        { id: 3, name: 'Mike Johnson', role: 'Team Lead', department: 'Core Systems', email: 'mike.johnson@spaceborn.com', employeeId: 'LD001', phone: '+1 (555) 000-0003', joinDate: '2021-02-10', status: 'Active', manager: 'Jane Smith' },
        { id: 4, name: 'Ravi Das', role: 'Member', department: 'Core Systems', email: 'ravi.das@spaceborn.com', employeeId: 'EMP001', phone: '+1 (555) 000-0004', joinDate: '2022-06-01', status: 'Active', manager: 'Mike Johnson' },
        { id: 5, name: 'Priya Sharma', role: 'Member', department: 'Core Systems', email: 'priya.sharma@spaceborn.com', employeeId: 'EMP002', phone: '+1 (555) 000-0005', joinDate: '2022-08-15', status: 'Active', manager: 'Mike Johnson' },
        { id: 6, name: 'Alex Chen', role: 'Member', department: 'Core Systems', email: 'alex.chen@spaceborn.com', employeeId: 'EMP003', phone: '+1 (555) 000-0006', joinDate: '2023-01-10', status: 'Active', manager: 'Mike Johnson' },
        { id: 7, name: 'Sarah Williams', role: 'Team Lead', department: 'Robotics & Simulation', email: 'sarah.williams@spaceborn.com', employeeId: 'LD002', phone: '+1 (555) 000-0007', joinDate: '2021-05-20', status: 'Active', manager: 'Jane Smith' },
        { id: 8, name: 'David Brown', role: 'Member', department: 'Robotics & Simulation', email: 'david.brown@spaceborn.com', employeeId: 'EMP004', phone: '+1 (555) 000-0008', joinDate: '2022-09-01', status: 'Active', manager: 'Sarah Williams' },
        { id: 9, name: 'Emily Davis', role: 'Member', department: 'Robotics & Simulation', email: 'emily.davis@spaceborn.com', employeeId: 'EMP005', phone: '+1 (555) 000-0009', joinDate: '2023-03-15', status: 'Active', manager: 'Sarah Williams' },
        { id: 10, name: 'Anil Mehta', role: 'Team Lead', department: 'Hardware & Integration', email: 'anil.mehta@spaceborn.com', employeeId: 'LD003', phone: '+1 (555) 000-0010', joinDate: '2021-06-10', status: 'Active', manager: 'Jane Smith' },
      ]);
    }
  };

  const getUserDepartment = () => {
    if (!user) return null;
    return user.department || null;
  };

  // Check for existing session on mount - DISABLED for dev mode
  useEffect(() => {
    const checkExistingSession = () => {
      const savedUser = localStorage.getItem('user');
      const session = localStorage.getItem('userSession');
      
      if (savedUser && session) {
        try {
          const userData = normalizeDepartmentFields(JSON.parse(savedUser));
          const sessionData = JSON.parse(session);
          const sessionAge = Date.now() - sessionData.timestamp;
          const SESSION_TIMEOUT = 8 * 60 * 60 * 1000;
          
          if (sessionAge < SESSION_TIMEOUT) {
            console.log('Found existing session for:', userData.name);
            setUser(userData);
            setIsLoggedIn(true);
            fetchEmployees();
          } else {
            localStorage.removeItem('user');
            localStorage.removeItem('userSession');
            localStorage.removeItem('rememberedEmployeeId');
          }
        } catch (error) {
          console.error('Error parsing session:', error);
        }
      }
    };
    
    // COMMENT THIS LINE TO DISABLE AUTO-LOGIN - Forces login page every time
    // checkExistingSession();  // <-- COMMENT THIS FOR DEV MODE (forces login)
  }, []);

  // Fetch pending reset requests count for Manager/COO
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (user?.role === 'Manager' || user?.role === 'COO') {
        try {
          const stats = await authService.getResetRequestStats();
          setPendingResetCount(stats.pending || 0);
        } catch (error) {
          console.error('Error fetching pending count:', error);
        }
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLoginSuccess = async (userData) => {
    console.log('Login success received in App:', userData);
    
    if (!userData || !userData.role) {
      console.error('Invalid user data received:', userData);
      return;
    }
    
    const normalizedUserData = normalizeDepartmentFields(userData);
    localStorage.setItem('user', JSON.stringify(normalizedUserData));
    setUser(normalizedUserData);
    setIsLoggedIn(true);
    setActiveMenu('Dashboard');
    await fetchEmployees();
  };

  const handleLogout = async () => {
    await authService.logout();
    localStorage.removeItem('userSession');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberedEmployeeId');
    
    setUser(null);
    setIsLoggedIn(false);
    setEmployees([]);
    setActiveMenu('Dashboard');
    setManagerActiveMenu('Dashboard');
    setTeamLeadActiveMenu('Dashboard');
    setMemberActiveMenu('Dashboard');
  };

  const handleSessionExpired = () => {
    alert('Your session has expired. Please login again.');
    handleLogout();
  };

  const getFilteredEmployees = () => {
    if (!user) return [];
    
    if (user.role === 'CEO' || user.role === 'Manager' || user.role === 'COO') {
      return employees;
    }
    if (user.role === 'Team Lead' || user.role === 'Co-Head' || user.role === 'CO Head') {
      const userDept = getUserDepartment();
      return employees.filter(emp => emp.department === userDept);
    }
    
    if (user.role === 'Member') {
      return employees.filter(emp => emp.id === user.id || emp.email === user.email);
    }
    
    return [];
  };

  const getAccessLevelText = () => {
    if (!user) return '';
    if (user.role === 'CEO') return 'Full company access — Viewing all employees';
    if (user.role === 'Manager') return 'Full company access — Viewing all employees';
    if (user.role === 'COO') return 'Full company access - Viewing all employees';
    if (user.role === 'Team Lead' || user.role === 'Co-Head' || user.role === 'CO Head') {
      const dept = getUserDepartment();
      return `Department-level access — Viewing ${dept} team (${getFilteredEmployees().length} members)`;
    }
    if (user.role === 'Member') {
      return `Personal access — Viewing and editing your own profile only`;
    }
    return '';
  };

  const handleUpdateEmployee = async (updatedEmployee) => {
    try {
      const result = await employeeService.updateEmployee(updatedEmployee.id, updatedEmployee);
      if (result) {
        setEmployees(prevEmployees => 
          prevEmployees.map(emp => 
            emp.id === updatedEmployee.id ? result : emp
          )
        );
        if (user && user.id === updatedEmployee.id) {
          setUser(result);
        }
      }
      return result;
    } catch (error) {
      console.error('Error updating employee:', error);
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => 
          emp.id === updatedEmployee.id ? updatedEmployee : emp
        )
      );
      if (user && user.id === updatedEmployee.id) {
        setUser(updatedEmployee);
      }
      return updatedEmployee;
    }
  };

  const handleAddEmployee = async (newEmployee) => {
    try {
      const result = await employeeService.addEmployee(newEmployee);
      if (result) {
        setEmployees(prev => [...prev, result]);
      }
      return result;
    } catch (error) {
      console.error('Error adding employee:', error);
      const tempEmployee = { ...newEmployee, id: Date.now() };
      setEmployees(prev => [...prev, tempEmployee]);
      return tempEmployee;
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      return true;
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn || !user) {
    return <LoginSystem onLoginSuccess={handleLoginSuccess} />;
  }

  // ==================== CEO DASHBOARD ====================
  if (user.role === 'CEO') {
    return (
      <ProtectedRoute user={user} requiredRoles={['CEO']}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <ShiftTimer user={user} onLogout={handleLogout} />
          <div className="flex flex-1">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col bottom-0 fixed left-0 top-[73px] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-center">
                <img src={require('./assets/spaceborn-logo.png')} alt="Spaceborn" className="h-16 w-auto object-contain" />
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'CEO' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>CEO</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'COO' || user.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{user.role === 'COO' ? 'COO' : 'Manager'}</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'Team Lead' || user.role === 'Co-Head' || user.role === 'CO Head' ? (user.role === 'Team Lead' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700') : 'bg-gray-100 text-gray-600'}`}>{user.role === 'Co-Head' || user.role === 'CO Head' ? 'CO Head' : 'Lead'}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'Member' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>Member</span>
                </div>
              </div>
              <nav className="flex-1 p-4">
                {/* OVERVIEW Section */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">OVERVIEW</div>
                  <div className="space-y-1">
                    <button onClick={() => setActiveMenu('Dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${activeMenu === 'Dashboard' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      <span className="text-sm font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveMenu('TaskManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'TaskManagement' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <span className="text-sm font-medium">Task Management</span>
                    </button>
                    <button onClick={() => setActiveMenu('Projects')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'Projects' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      <span className="text-sm font-medium">Projects</span>
                    </button>
                  </div>
                </div>

                {/* MANAGEMENT Section */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">MANAGEMENT</div>
                  <div className="space-y-1">
                    <button onClick={() => setActiveMenu('TeamsAndRoles')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'TeamsAndRoles' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      <span className="text-sm font-medium">Teams & Roles</span>
                    </button>
                    <button onClick={() => setActiveMenu('Accounts')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'Accounts' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-sm font-medium">Accounts</span>
                    </button>
                    <button onClick={() => setActiveMenu('EmployeeManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'EmployeeManagement' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-sm font-medium">Employee Database</span>
                    </button>
                  </div>
                </div>

                {/* REPORTS Section */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">REPORTS</div>
                  <div className="space-y-1">
                    <button onClick={() => setActiveMenu('TeamReports')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'TeamReports' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-sm font-medium">Team Reports & MVP Roadmaps</span>
                    </button>
                    <button onClick={() => setActiveMenu('LeaveManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'LeaveManagement' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">Leave Management</span>
                    </button>
                  </div>
                </div>

                {/* AUTOMATION Section */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">AUTOMATION</div>
                  <div className="space-y-1">
                    <button onClick={() => setActiveMenu('Automation')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'Automation' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      <span className="text-sm font-medium">System Automation</span>
                    </button>
                  </div>
                </div>

                {/* RESOURCES Section */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">RESOURCES</div>
                  <div className="space-y-1">
                    <button onClick={() => setActiveMenu('ResourceAllocation')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'ResourceAllocation' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <span className="text-sm font-medium">Resource Allocation</span>
                    </button>
                  </div>
                </div>

                {/* ATTENDANCE Section */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">ATTENDANCE</div>
                  <div className="space-y-1">
                    <button onClick={() => setActiveMenu('Attendance')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'Attendance' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-medium">Attendance</span>
                    </button>
                  </div>
                </div>

                {/* TOOLS Section */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">TOOLS</div>
                  <div className="space-y-1">
                    <button onClick={() => setActiveMenu('Meetings')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'Meetings' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">Meetings</span>
                    </button>
                    <button onClick={() => setActiveMenu('AIInsights')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'AIInsights' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      <span className="text-sm font-medium">AI Insights</span>
                    </button>
                    <button onClick={() => setActiveMenu('Notifications')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'Notifications' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <span className="text-sm font-medium">Notifications</span>
                    </button>
                  </div>
                </div>

                {/* SYSTEM Section */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">SYSTEM</div>
                  <div className="space-y-1">
                    <button onClick={() => setActiveMenu('ActivityMonitor')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${activeMenu === 'ActivityMonitor' ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      <span className="text-sm font-medium">Activity Monitor</span>
                    </button>
                  </div>
                </div>
              </nav>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">CEO</p>
                  </div>
                  <LogoutButton onLogout={handleLogout} />
                </div>
              </div>
            </aside>
            <main className="flex-1 ml-64 overflow-y-auto mt-[73px]">
              <div className="p-8">
                {activeMenu === 'Dashboard' && <CEODashboard user={user} onLogout={handleLogout} />}
                {activeMenu === 'TaskManagement' && <TaskManagement userRole={user.role} />}
                {activeMenu === 'Projects' && <Projects userRole={user.role} />}
                {activeMenu === 'TeamsAndRoles' && <TeamsAndRoles userRole={user.role} />}
                {activeMenu === 'Accounts' && <Accounts userRole={user.role} />}
                {activeMenu === 'EmployeeManagement' && (
                  <EmployeeManagement 
                    employees={getFilteredEmployees()}
                    userRole={user.role}
                    accessLevel={getAccessLevelText()}
                    userDepartment={getUserDepartment()}
                    canEdit={true}
                    canDelete={true}
                    canAdd={true}
                    onUpdateEmployee={handleUpdateEmployee}
                    onAddEmployee={handleAddEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
                  />
                )}
                {activeMenu === 'TeamReports' && <CEOTeamReports userRole={user.role} department={getUserDepartment()} user={user} />}
                {activeMenu === 'LeaveManagement' && (
                  <LeaveManagement 
                    user={user}
                    userRole={user.role}
                    userDepartment={user.department}
                  />
                )}
                {activeMenu === 'Automation' && <AutomationDashboard user={user} userRole={user.role} />}
                {activeMenu === 'ResourceAllocation' && <ResourceAllocation userRole={user.role} />}
                {activeMenu === 'Attendance' && <AttendanceView userRole={user.role} />}
                {activeMenu === 'Meetings' && <Meetings userRole={user.role} />}
                {activeMenu === 'AIInsights' && <AIInsights userRole={user.role} />}
                {activeMenu === 'Notifications' && <Notifications userRole={user.role} />}
                {activeMenu === 'ActivityMonitor' && <ActivityMonitor userRole={user.role} />}
              </div>
            </main>
          </div>
          <SessionManager user={user} onSessionExpired={handleSessionExpired} />
        </div>
      </ProtectedRoute>
    );
  }

  // ==================== MANAGER / COO DASHBOARD ====================
  if (user.role === 'Manager' || user.role === 'COO') {
    const isCOO = user.role === 'COO';
    const managerFeatureRole = 'Manager';
    const managerDisplayRole = user.role;
    const DashboardComponent = isCOO ? COODashboard : ManagerDashboard;
    const TaskManagementComponent = isCOO ? COOTaskManagement : ManagerTaskManagement;
    const ProjectsComponent = isCOO ? COOProjects : ManagerProjects;
    const TeamsAndRolesComponent = isCOO ? COOTeamsAndRoles : ManagerTeamsAndRoles;
    const AccountsComponent = isCOO ? COOAccounts : ManagerAccounts;
    const EmployeeManagementComponent = isCOO ? COOEmployeeManagement : EmployeeManagement;
    const TeamReportsComponent = isCOO ? COOTeamReports : ManagerTeamReports;
    const AutomationDashboardComponent = isCOO ? COOAutomationDashboard : ManagerAutomationDashboard;
    const AttendanceViewComponent = isCOO ? COOAttendanceView : ManagerAttendanceView;
    const MeetingsComponent = isCOO ? COOMeetings : ManagerMeetings;
    const AIInsightsComponent = isCOO ? COOAIInsights : ManagerAIInsights;
    const NotificationsComponent = isCOO ? COONotifications : ManagerNotifications;
    const ActivityMonitorComponent = isCOO ? COOActivityMonitor : ManagerActivityMonitor;
    const PasswordResetRequestsComponent = isCOO ? COOPasswordResetRequests : PasswordResetRequests;

    return (
      <ProtectedRoute user={user} requiredRoles={['Manager', 'COO']}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <ShiftTimer user={user} onLogout={handleLogout} />
          <div className="flex flex-1">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col bottom-0 fixed left-0 top-[73px] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-center">
                <img src={require('./assets/spaceborn-logo.png')} alt="Spaceborn" className="h-16 w-auto object-contain" />
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'CEO' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>CEO</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'COO' || user.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{user.role === 'COO' ? 'COO' : 'Manager'}</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'Team Lead' || user.role === 'Co-Head' || user.role === 'CO Head' ? (user.role === 'Team Lead' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700') : 'bg-gray-100 text-gray-600'}`}>{user.role === 'Co-Head' || user.role === 'CO Head' ? 'CO Head' : 'Lead'}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'Member' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>Member</span>
                </div>
              </div>
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">OVERVIEW</div>
                  <div className="space-y-1">
                    <button onClick={() => setManagerActiveMenu('Dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'Dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      <span className="text-sm font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => setManagerActiveMenu('TaskManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'TaskManagement' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <span className="text-sm font-medium">Task Management</span>
                    </button>
                    <button onClick={() => setManagerActiveMenu('Projects')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'Projects' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      <span className="text-sm font-medium">Projects</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">MANAGEMENT</div>
                  <div className="space-y-1">
                    <button onClick={() => setManagerActiveMenu('TeamsAndRoles')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'TeamsAndRoles' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      <span className="text-sm font-medium">Teams & Roles</span>
                    </button>
                    {isCOO && (
                      <button onClick={() => setManagerActiveMenu('ResourceAllocation')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'ResourceAllocation' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                        <span className="text-sm font-medium">Resource Allocation</span>
                      </button>
                    )}
                    <button onClick={() => setManagerActiveMenu('Accounts')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'Accounts' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-sm font-medium">Accounts</span>
                    </button>
                    <button onClick={() => setManagerActiveMenu('EmployeeManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'EmployeeManagement' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-sm font-medium">Employee Database</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">REPORTS</div>
                  <div className="space-y-1">
                    <button onClick={() => setManagerActiveMenu('TeamReports')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'TeamReports' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-sm font-medium">Team Reports & MVP Roadmaps</span>
                    </button>
                    <button onClick={() => setManagerActiveMenu('LeaveManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'LeaveManagement' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">Leave Management</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">AUTOMATION</div>
                  <div className="space-y-1">
                    <button onClick={() => setManagerActiveMenu('Automation')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'Automation' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      <span className="text-sm font-medium">Team Automation</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">ATTENDANCE</div>
                  <div className="space-y-1">
                    <button onClick={() => setManagerActiveMenu('Attendance')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'Attendance' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-sm font-medium">Attendance</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">TOOLS</div>
                  <div className="space-y-1">
                    <button onClick={() => setManagerActiveMenu('Meetings')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'Meetings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">Meetings</span>
                    </button>
                    <button onClick={() => setManagerActiveMenu('AIInsights')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'AIInsights' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                      <span className="text-sm font-medium">AI Insights</span>
                    </button>
                    <button onClick={() => setManagerActiveMenu('Notifications')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'Notifications' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <span className="text-sm font-medium">Notifications</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">SYSTEM</div>
                  <div className="space-y-1">
                    <button onClick={() => setManagerActiveMenu('ActivityMonitor')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'ActivityMonitor' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      <span className="text-sm font-medium">Activity Monitor</span>
                    </button>
                  </div>
                </div>
                {/* Password Reset Requests Menu */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">SECURITY</div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => setManagerActiveMenu('PasswordResetRequests')} 
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${managerActiveMenu === 'PasswordResetRequests' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span className="text-sm font-medium">Password Reset Requests</span>
                      {pendingResetCount > 0 && (
                        <span className="ml-auto px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">
                          {pendingResetCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </nav>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{managerDisplayRole}</p>
                  </div>
                  <LogoutButton onLogout={handleLogout} />
                </div>
              </div>
            </aside>
            <main className="flex-1 ml-64 overflow-y-auto mt-[73px]">
              <div className="p-8">
                {managerActiveMenu === 'Dashboard' && <DashboardComponent user={user} onLogout={handleLogout} />}
                {managerActiveMenu === 'TaskManagement' && <TaskManagementComponent userRole={managerFeatureRole} />}
                {managerActiveMenu === 'Projects' && <ProjectsComponent userRole={managerFeatureRole} />}
                {managerActiveMenu === 'TeamsAndRoles' && <TeamsAndRolesComponent userRole={managerFeatureRole} />}
                {isCOO && managerActiveMenu === 'ResourceAllocation' && <COOResourceAllocation userRole={managerFeatureRole} />}
                {managerActiveMenu === 'Accounts' && <AccountsComponent userRole={managerDisplayRole} />}
                {managerActiveMenu === 'EmployeeManagement' && (
                  <EmployeeManagementComponent 
                    employees={getFilteredEmployees()}
                    userRole={managerFeatureRole}
                    accessLevel={getAccessLevelText()}
                    userDepartment={getUserDepartment()}
                    canEdit={true}
                    canDelete={true}
                    canAdd={true}
                    onUpdateEmployee={handleUpdateEmployee}
                    onAddEmployee={handleAddEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
                  />
                )}
                {managerActiveMenu === 'TeamReports' && <TeamReportsComponent userRole={managerDisplayRole} department={isCOO ? null : getUserDepartment()} user={user} />}
                {managerActiveMenu === 'LeaveManagement' && (
                  <LeaveManagement 
                    user={user}
                    userRole={managerFeatureRole}
                    userDepartment={user.department}
                  />
                )}
                {managerActiveMenu === 'Automation' && <AutomationDashboardComponent user={user} userRole={managerFeatureRole} />}
                {managerActiveMenu === 'Attendance' && <AttendanceViewComponent userRole={managerFeatureRole} />}
                {managerActiveMenu === 'Meetings' && <MeetingsComponent userRole={managerFeatureRole} />}
                {managerActiveMenu === 'AIInsights' && <AIInsightsComponent userRole={managerFeatureRole} />}
                {managerActiveMenu === 'Notifications' && <NotificationsComponent userRole={managerFeatureRole} />}
                {managerActiveMenu === 'ActivityMonitor' && <ActivityMonitorComponent userRole={managerFeatureRole} />}
                {managerActiveMenu === 'PasswordResetRequests' && <PasswordResetRequestsComponent userRole={managerFeatureRole} />}
              </div>
            </main>
          </div>
          <SessionManager user={user} onSessionExpired={handleSessionExpired} />
        </div>
      </ProtectedRoute>
    );
  }

  // ==================== TEAM LEAD DASHBOARD ====================
  if (user.role === 'Team Lead' || user.role === 'Co-Head' || user.role === 'CO Head') {
    return (
      <ProtectedRoute user={user} requiredRoles={['Team Lead', 'Co-Head', 'CO Head']}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <ShiftTimer user={user} onLogout={handleLogout} />
          <div className="flex flex-1">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col bottom-0 fixed left-0 top-[73px] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-center">
                <img src={require('./assets/spaceborn-logo.png')} alt="Spaceborn" className="h-16 w-auto object-contain" />
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'CEO' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>CEO</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'COO' || user.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{user.role === 'COO' ? 'COO' : 'Manager'}</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'Team Lead' || user.role === 'Co-Head' || user.role === 'CO Head' ? (user.role === 'Team Lead' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700') : 'bg-gray-100 text-gray-600'}`}>{user.role === 'Co-Head' || user.role === 'CO Head' ? 'CO Head' : 'Lead'}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'Member' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>Member</span>
                </div>
              </div>
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">OVERVIEW</div>
                  <div className="space-y-1">
                    <button onClick={() => setTeamLeadActiveMenu('Dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${teamLeadActiveMenu === 'Dashboard' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      <span className="text-sm font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => setTeamLeadActiveMenu('TaskManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${teamLeadActiveMenu === 'TaskManagement' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <span className="text-sm font-medium">Task Management</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">TEAM</div>
                  <div className="space-y-1">
                    <button onClick={() => setTeamLeadActiveMenu('TeamsAndRoles')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${teamLeadActiveMenu === 'TeamsAndRoles' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      <span className="text-sm font-medium">Teams & Roles</span>
                    </button>
                    <button onClick={() => setTeamLeadActiveMenu('Resources')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${teamLeadActiveMenu === 'Resources' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <span className="text-sm font-medium">Resources</span>
                    </button>
                    <button onClick={() => setTeamLeadActiveMenu('MVPRoadmap')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${teamLeadActiveMenu === 'MVPRoadmap' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      <span className="text-sm font-medium">MVP Roadmap</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">TOOLS</div>
                  <div className="space-y-1">
                    <button onClick={() => setTeamLeadActiveMenu('Meetings')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${teamLeadActiveMenu === 'Meetings' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">Meetings</span>
                    </button>
                    <button onClick={() => setTeamLeadActiveMenu('Notifications')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${teamLeadActiveMenu === 'Notifications' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <span className="text-sm font-medium">Notifications</span>
                    </button>
                    <button onClick={() => setTeamLeadActiveMenu('LeaveManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${teamLeadActiveMenu === 'LeaveManagement' ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">Leave & Breaks</span>
                    </button>
                  </div>
                </div>
              </nav>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role} · {getUserDepartment()}</p>
                  </div>
                  <LogoutButton onLogout={handleLogout} />
                </div>
              </div>
            </aside>
            <main className="flex-1 ml-64 overflow-y-auto mt-[73px]">
              <div className="p-8">
                {teamLeadActiveMenu === 'Dashboard' && <TeamLeadDashboard user={user} onLogout={handleLogout} />}
                {teamLeadActiveMenu === 'TaskManagement' && <TeamLeadTaskManagement userRole={user.role} />}
                {teamLeadActiveMenu === 'TeamsAndRoles' && <TeamLeadTeamsAndRoles userRole={user.role} />}
                {teamLeadActiveMenu === 'Resources' && <TeamLeadResources userRole={user.role} />}
                {teamLeadActiveMenu === 'MVPRoadmap' && <MVPRoadmap userRole={user.role} />}
                {teamLeadActiveMenu === 'Meetings' && <TeamLeadMeetings userRole={user.role} />}
                {teamLeadActiveMenu === 'Notifications' && <TeamLeadNotifications userRole={user.role} />}
                {teamLeadActiveMenu === 'LeaveManagement' && (
                  <LeaveManagement 
                    user={user}
                    userRole={user.role}
                    userDepartment={user.department}
                  />
                )}
              </div>
            </main>
          </div>
          <SessionManager user={user} onSessionExpired={handleSessionExpired} />
        </div>
      </ProtectedRoute>
    );
  }

  // ==================== MEMBER DASHBOARD ====================
  if (user.role === 'Member') {
    const memberData = user;
    
    return (
      <ProtectedRoute user={user} requiredRoles={['Member']}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <ShiftTimer user={user} onLogout={handleLogout} />
          <div className="flex flex-1">
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col bottom-0 fixed left-0 top-[73px] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-center">
                <img src={require('./assets/spaceborn-logo.png')} alt="Spaceborn" className="h-16 w-auto object-contain" />
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'CEO' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>CEO</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'COO' || user.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{user.role === 'COO' ? 'COO' : 'Manager'}</span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'Team Lead' || user.role === 'Co-Head' || user.role === 'CO Head' ? (user.role === 'Team Lead' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700') : 'bg-gray-100 text-gray-600'}`}>{user.role === 'Co-Head' || user.role === 'CO Head' ? 'CO Head' : 'Lead'}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${user.role === 'Member' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>Member</span>
                </div>
              </div>
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">OVERVIEW</div>
                  <div className="space-y-1">
                    <button onClick={() => setMemberActiveMenu('Dashboard')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${memberActiveMenu === 'Dashboard' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                      <span className="text-sm font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => setMemberActiveMenu('MyProfile')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${memberActiveMenu === 'MyProfile' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-sm font-medium">My Profile</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">REPORTS</div>
                  <div className="space-y-1">
                    <button onClick={() => setMemberActiveMenu('DailyReport')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${memberActiveMenu === 'DailyReport' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-sm font-medium">Daily Report</span>
                    </button>
                    <button onClick={() => setMemberActiveMenu('Leave')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${memberActiveMenu === 'Leave' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">Leave</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">TASKS</div>
                  <div className="space-y-1">
                    <button onClick={() => setMemberActiveMenu('TaskManagement')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${memberActiveMenu === 'TaskManagement' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      <span className="text-sm font-medium">My Tasks</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">RESOURCES</div>
                  <div className="space-y-1">
                    <button onClick={() => setMemberActiveMenu('Resources')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${memberActiveMenu === 'Resources' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <span className="text-sm font-medium">Resources</span>
                    </button>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">TOOLS</div>
                  <div className="space-y-1">
                    <button onClick={() => setMemberActiveMenu('Meetings')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${memberActiveMenu === 'Meetings' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm font-medium">Meetings</span>
                    </button>
                    <button onClick={() => setMemberActiveMenu('Notifications')} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg ${memberActiveMenu === 'Notifications' ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <span className="text-sm font-medium">Notifications</span>
                    </button>
                  </div>
                </div>
              </nav>
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role} · {user.department}</p>
                  </div>
                  <LogoutButton onLogout={handleLogout} />
                </div>
              </div>
            </aside>
            <main className="flex-1 ml-64 overflow-y-auto mt-[73px]">
              <div className="p-8">
                {memberActiveMenu === 'Dashboard' && <MemberDashboard user={user} onLogout={handleLogout} />}
                {memberActiveMenu === 'MyProfile' && memberData && (
                  <MemberProfileView 
                    userData={memberData}
                    onUpdate={handleUpdateEmployee}
                  />
                )}
                {memberActiveMenu === 'DailyReport' && (
                  <DailyWorkReport 
                    user={user}
                    onReportSubmitted={() => console.log('Report submitted')}
                  />
                )}
                {memberActiveMenu === 'Leave' && (
                  <LeaveManagement 
                    user={user}
                    userRole={user.role}
                    userDepartment={user.department}
                  />
                )}
                {memberActiveMenu === 'TaskManagement' && <MemberTaskManagement userRole={user.role} />}
                {memberActiveMenu === 'Resources' && <MemberResources userRole={user.role} />}
                {memberActiveMenu === 'Meetings' && <MemberMeetings userRole={user.role} />}
                {memberActiveMenu === 'Notifications' && <MemberNotifications userRole={user.role} />}
              </div>
            </main>
          </div>
          <SessionManager user={user} onSessionExpired={handleSessionExpired} />
        </div>
      </ProtectedRoute>
    );
  }

  return null;
}

export default App;
