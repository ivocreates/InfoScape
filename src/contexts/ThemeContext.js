import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreference] = useState(() => {
    const saved = localStorage.getItem('infoscope-osint-theme-preference');
    return saved || 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('infoscope-osint-theme-preference');
    if (saved === 'light') return false;
    if (saved === 'dark') return true;
    // System preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem('infoscope-osint-theme-preference', themePreference);
    
    // Apply theme based on preference
    let shouldBeDark = false;
    if (themePreference === 'dark') {
      shouldBeDark = true;
    } else if (themePreference === 'light') {
      shouldBeDark = false;
    } else { // system
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    setIsDarkMode(shouldBeDark);
    
    // Apply theme to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themePreference]);

  const toggleTheme = () => {
    setThemePreference(isDarkMode ? 'light' : 'dark');
  };

  const setTheme = (theme) => {
    setThemePreference(theme);
  };

  const value = {
    isDarkMode,
    setIsDarkMode,
    toggleTheme,
    setTheme,
    theme: isDarkMode ? 'dark' : 'light',
    themePreference,
    setThemePreference
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;