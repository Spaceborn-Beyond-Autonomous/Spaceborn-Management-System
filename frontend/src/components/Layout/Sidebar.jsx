import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, FolderKanban, Users, 
  Coins, Calendar, Bot, Bell, Activity, Database,
  Building2, FileText, LogOut, Menu, ChevronLeft,
  Target, Gift, MessageCircle, Zap, Heart, TrendingUp
} from 'lucide-react';
import authService from '../../services/authService';

const Sidebar = ({ activeMenu, setActiveMenu, onLogout, collapsed = false, onToggleCollapse }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetchUserData();
    loadMenuItems();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        const verifiedUser = await authService.verifyToken();
        setUser(verifiedUser);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenuItems = () => {
    // Menu configuration - can be fetched from API
    const allMenuItems = [
      // OVERVIEW Section
      {
        section: 'OVERVIEW',
        items: [
          { id: 'Dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, roles: ['CEO', 'Manager', 'Team Lead', 'Member'] }
        ]
      },
      {
        section: 'MANAGEMENT',
        items: [
          { id: 'TaskManagement', label: 'Task Management', icon: <CheckSquare className="w-5 h-5" />, roles: ['CEO', 'Manager', 'Team Lead', 'Member'] },
          { id: 'Projects', label: 'Projects', icon: <FolderKanban className="w-5 h-5" />, roles: ['CEO', 'Manager'] },
          { id: 'TeamsAndRoles', label: 'Teams & Roles', icon: <Users className="w-5 h-5" />, roles: ['CEO', 'Manager'] },
          { id: 'Accounts', label: 'Accounts', icon: <Coins className="w-5 h-5" />, roles: ['CEO'] },
          { id: 'EmployeeManagement', label: 'Employee Database', icon: <Database className="w-5 h-5" />, roles: ['CEO', 'Manager'] }
        ]
      },
      {
        section: 'REPORTS',
        items: [
          { id: 'TeamReports', label: 'Team Reports', icon: <FileText className="w-5 h-5" />, roles: ['CEO', 'Manager'] },
          { id: 'LeaveManagement', label: 'Leave Management', icon: <Calendar className="w-5 h-5" />, roles: ['CEO', 'Manager', 'Team Lead', 'Member'] }
        ]
      },
      {
        section: 'RESOURCES',
        items: [
          { id: 'ResourceAllocation', label: 'Resource Allocation', icon: <Target className="w-5 h-5" />, roles: ['CEO', 'Manager'] },
          { id: 'Resources', label: 'Resources', icon: <Gift className="w-5 h-5" />, roles: ['CEO', 'Manager', 'Team Lead', 'Member'] }
        ]
      },
      {
        section: 'TOOLS',
        items: [
          { id: 'Meetings', label: 'Meetings', icon: <Calendar className="w-5 h-5" />, roles: ['CEO', 'Manager', 'Team Lead', 'Member'] },
          { id: 'AIInsights', label: 'AI Insights', icon: <Bot className="w-5 h-5" />, roles: ['CEO'] },
          { id: 'Notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" />, roles: ['CEO', 'Manager', 'Team Lead', 'Member'] }
        ]
      },
      {
        section: 'SYSTEM',
        items: [
          { id: 'ActivityMonitor', label: 'Activity Monitor', icon: <Activity className="w-5 h-5" />, roles: ['CEO', 'Manager'] }
        ]
      }
    ];

    // Filter menu items based on user role
    const userRole = user?.role || 'CEO';
    const filteredMenus = allMenuItems.map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(userRole))
    })).filter(section => section.items.length > 0);

    setMenuItems(filteredMenus);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'CEO': return 'bg-purple-100 text-purple-700';
      case 'Manager': return 'bg-blue-100 text-blue-700';
      case 'Team Lead': return 'bg-green-100 text-green-700';
      case 'Member': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-50`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-50 shadow-sm`}>
      {/* Logo */}
      <div className={`p-6 border-b border-gray-200 ${collapsed ? 'px-4' : ''}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          {!collapsed && (
            <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Spaceborn
            </span>
          )}
        </div>
      </div>

      {/* Collapse Toggle Button */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-all duration-200 shadow-sm"
        >
          <ChevronLeft className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Role Tags */}
      {!collapsed && (
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
          <div className="flex space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor('CEO')}`}>CEO</span>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">Manager</span>
          </div>
          <div className="flex space-x-2">
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">Lead</span>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">Member</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {!collapsed && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                {section.section}
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg transition-all duration-200 group ${
                    activeMenu === item.id
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <span className={activeMenu === item.id ? 'text-purple-600' : 'text-gray-500 group-hover:text-gray-700'}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {!collapsed && activeMenu === item.id && (
                    <span className="ml-auto w-1 h-1 bg-purple-600 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className={`p-4 border-t border-gray-200 ${collapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
            {getInitials(user?.name)}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'John Doe'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'CEO'}</p>
              </div>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-red-500"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
        
        {/* Online Status Indicator */}
        {!collapsed && (
          <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;