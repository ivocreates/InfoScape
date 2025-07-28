import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { CssBaseline, Box, useMediaQuery } from '@mui/material';
import { darkTheme } from './theme/theme';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PeopleSearch from './components/PeopleSearch';
import ReverseSearch from './components/ReverseSearch';
import SocialIntelligence from './components/SocialIntelligence';
import DomainIntelligence from './components/DomainIntelligence';
import Reports from './components/Reports';
import SearchHistory from './components/SearchHistory';
import Settings from './components/Settings';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Use responsive breakpoints
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Auto-close sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} />;
      case 'people-search':
        return <PeopleSearch />;
      case 'reverse-search':
        return <ReverseSearch />;
      case 'social-intel':
        return <SocialIntelligence />;
      case 'domain-intel':
        return <DomainIntelligence />;
      case 'reports':
        return <Reports />;
      case 'history':
        return <SearchHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Header onMenuToggle={handleSidebarToggle} />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar
          open={sidebarOpen}
          onToggle={handleSidebarToggle}
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: '64px',
            ml: sidebarOpen && !isMobile ? '280px' : 0,
            transition: 'margin-left 0.3s',
            minHeight: 'calc(100vh - 64px)',
            maxHeight: 'calc(100vh - 64px)',
            backgroundColor: 'transparent',
            px: { xs: 1, sm: 2, md: 3 },
            overflow: 'auto', // Enable scrolling
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.5)',
              },
            },
          }}
        >
          {renderCurrentView()}
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <AppContent />
        </ThemeProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
