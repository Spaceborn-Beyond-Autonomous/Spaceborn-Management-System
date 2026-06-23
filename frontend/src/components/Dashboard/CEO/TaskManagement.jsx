// src/components/Dashboard/CEO/TaskManagement.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import taskService from '../../../services/taskService';
import userService from '../../../services/userService';
import {
  groupTasksByKanban,
  columnToStatus,
  statusToColumn,
  calculateTaskStats,
  filterTasks,
  formatPriorityLabel,
  getInitialsFromName,
  getTaskId,
  isTaskOverdue,
  normalizeTask,
} from '../../../utils/taskMapper';

const TaskManagement = ({ userRole = 'CEO' }) => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    department: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: 0,
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'gray' },
    { id: 'inProgress', title: 'In Progress', color: 'blue' },
    { id: 'done', title: 'Done', color: 'green' },
  ];

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [filterPriority, filterAssignee, searchQuery]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) {
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setIsLoading(false);
        return;
      }

      const filters = {};
      if (filterPriority !== 'all') filters.priority = filterPriority;
      if (searchQuery) filters.search = searchQuery;

      const rawTasks = await taskService.getAllTasks(filters);
      let normalized = filterTasks(rawTasks, {
        search: searchQuery,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        assignee: filterAssignee !== 'all' ? filterAssignee : undefined,
      });

      const kanban = groupTasksByKanban(normalized);
      setTasks(kanban);
      setTaskStats(calculateTaskStats(normalized));
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const list = await userService.getAssignableUsers();
      setEmployees(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        setEmployees([
          { id: 1, name: 'Anil Mehta', department: 'Core Systems' },
          { id: 2, name: 'Priya Sharma', department: 'Core Systems' },
        ]);
      }
    }
  };

  const loadMockData = () => {
    const mock = groupTasksByKanban([
      {
        id: 1,
        title: 'Hardware & Integration system update',
        description: 'Update the design system components',
        department: 'Core Systems',
        priority: 'high',
        assignedToName: 'Anil Mehta',
        dueDate: '2026-06-10',
        status: 'Pending',
        progress: 0,
        createdAt: '2026-06-01',
      },
      {
        id: 2,
        title: 'Authentication flow',
        description: 'Implement OAuth authentication',
        department: 'Core Systems',
        priority: 'high',
        assignedToName: 'Rahul Verma',
        dueDate: '2026-06-08',
        status: 'In progress',
        progress: 45,
        createdAt: '2026-06-01',
      },
      {
        id: 3,
        title: 'Sprint planning',
        description: 'Plan Q2 sprint goals',
        department: 'Platform and DevOps',
        priority: 'high',
        assignedToName: 'John Doe',
        dueDate: '2026-06-05',
        status: 'Completed',
        progress: 100,
        createdAt: '2026-05-30',
      },
    ]);
    setTasks(mock);
    setTaskStats(calculateTaskStats([...mock.todo, ...mock.inProgress, ...mock.done]));
  };

  const handleDragStart = (e, task, sourceColumn) => {
    setDraggedTask({ task, sourceColumn });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    if (!draggedTask) return;

    const { task, sourceColumn } = draggedTask;
    if (sourceColumn === targetColumn) return;

    const taskId = getTaskId(task);
    const newStatus = columnToStatus(targetColumn);

    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[sourceColumn] = prev[sourceColumn].filter(t => getTaskId(t) !== taskId);
      newTasks[targetColumn] = [{ ...normalizeTask(task), status: newStatus }, ...prev[targetColumn]];
      return newTasks;
    });

    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      const allTasks = [...tasks.todo, ...tasks.inProgress, ...tasks.done];
      setTaskStats(calculateTaskStats(allTasks));
    } catch (err) {
      console.error('Error updating task status:', err);
      fetchTasks();
    }

    setDraggedTask(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const currentUser = authService.getCurrentUser();
      const selectedEmployee = employees.find(
        emp => String(emp.id ?? emp._id) === String(formData.assignedTo)
      );

      const taskData = {
        title: formData.title,
        description: formData.description,
        assignedTo: selectedEmployee?.id ?? selectedEmployee?._id ?? formData.assignedTo,
        assignedToName: selectedEmployee?.name,
        assignedToInitials: getInitialsFromName(selectedEmployee?.name),
        department: formData.department || selectedEmployee?.department,
        priority: formData.priority,
        dueDate: formData.dueDate,
        estimatedHours: Number(formData.estimatedHours) || 0,
        status: 'Pending',
        progress: 0,
        createdBy: currentUser?.id,
      };

      const newTask = await taskService.createTask(taskData);
      const normalized = normalizeTask(newTask);
      const column = statusToColumn(normalized.status);

      setTasks(prev => ({
        ...prev,
        [column]: [normalized, ...prev[column]],
      }));

      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        department: '',
        priority: 'medium',
        dueDate: '',
        estimatedHours: 0,
      });
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Failed to create task');
    }
  };

  const getPriorityColor = (priority) => {
    const p = (priority || '').toString().toLowerCase();
    switch (p) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const assigneeNames = [...new Set(employees.map(e => e.name).filter(Boolean))];

  if (isLoading && Object.values(tasks).flat().length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-500 mt-1">Manage and track all tasks across the organization</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200 text-center">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-700">{taskStats.completed}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
          <p className="text-sm text-blue-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-700">{taskStats.inProgress}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
          <p className="text-sm text-red-600">Overdue</p>
          <p className="text-2xl font-bold text-red-700">{taskStats.overdue}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            {assigneeNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {error && Object.values(tasks).flat().length === 0 ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Tasks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchTasks} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-gray-50 rounded-xl"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className={`p-4 bg-white rounded-t-xl border-b border-${column.color}-200`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {tasks[column.id]?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
                {tasks[column.id]?.map(task => (
                  <div
                    key={getTaskId(task)}
                    draggable={column.id !== 'done'}
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="bg-white rounded-lg p-4 border border-gray-200 cursor-move hover:shadow-md transition"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowTaskModal(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                        {formatPriorityLabel(task.priority)}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    {task.department && (
                      <p className="text-xs text-gray-500 mb-2">{task.department}</p>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs">
                          {task.assignedToInitials || getInitialsFromName(task.assignedToName)}
                        </div>
                        <span className="text-xs text-gray-600">{task.assignedToName || 'Unassigned'}</span>
                      </div>
                      <span className={`text-xs ${isTaskOverdue(task) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        Due: {formatDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full mt-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 text-sm transition"
                >
                  + Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTaskModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedTask.title}</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {selectedTask.description && (
              <p className="text-gray-600 mb-4">{selectedTask.description}</p>
            )}

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Department</span>
                <span className="text-sm text-gray-900">{selectedTask.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Assignee</span>
                <span className="text-sm text-gray-900">{selectedTask.assignedToName || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Priority</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(selectedTask.priority)}`}>
                  {formatPriorityLabel(selectedTask.priority)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Progress</span>
                <span className="text-sm text-gray-900">{selectedTask.progress ?? 0}%</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Due Date</span>
                <span className={`text-sm ${isTaskOverdue(selectedTask) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {formatDate(selectedTask.dueDate)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm text-gray-900">{selectedTask.status}</span>
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
              <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full mx-4 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Create New Task</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee *</label>
                  <select
                    required
                    value={formData.assignedTo}
                    onChange={(e) => {
                      const emp = employees.find(em => String(em.id ?? em._id) === e.target.value);
                      setFormData({
                        ...formData,
                        assignedTo: e.target.value,
                        department: emp?.department || formData.department,
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Assignee</option>
                    {employees.map(emp => (
                      <option key={emp.id ?? emp._id} value={emp.id ?? emp._id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
