// src/components/Dashboard/CEO/Meetings.jsx
import React, { useState, useEffect } from 'react';
import authService from '../../../services/authService';

const Meetings = ({ userRole = 'CEO' }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    date: '',
    time: '',
    meetingLink: '',
    description: '',
    duration: '1 hour'
  });

  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [departments, setDepartments] = useState([]);

  const departmentsList = ['Core Systems', 'Hardware & Integration', 'AI/LLM & Perception', 'Platform and DevOps', 'Robotics & Simulation', 'All'];
  const filterButtons = ['All', 'Core Systems', 'Hardware & Integration', 'AI/LLM & Perception'];

  useEffect(() => {
    fetchMeetings();
    fetchDepartments();
  }, [filterDepartment, filterStatus]);

  const fetchMeetings = async () => {
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
      if (filterDepartment !== 'All') params.append('department', filterDepartment);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      
      const response = await fetch(`${API_BASE_URL}/meetings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
  const responseData = await response.json();
  let meetings = [];
  if (responseData.success && responseData.data) {
    meetings = responseData.data;
  } else if (Array.isArray(responseData)) {
    meetings = responseData;
  }
  setScheduledMeetings(meetings);
} else {
        throw new Error('Failed to fetch meetings');
      }
      
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError('Failed to load meetings');
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        loadMockData();
      }
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
      setDepartments(['Core Systems', 'Hardware & Integration', 'AI/LLM & Perception', 'Platform and DevOps', 'Robotics & Simulation']);
    }
  };

  const loadMockData = () => {
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
        attendees: ['Ravi Das', 'Priya Sharma', 'Mike Johnson']
      },
      {
        id: 2,
        title: 'Design System Review',
        department: 'Hardware & Integration',
        createdBy: 'John Doe',
        createdById: 2,
        date: '2026-06-06',
        time: '2:00 PM',
        duration: '45 min',
        description: 'Review the new design system components',
        meetingLink: 'https://meet.google.com/def-ghi-jkl',
        status: 'upcoming',
        attendees: ['Anil Mehta', 'Pooja B', 'John Doe']
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
        attendees: ['All Employees']
      },
      {
        id: 4,
        title: 'Marketing Campaign Kickoff',
        department: 'AI/LLM & Perception',
        createdBy: 'Sita Krishnan',
        createdById: 4,
        date: '2026-06-07',
        time: '3:30 PM',
        duration: '1 hour',
        description: 'Kickoff the new marketing campaign',
        meetingLink: 'https://meet.google.com/jkl-mno-pqr',
        status: 'upcoming',
        attendees: ['Sita Krishnan', 'Marketing Team']
      }
    ];
    
    let filtered = mockMeetings;
    if (filterDepartment !== 'All') {
      filtered = mockMeetings.filter(m => m.department === filterDepartment || m.department === 'All');
    }
    
    setScheduledMeetings(filtered);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = authService.getToken();
      const currentUser = authService.getCurrentUser();
      
      if (!token) {
        alert('Please login to schedule a meeting');
        return;
      }

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const meetingData = {
        ...formData,
        createdBy: currentUser?.name || 'System',
        createdById: currentUser?.id,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
        attendees: []
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
        const newMeeting = await response.json();
        setScheduledMeetings([newMeeting, ...scheduledMeetings]);
        setFormData({
          title: '',
          department: '',
          date: '',
          time: '',
          meetingLink: '',
          description: '',
          duration: '1 hour'
        });
        setShowScheduleForm(false);
        alert(`Meeting "${formData.title}" scheduled successfully!`);
      } else {
        throw new Error('Failed to schedule meeting');
      }
      
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      
      if (process.env.REACT_APP_USE_MOCK_AUTH === 'true') {
        const newMeeting = {
          id: scheduledMeetings.length + 1,
          title: formData.title,
          department: formData.department,
          createdBy: authService.getCurrentUser()?.name || 'Current User',
          date: formData.date,
          time: formData.time,
          meetingLink: formData.meetingLink || '#',
          duration: formData.duration,
          description: formData.description,
          status: 'upcoming'
        };
        setScheduledMeetings([newMeeting, ...scheduledMeetings]);
        setFormData({
          title: '',
          department: '',
          date: '',
          time: '',
          meetingLink: '',
          description: '',
          duration: '1 hour'
        });
        setShowScheduleForm(false);
        alert(`Meeting "${formData.title}" scheduled! (Mock Mode)`);
      } else {
        alert('Failed to schedule meeting. Please try again.');
      }
    }
  };

  const joinMeeting = (link) => {
    if (link && link !== '#') {
      window.open(link, '_blank');
    } else {
      alert('Meeting link not available. Please check back later.');
    }
  };

  const deleteMeeting = async (meetingId) => {
  if (!window.confirm('Delete this meeting?')) return;
  
  const token = authService.getToken();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // DELETE LOCALLY FIRST - check both id and _id (MongoDB uses _id)
  const updatedMeetings = scheduledMeetings.filter(m => {
    const mid = m.id || m._id;
    return mid !== meetingId;
  });
  setScheduledMeetings(updatedMeetings);
  
  // Try API delete
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      alert('Meeting deleted');
    } catch (error) {
      console.log('Deleted locally');
    }
  }
};

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const canDeleteMeeting = () => {
    return userRole === 'CEO' || userRole === 'Manager';
  };

  if (isLoading && scheduledMeetings.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-500 mt-1">Schedule and manage team meetings</p>
        </div>
        <button
          onClick={() => setShowScheduleForm(!showScheduleForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{showScheduleForm ? 'Cancel' : 'Schedule Meeting'}</span>
        </button>
      </div>

      {/* Schedule a Meeting Section */}
      {showScheduleForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Schedule a meeting</h2>
          <p className="text-sm text-gray-500 mb-6">
            Send a meeting link to your department
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">MEETING TITLE *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Sprint Review"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DEPARTMENT *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select department</option>
                  {departmentsList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DURATION</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">DATE *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TIME *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">MEETING LINK</label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleInputChange}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">DESCRIPTION (Optional)</label>
                <textarea
                  rows="2"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Meeting agenda, goals, etc."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowScheduleForm(false)}
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
      )}

      {/* Filter Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Scheduled meetings ({scheduledMeetings.length})
        </h2>
        <div className="flex space-x-2">
          {filterButtons.map(btn => (
            <button
              key={btn}
              onClick={() => setFilterDepartment(btn)}
              className={`px-3 py-1 text-sm rounded-lg transition ${
                filterDepartment === btn
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && scheduledMeetings.length === 0 ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Meetings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchMeetings} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Try Again</button>
        </div>
      ) : scheduledMeetings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-lg">No meetings found</p>
          <p className="text-gray-400 text-sm mt-2">
            {filterDepartment !== 'All' ? `No meetings for ${filterDepartment} department` : 'Schedule your first meeting'}
          </p>
        </div>
      ) : (
        /* Meetings List */
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
                      onClick={() => deleteMeeting(meeting.id || meeting._id)}
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
  );
};

export default Meetings;