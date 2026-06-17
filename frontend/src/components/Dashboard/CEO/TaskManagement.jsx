// src/components/Dashboard/CEO/TaskManagement.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const TaskManagement = ({ userRole = 'CEO' }) => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    review: [],
    done: []
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
  const [assignees, setAssignees] = useState([]);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    priority: 'Medium',
    assignee: '',
    dueDate: '',
    projectId: ''
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'gray' },
    { id: 'inProgress', title: 'In Progress', color: 'blue' },
    { id: 'review', title: 'In Review', color: 'purple' },
    { id: 'done', title: 'Done', color: 'green' }
  ];

  useEffect(() => {
    fetchTasks();
    fetchAssignees();
  }, [filterPriority, filterAssignee, searchQuery]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    
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
      
      const params = new URLSearchParams();
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      if (filterAssignee !== 'all') params.append('assignee', filterAssignee);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_BASE_URL}/tasks/kanban?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        calculateStats(data);
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

  const fetchAssignees = async () => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/users/assignees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignees(data);
      } else if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        setAssignees(['Anil Mehta', 'Priya Sharma', 'Rahul Verma', 'Anjali Nair', 'John Doe']);
      }
      
    } catch (error) {
      console.error('Error fetching assignees:', error);
      setAssignees(['Anil Mehta', 'Priya Sharma', 'Rahul Verma', 'Anjali Nair', 'John Doe']);
    }
  };

  const calculateStats = (tasksData) => {
    const total = Object.values(tasksData).flat().length;
    const completed = tasksData.done?.length || 0;
    const inProgress = tasksData.inProgress?.length || 0;
    const overdue = Object.values(tasksData).flat().filter(t => {
      if (t.status === 'done') return false;
      return t.dueDate && new Date(t.dueDate) < new Date();
    }).length;
    
    setTaskStats({ total, completed, inProgress, overdue });
  };

  const loadMockData = () => {
    setTasks({
      todo: [
        { id: 1, title: 'Design system update', description: 'Update the design system components', project: 'Project Beta', priority: 'High', assignee: 'Anil Mehta', dueDate: '2026-06-10', status: 'todo', createdAt: '2026-06-01' },
        { id: 2, title: 'API documentation', description: 'Write comprehensive API documentation', project: 'API Gateway', priority: 'Medium', assignee: 'Priya Sharma', dueDate: '2026-06-12', status: 'todo', createdAt: '2026-06-02' }
      ],
      inProgress: [
        { id: 3, title: 'Authentication flow', description: 'Implement OAuth authentication', project: 'API Gateway', priority: 'High', assignee: 'Rahul Verma', dueDate: '2026-06-08', status: 'inProgress', createdAt: '2026-06-01' }
      ],
      review: [
        { id: 4, title: 'Code review for API', description: 'Review API implementation', project: 'API Gateway', priority: 'High', assignee: 'Anjali Nair', dueDate: '2026-06-07', status: 'review', createdAt: '2026-06-01' }
      ],
      done: [
        { id: 5, title: 'Sprint planning', description: 'Plan Q2 sprint goals', project: 'All Projects', priority: 'High', assignee: 'John Doe', dueDate: '2026-06-05', status: 'done', createdAt: '2026-05-30' }
      ]
    });
    setTaskStats({ total: 5, completed: 1, inProgress: 1, overdue: 0 });
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
    
    // Optimistic update
    setTasks(prev => {
      const newTasks = { ...prev };
      newTasks[sourceColumn] = prev[sourceColumn].filter(t => t.id !== task.id);
      newTasks[targetColumn] = [{ ...task, status: targetColumn }, ...prev[targetColumn]];
      return newTasks;
    });
    
    // Update in backend
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      await fetch(`${API_BASE_URL}/tasks/${task.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: targetColumn })
      });
      
    } catch (error) {
      console.error('Error updating task status:', error);
      // Revert on error
      fetchTasks();
    }
    
    setDraggedTask(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const taskData = {
        ...formData,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString(),
        status: 'todo'
      };
      
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => ({
          ...prev,
          todo: [newTask, ...prev.todo]
        }));
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          project: '',
          priority: 'Medium',
          assignee: '',
          dueDate: '',
          projectId: ''
        });
        alert('Task created successfully!');
      } else {
        throw new Error('Failed to create task');
      }
      
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task');
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'done') return false;
    return dueDate && new Date(dueDate) < new Date();
  };

  if (isLoading && Object.values(tasks).flat().length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-500 mt-1">Manage and track all tasks across projects</p>
      </div>

      {/* Stats Cards */}
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

      {/* Filters */}
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
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            {assignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
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

      {/* Error State */}
      {error && Object.values(tasks).flat().length === 0 ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Tasks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchTasks} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
        </div>
      ) : (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    key={task.id}
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
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-2">{task.project}</p>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs">
                          {getInitials(task.assignee)}
                        </div>
                        <span className="text-xs text-gray-600">{task.assignee}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs ${isOverdue(task.dueDate, task.status) ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>
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

      {/* Task Details Modal */}
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
                <span className="text-sm text-gray-500">Project</span>
                <span className="text-sm text-gray-900">{selectedTask.project}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Assignee</span>
                <span className="text-sm text-gray-900">{selectedTask.assignee}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Priority</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Due Date</span>
                <span className={`text-sm ${isOverdue(selectedTask.dueDate, selectedTask.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {formatDate(selectedTask.dueDate)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm text-gray-900 capitalize">{selectedTask.status}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-500">Created</span>
                <span className="text-sm text-gray-900">{formatDate(selectedTask.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Edit Task</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
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
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({...formData, project: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Project name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                  <select
                    value={formData.assignee}
                    onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Assignee</option>
                    {assignees.map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
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