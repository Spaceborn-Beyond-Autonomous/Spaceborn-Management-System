// src/components/Login/LogoutButton.jsx
import React, { useState } from 'react';
import authService from '../../services/authService';

const LogoutButton = ({ onLogout, className = "", userRole, userName }) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);
    
    try {
      // Call auth service to handle logout (clears session and notifies server)
      await authService.logout();
      
      // Clear any app-specific data
      localStorage.removeItem('lastVisitedPage');
      sessionStorage.clear();
      
      // Call the parent's onLogout callback
      if (onLogout) {
        onLogout();
      }
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout properly. Please try again.');
      setIsLoggingOut(false);
    }
  };

  const handleClick = () => {
    // Show confirmation dialog for better UX
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setError(null);
  };

  // Get user initials for display
  const getUserInitials = () => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    const user = authService.getCurrentUser();
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return 'U';
  };

  const getUserRole = () => {
    if (userRole) return userRole;
    const user = authService.getCurrentUser();
    return user?.role || 'User';
  };

  const getUserName = () => {
    if (userName) return userName;
    const user = authService.getCurrentUser();
    return user?.name || 'User';
  };

  return (
    <>
      {/* Logout Button with User Info */}
      <div className="flex items-center space-x-3">
        {/* User Info Section */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
            {getUserInitials()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">{getUserName()}</p>
            <p className="text-xs text-gray-500">{getUserRole()}</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleClick}
          disabled={isLoggingOut}
          className={`flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          {isLoggingOut ? (
            <>
              <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </>
          )}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl animate-scale-up">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to logout? You will need to login again to access your dashboard.
            </p>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
                {error}
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Yes, Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default LogoutButton;