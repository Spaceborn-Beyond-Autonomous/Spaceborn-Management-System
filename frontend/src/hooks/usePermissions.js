// Permissions hook - manages user permissions and access control
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

export const usePermissions = (user) => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleBasedAccess, setRoleBasedAccess] = useState({});

  useEffect(() => {
    if (user) {
      loadPermissions();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadPermissions = async () => {
    setIsLoading(true);
    try {
      // Fetch permissions from backend
      const response = await fetch(`${API_BASE_URL}/permissions/${user?.role}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || []);
        setRoleBasedAccess(data.roleAccess || {});
      } else {
        setDefaultPermissions();
      }
    } catch (error) {
      console.log('Using default permissions');
      setDefaultPermissions();
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultPermissions = () => {
    const defaultPermissions = {
      'CEO': ['view_all', 'edit_all', 'delete_all', 'manage_users', 'manage_roles'],
      'COO': ['view_team', 'edit_team', 'approve_leave', 'view_reports', 'manage_resources'],
      'Manager': ['view_team', 'edit_team', 'approve_leave', 'view_reports', 'manage_resources'],
      'Team Lead': ['view_team', 'assign_tasks', 'view_reports', 'manage_sprints'],
      'Member': ['view_tasks', 'edit_tasks', 'submit_reports', 'view_profile']
    };
    
    setPermissions(defaultPermissions[user?.role] || []);
    setRoleBasedAccess({
      canView: true,
      canEdit: user?.role !== 'Member',
      canDelete: user?.role === 'CEO',
      canApprove: ['CEO', 'COO', 'Manager'].includes(user?.role),
      canAssign: ['CEO', 'COO', 'Manager', 'Team Lead'].includes(user?.role)
    });
  };

  const hasPermission = (permission) => {
    if (!permissions.length) return false;
    return permissions.includes(permission) || permissions.includes('*');
  };

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissionList) => {
    return permissionList.every(p => hasPermission(p));
  };

  const can = (action, resource) => {
    const actionMap = {
      'view': ['view_all', `view_${resource}`, `manage_${resource}`],
      'create': ['create_all', `create_${resource}`, `manage_${resource}`],
      'edit': ['edit_all', `edit_${resource}`, `manage_${resource}`],
      'delete': ['delete_all', `delete_${resource}`],
      'approve': ['approve_all', `approve_${resource}`]
    };
    
    const requiredPermissions = actionMap[action] || [];
    return hasAnyPermission(requiredPermissions);
  };

  const getAccessLevel = () => {
    if (hasPermission('*') || user?.role === 'CEO') return 'full';
    if (hasPermission('manage_team')) return 'manager';
    if (hasPermission('manage_tasks')) return 'lead';
    return 'basic';
  };

  return {
    permissions,
    roleBasedAccess,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
    getAccessLevel,
    isCEO: user?.role === 'CEO',
    isManager: user?.role === 'Manager' || user?.role === 'COO',
    isTeamLead: user?.role === 'Team Lead',
    isMember: user?.role === 'Member'
  };
};

export default usePermissions;
