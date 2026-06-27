// src/components/Dashboard/Member/TaskManagement.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import taskService from '../../../services/taskService';
import {
  calculateTaskStats,
  formatPriorityLabel,
  getTaskId,
  isTaskOverdue,
  normalizeTask,
  normalizeTaskList,
} from '../../../utils/taskMapper';

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
    overdueTasks: 0,
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchMyTasks(), fetchCompletedTasks(), fetchDailyLogs()]);
    setIsLoading(false);
  };

  const fetchMyTasks = async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        return;
      }

      const rawTasks = await taskService.getMyAssignedTasks();
      const tasks = normalizeTaskList(rawTasks);
      setMyTasks(tasks);
      applyStats(tasks);

      if (tasks.length > 0 && !selectedTask) {
        setSelectedTask(String(getTaskId(tasks[0])));
        setProgress(tasks[0].progress || 0);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const tasks = normalizeTaskList(await taskService.getCompletedTasks());
      setCompletedTasks(tasks);
    } catch (err) {
      console.error('Error fetching completed tasks:', err);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockCompletedTasks();
      }
    }
  };

  const fetchDailyLogs = async () => {
    try {
      const logs = await taskService.getDailyLogsList();
      setDailyLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error('Error fetching daily logs:', err);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockDailyLogs();
      }
    }
  };

  const applyStats = (tasks) => {
    const s = calculateTaskStats(tasks);
    setStats({
      totalTasks: s.total,
      completedTasks: s.completed,
      inProgressTasks: s.inProgress,
      pendingTasks: s.pending,
      overdueTasks: s.overdue,
    });
  };

  const loadMockData = () => {
    const mockTasks = normalizeTaskList([
      {
        id: 1,
        title: 'Build login UI',
        status: 'In progress',
        dueDate: '2026-05-28',
        priority: 'high',
        progress: 74,
        description: 'Implement the login page with validation',
        createdByName: 'Mike Johnson',
        createdAt: '2026-05-20T10:00:00Z',
      },
      {
        id: 2,
        title: 'API Integration',
        status: 'Pending',
        dueDate: '2026-06-05',
        priority: 'medium',
        progress: 0,
        description: 'Integrate REST APIs for dashboard',
        createdByName: 'Mike Johnson',
        createdAt: '2026-05-22T14:00:00Z',
      },
    ]);
    setMyTasks(mockTasks);
    applyStats(mockTasks);
    if (mockTasks.length > 0) {
      setSelectedTask(String(getTaskId(mockTasks[0])));
      setProgress(mockTasks[0].progress);
    }
  };

  const loadMockCompletedTasks = () => {
    setCompletedTasks(
      normalizeTaskList([
        { id: 10, title: 'User profile page redesign', status: 'Completed', updatedAt: '2026-05-20' },
        { id: 11, title: 'Mobile responsive fixes', status: 'Completed', updatedAt: '2026-05-15' },
      ])
    );
  };

  const loadMockDailyLogs = () => {
    setDailyLogs([
      { id: 1, date: '2026-05-27T10:00:00Z', taskId: 1, taskName: 'Build login UI', progress: 45, notes: 'Working on form validation', hoursSpent: 4 },
    ]);
  };

  const updateTaskProgress = async (taskId, newProgress) => {
    try {
      await taskService.updateTaskProgress(taskId, newProgress);
      const updated = myTasks.map(task =>
        getTaskId(task) === taskId ? { ...task, progress: newProgress } : task
      );
      setMyTasks(updated);
    } catch (err) {
      console.error('Error updating task progress:', err);
    }
  };

  const markTaskComplete = async (taskId) => {
    try {
      await taskService.completeTaskById(taskId);
      const completedTask = myTasks.find(t => getTaskId(t) === taskId);
      setMyTasks(myTasks.filter(task => getTaskId(task) !== taskId));
      if (completedTask) {
        setCompletedTasks([normalizeTask({ ...completedTask, status: 'Completed' }), ...completedTasks]);
      }
      applyStats(myTasks.filter(task => getTaskId(task) !== taskId));
    } catch (err) {
      console.error('Error marking task as complete:', err);
      alert('Failed to mark task as complete');
    }
  };

  const handleSubmitDailyLog = async () => {
    if (!selectedTask) {
      alert('Please select a task');
      return;
    }

    const task = myTasks.find(t => String(getTaskId(t)) === String(selectedTask));
    const taskId = getTaskId(task);

    const logData = {
      taskId,
      taskName: task?.title,
      progress,
      notes,
      content: notes,
      date: new Date().toISOString(),
      hoursSpent: 0,
    };

    try {
      const newLog = await taskService.createDailyLogEntry(logData);
      setDailyLogs([newLog, ...dailyLogs]);
      await updateTaskProgress(taskId, progress);
      setNotes('');
      alert('Daily log submitted successfully!');
    } catch (err) {
      console.error('Error submitting daily log:', err);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        setDailyLogs([
          { id: dailyLogs.length + 1, ...logData },
          ...dailyLogs,
        ]);
        await updateTaskProgress(taskId, progress);
        setNotes('');
      } else {
        alert('Failed to submit daily log. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
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

      {error && myTasks.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">{error}</div>
      )}

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

      {activeTab === 'myTasks' && (
        <div>
          {myTasks.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No tasks assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myTasks.map((task) => (
                <div key={getTaskId(task)} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Due {formatDate(task.dueDate)} · {formatRelativeDate(task.dueDate)}
                        {isTaskOverdue(task) && ' · Overdue'}
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {formatPriorityLabel(task.priority)} Priority
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setSelectedTask(String(getTaskId(task)));
                          setProgress(task.progress);
                          setActiveTab('dailyLog');
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                      >
                        Update progress
                      </button>
                      {task.status !== 'Completed' && (
                        <button
                          onClick={() => markTaskComplete(getTaskId(task))}
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

      {activeTab === 'dailyLog' && (
        <div>
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
                    const task = myTasks.find(t => String(getTaskId(t)) === e.target.value);
                    if (task) setProgress(task.progress);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a task</option>
                  {myTasks.map(task => (
                    <option key={getTaskId(task)} value={getTaskId(task)}>{task.title}</option>
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

          {dailyLogs.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Updates</h2>
              <div className="space-y-4">
                {dailyLogs.map((log) => (
                  <div key={log.id ?? log._id ?? `${log.date}-${log.taskId}`} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-500">{formatDate(log.date || log.createdAt)}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {log.progress}% · {log.taskName || log.content}
                        </p>
                      </div>
                      {log.hoursSpent > 0 && (
                        <span className="text-xs text-gray-400">{log.hoursSpent} hours</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{log.notes || log.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {completedTasks.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No completed tasks yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {completedTasks.map((task) => (
                <div key={getTaskId(task)} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        Completed - {formatDate(task.updatedAt || task.completedDate || task.dueDate)}
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
