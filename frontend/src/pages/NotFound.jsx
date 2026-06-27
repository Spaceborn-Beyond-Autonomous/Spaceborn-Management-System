import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

const NotFound = () => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch suggested routes from backend
    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/routes/suggestions`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (error) {
        // Fallback suggestions
        setSuggestions([
          { path: '/dashboard', name: 'Dashboard' },
          { path: '/login', name: 'Login' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-16 h-16 text-gray-500" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-xl text-gray-600 mb-2">Page Not Found</p>
          <p className="text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        {/* Suggested Routes */}
        {!loading && suggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-3">You might want to try:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => navigate(suggestion.path)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  {suggestion.name} → {suggestion.path}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;