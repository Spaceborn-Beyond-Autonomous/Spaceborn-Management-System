// src/components/Login/LoginSystem.js
import React, { useState, useEffect } from 'react';
import logo from '../../assets/spaceborn-logo.png';
import ForgotPassword from './ForgotPassword';

const LoginSystem = ({ onLoginSuccess }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Load remembered Employee ID
  useEffect(() => {
    const rememberedId = localStorage.getItem('rememberedEmployeeId');
    if (rememberedId) {
      setEmployeeId(rememberedId);
      setRememberMe(true);
    }
  }, []);

  // Check if account is locked
  const isAccountLocked = () => {
    if (isLocked && lockoutTime && Date.now() < lockoutTime) {
      const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / 60000);
      return { locked: true, remainingMinutes };
    }
    return { locked: false };
  };

  // Call backend API for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const lockStatus = isAccountLocked();
    if (lockStatus.locked) {
      setError(`Too many failed attempts. Account locked for ${lockStatus.remainingMinutes} minutes.`);
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employeeId: employeeId.toUpperCase(), 
          password: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          const lockDuration = 15 * 60 * 1000;
          setLockoutTime(Date.now() + lockDuration);
          setIsLocked(true);
          setError(`Too many failed attempts. Account locked for 15 minutes.`);
        } else {
          setError(data.message || `Invalid Employee ID or Password. ${5 - newAttempts} attempts remaining.`);
        }
        setIsLoading(false);
        return;
      }

      // Login successful!
      setLoginAttempts(0);
      setIsLocked(false);
      
      const user = data.data.user;
      const token = data.data.token;

      // Store session
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userSession', JSON.stringify({
        ...user,
        isAuthenticated: true,
        timestamp: Date.now(),
        loginTime: new Date().toLocaleTimeString()
      }));

      if (rememberMe) {
        localStorage.setItem('rememberedEmployeeId', employeeId);
      } else {
        localStorage.removeItem('rememberedEmployeeId');
      }

      onLoginSuccess(user);
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    }
    
    setIsLoading(false);
  };

  // Quick login using backend
  const handleQuickLogin = async (empId, pwd) => {
    setEmployeeId(empId);
    setPassword(pwd);
    
    setIsLoading(true);
    
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employeeId: empId.toUpperCase(), 
          password: pwd 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Quick login failed');
        setIsLoading(false);
        return;
      }

      const user = data.data.user;
      const token = data.data.token;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userSession', JSON.stringify({
        ...user,
        isAuthenticated: true,
        timestamp: Date.now()
      }));

      localStorage.setItem('rememberedEmployeeId', empId);
      onLoginSuccess(user);
      
    } catch (error) {
      console.error('Quick login error:', error);
      setError('Quick login failed. Please try manual login.');
    }
    
    setIsLoading(false);
  };

  const handleForgotPasswordClick = () => {
    if (!employeeId) {
      setError('Please enter your Employee ID before requesting password reset');
      return;
    }
const handleForgotPasswordClick = () => {
  if (!employeeId) {
    setError('Please enter your Employee ID before requesting password reset');
    return;
  }

  setShowForgotPassword(true);
};

const handleBackToLogin = () => {
  setShowForgotPassword(false);
  setError('');
};

  const lockStatus = isAccountLocked();

  // Show Forgot Password component if requested
  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logo} alt="Spaceborn" className="h-24 w-auto mx-auto mb-4" />
          <p className="text-gray-500">Workforce & Operations Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Employee Login</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your dashboard</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {lockStatus.locked && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              ⚠️ Account locked for {lockStatus.remainingMinutes} minutes due to multiple failed attempts.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Employee ID
              </label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                placeholder="Enter your Employee ID (e.g., EMP001)"
                required
                disabled={isLoading || lockStatus.locked}
                autoCapitalize="characters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all pr-10"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading || lockStatus.locked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  disabled={isLoading || lockStatus.locked}
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button 
                type="button" 
                className="text-sm text-gray-500 hover:text-black transition-colors"
                onClick={handleForgotPasswordClick}
                disabled={isLoading || lockStatus.locked}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockStatus.locked}
              className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          {/* Info Section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center text-sm text-gray-500">
              <p>⏰ Working Hours: 8:00 AM - 12:00 AM</p>
              <p className="mt-1">📍 Mandatory login within shift timing</p>
              <p className="mt-2 text-xs text-gray-400">
                Employee IDs are assigned and controlled by your Manager
              </p>
              <p className="mt-1 text-xs text-gray-400">
                🔒 5 failed attempts = 15 minutes lockout
              </p>
            </div>
          </div>
        </div>

        {/* Demo Accounts Section - Uses Backend API */}
        <div className="mt-6">
          <p className="text-center text-xs text-gray-400 mb-3">
            Demo Employee IDs (Click to quick login via backend)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('CEO001', 'admin123')}
              className="flex items-center space-x-2 p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">JD</div>
              <div>
                <div className="text-xs font-medium text-black">John Doe</div>
                <div className="text-xs text-gray-400">CEO001 · CEO</div>
              </div>
            </button>
            <button
              onClick={() => handleQuickLogin('MGR001', 'manager123')}
              className="flex items-center space-x-2 p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center text-xs font-bold">JS</div>
              <div>
                <div className="text-xs font-medium text-black">Jane Smith</div>
                <div className="text-xs text-gray-400">MGR001 · Manager</div>
              </div>
            </button>
            <button
              onClick={() => handleQuickLogin('LD001', 'lead123')}
              className="flex items-center space-x-2 p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-xs font-bold">MJ</div>
              <div>
                <div className="text-xs font-medium text-black">Mike Johnson</div>
                <div className="text-xs text-gray-400">LD001 · Team Lead</div>
              </div>
            </button>
            <button
              onClick={() => handleQuickLogin('EMP001', 'member123')}
              className="flex items-center space-x-2 p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-bold">RD</div>
              <div>
                <div className="text-xs font-medium text-black">Ravi Das</div>
                <div className="text-xs text-gray-400">EMP001 · Member</div>
              </div>
            </button>
            <button
              onClick={() => handleQuickLogin('EMP002', 'member123')}
              className="flex items-center space-x-2 p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-bold">PS</div>
              <div>
                <div className="text-xs font-medium text-black">Priya Sharma</div>
                <div className="text-xs text-gray-400">EMP002 · Member</div>
              </div>
            </button>
            <button
              onClick={() => handleQuickLogin('HR001', 'hr123')}
              className="flex items-center space-x-2 p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-bold">NG</div>
              <div>
                <div className="text-xs font-medium text-black">Neha Gupta</div>
                <div className="text-xs text-gray-400">HR001 · HR</div>
              </div>
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            ⚠️ 5 failed attempts will lock account for 15 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSystem;