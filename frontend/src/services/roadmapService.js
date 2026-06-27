// src/services/roadmapService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

const getErrorMessage = async (response, fallback) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const error = await response.json();
    return error.message || fallback;
  }

  const text = await response.text();
  const htmlTitle = text.match(/<pre>(.*?)<\/pre>/i)?.[1] || text.match(/<title>(.*?)<\/title>/i)?.[1];
  return htmlTitle || `${fallback} (${response.status})`;
};

const roadmapService = {
  // Get all roadmaps with filters
  getAllRoadmaps: async (filters = {}) => {
    try {
      const token = getToken();
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `${API_BASE_URL}/roadmaps?${queryParams}` : `${API_BASE_URL}/roadmaps`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      return [];
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      return [];
    }
  },

  // Get shared roadmaps (for CEO and Manager)
  getSharedRoadmaps: async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps?status=shared`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      return [];
    } catch (error) {
      console.error('Error fetching shared roadmaps:', error);
      return [];
    }
  },

  // Get single roadmap by ID
  getRoadmapById: async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      return null;
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      return null;
    }
  },

  // Create new roadmap
  createRoadmap: async (roadmapData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roadmapData),
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to create roadmap');
    } catch (error) {
      console.error('Error creating roadmap:', error);
      throw error;
    }
  },

  // Update roadmap
  updateRoadmap: async (id, roadmapData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roadmapData),
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to update roadmap');
    } catch (error) {
      console.error('Error updating roadmap:', error);
      throw error;
    }
  },

  // Delete roadmap
  deleteRoadmap: async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      return false;
    }
  },

  // Update progress
  updateProgress: async (id, progressData) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${id}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to update progress');
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Share roadmap with CEO and Manager
  shareRoadmap: async (roadmapId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to share roadmap');
    } catch (error) {
      console.error('Error sharing roadmap:', error);
      throw error;
    }
  },

  // Get roadmap statistics
  getRoadmapStats: async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      return {
        totalRoadmaps: 0,
        activeRoadmaps: 0,
        avgProgress: 0,
        totalMilestones: 0,
        completedMilestones: 0,
        totalFeatures: 0,
        completedFeatures: 0,
        totalRisks: 0,
        highImpactRisks: 0
      };
    } catch (error) {
      console.error('Error fetching roadmap stats:', error);
      return {
        totalRoadmaps: 0,
        activeRoadmaps: 0,
        avgProgress: 0,
        totalMilestones: 0,
        completedMilestones: 0,
        totalFeatures: 0,
        completedFeatures: 0,
        totalRisks: 0,
        highImpactRisks: 0
      };
    }
  },

  // Download roadmap report
  downloadRoadmap: async (id) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      return null;
    } catch (error) {
      console.error('Error downloading roadmap:', error);
      return null;
    }
  },

  // Upload attachment
  uploadAttachment: async (roadmapId, file) => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      throw new Error(await getErrorMessage(response, 'Failed to upload attachment'));
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  },

  // Delete attachment
  deleteAttachment: async (roadmapId, attachmentId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      return false;
    }
  },

  // Download attachment
  downloadAttachment: async (roadmapId, attachmentId, fileName) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}/attachments/${attachmentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error downloading attachment:', error);
      return false;
    }
  },

  // Get roadmaps by department
  getRoadmapsByDepartment: async (department) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps?department=${department}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      return [];
    } catch (error) {
      console.error('Error fetching department roadmaps:', error);
      return [];
    }
  },

  // Add comment to roadmap
  addComment: async (roadmapId, message) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
      return null;
    } catch (error) {
      console.error('Error adding comment:', error);
      return null;
    }
  },

  // Get roadmaps with filters (status, search, etc.)
  getFilteredRoadmaps: async (filters) => {
    try {
      const token = getToken();
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/roadmaps?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        return {
          data: result.data || result,
          pagination: result.pagination
        };
      }
      return { data: [], pagination: null };
    } catch (error) {
      console.error('Error fetching filtered roadmaps:', error);
      return { data: [], pagination: null };
    }
  }
};

export default roadmapService;
