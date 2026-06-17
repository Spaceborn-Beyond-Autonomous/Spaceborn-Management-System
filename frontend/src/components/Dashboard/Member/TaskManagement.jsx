// src/components/Dashboard/Member/TaskManagement.js (and for other roles)
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const TaskManagement = ({ userRole = 'Member' }) => {
  const [activeTab, setActiveTab] = useState('myTasks');
  const [myTasks, setMyTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });

  // Fetch all task data on component mount
  useEffect(() => {
    fetchMyTasks();
    fetchCompletedTasks();
    fetchDailyLogs();
  }, []);

  // Fetch my tasks
  const fetchMyTasks = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        console.error('No authentication token found');
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/tasks/my-tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const tasks = await response.json();
        setMyTasks(tasks);
        
        // Calculate stats
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const inProgress = tasks.filter(t => t.status === 'in-progress').length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
        
        setStats({ totalTasks: total, completedTasks: completed, inProgressTasks: inProgress, pendingTasks: pending, overdueTasks: overdue });
        
        // Set default selected task
        if (tasks.length > 0 && !selectedTask) {
          setSelectedTask(tasks[0].id.toString());
          setProgress(tasks[0].progress || 0);
        }
      } else {
        throw new Error('Failed to fetch tasks');
      }
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch completed tasks
  const fetchCompletedTasks = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/tasks/completed`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const tasks = await response.json();
        setCompletedTasks(tasks);
      }
      
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockCompletedTasks();
      }
    }
  };

  // Fetch daily logs
  const fetchDailyLogs = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/tasks/daily-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const logs = await response.json();
        setDailyLogs(logs);
      }
      
    } catch (error) {
      console.error('Error fetching daily logs:', error);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockDailyLogs();
      }
    }
  };

  // Mock data for development
  const loadMockData = () => {
    const mockTasks = [
      { 
        id: 1, 
        name: 'Build login UI', 
        status: 'in-progress', 
        dueDate: '2026-05-28', 
        priority: 'high', 
        progress: 74,
        description: 'Implement the login page with validation',
        assignedBy: 'Mike Johnson',
        createdAt: '2026-05-20T10:00:00Z'
      },
      { 
        id: 2, 
        name: 'API Integration', 
        status: 'pending', 
        dueDate: '2026-06-05', 
        priority: 'medium', 
        progress: 0,
        description: 'Integrate REST APIs for dashboard',
        assignedBy: 'Mike Johnson',
        createdAt: '2026-05-22T14:00:00Z'
      },
      { 
        id: 3, 
        name: 'Write unit tests', 
        status: 'in-progress', 
        dueDate: '2026-06-10', 
        priority: 'low', 
        progress: 30,
        description: 'Write unit tests for components',
        assignedBy: 'Priya Sharma',
        createdAt: '2026-05-25T09:00:00Z'
      },
      { 
        id: 4, 
        name: 'Code Review', 
        status: 'pending', 
        dueDate: '2026-05-30', 
        priority: 'high', 
        progress: 0,
        description: 'Review pull requests from team',
        assignedBy: 'Mike Johnson',
        createdAt: '2026-05-26T11:00:00Z'
      }
    ];
    
    setMyTasks(mockTasks);
    
    const total = mockTasks.length;
    const completed = mockTasks.filter(t => t.status === 'completed').length;
    const inProgress = mockTasks.filter(t => t.status === 'in-progress').length;
    const pending = mockTasks.filter(t => t.status === 'pending').length;
    const overdue = mockTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
    
    setStats({ totalTasks: total, completedTasks: completed, inProgressTasks: inProgress, pendingTasks: pending, overdueTasks: overdue });
    
    if (mockTasks.length > 0) {
      setSelectedTask(mockTasks[0].id.toString());
      setProgress(mockTasks[0].progress);
    }
  };

  const loadMockCompletedTasks = () => {
    setCompletedTasks([
      { id: 1, name: 'User profile page redesign', completedDate: '2026-05-20', completedBy: 'Ravi Das' },
      { id: 2, name: 'API integration for dashboard', completedDate: '2026-05-18', completedBy: 'Ravi Das' },
      { id: 3, name: 'Mobile responsive fixes', completedDate: '2026-05-15', completedBy: 'Ravi Das' },
      { id: 4, name: 'Performance optimization', completedDate: '2026-05-12', completedBy: 'Ravi Das' }
    ]);
  };

  const loadMockDailyLogs = () => {
    setDailyLogs([
      { id: 1, date: '2026-05-27T10:00:00Z', taskId: 1, taskName: 'Build login UI', progress: 45, notes: 'Working on form validation', hoursSpent: 4 },
      { id: 2, date: '2026-05-26T10:00:00Z', taskId: 1, taskName: 'Build login UI', progress: 35, notes: 'Started UI implementation', hoursSpent: 3 },
      { id: 3, date: '2026-05-25T10:00:00Z', taskId: 3, taskName: 'Write unit tests', progress: 20, notes: 'Setup testing framework', hoursSpent: 2 }
    ]);
  };

  // Update task progress
  const updateTaskProgress = async (taskId, newProgress) => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress }),
      });
      
      if (response.ok) {
        setMyTasks(myTasks.map(task =>
          task.id === taskId ? { ...task, progress: newProgress } : task
        ));
      }
      
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  };

  // Mark task as completed
  const markTaskComplete = async (taskId) => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const completedTask = myTasks.find(t => t.id === taskId);
        setMyTasks(myTasks.filter(task => task.id !== taskId));
        setCompletedTasks([{ ...completedTask, completedDate: new Date().toISOString() }, ...completedTasks]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          completedTasks: prev.completedTasks + 1,
          totalTasks: prev.totalTasks - 1
        }));
      }
      
    } catch (error) {
      console.error('Error marking task as complete:', error);
      alert('Failed to mark task as complete');
    }
  };

  // Submit daily log
  const handleSubmitDailyLog = async () => {
    if (!selectedTask) {
      alert('Please select a task');
      return;
    }
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const task = myTasks.find(t => t.id === parseInt(selectedTask));
      
      const logData = {
        taskId: parseInt(selectedTask),
        taskName: task?.name,
        progress: progress,
        notes: notes,
        date: new Date().toISOString(),
        hoursSpent: 0 // Can be added later
      };
      
      const response = await fetch(`${API_BASE_URL}/tasks/daily-logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });
      
      if (response.ok) {
        const newLog = await response.json();
        setDailyLogs([newLog, ...dailyLogs]);
        
        // Update task progress
        await updateTaskProgress(parseInt(selectedTask), progress);
        
        setNotes('');
        alert('Daily log submitted successfully!');
      } else {
        throw new Error('Failed to submit daily log');
      }
      
    } catch (error) {
      console.error('Error submitting daily log:', error);
      
      // Fallback for development
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        const newLog = {
          id: dailyLogs.length + 1,
          date: new Date().toISOString(),
          taskId: parseInt(selectedTask),
          taskName: myTasks.find(t => t.id === parseInt(selectedTask))?.name,
          progress: progress,
          notes: notes,
          hoursSpent: 0
        };
        setDailyLogs([newLog, ...dailyLogs]);
        await updateTaskProgress(parseInt(selectedTask), progress);
        setNotes('');
        alert('Daily log submitted successfully! (Mock Mode)');
      } else {
        alert('Failed to submit daily log. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days left`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-500 mt-1">Track and manage your tasks</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgressTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-red-600">{stats.pendingTasks}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-2xl font-bold text-orange-600">{stats.overdueTasks}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('myTasks')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'myTasks' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          My Tasks ({myTasks.length})
        </button>
        <button 
          onClick={() => setActiveTab('dailyLog')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'dailyLog' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Daily Log
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 text-sm font-medium transition-colors ${activeTab === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* My Tasks Tab */}
      {activeTab === 'myTasks' && (
        <div>
          {myTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No tasks assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Due {formatDate(task.dueDate)} · {formatRelativeDate(task.dueDate)}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                        {task.assignedBy && (
                          <span className="text-xs text-gray-400">Assigned by: {task.assignedBy}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedTask(task.id.toString());
                          setProgress(task.progress);
                          setActiveTab('dailyLog');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        Update progress
                      </button>
                      {task.status !== 'completed' && (
                        <button 
                          onClick={() => markTaskComplete(task.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Mark done
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Log Tab */}
      {activeTab === 'dailyLog' && (
        <div>
          {/* Daily Log Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Daily Log</h2>
            <p className="text-sm text-gray-500 mb-6">Log your progress for today</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SELECT TASK *</label>
                <select 
                  value={selectedTask}
                  onChange={(e) => {
                    setSelectedTask(e.target.value);
                    const task = myTasks.find(t => t.id === parseInt(e.target.value));
                    if (task) setProgress(task.progress);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a task</option>
                  {myTasks.map(task => (
                    <option key={task.id} value={task.id}>{task.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PROGRESS UPDATE</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium min-w-[45px]">{progress}%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NOTES / BLOCKERS</label>
                <textarea 
                  rows="4"
                  placeholder="Share your progress, challenges, or blockers..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button 
                onClick={handleSubmitDailyLog}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Submit Daily Update
              </button>
            </div>
          </div>

          {/* Past Daily Logs */}
          {dailyLogs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Updates</h2>
              <div className="space-y-4">
                {dailyLogs.map((log) => (
                  <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">{formatDate(log.date)}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {log.progress}% · {log.taskName}
                        </p>
                      </div>
                      {log.hoursSpent > 0 && (
                        <span className="text-xs text-gray-400">{log.hoursSpent} hours</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{log.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Tasks Tab */}
      {activeTab === 'completed' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {completedTasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No completed tasks yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {completedTasks.map((task) => (
                <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{task.name}</p>
                      <p className="text-sm text-gray-500">
                        Completed - {formatDate(task.completedDate)}
                        {task.completedBy && ` by ${task.completedBy}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskManagement;