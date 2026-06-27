// src/components/Dashboard/Manager/Projects.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const Projects = ({ userRole = 'Manager' }) => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    onTrack: 0,
    atRisk: 0,
    delayed: 0,
    completed: 0
  });
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    dueDate: '',
    priority: 'medium',
    budget: '',
    lead: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchProjects();
  }, [selectedDepartment, selectedStatus, searchQuery]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
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
      
      const response = await fetch(`${API_BASE_URL}/projects?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const nextProjects = data.projects || data;
        setProjects(nextProjects);
        calculateStats(nextProjects);
      } else {
        throw new Error('Failed to fetch projects');
      }
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
      loadMockData();
    } finally {
      setIsLoading(false);
    }
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
      setDepartments(['Platform and DevOps', 'Core Systems', 'Hardware & Integration', 'Robotics & Simulation', 'AI/LLM & Perception']);
    }
  };

  const calculateStats = (projectsData) => {
    const total = projectsData.length;
    const onTrack = projectsData.filter(p => p.status === 'on-track' || p.status === 'active').length;
    const atRisk = projectsData.filter(p => p.status === 'at-risk').length;
    const delayed = projectsData.filter(p => p.status === 'delayed').length;
    const completed = projectsData.filter(p => p.status === 'completed').length;
    
    setStats({ total, onTrack, atRisk, delayed, completed });
  };

  const loadMockData = () => {
    const mockProjects = [
      { 
        id: 1, 
        name: 'API Gateway', 
        description: 'Upgrade API infrastructure', 
        progress: 75, 
        status: 'on-track', 
        department: 'Core Systems', 
        dueDate: '2026-06-10', 
        tasks: { completed: 34, total: 45 },
        lead: 'Mike Johnson'
      },
      { 
        id: 2, 
        name: 'Database Migration', 
        description: 'Migrate to new database system', 
        progress: 45, 
        status: 'at-risk', 
        department: 'Platform and DevOps', 
        dueDate: '2026-07-15', 
        tasks: { completed: 18, total: 40 },
        lead: 'Ravi Das'
      },
      { 
        id: 3, 
        name: 'Security Audit', 
        description: 'Security compliance and audit', 
        progress: 30, 
        status: 'delayed', 
        department: 'Hardware & Integration', 
        dueDate: '2026-06-20', 
        tasks: { completed: 9, total: 32 },
        lead: 'Suresh M'
      },
      { 
        id: 4, 
        name: 'CI/CD Pipeline', 
        description: 'Automated deployment pipeline', 
        progress: 95, 
        status: 'completed', 
        department: 'Robotics & Simulation', 
        dueDate: '2026-05-15', 
        tasks: { completed: 28, total: 30 },
        lead: 'Nisha Kumar'
      },
      { 
        id: 5, 
        name: 'Frontend Redesign', 
        description: 'Complete UI overhaul', 
        progress: 65, 
        status: 'on-track', 
        department: 'AI/LLM & Perception', 
        dueDate: '2026-06-25', 
        tasks: { completed: 25, total: 38 },
        lead: 'Priya Sharma'
      }
    ];
    
    let filtered = mockProjects;
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(p => p.department === selectedDepartment);
    }
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setProjects(filtered);
    calculateStats(mockProjects);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const projectData = {
        ...formData,
        createdBy: currentUser?.id,
        createdAt: new Date().toISOString(),
        progress: 0,
        status: 'pending',
        tasks: { completed: 0, total: 0 }
      };
      
      if (!token || process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        const newProject = {
          id: projects.length + 1,
          ...formData,
          progress: 0,
          status: 'pending',
          tasks: { completed: 0, total: 0 },
          lead: formData.lead || currentUser?.name
        };
        setProjects([newProject, ...projects]);
        calculateStats([...projects, newProject]);
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          department: '',
          dueDate: '',
          priority: 'medium',
          budget: '',
          lead: ''
        });
        alert('Project created successfully!');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        const newProject = await response.json();
        setProjects([newProject, ...projects]);
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          department: '',
          dueDate: '',
          priority: 'medium',
          budget: '',
          lead: ''
        });
        alert('Project created successfully!');
      } else {
        throw new Error('Failed to create project');
      }
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'at-risk': 
        return <span className="px-2 py-1 bg-rose-100 text-rose-800 rounded-full text-xs flex items-center gap-1">⚠️ At Risk</span>;
      case 'delayed': 
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs flex items-center gap-1">⏰ Delayed</span>;
      case 'on-track': 
      case 'active': 
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs flex items-center gap-1">✓ On Track</span>;
      case 'completed': 
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center gap-1">✓ Completed</span>;
      default: 
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusOptions = ['All', 'on-track', 'at-risk', 'delayed', 'completed'];
  const departmentName = 'all departments';

  if (isLoading && projects.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Team Projects</h1>
        <p className="text-gray-500 mt-1">Manage and track projects across all departments</p>
        <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs">
          Manager View - All departments
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-sm text-gray-500">Total Projects</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 text-center">
          <p className="text-sm text-emerald-600">On Track</p>
          <p className="text-2xl font-bold text-emerald-700">{stats.onTrack}</p>
        </div>
        <div className="bg-rose-50 rounded-lg p-4 border border-rose-200 text-center">
          <p className="text-sm text-rose-600">At Risk</p>
          <p className="text-2xl font-bold text-rose-700">{stats.atRisk}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-center">
          <p className="text-sm text-amber-600">Delayed</p>
          <p className="text-2xl font-bold text-amber-700">{stats.delayed}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
          <p className="text-sm text-blue-600">Completed</p>
          <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input 
              type="text" 
              placeholder="Search team projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-rose-200 p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Projects</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchProjects} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
            📁
          </div>
          <p className="text-gray-500">No projects found for {departmentName}</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or create a new project</p>
        </div>
      ) : (
        /* Projects Table */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedProject(project)}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{project.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{project.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.lead || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${getProgressColor(project.progress)} rounded-full h-2 transition-all duration-500`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(project.dueDate)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {project.tasks?.completed || 0}/{project.tasks?.total || 0}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 text-sm hover:text-blue-700">View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedProject.name}</h2>
              <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <p className="text-gray-600 mt-2">{selectedProject.description}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">Department: <span className="font-medium">{selectedProject.department}</span></p>
              <p className="text-sm text-gray-600">Project Lead: <span className="font-medium">{selectedProject.lead || 'Not assigned'}</span></p>
              <p className="text-sm text-gray-600">Due Date: <span className="font-medium">{formatDate(selectedProject.dueDate)}</span></p>
              <p className="text-sm text-gray-600">Progress: <span className="font-medium">{selectedProject.progress}%</span></p>
              <p className="text-sm text-gray-600">Tasks: <span className="font-medium">{selectedProject.tasks?.completed || 0}/{selectedProject.tasks?.total || 0} completed</span></p>
              <div className="mt-3 pt-3 border-t">
                {getStatusBadge(selectedProject.status)}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-lg max-w-md w-full mx-4 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Select any department for this project</p>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Project description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Lead</label>
                <input
                  type="text"
                  value={formData.lead}
                  onChange={(e) => setFormData({...formData, lead: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Assign project lead"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
