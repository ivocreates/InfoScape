import { useState, useCallback, useContext, createContext } from 'react';

const BrowserAlertContext = createContext();

export const useBrowserAlert = () => {
  const context = useContext(BrowserAlertContext);
  if (!context) {
    throw new Error('useBrowserAlert must be used within a BrowserAlertProvider');
  }
  return context;
};

export const BrowserAlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((options) => {
    const id = Date.now().toString();
    const alert = {
      id,
      ...options,
      isOpen: true
    };
    
    setAlerts(prev => [...prev, alert]);
    
    return id;
  }, []);

  const hideAlert = useCallback((id) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isOpen: false } : alert
    ));
    
    // Remove from state after animation
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 300);
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const showInfo = useCallback((title, message, options = {}) => {
    return showAlert({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [showAlert]);

  const showSuccess = useCallback((title, message, options = {}) => {
    return showAlert({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [showAlert]);

  const showWarning = useCallback((title, message, options = {}) => {
    return showAlert({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [showAlert]);

  const showError = useCallback((title, message, options = {}) => {
    return showAlert({
      type: 'error',
      title,
      message,
      ...options
    });
  }, [showAlert]);

  const showConfirm = useCallback((title, message, options = {}) => {
    return new Promise((resolve) => {
      showAlert({
        type: 'warning',
        title,
        message,
        confirmText: 'Yes',
        cancelText: 'No',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        ...options
      });
    });
  }, [showAlert]);

  const value = {
    alerts,
    showAlert,
    hideAlert,
    clearAllAlerts,
    showInfo,
    showSuccess,
    showWarning,
    showError,
    showConfirm
  };

  return (
    <BrowserAlertContext.Provider value={value}>
      {children}
    </BrowserAlertContext.Provider>
  );
};

export default BrowserAlertContext;