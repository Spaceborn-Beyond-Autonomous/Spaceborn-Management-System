// src/components/Login/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  redirectTo = '/login',
  fallbackPath = '/dashboard'
}) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [error, setError] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Check if we're in development mode (no backend)
  const isDevMode = () => {
    return true; // FORCE DEV MODE - NO BACKEND CHECKS
  };

  // Check if session is valid (not expired)
  const isValidSession = () => {
    const session = localStorage.getItem('userSession');
    if (!session) return false;
    
    try {
      const sessionData = JSON.parse(session);
      const sessionAge = Date.now() - (sessionData.timestamp || 0);
      const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours
      
      console.log(`Session age: ${Math.floor(sessionAge / 60000)} minutes`);
      return sessionAge < SESSION_TIMEOUT;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const verifyAccess = async () => {
      setIsVerifying(true);
      setError(null);
      
      console.log('ProtectedRoute: Verifying access...');
      
      // DEV MODE - Check localStorage for user
      if (isDevMode()) {
        const sessionValid = isValidSession();
        const storedUser = localStorage.getItem('user');
        
        console.log('Dev Mode - Session valid:', sessionValid);
        console.log('Dev Mode - Stored user:', storedUser ? 'yes' : 'no');
        
        if (sessionValid && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            console.log('Dev Mode - Authenticated as:', user.name, 'Role:', user.role);
            setIsAuthenticated(true);
            setUserRole(user?.role || null);
            setUserName(user?.name || null);
            setIsVerifying(false);
            return;
          } catch (e) {
            console.error('Error parsing user:', e);
          }
        }
        
        // No valid session
        console.log('Dev Mode - No valid session, redirecting to login');
        setIsAuthenticated(false);
        setIsVerifying(false);
        startRedirectCountdown();
        return;
      }
      
      // ========== PRODUCTION CODE (only if not dev mode) ==========
      try {
        const authenticated = authService.isAuthenticated();
        if (!authenticated) {
          setIsAuthenticated(false);
          setIsVerifying(false);
          startRedirectCountdown();
          return;
        }
        
        const verification = await authService.verifyToken();
        if (verification.success) {
          const user = authService.getCurrentUser();
          setIsAuthenticated(true);
          setUserRole(user?.role || null);
          setUserName(user?.name || null);
        } else {
          await authService.logout();
          setIsAuthenticated(false);
          setError(verification.error);
          startRedirectCountdown();
        }
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify authentication');
        setIsAuthenticated(false);
        startRedirectCountdown();
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRedirectCountdown = () => {
    const interval = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = redirectTo;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const hasRequiredRole = () => {
    if (requiredRoles.length === 0) return true;
    return requiredRoles.includes(userRole);
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'CEO': return 'bg-purple-100 text-purple-700';
      case 'Manager': return 'bg-blue-100 text-blue-700';
      case 'Team Lead': return 'bg-green-100 text-green-700';
      case 'Member': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // Not authenticated - show session expired
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Your session has expired or you are not logged in.'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to login in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
          </p>
          <button 
            onClick={() => window.location.href = redirectTo}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }
  
  // Wrong role - access denied
  if (!hasRequiredRole()) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 text-center max-w-md shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-3">
            You don't have permission to access this page.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                {userName?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userName || 'User'}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(userRole)}`}>
                  {userRole || 'Unknown Role'}
                </span>
              </div>
            </div>
          </div>
          {requiredRoles.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Required Role(s):</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {requiredRoles.map(role => (
                  <span key={role} className={`px-2 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(role)}`}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex space-x-3">
            <button 
              onClick={() => window.location.href = fallbackPath} 
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = redirectTo;
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // All good - render children
  return children;
};

export default ProtectedRoute;