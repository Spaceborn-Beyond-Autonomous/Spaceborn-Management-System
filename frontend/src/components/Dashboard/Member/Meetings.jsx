// src/components/Dashboard/CEO/Meetings.js (and for other roles)
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const Meetings = ({ userRole = 'CEO' }) => {
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, my-meetings
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    department: '',
    date: '',
    time: '',
    duration: '1 hour',
    description: '',
    meetingLink: ''
  });
const safeMeetings = scheduledMeetings || [];
  // Available departments for filtering
  const departments = ['Platform and DevOps', 'Core Systems', 'Hardware & Integration', 'Robotics & Simulation', 'AI/LLM & Perception', 'All'];

  // Fetch meetings from API
  useEffect(() => {
    fetchMeetings();
  }, [filter, departmentFilter]);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token) {
        console.error('No authentication token found');
        if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
          loadMockData();
        }
        setIsLoading(false);
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      
      const response = await fetch(`${API_BASE_URL}/meetings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
  const data = await response.json();
  const meetings = Array.isArray(data) ? data : (data.data || data.meetings || []);
  setScheduledMeetings(meetings);
} else {
        throw new Error('Failed to fetch meetings');
      }
      
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings');
      
      // If API fails and mock mode is enabled, load mock data
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const loadMockData = () => {
    const currentUser = authService.getCurrentUser();
    const userDept = currentUser?.department || 'Core Systems';
    
    const mockMeetings = [
      { 
        id: 1, 
        title: 'Q2 Sprint Planning', 
        department: 'Core Systems', 
        createdBy: 'Priya Sharma',
        createdById: 1,
        date: '2026-06-05', 
        time: '10:00 AM',
        duration: '1 hour',
        description: 'Plan the Q2 sprint goals and tasks',
        meetingLink: 'https://meet.google.com/abc-def-ghi',
        status: 'upcoming',
        attendees: ['Ravi Das', 'Priya Sharma', 'Mike Johnson'],
        createdAt: '2026-05-28T10:00:00Z'
      },
      { 
        id: 2, 
        title: 'Hardware & Integration System Review', 
        department: 'Hardware & Integration', 
        createdBy: 'John Doe',
        createdById: 2,
        date: '2026-06-06', 
        time: '2:00 PM',
        duration: '45 min',
        description: 'Review the new design system components',
        meetingLink: 'https://meet.google.com/def-ghi-jkl',
        status: 'upcoming',
        attendees: ['Anil Mehta', 'Pooja B', 'John Doe'],
        createdAt: '2026-05-29T14:00:00Z'
      },
      { 
        id: 3, 
        title: 'All-Hands Q2 Review', 
        department: 'All', 
        createdBy: 'John Doe',
        createdById: 2,
        date: '2026-06-10', 
        time: '11:00 AM',
        duration: '1.5 hours',
        description: 'Company-wide Q2 review and Q3 planning',
        meetingLink: 'https://meet.google.com/ghi-jkl-mno',
        status: 'upcoming',
        attendees: ['All Employees'],
        createdAt: '2026-05-20T09:00:00Z'
      },
      { 
        id: 4, 
        title: 'AI/LLM & Perception Campaign Kickoff', 
        department: 'AI/LLM & Perception', 
        createdBy: 'Sita Krishnan',
        createdById: 4,
        date: '2026-06-07', 
        time: '3:30 PM',
        duration: '1 hour',
        description: 'Kickoff the new marketing campaign',
        meetingLink: 'https://meet.google.com/jkl-mno-pqr',
        status: 'upcoming',
        attendees: ['Sita Krishnan', 'AI/LLM & Perception Team'],
        createdAt: '2026-05-30T11:00:00Z'
      }
    ];
    
    // Filter by department if needed
    let filtered = mockMeetings;
    if (departmentFilter !== 'all') {
      filtered = mockMeetings.filter(m => m.department === departmentFilter || m.department === 'All');
    }
    
    setScheduledMeetings(filtered);
  };

  // Create new meeting
  const createMeeting = async (e) => {
    e.preventDefault();
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const meetingData = {
        ...newMeeting,
        createdBy: currentUser.name,
        createdById: currentUser.id,
        status: 'upcoming',
        createdAt: new Date().toISOString()
      };
      
      const response = await fetch(`${API_BASE_URL}/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });
      
      if (response.ok) {
        const created = await response.json();
        setScheduledMeetings([created, ...(scheduledMeetings || [])]);
        setShowCreateModal(false);
        setNewMeeting({
          title: '',
          department: '',
          date: '',
          time: '',
          duration: '1 hour',
          description: '',
          meetingLink: ''
        });
      } else {
        throw new Error('Failed to create meeting');
      }
      
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    }
  };

  // Join meeting
  const joinMeeting = (meetingLink) => {
    if (meetingLink && meetingLink !== '#') {
      window.open(meetingLink, '_blank');
    } else {
      alert('Meeting link not available. Please check back later.');
    }
  };

  // Delete meeting (for CEO and Managers)
  // Delete meeting (CEO, Manager can delete)
const deleteMeeting = async (meetingId) => {
  if (!window.confirm('Are you sure you want to delete this meeting?')) return;
  
  // Get token
  const token = authService.getToken();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // Delete locally FIRST (instant UI update)
  const currentMeetings = scheduledMeetings || [];
  const updatedMeetings = currentMeetings.filter(m => m.id !== meetingId);
  setScheduledMeetings(updatedMeetings);
  
  // Try API delete in background (won't block UI)
  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        alert('Meeting deleted successfully');
      } else {
        // API failed but we already deleted locally
        console.log('Deleted locally (API error)');
      }
    } catch (error) {
      console.log('Deleted locally only');
    }
  } else {
    alert('Meeting deleted');
  }
};

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const canCreateMeeting = () => {
    return userRole === 'CEO' || userRole === 'Manager' || userRole === 'Team Lead';
  };

  const canDeleteMeeting = () => {
    return userRole === 'CEO' || userRole === 'Manager';
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-500 mt-1">Schedule and join team meetings</p>
        </div>
        {canCreateMeeting() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Schedule Meeting</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Meetings</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="my-meetings">My Meetings</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.filter(d => d !== 'All').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      {error && scheduledMeetings.length === 0 ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Meetings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchMeetings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Scheduled meetings ({scheduledMeetings.length})
          </h2>
          
          {scheduledMeetings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">No meetings found</p>
              {canCreateMeeting() && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Schedule your first meeting →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledMeetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                        {meeting.department === 'All' && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            All-Hands
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        For {meeting.department} · By {meeting.createdBy}
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-sm text-gray-600">
                          📅 {formatDate(meeting.date)} at {meeting.time}
                        </span>
                        {meeting.duration && (
                          <span className="text-sm text-gray-600">
                            ⏱️ {meeting.duration}
                          </span>
                        )}
                      </div>
                      {meeting.description && (
                        <p className="text-sm text-gray-500 mt-2">{meeting.description}</p>
                      )}
                      {meeting.attendees && meeting.attendees.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-400">
                            Attendees: {meeting.attendees.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => joinMeeting(meeting.meetingLink)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Join meeting
                      </button>
                      {canDeleteMeeting() && (
                        <button
                          onClick={() => deleteMeeting(meeting.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete meeting"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Schedule New Meeting</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={createMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Sprint Planning"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  required
                  value={newMeeting.department}
                  onChange={(e) => setNewMeeting({...newMeeting, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select department</option>
                  <option value="All">All Departments (All-Hands)</option>
                  {departments.filter(d => d !== 'All').map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={newMeeting.duration}
                  onChange={(e) => setNewMeeting({...newMeeting, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option>15 min</option>
                  <option>30 min</option>
                  <option>45 min</option>
                  <option>1 hour</option>
                  <option>1.5 hours</option>
                  <option>2 hours</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={newMeeting.meetingLink}
                  onChange={(e) => setNewMeeting({...newMeeting, meetingLink: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="https://meet.google.com/..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newMeeting.description}
                  onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Meeting agenda, goals, etc."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;