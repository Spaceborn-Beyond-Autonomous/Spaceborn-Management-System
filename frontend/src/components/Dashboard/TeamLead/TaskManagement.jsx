// src/components/Dashboard/TeamLead/TaskManagement.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import employeeService from '../../../services/employeeService';

const TaskManagement = ({ userRole = 'Team Lead' }) => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: ''
  });

  // Available statuses
  const statuses = ['All', 'In progress', 'Pending', 'Completed', 'Overdue'];
  const priorityOptions = ['low', 'medium', 'high'];

  // Fetch tasks and team members
  useEffect(() => {
    fetchTeamMembers();
    fetchTasks();
  }, [selectedDepartment, selectedStatus, searchQuery]);

  const fetchTeamMembers = async () => {
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        // Mock team members
        setTeamMembers([
          { id: 4, name: 'Ravi Das', role: 'Member', department: currentUser?.department || 'Core Systems', email: 'ravi.das@spaceborn.com', initials: 'RD' },
          { id: 5, name: 'Priya Sharma', role: 'Member', department: currentUser?.department || 'Core Systems', email: 'priya.sharma@spaceborn.com', initials: 'PS' },
          { id: 6, name: 'Nisha Kumar', role: 'Member', department: currentUser?.department || 'Core Systems', email: 'nisha.kumar@spaceborn.com', initials: 'NK' },
          { id: 10, name: 'Suresh M', role: 'Member', department: currentUser?.department || 'Core Systems', email: 'suresh.m@spaceborn.com', initials: 'SM' }
        ]);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/team-members?department=${currentUser?.department}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Mock fallback
      setTeamMembers([
        { id: 4, name: 'Ravi Das', role: 'Member', department: 'Core Systems', email: 'ravi.das@spaceborn.com', initials: 'RD' },
        { id: 5, name: 'Priya Sharma', role: 'Member', department: 'Core Systems', email: 'priya.sharma@spaceborn.com', initials: 'PS' }
      ]);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const params = new URLSearchParams();
      if (selectedDepartment !== 'All') params.append('department', selectedDepartment);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter tasks for team lead's department only
        const filteredTasks = (data.tasks || data).filter(task => 
          task.department === currentUser?.department
        );
        setTasks(filteredTasks);
        calculateStats(filteredTasks);
      } else {
        throw new Error('Failed to fetch tasks');
      }
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    const currentUser = authService.getCurrentUser();
    const department = currentUser?.department || 'Core Systems';
    
    const mockTasks = [
      { 
        id: 1, 
        initials: 'RD', 
        name: 'Ravi Das', 
        task: 'Build login UI', 
        dept: department, 
        progress: 74, 
        status: 'In progress',
        priority: 'high',
        dueDate: '2026-06-10',
        description: 'Implement the login page with validation',
        assignedTo: 4
      },
      { 
        id: 2, 
        initials: 'NK', 
        name: 'Nisha Kumar', 
        task: 'Write unit tests', 
        dept: department, 
        progress: 0, 
        status: 'Pending',
        priority: 'medium',
        dueDate: '2026-06-15',
        description: 'Write unit tests for all components',
        assignedTo: 6
      },
      { 
        id: 3, 
        initials: 'SM', 
        name: 'Suresh M', 
        task: 'DB schema design', 
        dept: department, 
        progress: 40, 
        status: 'Overdue',
        priority: 'high',
        dueDate: '2026-06-05',
        description: 'Design the database schema for the new feature',
        assignedTo: 10
      },
      { 
        id: 4, 
        initials: 'PS', 
        name: 'Priya Sharma', 
        task: 'API Integration', 
        dept: department, 
        progress: 100, 
        status: 'Completed',
        priority: 'high',
        dueDate: '2026-06-08',
        description: 'Integrate REST APIs for dashboard',
        assignedTo: 5
      }
    ];
    
    let filtered = mockTasks;
    if (selectedStatus !== 'All') {
      filtered = mockTasks.filter(t => t.status === selectedStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.task.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setTasks(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (tasksData) => {
    const total = tasksData.length;
    const completed = tasksData.filter(t => t.status === 'Completed').length;
    const inProgress = tasksData.filter(t => t.status === 'In progress').length;
    const pending = tasksData.filter(t => t.status === 'Pending').length;
    const overdue = tasksData.filter(t => t.status === 'Overdue').length;
    
    setStats({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      pendingTasks: pending,
      overdueTasks: overdue
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    const selectedMember = teamMembers.find(m => m.id === parseInt(newTask.assignedTo));
    
    const taskData = {
      title: newTask.title,
      description: newTask.description,
      assignedTo: parseInt(newTask.assignedTo),
      assignedToName: selectedMember?.name,
      assignedToInitials: selectedMember?.initials,
      department: selectedMember?.department,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      estimatedHours: newTask.estimatedHours,
      progress: 0,
      status: 'Pending',
      createdBy: authService.getCurrentUser()?.id,
      createdAt: new Date().toISOString()
    };
    
    try {
      const token = authService.getToken();
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        // Mock task creation
        const newTaskObj = {
          id: tasks.length + 1,
          initials: selectedMember?.initials || 'U',
          name: selectedMember?.name,
          task: newTask.title,
          dept: selectedMember?.department,
          progress: 0,
          status: 'Pending',
          priority: newTask.priority,
          dueDate: newTask.dueDate,
          description: newTask.description,
          assignedTo: parseInt(newTask.assignedTo)
        };
        setTasks([newTaskObj, ...tasks]);
        calculateStats([newTaskObj, ...tasks]);
        setShowCreateModal(false);
        setNewTask({
          title: '',
          description: '',
          assignedTo: '',
          priority: 'medium',
          dueDate: '',
          estimatedHours: ''
        });
        alert('Task created successfully!');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (response.ok) {
        const created = await response.json();
        setTasks([created, ...tasks]);
        calculateStats([created, ...tasks]);
        setShowCreateModal(false);
        setNewTask({
          title: '',
          description: '',
          assignedTo: '',
          priority: 'medium',
          dueDate: '',
          estimatedHours: ''
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

  const updateTaskProgress = async (taskId, newProgress) => {
    try {
      const token = authService.getToken();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const newStatus = newProgress === 100 ? 'Completed' : (newProgress > 0 ? 'In progress' : 'Pending');
      
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, progress: newProgress, status: newStatus } : task
        ));
        calculateStats(tasks.map(task =>
          task.id === taskId ? { ...task, progress: newProgress, status: newStatus } : task
        ));
        alert('Task progress updated successfully');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress: newProgress, status: newStatus }),
      });
      
      if (response.ok) {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, progress: newProgress, status: newStatus } : task
        ));
        calculateStats(tasks.map(task =>
          task.id === taskId ? { ...task, progress: newProgress, status: newStatus } : task
        ));
        alert('Task progress updated successfully');
      }
      
    } catch (error) {
      console.error('Error updating task progress:', error);
      alert('Failed to update task progress');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'In progress': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentUser = authService.getCurrentUser();
  const departmentName = currentUser?.department || 'your';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        <p className="text-gray-500 mt-1">Manage and assign tasks to your team members</p>
        <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-xs">
          Team Lead View • {departmentName} Department
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
          <p className="text-xs text-gray-500">Total Tasks</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.overdueTasks}</p>
          <p className="text-xs text-gray-500">Overdue</p>
        </div>
      </div>

      {/* Create Task Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Assign New Task
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder="Search by name or task..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('All');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Tasks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchTasks}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-gray-400 text-sm mt-2">Assign tasks to your team members</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MEMBER</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TASK</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRIORITY</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROGRESS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DUE DATE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => {
                    setSelectedTask(task);
                    setShowTaskModal(true);
                  }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {task.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{task.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">{task.task}</p>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate max-w-xs">{task.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 rounded-full h-2 transition-all duration-300" 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(task.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Assign New Task</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Enter task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                  <select
                    required
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="">Select Team Member</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    placeholder="Describe the task details..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({...newTask, estimatedHours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder="Hours"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    Assign Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
                <button onClick={() => setShowTaskModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase font-medium">Task Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedTask.task}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase font-medium">Assigned To</label>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedTask.initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedTask.name}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase font-medium">Description</label>
                  <p className="text-gray-600 mt-1">{selectedTask.description || 'No description provided'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-medium">Status</label>
                    <p className={`mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTask.status)}`}>
                      {selectedTask.status}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase font-medium">Priority</label>
                    <p className={`mt-1 px-2 py-1 rounded-full text-xs font-medium inline-block ${getPriorityColor(selectedTask.priority)}`}>
                      {selectedTask.priority}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase font-medium">Progress</label>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 rounded-full h-2 transition-all duration-300" 
                        style={{ width: `${selectedTask.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{selectedTask.progress}%</span>
                  </div>
                  <div className="mt-3">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={selectedTask.progress}
                      onChange={(e) => {
                        setSelectedTask({...selectedTask, progress: parseInt(e.target.value)});
                      }}
                      className="w-full"
                    />
                    <button
                      onClick={() => updateTaskProgress(selectedTask.id, selectedTask.progress)}
                      className="mt-2 w-full px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase font-medium">Due Date</label>
                  <p className="text-gray-900 mt-1">{formatDate(selectedTask.dueDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;