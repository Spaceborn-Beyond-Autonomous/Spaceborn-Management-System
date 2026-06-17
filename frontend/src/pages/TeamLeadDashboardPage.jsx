import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ShiftTimer from '../components/Common/ShiftTimer';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import TeamLeadDashboard from '../components/Dashboard/TeamLead/TeamLeadDashboard';
import TeamLeadTaskManagement from '../components/Dashboard/TeamLead/TaskManagement';
import TeamLeadTeamsAndRoles from '../components/Dashboard/TeamLead/TeamsAndRoles';
import TeamLeadResources from '../components/Dashboard/TeamLead/Resources';
import TeamLeadMeetings from '../components/Dashboard/TeamLead/Meetings';
import TeamLeadNotifications from '../components/Dashboard/TeamLead/Notifications';
import authService from '../services/authService';
import { API_BASE_URL } from '../utils/constants';

const TeamLeadDashboardPage = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      
      if (currentUser.role !== 'Team Lead') {
        const hasTeamLeadAccess = await checkTeamLeadAccess(currentUser);
        if (!hasTeamLeadAccess) {
          navigate('/unauthorized');
          return;
        }
      }
      
      setUser(currentUser);
      await fetchMenuItems(currentUser);
      setIsLoading(false);
    };
    init();
  }, [navigate]);

  const checkTeamLeadAccess = async (user) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/has-role/Team Lead`);
      if (response.ok) {
        const data = await response.json();
        return data.hasAccess;
      }
    } catch (error) {
      console.log('Using fallback role check');
    }
    return user.role === 'Team Lead';
  };

  const fetchMenuItems = async (currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/team-lead`);
      if (response.ok) {
        const items = await response.json();
        setMenuItems(items);
      }
    } catch (error) {
      console.log('Using default menu items');
      setMenuItems([
        { id: 'Dashboard', label: 'Dashboard' },
        { id: 'TaskManagement', label: 'Task Management' },
        { id: 'TeamsAndRoles', label: 'Teams & Roles' },
        { id: 'Resources', label: 'Resources' },
        { id: 'Meetings', label: 'Meetings' },
        { id: 'Notifications', label: 'Notifications' }
      ]);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const renderContent = () => {
    const commonProps = { userRole: 'Team Lead', user: user, userDepartment: user?.department };
    
    switch(activeMenu) {
      case 'Dashboard':
        return <TeamLeadDashboard {...commonProps} />;
      case 'TaskManagement':
        return <TeamLeadTaskManagement {...commonProps} />;
      case 'TeamsAndRoles':
        return <TeamLeadTeamsAndRoles {...commonProps} />;
      case 'Resources':
        return <TeamLeadResources {...commonProps} />;
      case 'Meetings':
        return <TeamLeadMeetings {...commonProps} />;
      case 'Notifications':
        return <TeamLeadNotifications {...commonProps} />;
      default:
        return <TeamLeadDashboard {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        userRole="Team Lead"
        userName={user?.name}
        onLogout={handleLogout}
        menuItems={menuItems}
      />
      <div className="ml-64">
        <Header 
          activeMenu={activeMenu} 
          user={user}
          onLogout={handleLogout}
        />
        <main className="pt-20 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TeamLeadDashboardPage;