// src/services/roadmapService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const roadmapService = {
  // Get all roadmaps
  getAllRoadmaps: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/roadmaps`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      return [];
    }
  },

  // Get shared roadmaps
  getSharedRoadmaps: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/roadmaps/shared`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching shared roadmaps:', error);
      return [];
    }
  },

  // Get roadmaps by department
  getRoadmapsByDepartment: async (department) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/roadmaps/department/${department}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching department roadmaps:', error);
      return [];
    }
  },

  // Create new roadmap
  createRoadmap: async (roadmapData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/roadmaps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roadmapData),
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error creating roadmap:', error);
      return null;
    }
  },

  // Share roadmap
  shareRoadmap: async (roadmapId, recipients) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipients }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error sharing roadmap:', error);
      return false;
    }
  },
};

export default roadmapService;