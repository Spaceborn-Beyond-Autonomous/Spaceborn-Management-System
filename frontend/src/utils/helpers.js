// src/utils/helpers.js
// Universal helpers that work with any data source

// Storage Helpers (browser only)
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return localStorage.getItem(key);
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

// Object Helpers
export const deepClone = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return { ...obj };
  }
};

export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim() === '';
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// Array Helpers
export const groupBy = (array, key) => {
  if (!array || !Array.isArray(array)) return {};
  return array.reduce((result, item) => {
    const groupKey = item?.[key];
    if (groupKey !== undefined && groupKey !== null) {
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
    }
    return result;
  }, {});
};

export const sortBy = (array, key, ascending = true) => {
  if (!array || !Array.isArray(array)) return [];
  return [...array].sort((a, b) => {
    const aVal = a?.[key];
    const bVal = b?.[key];
    if (aVal === undefined && bVal === undefined) return 0;
    if (aVal === undefined) return 1;
    if (bVal === undefined) return -1;
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
};

// Dynamic Color Helpers (based on data, not hardcoded)
export const getColorByValue = (value, colorMap) => {
  if (!value) return 'bg-gray-100 text-gray-700';
  if (colorMap && colorMap[value]) return colorMap[value];
  return 'bg-gray-100 text-gray-700';
};

export const getRoleColor = (role) => {
  // This can be extended from API, but has fallback
  const defaultColors = {
    'CEO': 'bg-purple-100 text-purple-700',
    'Manager': 'bg-blue-100 text-blue-700',
    'Team Lead': 'bg-green-100 text-green-700',
    'Lead': 'bg-green-100 text-green-700',
    'Member': 'bg-gray-100 text-gray-700',
    'HR': 'bg-pink-100 text-pink-700'
  };
  return defaultColors[role] || 'bg-gray-100 text-gray-700';
};

export const getPriorityColor = (priority) => {
  const defaultColors = {
    'High': 'bg-red-100 text-red-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Low': 'bg-gray-100 text-gray-700'
  };
  return defaultColors[priority] || 'bg-gray-100 text-gray-700';
};

// Async color map fetcher
export const fetchColorMap = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/constants/colors/${type}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log(`Using default colors for ${type}`);
  }
  return null;
};

// ID Generation (client-side, for optimistic updates)
export const generateTempId = () => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Download Helpers
export const downloadFile = (content, filename, type = 'text/plain') => {
  try {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, filename, 'application/json');
};

// URL Helpers
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

export const buildQueryString = (params) => {
  if (!params) return '';
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
};