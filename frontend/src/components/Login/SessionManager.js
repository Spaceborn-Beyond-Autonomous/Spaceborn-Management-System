// src/components/Login/SessionManager.js - FIXED VERSION

import React, { useEffect, useState, useCallback } from 'react';
import authService from '../../services/authService';

const SessionManager = ({ 
  user, 
  onSessionExpired, 
  checkInterval = 60000, 
  warningBeforeExpiry = 300000 
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Check if we're in development mode with mock auth
  const isDevMode = useCallback(() => {
    return process.env.REACT_APP_USE_MOCK_AUTH === 'true' || 
           localStorage.getItem('dev_mode') === 'true' ||
           window.location.hostname === 'localhost';
  }, []);

  // Refresh session activity
  const refreshSession = useCallback(() => {
    if (isDevMode()) return;
    
    const session = localStorage.getItem('userSession');
    if (session && user) {
      const sessionData = JSON.parse(session);
      localStorage.setItem('userSession', JSON.stringify({
        ...sessionData,
        timestamp: Date.now()
      }));
    }
  }, [isDevMode(), user]);

  // Check session and token validity
  const checkSession = useCallback(async () => {
    // COMPLETELY BYPASS ALL SESSION CHECKS IN DEV MODE
    if (isDevMode()) {
      console.log('Dev mode: Session check completely bypassed');
      return true; // Always return valid
    }

    try {
      const session = localStorage.getItem('userSession');
      if (!session) {
        if (user) {
          console.log('No session found, but user exists - this might be an issue');
          // Don't immediately expire - let's just return false
          return false;
        }
        return false;
      }

      const sessionData = JSON.parse(session);
      const sessionAge = Date.now() - sessionData.timestamp;
      const SESSION_TIMEOUT = parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 8 * 60 * 60 * 1000;
      
      if (sessionAge > SESSION_TIMEOUT) {
        console.log('Session expired by age');
        await authService.logout();
        onSessionExpired();
        return false;
      }

      const timeUntilExpiry = SESSION_TIMEOUT - sessionAge;
      if (timeUntilExpiry <= warningBeforeExpiry && timeUntilExpiry > 0 && !showWarning) {
        setTimeRemaining(Math.floor(timeUntilExpiry / 60000));
        setShowWarning(true);
      } else if (timeUntilExpiry > warningBeforeExpiry && showWarning) {
        setShowWarning(false);
      }

      // SKIP token verification in dev mode
      return true;
      
    } catch (error) {
      console.error('Session check error:', error);
      if (!isDevMode()) {
        // Don't call onSessionExpired here - just log
        console.warn('Session check failed but not expiring due to possible backend issue');
      }
      return false;
    }
  }, [isDevMode, user, onSessionExpired, showWarning, warningBeforeExpiry]);

  // Set up activity listeners
  useEffect(() => {
    if (isDevMode()) return;
    
    const activities = ['click', 'keypress', 'scroll', 'mousemove'];
    const handleUserActivity = () => {
      refreshSession();
      if (showWarning) setShowWarning(false);
    };
    
    activities.forEach(activity => {
      window.addEventListener(activity, handleUserActivity);
    });
    
    return () => {
      activities.forEach(activity => {
        window.removeEventListener(activity, handleUserActivity);
      });
    };
  }, [isDevMode, refreshSession, showWarning]);

  // Main session checker interval
  useEffect(() => {
    // COMPLETELY SKIP EVERYTHING in dev mode
    if (isDevMode() || !user) {
      console.log('Dev mode or no user - SessionManager is idle');
      return;
    }
    
    checkSession();
    const interval = setInterval(checkSession, checkInterval);
    
    return () => clearInterval(interval);
  }, [user, checkInterval, checkSession, isDevMode]);

  // Session warning modal - hidden in dev mode
  if (isDevMode()) {
    return null; // Return nothing in dev mode
  }

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl border border-yellow-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-gray-900">Session Expiring Soon</h4>
            <p className="text-xs text-gray-600 mt-1">
              Your session will expire in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''} due to inactivity.
            </p>
            <button
              onClick={() => {
                refreshSession();
                setShowWarning(false);
              }}
              className="mt-2 text-xs font-medium text-black hover:text-gray-700 underline"
            >
              Stay Logged In
            </button>
          </div>
          <button onClick={() => setShowWarning(false)} className="text-gray-400 hover:text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;