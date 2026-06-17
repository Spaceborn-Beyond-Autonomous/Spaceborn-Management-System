// src/components/Login/Login.js
import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';

const Login = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [workingHours, setWorkingHours] = useState({
    start: '08:00',
    end: '23:59',
    isWithinShift: true
  });

  // Fetch working hours from API on mount
  useEffect(() => {
    fetchWorkingHours();
    // Load remembered employee ID if exists
    const rememberedId = localStorage.getItem('rememberedEmployeeId');
    if (rememberedId) {
      setEmployeeId(rememberedId);
      setRememberMe(true);
    }
  }, []);

  const fetchWorkingHours = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/config/working-hours`);
      
      if (response.ok) {
        const data = await response.json();
        setWorkingHours({
          start: data.start,
          end: data.end,
          isWithinShift: checkIfWithinShift(data.start, data.end)
        });
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
      // Default working hours if API fails
      setWorkingHours({
        start: '08:00',
        end: '23:59',
        isWithinShift: true
      });
    }
  };

  const checkIfWithinShift = (start, end) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
    const endTime = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate employee ID format
    if (!employeeId || employeeId.trim() === '') {
      setError('Please enter your Employee ID');
      setIsLoading(false);
      return;
    }

    // Check working hours
    if (!workingHours.isWithinShift) {
      setError(`Login is only allowed between ${workingHours.start} and ${workingHours.end}. Please login during working hours.`);
      setIsLoading(false);
      return;
    }

    try {
      // Try to login with backend API
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // First try: Login with employee ID
      let response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          employeeId: employeeId.trim(), 
          password,
          rememberMe 
        }),
      });

      let data = await response.json();

      // Second try: If employee ID fails, try with email
      if (!response.ok && employeeId.includes('@')) {
        response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: employeeId.trim(), 
            password,
            rememberMe 
          }),
        });
        data = await response.json();
      }

      if (response.ok && data.user) {
        const loginTime = new Date().toLocaleTimeString();
        const user = {
          ...data.user,
          loginTime: loginTime,
          isAuthenticated: true
        };
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('attendance_marked', 'false');
        
        // Store remembered employee ID if requested
        if (rememberMe) {
          localStorage.setItem('rememberedEmployeeId', employeeId);
        } else {
          localStorage.removeItem('rememberedEmployeeId');
        }
        
        onLogin(user);
      } else {
        setError(data.message || 'Invalid Employee ID or Password');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to mock data for development
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        handleMockLogin();
      } else {
        setError('Unable to connect to server. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock login for development (only when USE_MOCK_AUTH is true)
  const handleMockLogin = () => {
    // Mock member database
    const members = {
      'CEO001': { password: 'ceo123', role: 'CEO', name: 'John Doe', department: 'Executive', email: 'john.doe@spaceborn.com' },
      'MGR001': { password: 'mgr123', role: 'Manager', name: 'Jane Smith', department: 'Operations', email: 'jane.smith@spaceborn.com' },
      'LD001': { password: 'lead123', role: 'Team Lead', name: 'Mike Johnson', department: 'Engineering', email: 'mike.johnson@spaceborn.com' },
      'EMP001': { password: 'member123', role: 'Member', name: 'Ravi Das', department: 'Engineering', email: 'ravi.das@spaceborn.com' }
    };
    
    const member = members[employeeId];
    
    if (member && member.password === password) {
      const loginTime = new Date().toLocaleTimeString();
      const user = {
        id: employeeId,
        name: member.name,
        role: member.role,
        department: member.department,
        email: member.email,
        loginTime: loginTime,
        isAuthenticated: true,
        employeeId: employeeId
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('attendance_marked', 'false');
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmployeeId', employeeId);
      }
      
      onLogin(user);
    } else {
      setError('Invalid Employee ID or Password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Space Born</h1>
          <p className="text-blue-200 mt-2">Workforce & Operations Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Member Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {!workingHours.isWithinShift && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
              ⚠️ Login is only allowed between {workingHours.start} and {workingHours.end}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID / Email</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter your Employee ID or Email"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Use Employee ID (e.g., CEO001) or Email address
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                  disabled={isLoading}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2 cursor-pointer"
                  disabled={isLoading}
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => {
                  // Forgot password functionality
                  alert('Password reset link will be sent to your registered email');
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !workingHours.isWithinShift}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-500">
              <p>⏰ Working Hours: {workingHours.start} - {workingHours.end}</p>
              <p className="mt-1">📍 Mandatory login within shift timing</p>
              {process.env.REACT_APP_USE_MOCK_AUTH === 'true' && (
                <div className="mt-3 p-2 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium">Demo Credentials:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                    <div>CEO001 / ceo123</div>
                    <div>MGR001 / mgr123</div>
                    <div>LD001 / lead123</div>
                    <div>EMP001 / member123</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;