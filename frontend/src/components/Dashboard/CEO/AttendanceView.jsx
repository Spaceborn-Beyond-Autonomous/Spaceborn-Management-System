// src/components/Dashboard/CEO/AttendanceView.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import attendanceService from '../../../services/attendanceService';

const AttendanceView = ({ userRole = 'CEO' }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
    workingFromHome: 0,
    totalEmployees: 0
  });
  const [departmentStats, setDepartmentStats] = useState([]);
  const [liveStatus, setLiveStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markData, setMarkData] = useState({
    status: 'present',
    checkInTime: '',
    checkOutTime: '',
    notes: ''
  });
  const [viewMode, setViewMode] = useState('grid');
  const [departments, setDepartments] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchLiveStatus();
    }, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [selectedDate, selectedDepartment]);

  const fetchAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchAttendanceRecords(),
        fetchAttendanceStats(),
        fetchDepartmentStats(),
        fetchLiveStatus(),
        fetchDepartments()
      ]);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to load attendance data');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    const filters = { date: selectedDate };
    if (selectedDepartment !== 'all') filters.department = selectedDepartment;
    
    const records = await attendanceService.getAllAttendance(filters);
    setAttendanceRecords(records);
  };

  const fetchAttendanceStats = async () => {
    const statsData = await attendanceService.getAttendanceStats(selectedDate);
    setStats(statsData);
  };

  const fetchDepartmentStats = async () => {
    const deptStats = await attendanceService.getAttendanceByDepartment(selectedDate);
    setDepartmentStats(deptStats);
  };

  const fetchLiveStatus = async () => {
    const live = await attendanceService.getLiveAttendance();
    setLiveStatus(live);
  };

  const fetchDepartments = async () => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = authService.getToken();
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['Engineering', 'Design', 'Marketing', 'Operations', 'HR']);
    }
  };

  const loadMockData = () => {
    const mockAttendance = [
      { id: 1, name: 'John Doe', role: 'CEO', department: 'Executive', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present', hoursWorked: 9 },
      { id: 2, name: 'Jane Smith', role: 'Manager', department: 'Operations', checkIn: '09:15 AM', checkOut: '06:30 PM', status: 'late', hoursWorked: 9.25 },
      { id: 3, name: 'Mike Johnson', role: 'Team Lead', department: 'Engineering', checkIn: '08:45 AM', checkOut: '05:30 PM', status: 'present', hoursWorked: 8.75 },
      { id: 4, name: 'Ravi Das', role: 'Member', department: 'Engineering', checkIn: '', checkOut: '', status: 'absent', hoursWorked: 0 },
      { id: 5, name: 'Priya Sharma', role: 'Member', department: 'Engineering', checkIn: '09:30 AM', checkOut: '', status: 'working-from-home', hoursWorked: 4.5 },
      { id: 6, name: 'Nisha Kumar', role: 'Member', department: 'Engineering', checkIn: '', checkOut: '', status: 'on-leave', hoursWorked: 0 }
    ];
    
    setAttendanceRecords(mockAttendance);
    setStats({
      present: 3,
      absent: 1,
      late: 1,
      onLeave: 1,
      workingFromHome: 1,
      totalEmployees: 7
    });
    setDepartmentStats([
      { department: 'Engineering', present: 2, absent: 1, late: 0, onLeave: 1, total: 4 },
      { department: 'Operations', present: 0, absent: 0, late: 1, onLeave: 0, total: 1 },
      { department: 'Executive', present: 1, absent: 0, late: 0, onLeave: 0, total: 1 }
    ]);
    setLiveStatus([
      { id: 1, name: 'John Doe', status: 'active', lastActive: '2 minutes ago', currentTask: 'Reviewing reports' },
      { id: 2, name: 'Jane Smith', status: 'active', lastActive: '5 minutes ago', currentTask: 'In meeting' },
      { id: 3, name: 'Mike Johnson', status: 'active', lastActive: '1 minute ago', currentTask: 'Code review' },
      { id: 4, name: 'Ravi Das', status: 'idle', lastActive: '30 minutes ago', currentTask: 'Break' }
    ]);
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    
    try {
      await attendanceService.markAttendance(selectedEmployee.id, markData);
      alert(`Attendance marked for ${selectedEmployee.name}`);
      setShowMarkModal(false);
      fetchAllData();
    } catch (error) {
      console.error('Error marking attendance:', error);
      alert('Failed to mark attendance');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      present: 'bg-green-100 text-green-700',
      absent: 'bg-red-100 text-red-700',
      late: 'bg-yellow-100 text-yellow-700',
      'on-leave': 'bg-blue-100 text-blue-700',
      'working-from-home': 'bg-purple-100 text-purple-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const formatTime = (time) => {
    if (!time) return 'Not checked';
    return time;
  };

  if (isLoading && attendanceRecords.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500 mt-1">Real-time attendance tracking for all employees</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => fetchAllData()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
          <div className="text-xs text-gray-500">Total Employees</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          <div className="text-xs text-green-600">Present</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-200 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          <div className="text-xs text-red-600">Absent</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
          <div className="text-xs text-yellow-600">Late</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.onLeave}</div>
          <div className="text-xs text-blue-600">On Leave</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.workingFromHome}</div>
          <div className="text-xs text-purple-600">WFH</div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-4 py-2 text-sm font-medium ${viewMode === 'grid' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Grid View
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 text-sm font-medium ${viewMode === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Table View
        </button>
        <button
          onClick={() => setViewMode('department')}
          className={`px-4 py-2 text-sm font-medium ${viewMode === 'department' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
        >
          Department View
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button
            onClick={() => setSelectedDepartment('all')}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Real-time Live Status */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Live Status</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time employee activity tracking</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {liveStatus.map((employee) => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${employee.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{employee.name}</p>
                    <p className="text-xs text-gray-500">Last active: {employee.lastActive}</p>
                  </div>
                </div>
                {employee.currentTask && (
                  <span className="text-xs text-gray-400">{employee.currentTask}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && attendanceRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Attendance</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchAllData} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendanceRecords.map((record) => (
            <div key={record.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {record.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{record.name}</p>
                    <p className="text-xs text-gray-500">{record.role} · {record.department}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                      {record.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedEmployee(record);
                    setShowMarkModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Mark
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Check In:</span>
                  <span className="text-gray-900">{formatTime(record.checkIn)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Check Out:</span>
                  <span className="text-gray-900">{formatTime(record.checkOut)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Hours:</span>
                  <span className="text-gray-900">{record.hoursWorked || 0}h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {record.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(record.status)}`}>
                        {record.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatTime(record.checkIn)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatTime(record.checkOut)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.hoursWorked || 0}h</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedEmployee(record);
                          setShowMarkModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Mark
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {departmentStats.map((dept) => (
            <div key={dept.department} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{dept.department}</h3>
                <p className="text-sm text-gray-500">Total Employees: {dept.total}</p>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">{dept.present || 0}</p>
                    <p className="text-xs text-gray-500">Present</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-xl font-bold text-red-600">{dept.absent || 0}</p>
                    <p className="text-xs text-gray-500">Absent</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xl font-bold text-yellow-600">{dept.late || 0}</p>
                    <p className="text-xs text-gray-500">Late</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">{dept.onLeave || 0}</p>
                    <p className="text-xs text-gray-500">On Leave</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark Attendance Modal */}
      {showMarkModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMarkModal(false)}>
          <div className="bg-white rounded-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
              <button onClick={() => setShowMarkModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Employee: <span className="font-medium">{selectedEmployee.name}</span></p>
              <p className="text-sm text-gray-600">Department: {selectedEmployee.department}</p>
            </div>
            
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={markData.status}
                  onChange={(e) => setMarkData({...markData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="on-leave">On Leave</option>
                  <option value="working-from-home">Working From Home</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
                <input
                  type="time"
                  value={markData.checkInTime}
                  onChange={(e) => setMarkData({...markData, checkInTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
                <input
                  type="time"
                  value={markData.checkOutTime}
                  onChange={(e) => setMarkData({...markData, checkOutTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={markData.notes}
                  onChange={(e) => setMarkData({...markData, notes: e.target.value})}
                  placeholder="Add notes if needed..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowMarkModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Mark Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;