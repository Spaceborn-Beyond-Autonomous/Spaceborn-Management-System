import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { RoleSelection } from './pages/RoleSelection';
import { CEODashboard } from './components/Dashboard/CEO/CEODashboard';
import { ManagerDashboard } from './components/Dashboard/Manager/ManagerDashboard';
import { TeamLeadDashboard } from './components/Dashboard/TeamLead/TeamLeadDashboard';
import { MaintainerDashboard } from './components/Dashboard/Member/MemberDashboard';

function DashboardRouter() {
  const { user, logout } = useAuth();

  if (!user) {
    return <RoleSelection />;
  }

  const renderDashboard = () => {
    switch(user.role) {
      case 'CEO':
        return <CEODashboard />;
      case 'Manager':
      case 'COO':
        return <ManagerDashboard />;
      case 'TeamLead':
        return <TeamLeadDashboard />;
      case 'Maintainer':
        return <MaintainerDashboard />;
      default:
        return <RoleSelection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        role={user.role} 
        userName={user.name}
        onLogout={logout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          userName={user.name}
          role={user.role}
          notifications={3}
          onMenuClick={() => {}}
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <DashboardRouter />
      </DashboardProvider>
    </AuthProvider>
  );
}

export default App;
