import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { darkTheme } from './theme/theme';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PeopleSearch from './components/PeopleSearch';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

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
        return <Box sx={{ p: 3 }}>Reverse Search (Coming Soon)</Box>;
      case 'social-intel':
        return <Box sx={{ p: 3 }}>Social Intelligence (Coming Soon)</Box>;
      case 'domain-intel':
        return <Box sx={{ p: 3 }}>Domain Intelligence (Coming Soon)</Box>;
      case 'reports':
        return <Box sx={{ p: 3 }}>Reports (Coming Soon)</Box>;
      case 'history':
        return <Box sx={{ p: 3 }}>Search History (Coming Soon)</Box>;
      case 'settings':
        return <Box sx={{ p: 3 }}>Settings (Coming Soon)</Box>;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <AppProvider>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
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
                ml: sidebarOpen ? '280px' : 0,
                transition: 'margin-left 0.3s',
                minHeight: 'calc(100vh - 64px)',
                backgroundColor: 'transparent',
              }}
            >
              {renderCurrentView()}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;
