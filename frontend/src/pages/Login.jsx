import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import { validateEmail, validatePassword } from '../utils/validators';
import { API_BASE_URL } from '../utils/constants';

const Login = ({ onLoginSuccess, redirectPath = null }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginConfig, setLoginConfig] = useState(null);
  const navigate = useNavigate();

  // Fetch login configuration from backend
  useEffect(() => {
    const fetchLoginConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/config`);
        if (response.ok) {
          const config = await response.json();
          setLoginConfig(config);
        }
      } catch (error) {
        console.log('Using default login config');
        setLoginConfig({
          demoCredentials: true,
          requireEmailVerification: false,
          maxAttempts: 5
        });
      }
    };
    fetchLoginConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Dynamic validation
    const emailValid = await validateEmail(email);
    if (!emailValid) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.login(email, password);
      
      if (response && response.user) {
        // Store session with expiry from backend
        const sessionExpiry = response.sessionExpiry || Date.now() + (8 * 60 * 60 * 1000);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('sessionExpiry', sessionExpiry.toString());
        
        // Dynamic role-based routing
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        } else if (redirectPath) {
          navigate(redirectPath);
        } else {
          // Get dashboard route from backend or use default mapping
          const dashboardRoutes = {
            'CEO': '/ceo/dashboard',
            'Manager': '/manager/dashboard',
            'Team Lead': '/teamlead/dashboard',
            'Member': '/member/dashboard'
          };
          navigate(dashboardRoutes[response.user.role] || '/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!loginConfig) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-black to-gray-800 px-8 py-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Spaceborn CMS</h1>
          <p className="text-gray-300 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>

          {loginConfig.demoCredentials && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Contact your administrator for credentials
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;