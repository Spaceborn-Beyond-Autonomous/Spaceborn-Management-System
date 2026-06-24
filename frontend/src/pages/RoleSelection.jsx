import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Shield, User, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import { API_BASE_URL } from '../utils/constants';

const RoleSelection = () => {
  const [user, setUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);
      await fetchAvailableRoles(currentUser);
    };
    loadData();
  }, [navigate]);

  const fetchAvailableRoles = async (currentUser) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}/available-roles`);
      if (response.ok) {
        const roles = await response.json();
        setAvailableRoles(roles);
      } else {
        // Fallback roles based on user's actual role from database
        const fallbackRoles = [{ id: currentUser.role, name: currentUser.role }];
        setAvailableRoles(fallbackRoles);
      }
    } catch (error) {
      console.log('Using fallback roles');
      setAvailableRoles([{ id: currentUser.role, name: currentUser.role }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (roleName) => {
    const icons = {
      'CEO': <Shield className="w-8 h-8" />,
      'Manager': <Users className="w-8 h-8" />,
      'Team Lead': <Building2 className="w-8 h-8" />,
      'CO Head': <Building2 className="w-8 h-8" />,
      'Co-Head': <Building2 className="w-8 h-8" />,
      'Member': <User className="w-8 h-8" />
    };
    return icons[roleName] || <User className="w-8 h-8" />;
  };

  const getRoleColor = (roleName) => {
    const colors = {
      'CEO': 'purple',
      'Manager': 'blue',
      'Team Lead': 'green',
      'CO Head': 'green',
      'Co-Head': 'green',
      'Member': 'gray'
    };
    return colors[roleName] || 'gray';
  };

  const getRoleDescription = (roleName) => {
    const descriptions = {
      'CEO': 'Full company access and strategic control',
      'Manager': 'Department management and resource allocation',
      'Team Lead': 'Team leadership and task coordination',
      'CO Head': 'Team leadership and task coordination',
      'Co-Head': 'Team leadership and task coordination',
      'Member': 'Individual contributor with task management'
    };
    return descriptions[roleName] || 'Access to assigned features';
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
  };

  const handleConfirm = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Store selected role preference in backend
      await fetch(`${API_BASE_URL}/users/${user.id}/active-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      });
      
      localStorage.setItem('selectedRole', selectedRole);
      
      // Dynamic dashboard routing
      const dashboardRoutes = {
        'CEO': '/ceo/dashboard',
        'Manager': '/manager/dashboard',
        'Team Lead': '/teamlead/dashboard',
        'CO Head': '/teamlead/dashboard',
        'Co-Head': '/teamlead/dashboard',
        'Member': '/member/dashboard'
      };
      
      navigate(dashboardRoutes[selectedRole] || '/dashboard');
    } catch (error) {
      console.error('Error saving role preference:', error);
      // Fallback navigation even if API fails
      const fallbackRoutes = {
        'CEO': '/ceo/dashboard',
        'Manager': '/manager/dashboard',
        'Team Lead': '/teamlead/dashboard',
        'CO Head': '/teamlead/dashboard',
        'Co-Head': '/teamlead/dashboard',
        'Member': '/member/dashboard'
      };
      navigate(fallbackRoutes[selectedRole] || '/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !availableRoles.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Select Your Role</h1>
          <p className="text-gray-500 mt-2">Choose how you want to access the platform</p>
        </div>

        {user && (
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {availableRoles.length > 1 ? 'Multiple roles available' : 'Single role access'}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {availableRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                selectedRole === role.id
                  ? 'border-black bg-gray-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                getRoleColor(role.name) === 'purple' ? 'bg-purple-100 text-purple-600' :
                getRoleColor(role.name) === 'blue' ? 'bg-blue-100 text-blue-600' :
                getRoleColor(role.name) === 'green' ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {getRoleIcon(role.name)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{getRoleDescription(role.name)}</p>
              {selectedRole === role.id && (
                <div className="mt-3 flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Selected
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedRole || isLoading}
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Loading...' : `Continue as ${selectedRole || 'Select a role'}`}
          </button>
          <p className="text-xs text-gray-400 mt-4">
            You can switch roles later from your profile settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;