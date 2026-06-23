import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ManagerSidebar from '../components/Layout/ManagerSidebar';
import ManagerHeader from '../components/Layout/ManagerHeader';
import ManagerDashboard from '../components/Dashboard/Manager/ManagerDashboard';
import ManagerTeamPerformance from '../components/Dashboard/Manager/TeamPerformance';
import ManagerResourceAllocation from '../components/Dashboard/Manager/ResourceAllocation';
import ManagerApprovalWorkflow from '../components/Dashboard/Manager/ApprovalWorkflow';
import ManagerProjects from '../components/Dashboard/Manager/Projects';
import ManagerTeamMembers from '../components/Dashboard/Manager/TeamMembers';
import EmployeeManagement from '../components/Dashboard/Manager/EmployeeManagement';
import LeaveManagement from '../components/Common/LeaveManagement';
import authService from '../services/authService';
import { API_BASE_URL } from '../utils/constants';

const ManagerDashboardPage = ({ user: propUser }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [user, setUser] = useState(propUser || null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      // Get user if not provided as prop
      let currentUser = propUser;
      if (!currentUser) {
        currentUser = authService.getCurrentUser();
      }
      
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      // Verify manager access from backend
      const hasAccess = await verifyManagerAccess(currentUser);
      if (!hasAccess) {
        navigate('/unauthorized');
        return;
      }
      
      setUser(currentUser);
      setDepartment(currentUser.department);
      
      // Load menu items from backend
      await loadMenuItems(currentUser);
      
      // Load user's last active menu from localStorage
      const savedMenu = localStorage.getItem('manager_last_active_menu');
      if (savedMenu && isValidMenu(savedMenu)) {
        setActiveMenu(savedMenu);
      }
      
      setIsLoading(false);
    };
    
    init();
  }, [propUser, navigate]);

  const verifyManagerAccess = async (currentUser) => {
    // If already has manager role, quick check
    if (currentUser.role === 'Manager' || currentUser.role === 'COO') {
      return true;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/has-role/Manager`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.hasAccess;
      }
    } catch (error) {
      console.log('Backend not available, using local role check');
    }
    
    // Fallback to local check
    return currentUser.role === 'Manager' || currentUser.role === 'COO';
  };

  const loadMenuItems = async (currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/manager`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const items = await response.json();
        setMenuItems(items);
      } else {
        setDefaultMenuItems();
      }
    } catch (error) {
      console.log('Backend not available, using default menu');
      setDefaultMenuItems();
    }
  };

  const setDefaultMenuItems = () => {
    // Fallback defaults - can be customized based on user permissions
    setMenuItems([
      { id: 'Dashboard', label: 'Dashboard', icon: '📊', enabled: true },
      { id: 'TeamPerformance', label: 'Team Performance', icon: '📈', enabled: true },
      { id: 'ResourceAllocation', label: 'Resource Allocation', icon: '💎', enabled: true },
      { id: 'Approvals', label: 'Approvals', icon: '✓', enabled: true },
      { id: 'Projects', label: 'Projects', icon: '📁', enabled: true },
      { id: 'TeamMembers', label: 'Team Members', icon: '👥', enabled: true },
      { id: 'EmployeeManagement', label: 'Employee Database', icon: '📋', enabled: true },
      { id: 'LeaveManagement', label: 'Leave Management', icon: '📅', enabled: true }
    ]);
  };

  const isValidMenu = (menu) => {
    const validMenus = [
      'Dashboard', 'TeamPerformance', 'ResourceAllocation', 'Approvals',
      'Projects', 'TeamMembers', 'EmployeeManagement', 'LeaveManagement'
    ];
    return validMenus.includes(menu);
  };

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    localStorage.setItem('manager_last_active_menu', menu);
  };

  const renderContent = () => {
    const commonProps = {
      userRole: 'Manager',
      user: user,
      userDepartment: department,
      department: department
    };

    switch(activeMenu) {
      case 'Dashboard':
        return <ManagerDashboard {...commonProps} />;
      
      case 'TeamPerformance':
        return <ManagerTeamPerformance {...commonProps} />;
      
      case 'ResourceAllocation':
        return <ManagerResourceAllocation {...commonProps} />;
      
      case 'Approvals':
        return <ManagerApprovalWorkflow {...commonProps} />;
      
      case 'Projects':
        return <ManagerProjects {...commonProps} />;
      
      case 'TeamMembers':
        return <ManagerTeamMembers {...commonProps} />;
      
      case 'EmployeeManagement':
        return <EmployeeManagement 
          userRole="Manager"
          userDepartment={department}
          employees={[]}
          canEdit={true}
          canDelete={false}
          canAdd={true}
        />;
      
      case 'LeaveManagement':
        return <LeaveManagement 
          user={user}
          userRole="Manager"
          userDepartment={department}
        />;
      
      default:
        return <ManagerDashboard {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-black text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ManagerSidebar 
        activeMenu={activeMenu} 
        setActiveMenu={handleMenuChange}
        userRole="Manager"
        userName={user?.name}
        department={department}
        menuItems={menuItems}
      />
      <div className="flex-1 ml-64">
        <ManagerHeader 
          activeMenu={activeMenu} 
          user={user}
          onLogout={() => {
            authService.logout();
            navigate('/login');
          }}
        />
        <main className="p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboardPage;
