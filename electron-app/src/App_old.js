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
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('connecting');
  
  useEffect(() => {
    // Initialize app
    initializeApp();
    
    // Setup menu listeners
    if (window.electronAPI) {
      const cleanup = window.electronAPI.onMenuAction(handleMenuAction);
      return cleanup;
    }
  }, []);
  
  const initializeApp = async () => {
    try {
      // Check backend connection
      const status = await apiService.checkHealth();
      setBackendStatus(status ? 'connected' : 'disconnected');
      
      // Load user preferences
      if (window.electronAPI) {
        const preferences = await window.electronAPI.store.get('userPreferences');
        if (preferences) {
          // Apply user preferences
          console.log('Loaded user preferences:', preferences);
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setBackendStatus('error');
      setIsLoading(false);
    }
  };
  
  const handleMenuAction = (action, ...args) => {
    console.log('Menu action:', action, args);
    
    switch (action) {
      case 'menu-new-investigation':
        // Handle new investigation
        break;
      case 'menu-open-investigation':
        // Handle open investigation
        break;
      case 'menu-save-investigation':
        // Handle save investigation
        break;
      case 'menu-export-pdf':
        // Handle PDF export
        break;
      case 'menu-export-csv':
        // Handle CSV export
        break;
      case 'menu-export-json':
        // Handle JSON export
        break;
      case 'menu-settings':
        // Navigate to settings
        break;
      case 'menu-about':
        // Show about dialog
        break;
      default:
        console.log('Unhandled menu action:', action);
    }
  };
  
  if (isLoading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)'
          }}
        >
          <Box sx={{ fontSize: '2.5rem', fontWeight: 700, color: '#00d4ff', mb: 3 }}>
            🌐 InfoScape
          </Box>
          <Box
            sx={{
              width: 50,
              height: 50,
              border: '3px solid rgba(0, 212, 255, 0.1)',
              borderTop: '3px solid #00d4ff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              mb: 2
            }}
          />
          <Box sx={{ color: '#888', fontSize: '0.9rem' }}>
            Initializing OSINT Intelligence Toolkit...
          </Box>
          <Box sx={{ color: '#666', fontSize: '0.8rem', mt: 1 }}>
            Backend: {backendStatus}
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppProvider>
        <SearchProvider>
          <Router>
            <Box sx={{ height: '100vh', overflow: 'hidden' }}>
              <Layout backendStatus={backendStatus}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/search/people" element={<PeopleSearch />} />
                  <Route path="/search/reverse" element={<ReverseLookup />} />
                  <Route path="/intelligence/social" element={<SocialIntelligence />} />
                  <Route path="/intelligence/domain" element={<DomainIntelligence />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/visualization" element={<NetworkVisualization />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </Layout>
            </Box>
          </Router>
        </SearchProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
