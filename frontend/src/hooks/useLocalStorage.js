// Local storage hook - manages localStorage with state sync
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get stored value
  const getStoredValue = () => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(getStoredValue);

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, storedValue]);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

export const useLocalStorageObject = (key, initialObject = {}) => {
  const [data, setData, clearData] = useLocalStorage(key, initialObject);

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const getField = (field) => {
    return data[field];
  };

  const resetToDefault = () => {
    setData(initialObject);
  };

  return { data, setData, updateField, getField, clearData, resetToDefault };
};

export default useLocalStorage;