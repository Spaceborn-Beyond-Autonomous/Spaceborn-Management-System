// src/utils/formatters.js
// Dynamic formatters that work with any data format

// Date Formatters - universal
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const defaultOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(
      navigator.language || 'en-US', 
      { ...defaultOptions, ...options }
    );
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString(navigator.language || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    const rtf = new Intl.RelativeTimeFormat(navigator.language || 'en', { numeric: 'auto' });
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return rtf.format(-diffMins, 'minute');
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    return rtf.format(-diffDays, 'day');
  } catch {
    return dateString;
  }
};

// Number Formatters - universal
export const formatNumber = (num, locale = null) => {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat(locale || navigator.language || 'en-US').format(num);
};

export const formatPercentage = (value, decimals = 0) => {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(decimals)}%`;
};

export const formatCurrency = (amount, currency = 'USD', locale = null) => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat(locale || navigator.language || 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Text Formatters - universal
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// File Formatters
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Dynamic formatter for any field
export const formatField = (value, type = 'text') => {
  if (value === undefined || value === null) return '—';
  
  switch (type) {
    case 'date':
      return formatDate(value);
    case 'datetime':
      return formatDateTime(value);
    case 'number':
      return formatNumber(value);
    case 'percentage':
      return formatPercentage(value);
    case 'currency':
      return formatCurrency(value);
    case 'truncate':
      return truncate(value);
    default:
      return value;
  }
};