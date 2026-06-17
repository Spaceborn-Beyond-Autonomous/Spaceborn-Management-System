// src/components/Dashboard/Manager/LoginManagement.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const LoginManagement = ({ userRole }) => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, today, week
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch login data
  useEffect(() => {
    fetchLoginData();
  }, []);

  const fetchLoginData = async () => {
    setIsLoading(true);
    try {
      // Replace with your actual API calls
      // const sessions = await authService.getActiveSessions();
      // const history = await authService.getLoginHistory();
      
      // Mock data for demonstration
      const mockSessions = [
        {
          id: 1,
          employeeId: 'EMP001',
          name: 'Ravi Das',
          role: 'Member',
          department: 'Engineering',
          loginTime: '2024-01-15 09:30:00',
          lastActivity: '2024-01-15 14:25:00',
          ipAddress: '192.168.1.101',
          device: 'Chrome / Windows',
          status: 'active',
          sessionId: 'sess_abc123'
        },
        {
          id: 2,
          employeeId: 'EMP002',
          name: 'Priya Sharma',
          role: 'Member',
          department: 'Engineering',
          loginTime: '2024-01-15 09:15:00',
          lastActivity: '2024-01-15 14:30:00',
          ipAddress: '192.168.1.102',
          device: 'Firefox / Mac',
          status: 'active',
          sessionId: 'sess_def456'
        },
        {
          id: 3,
          employeeId: 'LD001',
          name: 'Mike Johnson',
          role: 'Team Lead',
          department: 'Engineering',
          loginTime: '2024-01-15 08:45:00',
          lastActivity: '2024-01-15 14:28:00',
          ipAddress: '192.168.1.100',
          device: 'Edge / Windows',
          status: 'active',
          sessionId: 'sess_ghi789'
        }
      ];

      const mockHistory = [
        {
          id: 1,
          employeeId: 'EMP001',
          name: 'Ravi Das',
          loginTime: '2024-01-15 09:30:00',
          logoutTime: null,
          duration: '4h 55m',
          ipAddress: '192.168.1.101',
          status: 'active'
        },
        {
          id: 2,
          employeeId: 'EMP001',
          name: 'Ravi Das',
          loginTime: '2024-01-14 09:20:00',
          logoutTime: '2024-01-14 18:15:00',
          duration: '8h 55m',
          ipAddress: '192.168.1.101',
          status: 'completed'
        },
        {
          id: 3,
          employeeId: 'EMP002',
          name: 'Priya Sharma',
          loginTime: '2024-01-14 09:10:00',
          logoutTime: '2024-01-14 17:45:00',
          duration: '8h 35m',
          ipAddress: '192.168.1.102',
          status: 'completed'
        }
      ];

      setActiveSessions(mockSessions);
      setLoginHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching login data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceLogout = async (session) => {
    setSelectedEmployee(session);
    setShowForceLogoutModal(true);
  };

  const confirmForceLogout = async () => {
    try {
      // Replace with your actual API call
      // await authService.forceLogout(selectedEmployee.sessionId);
      
      // Remove from active sessions
      setActiveSessions(prev => prev.filter(s => s.id !== selectedEmployee.id));
      
      // Add to history
      const logoutEntry = {
        ...selectedEmployee,
        logoutTime: new Date().toLocaleString(),
        status: 'forced'
      };
      setLoginHistory(prev => [logoutEntry, ...prev]);
      
      alert(`Successfully logged out ${selectedEmployee.name}`);
    } catch (error) {
      console.error('Force logout error:', error);
      alert('Failed to force logout');
    } finally {
      setShowForceLogoutModal(false);
      setSelectedEmployee(null);
    }
  };

  const getFilteredSessions = () => {
    let filtered = activeSessions;
    
    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getFilteredHistory = () => {
    let filtered = loginHistory;
    
    if (filter === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(entry => 
        new Date(entry.loginTime).toDateString() === today
      );
    } else if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(entry => 
        new Date(entry.loginTime) > weekAgo
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const ActiveSessionsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {getFilteredSessions().map((session) => (
            <tr key={session.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{session.name}</p>
                  <p className="text-xs text-gray-500">{session.employeeId}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                  {session.role}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{session.loginTime}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{session.lastActivity}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{session.device}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{session.ipAddress}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleForceLogout(session)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Force Logout
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const LoginHistoryTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Login Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logout Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {getFilteredHistory().map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900">{entry.name}</p>
                  <p className="text-xs text-gray-500">{entry.employeeId}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{entry.loginTime}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{entry.logoutTime || 'Active'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{entry.duration || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{entry.ipAddress}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  entry.status === 'active' ? 'bg-green-100 text-green-700' :
                  entry.status === 'forced' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {entry.status === 'forced' ? 'Force Logged Out' : entry.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Login Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage employee login sessions</p>
        </div>
        <button
          onClick={fetchLoginData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-900">{activeSessions.length}</div>
          <div className="text-sm text-gray-500">Active Sessions</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-900">{loginHistory.filter(h => h.status === 'completed').length}</div>
          <div className="text-sm text-gray-500">Completed Sessions</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-900">{loginHistory.filter(h => h.status === 'forced').length}</div>
          <div className="text-sm text-gray-500">Force Logged Out</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-gray-900">{loginHistory.length}</div>
          <div className="text-sm text-gray-500">Total Logins</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, employee ID, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black pl-10"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-1 text-sm font-medium ${
              filter === 'all' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active Sessions
          </button>
          <button
            onClick={() => setFilter('history')}
            className={`pb-3 px-1 text-sm font-medium ${
              filter === 'history' 
                ? 'border-b-2 border-black text-black' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Login History
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        ) : filter === 'all' ? (
          activeSessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No active sessions found</div>
          ) : (
            <ActiveSessionsTable />
          )
        ) : (
          loginHistory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No login history found</div>
          ) : (
            <LoginHistoryTable />
          )
        )}
      </div>

      {/* Force Logout Modal */}
      {showForceLogoutModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Force Logout</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to force logout <span className="font-medium">{selectedEmployee.name}</span>?
              They will be immediately logged out of the system.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowForceLogoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmForceLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Force Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginManagement;