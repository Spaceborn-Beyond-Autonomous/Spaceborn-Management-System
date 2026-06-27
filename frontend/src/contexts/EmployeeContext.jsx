// src/contexts/EmployeeContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import employeeService from '../services/employeeService';

// Action types
const ACTIONS = {
  SET_EMPLOYEES: 'SET_EMPLOYEES',
  SET_SELECTED_EMPLOYEE: 'SET_SELECTED_EMPLOYEE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_STATS: 'SET_STATS',
  ADD_EMPLOYEE: 'ADD_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION'
};

// Initial state
const initialState = {
  employees: [],
  selectedEmployee: null,
  loading: false,
  error: null,
  stats: {
    total: 0,
    active: 0,
    onLeave: 0,
    ndaSigned: 0
  },
  filters: {
    department: 'All',
    status: 'All',
    searchTerm: '',
    role: 'All'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  }
};

// Reducer
const employeeReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_EMPLOYEES:
      return { ...state, employees: action.payload };
    case ACTIONS.SET_SELECTED_EMPLOYEE:
      return { ...state, selectedEmployee: action.payload };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_STATS:
      return { ...state, stats: action.payload };
    case ACTIONS.ADD_EMPLOYEE:
      return { ...state, employees: [action.payload, ...state.employees] };
    case ACTIONS.UPDATE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.map(emp =>
          emp.id === action.payload.id ? action.payload : emp
        ),
        selectedEmployee: state.selectedEmployee?.id === action.payload.id ? action.payload : state.selectedEmployee
      };
    case ACTIONS.DELETE_EMPLOYEE:
      return {
        ...state,
        employees: state.employees.filter(emp => emp.id !== action.payload)
      };
    case ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case ACTIONS.SET_PAGINATION:
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    default:
      return state;
  }
};

// Context
const EmployeeContext = createContext();

// Provider
export const EmployeeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(employeeReducer, initialState);

  // Load employees with current filters
  const loadEmployees = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    
    try {
      const { page, limit } = state.pagination;
      const { department, status, searchTerm, role } = state.filters;
      
      const filters = {};
      if (department !== 'All') filters.department = department;
      if (status !== 'All') filters.status = status;
      if (role !== 'All') filters.role = role;
      if (searchTerm) filters.search = searchTerm;
      
      const response = await employeeService.getAllEmployees(page, limit, filters);
      
      dispatch({ type: ACTIONS.SET_EMPLOYEES, payload: response.data || response });
      dispatch({ type: ACTIONS.SET_PAGINATION, payload: {
        total: response.total || response.data?.length || 0,
        pages: response.pages || 1
      } });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.pagination.page, state.pagination.limit, state.filters]);

  // Load employee statistics
  const loadStats = useCallback(async () => {
    try {
      const stats = await employeeService.getEmployeeStats();
      dispatch({ type: ACTIONS.SET_STATS, payload: stats });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, []);

  // Load single employee
  const loadEmployee = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const employee = await employeeService.getEmployeeById(id);
      dispatch({ type: ACTIONS.SET_SELECTED_EMPLOYEE, payload: employee });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Create employee
  const createEmployee = useCallback(async (employeeData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const newEmployee = await employeeService.createEmployee(employeeData);
      dispatch({ type: ACTIONS.ADD_EMPLOYEE, payload: newEmployee });
      await loadStats();
      return newEmployee;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [loadStats]);

  // Update employee
  const updateEmployee = useCallback(async (id, employeeData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      const updated = await employeeService.updateEmployee(id, employeeData);
      dispatch({ type: ACTIONS.UPDATE_EMPLOYEE, payload: updated });
      await loadStats();
      return updated;
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [loadStats]);

  // Delete employee
  const deleteEmployee = useCallback(async (id) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    try {
      await employeeService.deleteEmployee(id);
      dispatch({ type: ACTIONS.DELETE_EMPLOYEE, payload: id });
      await loadEmployees();
      await loadStats();
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [loadEmployees, loadStats]);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  // Set pagination
  const setPagination = useCallback((pagination) => {
    dispatch({ type: ACTIONS.SET_PAGINATION, payload: pagination });
  }, []);

  // Clear selected employee
  const clearSelectedEmployee = useCallback(() => {
    dispatch({ type: ACTIONS.SET_SELECTED_EMPLOYEE, payload: null });
  }, []);

  const value = {
    ...state,
    loadEmployees,
    loadStats,
    loadEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    setFilters,
    setPagination,
    clearSelectedEmployee
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

// Custom hook
export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within EmployeeProvider');
  }
  return context;
};