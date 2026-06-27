// src/utils/validators.js
// Dynamic validators that can fetch rules from API

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Cache for validation rules
let validationRulesCache = null;

export const getValidationRules = async () => {
  if (validationRulesCache) return validationRulesCache;
  
  try {
    const response = await fetch(`${API_BASE_URL}/constants/validation-rules`);
    if (response.ok) {
      validationRulesCache = await response.json();
      return validationRulesCache;
    }
  } catch (error) {
    console.log('Using default validation rules');
  }
  
  // Default validation rules
  validationRulesCache = {
    email: { regex: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Invalid email format' },
    password: { minLength: 8, requireUppercase: true, requireLowercase: true, requireNumber: true, requireSpecial: true },
    name: { minLength: 2, maxLength: 100 },
    phone: { minLength: 10, maxLength: 15 }
  };
  return validationRulesCache;
};

// Email Validation
export const isValidEmail = async (email) => {
  if (!email) return false;
  const rules = await getValidationRules();
  const regex = new RegExp(rules.email.regex);
  return regex.test(email);
};

// Password Validation
export const isValidPassword = async (password) => {
  if (!password) return false;
  const rules = await getValidationRules();
  
  if (password.length < rules.password.minLength) return false;
  if (rules.password.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (rules.password.requireLowercase && !/[a-z]/.test(password)) return false;
  if (rules.password.requireNumber && !/[0-9]/.test(password)) return false;
  if (rules.password.requireSpecial && !/[!@#$%^&*]/.test(password)) return false;
  
  return true;
};

export const getPasswordStrength = async (password) => {
  if (!password) return { score: 0, label: 'Very Weak', requirements: [] };
  
  const rules = await getValidationRules();
  const requirements = [];
  let score = 0;
  
  if (password.length >= (rules.password.minLength || 8)) {
    score++;
  } else {
    requirements.push(`At least ${rules.password.minLength || 8} characters`);
  }
  
  if (/[a-z]/.test(password)) {
    score++;
  } else {
    requirements.push('One lowercase letter');
  }
  
  if (/[A-Z]/.test(password)) {
    score++;
  } else {
    requirements.push('One uppercase letter');
  }
  
  if (/[0-9]/.test(password)) {
    score++;
  } else {
    requirements.push('One number');
  }
  
  if (/[!@#$%^&*]/.test(password)) {
    score++;
  } else {
    requirements.push('One special character (!@#$%^&*)');
  }
  
  const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: levels[score] || 'Very Weak', requirements };
};

// Phone Validation
export const isValidPhone = async (phone) => {
  if (!phone) return true; // Phone is optional
  const rules = await getValidationRules();
  const phoneRegex = /^\+?[\d\s-]{10,15}$/;
  return phoneRegex.test(phone);
};

// Name Validation
export const isValidName = async (name) => {
  if (!name) return false;
  const rules = await getValidationRules();
  const trimmed = name.trim();
  return trimmed.length >= rules.name.minLength && trimmed.length <= rules.name.maxLength;
};

// Date Validation
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

export const isDateInPast = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Leave Validation (dynamic based on API)
export const validateLeaveRequest = async (startDate, endDate, leaveType, userId) => {
  const errors = [];
  
  if (!startDate || !endDate) {
    errors.push('Start date and end date are required');
    return { isValid: false, errors };
  }
  
  if (isDateInPast(startDate)) {
    errors.push('Start date cannot be in the past');
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) {
    errors.push('Start date must be before end date');
  }
  
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Fetch leave balance from API
  try {
    const response = await fetch(`${API_BASE_URL}/leaves/balance/${userId}`);
    if (response.ok) {
      const balance = await response.json();
      if (balance[leaveType] < days) {
        errors.push(`Insufficient ${leaveType} leave balance. Available: ${balance[leaveType]} days`);
      }
    }
  } catch (error) {
    console.log('Could not verify leave balance');
  }
  
  return { isValid: errors.length === 0, errors, days };
};

// Generic form validator
export const validateForm = async (data, rules) => {
  const errors = {};
  
  for (const [field, validations] of Object.entries(rules)) {
    const value = data[field];
    
    for (const validation of validations) {
      let isValid = true;
      let errorMessage = '';
      
      switch (validation.type) {
        case 'required':
          isValid = value && value.toString().trim() !== '';
          errorMessage = validation.message || `${field} is required`;
          break;
        case 'email':
          isValid = await isValidEmail(value);
          errorMessage = validation.message || 'Invalid email format';
          break;
        case 'minLength':
          isValid = value && value.length >= validation.value;
          errorMessage = validation.message || `${field} must be at least ${validation.value} characters`;
          break;
        case 'maxLength':
          isValid = value && value.length <= validation.value;
          errorMessage = validation.message || `${field} cannot exceed ${validation.value} characters`;
          break;
        case 'pattern':
          const regex = new RegExp(validation.value);
          isValid = regex.test(value);
          errorMessage = validation.message || `Invalid ${field} format`;
          break;
      }
      
      if (!isValid) {
        errors[field] = errorMessage;
        break;
      }
    }
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};