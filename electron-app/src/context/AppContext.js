import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/apiService';

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  ADD_SEARCH_RESULT: 'ADD_SEARCH_RESULT',
  SET_ACTIVE_SEARCH: 'SET_ACTIVE_SEARCH',
  SET_SEARCH_HISTORY: 'SET_SEARCH_HISTORY',
  SET_USER_PREFERENCES: 'SET_USER_PREFERENCES',
  SET_SESSION: 'SET_SESSION',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_TOOLS_STATUS: 'SET_TOOLS_STATUS',
  UPDATE_TOOL_STATUS: 'UPDATE_TOOL_STATUS',
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  searchResults: [],
  activeSearch: null,
  searchHistory: [],
  userPreferences: {
    theme: 'dark',
    autoSave: true,
    maxResults: 100,
    enableNotifications: true,
    defaultSearchTypes: ['people', 'social', 'domain'],
    confidenceThreshold: 0.5,
  },
  session: {
    id: null,
    startTime: null,
    searchCount: 0,
    toolsUsed: [],
  },
  notifications: [],
  toolsStatus: {
    sherlock: 'unknown',
    maigret: 'unknown',
    socialscan: 'unknown',
    holehe: 'unknown',
    theharvester: 'unknown',
    photon: 'unknown',
    sublist3r: 'unknown',
    amass: 'unknown',
    nmap: 'unknown',
    nuclei: 'unknown',
  },
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case ACTIONS.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };
    
    case ACTIONS.ADD_SEARCH_RESULT:
      return { 
        ...state, 
        searchResults: [...state.searchResults, action.payload] 
      };
    
    case ACTIONS.SET_ACTIVE_SEARCH:
      return { ...state, activeSearch: action.payload };
    
    case ACTIONS.SET_SEARCH_HISTORY:
      return { ...state, searchHistory: action.payload };
    
    case ACTIONS.SET_USER_PREFERENCES:
      return { 
        ...state, 
        userPreferences: { ...state.userPreferences, ...action.payload } 
      };
    
    case ACTIONS.SET_SESSION:
      return { ...state, session: action.payload };
    
    case ACTIONS.SET_NOTIFICATIONS:
      return { ...state, notifications: action.payload };
    
    case ACTIONS.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload] 
      };
    
    case ACTIONS.REMOVE_NOTIFICATION:
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload) 
      };
    
    case ACTIONS.SET_TOOLS_STATUS:
      return { ...state, toolsStatus: action.payload };
    
    case ACTIONS.UPDATE_TOOL_STATUS:
      return { 
        ...state, 
        toolsStatus: { 
          ...state.toolsStatus, 
          [action.payload.tool]: action.payload.status 
        } 
      };
    
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
    checkToolsStatus();
  }, []);

  // Actions
  const setLoading = (loading) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
    dispatch({ type: ACTIONS.SET_ERROR, payload: errorMessage });
    addNotification({
      type: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  const setSearchResults = (results) => {
    dispatch({ type: ACTIONS.SET_SEARCH_RESULTS, payload: results });
  };

  const addSearchResult = (result) => {
    dispatch({ type: ACTIONS.ADD_SEARCH_RESULT, payload: result });
  };

  const setActiveSearch = (search) => {
    dispatch({ type: ACTIONS.SET_ACTIVE_SEARCH, payload: search });
  };

  const setUserPreferences = (preferences) => {
    dispatch({ type: ACTIONS.SET_USER_PREFERENCES, payload: preferences });
    // Save to localStorage
    localStorage.setItem('infoscape-preferences', JSON.stringify({
      ...state.userPreferences,
      ...preferences
    }));
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    const notificationWithId = { ...notification, id };
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notificationWithId });
    
    // Auto-remove notification after 5 seconds for non-error types
    if (notification.type !== 'error') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  };

  const removeNotification = (id) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const updateToolStatus = (tool, status) => {
    dispatch({ type: ACTIONS.UPDATE_TOOL_STATUS, payload: { tool, status } });
  };

  // API wrapper functions
  const performPeopleSearch = async (query, options = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await apiService.searchPeople({
        query: query,
        ...options
      });
      
      if (response.success) {
        const searchResult = {
          type: 'people',
          query,
          results: response.data,
          timestamp: new Date().toISOString(),
          confidence: response.confidence || response.data.confidence || 0.5,
        };
        
        addSearchResult(searchResult);
        
        addNotification({
          type: 'success',
          message: `People search completed: ${response.data.total_results || 'Multiple'} results found`,
          timestamp: new Date().toISOString(),
        });
        
        return response.data;
      } else {
        throw new Error(response.error || 'People search failed');
      }
    } catch (error) {
      console.error('People search error in context:', error);
      
      // Don't throw error immediately, try to show user-friendly message
      addNotification({
        type: 'warning',
        message: error.message || 'Search completed with limited results (backend unavailable)',
        timestamp: new Date().toISOString(),
      });
      
      // If we have demo data from the API service, return it
      if (error.response || error.data) {
        return error.response || error.data;
      }
      
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const performReverseSearch = async (identifier, type, options = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await apiService.reverseSearch(identifier, type, options);
      
      if (response.success) {
        addSearchResult({
          type: 'reverse',
          query: { identifier, type },
          results: response.data,
          timestamp: new Date().toISOString(),
          confidence: response.confidence || 0.5,
        });
        
        addNotification({
          type: 'success',
          message: `Reverse search completed: ${response.data.length} results found`,
          timestamp: new Date().toISOString(),
        });
        
        return response.data;
      } else {
        throw new Error(response.error || 'Reverse search failed');
      }
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const performSocialIntelligence = async (target, platforms = [], options = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await apiService.socialIntelligence(target, platforms, options);
      
      if (response.success) {
        addSearchResult({
          type: 'social',
          query: { target, platforms },
          results: response.data,
          timestamp: new Date().toISOString(),
          confidence: response.confidence || 0.5,
        });
        
        addNotification({
          type: 'success',
          message: `Social intelligence completed: ${response.data.profiles?.length || 0} profiles found`,
          timestamp: new Date().toISOString(),
        });
        
        return response.data;
      } else {
        throw new Error(response.error || 'Social intelligence failed');
      }
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const performDomainIntelligence = async (domain, options = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await apiService.domainIntelligence(domain, options);
      
      if (response.success) {
        addSearchResult({
          type: 'domain',
          query: domain,
          results: response.data,
          timestamp: new Date().toISOString(),
          confidence: response.confidence || 0.5,
        });
        
        addNotification({
          type: 'success',
          message: `Domain intelligence completed for ${domain}`,
          timestamp: new Date().toISOString(),
        });
        
        return response.data;
      } else {
        throw new Error(response.error || 'Domain intelligence failed');
      }
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const runTool = async (toolName, target, options = {}) => {
    try {
      setLoading(true);
      clearError();
      
      updateToolStatus(toolName, 'running');
      
      const response = await apiService.runTool(toolName, target, options);
      
      if (response.success) {
        updateToolStatus(toolName, 'completed');
        
        addNotification({
          type: 'success',
          message: `${toolName} completed successfully`,
          timestamp: new Date().toISOString(),
        });
        
        return response.data;
      } else {
        updateToolStatus(toolName, 'error');
        throw new Error(response.error || `${toolName} execution failed`);
      }
    } catch (error) {
      updateToolStatus(toolName, 'error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (searchIds, format = 'json', options = {}) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await apiService.generateReport(searchIds, format, options);
      
      if (response.success) {
        addNotification({
          type: 'success',
          message: `Report generated successfully in ${format} format`,
          timestamp: new Date().toISOString(),
        });
        
        return response.data;
      } else {
        throw new Error(response.error || 'Report generation failed');
      }
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const initializeSession = async () => {
    try {
      const response = await apiService.createSession();
      if (response.success) {
        dispatch({ 
          type: ACTIONS.SET_SESSION, 
          payload: {
            id: response.data.session_id,
            startTime: new Date().toISOString(),
            searchCount: 0,
            toolsUsed: [],
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }

    // Load preferences from localStorage
    try {
      const savedPreferences = localStorage.getItem('infoscape-preferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        dispatch({ type: ACTIONS.SET_USER_PREFERENCES, payload: preferences });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const checkToolsStatus = async () => {
    try {
      const response = await apiService.getSystemHealth();
      if (response.success && response.data.tools) {
        dispatch({ type: ACTIONS.SET_TOOLS_STATUS, payload: response.data.tools });
      }
    } catch (error) {
      console.error('Failed to check tools status:', error);
    }
  };

  const exportSearchHistory = () => {
    const data = {
      searchHistory: state.searchResults,
      session: state.session,
      exportTime: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `infoscape-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addNotification({
      type: 'success',
      message: 'Search history exported successfully',
      timestamp: new Date().toISOString(),
    });
  };

  const clearSearchHistory = () => {
    setSearchResults([]);
    addNotification({
      type: 'info',
      message: 'Search history cleared',
      timestamp: new Date().toISOString(),
    });
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    setLoading,
    setError,
    clearError,
    setSearchResults,
    addSearchResult,
    setActiveSearch,
    setUserPreferences,
    addNotification,
    removeNotification,
    updateToolStatus,
    
    // API functions
    performPeopleSearch,
    performReverseSearch,
    performSocialIntelligence,
    performDomainIntelligence,
    runTool,
    generateReport,
    
    // Helper functions
    checkToolsStatus,
    exportSearchHistory,
    clearSearchHistory,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
