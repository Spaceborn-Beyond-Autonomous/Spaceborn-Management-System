import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberSidebar from '../components/Layout/MemberSidebar';
import MemberHeader from '../components/Layout/MemberHeader';
import MemberDashboard from '../components/Dashboard/Member/MemberDashboard';
import DailyWorkReport from '../components/Common/DailyWorkReport';
import LeaveManagement from '../components/Common/LeaveManagement';
import authService from '../services/authService';
import { API_BASE_URL } from '../utils/constants';

const MemberDashboardPage = ({ user: propUser }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [user, setUser] = useState(propUser || null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
      
      // Verify member access from backend
      const hasAccess = await verifyMemberAccess(currentUser);
      if (!hasAccess) {
        navigate('/unauthorized');
        return;
      }
      
      setUser(currentUser);
      await loadMenuItems(currentUser);
      setIsLoading(false);
    };
    
    init();
  }, [propUser, navigate]);

  const verifyMemberAccess = async (currentUser) => {
    // If already has member role, quick check
    if (currentUser.role === 'Member') {
      return true;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/has-role/Member`, {
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
    return currentUser.role === 'Member';
  };

  const loadMenuItems = async (currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/member`, {
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
    // These are fallback defaults - can be customized based on user permissions
    setMenuItems([
      { id: 'Dashboard', label: 'Dashboard', icon: '📊', enabled: true },
      { id: 'MyProfile', label: 'My Profile', icon: '👤', enabled: true },
      { id: 'DailyReport', label: 'Daily Report', icon: '📝', enabled: true },
      { id: 'Leave', label: 'Leave', icon: '📅', enabled: true },
      { id: 'TaskManagement', label: 'My Tasks', icon: '✅', enabled: true },
      { id: 'Resources', label: 'Resources', icon: '💎', enabled: true },
      { id: 'Meetings', label: 'Meetings', icon: '📅', enabled: true },
      { id: 'Notifications', label: 'Notifications', icon: '🔔', enabled: true }
    ]);
  };

  const renderContent = () => {
    const commonProps = {
      user: user,
      userRole: 'Member',
      userDepartment: user?.department
    };

    switch(activeMenu) {
      case 'Dashboard':
        return <MemberDashboard {...commonProps} />;
      
      case 'MyProfile':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-black px-6 py-4">
                <h2 className="text-xl font-semibold text-white">My Profile</h2>
                <p className="text-gray-400 text-sm">View and edit your personal information</p>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 pb-4 border-b">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-gray-500">{user?.role} · {user?.department}</p>
                    <p className="text-sm text-gray-400">Employee ID: {user?.employeeId}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><p className="text-gray-900">{user?.name}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label><p className="text-gray-900">{user?.email}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><p className="text-gray-900">{user?.phone || 'Not provided'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><p className="text-gray-900">{user?.role}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><p className="text-gray-900">{user?.department}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label><p className="text-gray-900">{user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">{user?.status || 'Active'}</span></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Manager</label><p className="text-gray-900">{user?.manager || 'N/A'}</p></div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'DailyReport':
        return <DailyWorkReport user={user} />;
      
      case 'Leave':
        return <LeaveManagement user={user} userRole={user?.role} userDepartment={user?.department} />;
      
      case 'TaskManagement':
        return <MemberDashboard {...commonProps} activeTab="tasks" />;
      
      case 'Resources':
        return <MemberDashboard {...commonProps} activeTab="resources" />;
      
      case 'Meetings':
        return <MemberDashboard {...commonProps} activeTab="meetings" />;
      
      case 'Notifications':
        return <MemberDashboard {...commonProps} activeTab="notifications" />;
      
      default:
        return <MemberDashboard {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
    <div className="min-h-screen bg-gray-50">
      <MemberSidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
        user={user}
        menuItems={menuItems}
      />
      <div className="ml-64">
        <MemberHeader 
          activeMenu={activeMenu} 
          user={user}
          onLogout={() => {
            authService.logout();
            navigate('/login');
          }}
        />
        <main className="pt-20 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MemberDashboardPage;