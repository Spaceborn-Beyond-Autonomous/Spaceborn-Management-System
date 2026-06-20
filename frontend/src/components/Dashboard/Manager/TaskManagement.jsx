// src/components/Dashboard/Manager/TaskManagement.js
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';
import employeeService from '../../../services/employeeService';

const TaskManagement = ({ userRole = 'Manager' }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All departments');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateNotes, setUpdateNotes] = useState('');
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    pending: 0,
    completed: 0,
    overdue: 0
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    department: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    estimatedHours: 0
  });
  const [employees, setEmployees] = useState([]);

  const statusOptions = ['All', 'In progress', 'Pending', 'Overdue', 'Completed'];
  const priorityOptions = ['All', 'High', 'Medium', 'Low'];

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!loading) {
      filterTasks();
    }
  }, [selectedDepartment, selectedStatus, selectedPriority, searchQuery]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Get current logged in user
      const currentUser = authService.getCurrentUser();
      const managerDepartment = currentUser?.department || 'Core Systems';
      
      // Mock tasks data as shown in the image
      const allTasks = [
        { 
          id: 1, 
          name: 'Ravi Das', 
          initials: 'RD', 
          task: 'Build login UI', 
          department: 'Core Systems', 
          progress: 74, 
          status: 'In progress', 
          priority: 'High', 
          dueDate: '2026-06-10',
          role: 'Member'
        },
        { 
          id: 2, 
          name: 'Nisha Kumar', 
          initials: 'NK', 
          task: 'Write unit tests', 
          department: 'Core Systems', 
          progress: 0, 
          status: 'Pending', 
          priority: 'Medium', 
          dueDate: '2026-06-15',
          role: 'Member'
        },
        { 
          id: 3, 
          name: 'Suresh M', 
          initials: 'SM', 
          task: 'DB schema design', 
          department: 'Core Systems', 
          progress: 40, 
          status: 'Overdue', 
          priority: 'High', 
          dueDate: '2026-06-05',
          role: 'Member'
        },
        { 
          id: 4, 
          name: 'Pooja B', 
          initials: 'PB', 
          task: 'Brand style guide', 
          department: 'Hardware & Integration', 
          progress: 55, 
          status: 'In progress', 
          priority: 'Medium', 
          dueDate: '2026-06-20',
          role: 'Member'
        },
        { 
          id: 5, 
          name: 'Anita M', 
          initials: 'AM', 
          task: 'Email campaign', 
          department: 'AI/LLM & Perception', 
          progress: 20, 
          status: 'Pending', 
          priority: 'Low', 
          dueDate: '2026-06-25',
          role: 'Member'
        }
      ];
      
      // Filter tasks based on manager's department (for demo, show Engineering dept tasks prominently)
      // In real scenario, filter by manager's department
      setTasks(allTasks);
      calculateStats(allTasks);
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    // This will be handled in the render with filteredTasks
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    if (selectedDepartment !== 'All departments') {
      filtered = filtered.filter(t => t.department === selectedDepartment);
    }
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(t => t.status === selectedStatus);
    }
    if (selectedPriority !== 'All') {
      filtered = filtered.filter(t => t.priority === selectedPriority);
    }
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.task.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const fetchDepartments = async () => {
    try {
      const depts = await employeeService.getAllDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments(['Core Systems', 'Hardware & Integration', 'AI/LLM & Perception', 'Platform and DevOps', 'Robotics & Simulation', 'Robotics & Simulation', 'Robotics & Simulation']);
    }
  };

  const fetchEmployees = async () => {
    try {
      const employeesList = await employeeService.getAllEmployees();
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.department) {
        const filtered = employeesList.filter(emp => emp.department === currentUser.department);
        setEmployees(filtered);
      } else {
        setEmployees(employeesList);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([
        { id: 4, name: 'Ravi Das', role: 'Member', department: 'Core Systems' },
        { id: 5, name: 'Priya Sharma', role: 'Member', department: 'Core Systems' },
        { id: 6, name: 'Nisha Kumar', role: 'Member', department: 'Core Systems' },
      ]);
    }
  };

  const calculateStats = (tasksData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueCount = tasksData.filter(t => {
      if (t.status === 'Completed') return false;
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return dueDate < today;
    }).length;

    setStats({
      total: tasksData.length,
      inProgress: tasksData.filter(t => t.status === 'In progress').length,
      pending: tasksData.filter(t => t.status === 'Pending').length,
      completed: tasksData.filter(t => t.status === 'Completed').length,
      overdue: overdueCount
    });
  };

  const handleUpdateProgress = async () => {
    if (!selectedTask) return;
    
    const newStatus = updateProgress === 100 ? 'Completed' : (updateProgress > 0 ? 'In progress' : 'Pending');
    
    const updatedTasks = tasks.map(task => 
      task.id === selectedTask.id 
        ? { ...task, progress: updateProgress, status: newStatus }
        : task
    );
    
    setTasks(updatedTasks);
    calculateStats(updatedTasks);
    setShowUpdateModal(false);
    setSelectedTask(null);
    setUpdateProgress(0);
    setUpdateNotes('');
    alert('Task progress updated successfully!');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    const employee = employees.find(emp => emp.id === parseInt(newTask.assignedTo));
    const currentUser = authService.getCurrentUser();
    
    const newTaskObj = {
      id: tasks.length + 1,
      name: employee?.name || 'Unknown',
      initials: employee?.name?.split(' ').map(n => n[0]).join('') || 'U',
      task: newTask.title,
      department: newTask.department,
      progress: 0,
      status: 'Pending',
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      role: 'Member'
    };
    
    const updatedTasks = [newTaskObj, ...tasks];
    setTasks(updatedTasks);
    calculateStats(updatedTasks);
    setShowCreateModal(false);
    setNewTask({
      title: '',
      description: '',
      department: '',
      assignedTo: '',
      priority: 'Medium',
      dueDate: '',
      estimatedHours: 0
    });
    alert('Task created successfully!');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'In progress': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Overdue': return 'bg-red-100 text-red-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'Completed') return false;
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  const filteredTasks = getFilteredTasks();

  if (loading && tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">Manage and track all tasks across your team</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Task
        </button>
      </div>

      {/* Stats Cards - Matching the image */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 text-center">
          <p className="text-sm text-blue-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4 text-center">
          <p className="text-sm text-yellow-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4 text-center">
          <p className="text-sm text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-4 text-center">
          <p className="text-sm text-red-600">Overdue</p>
          <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search by name or task..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option>All departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {statusOptions.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {priorityOptions.map(priority => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedDepartment('All departments');
              setSelectedStatus('All');
              setSelectedPriority('All');
            }}
            className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MEMBER</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TASK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DEPT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRIORITY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROGRESS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DUE DATE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {getInitials(task.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{task.name}</p>
                          <p className="text-xs text-gray-400">{task.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">{task.task}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {task.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div 
                            className={`rounded-full h-1.5 transition-all duration-500 ${
                              task.progress >= 70 ? 'bg-green-500' : 
                              task.progress >= 30 ? 'bg-yellow-500' : 
                              'bg-blue-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {overdue && (
                          <span className="text-xs text-red-500">Overdue</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{formatDate(task.dueDate)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setSelectedTask(task);
                          setUpdateProgress(task.progress);
                          setShowUpdateModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500">No tasks found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or create a new task</p>
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {showUpdateModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowUpdateModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Task Progress</h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 pb-2 border-b">Task: <span className="font-medium">{selectedTask.task}</span></p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Progress: {updateProgress}%</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={updateProgress}
                onChange={(e) => setUpdateProgress(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Notes</label>
              <textarea
                rows="3"
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Add notes about your progress..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateProgress}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
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
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Enter task description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select
                    required
                    value={newTask.department}
                    onChange={(e) => setNewTask({...newTask, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                  <select
                    required
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;