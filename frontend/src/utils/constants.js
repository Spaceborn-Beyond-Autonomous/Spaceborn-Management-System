// src/utils/constants.js
// Dynamic constants that can be fetched from API

export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// These can be fetched from API, but have fallbacks
export const getRoles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/constants/roles`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Using default roles');
  }
  // Fallback roles - can be overridden by API
  return {
    CEO: 'CEO',
    MANAGER: 'Manager',
    TEAM_LEAD: 'Team Lead',
    MEMBER: 'Member',
    HR: 'Robotics & Simulation'
  };
};

export const getLeaveTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/constants/leave-types`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Using default leave types');
  }
  return ['Sick', 'Casual', 'Annual', 'Emergency', 'Other'];
};

export const getTaskStatuses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/constants/task-statuses`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Using default task statuses');
  }
  return ['Todo', 'In Progress', 'Review', 'Completed'];
};

export const getDepartments = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Using default departments');
  }
  return [];
};

// Session constants (configurable via API)
export const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours default

// Regex patterns (universal, not hardcoded to specific format)
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[\d\s-]{10,}$/;