import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrowserAlertProvider } from './hooks/useBrowserAlert';
import BrowserAlertContainer from './components/BrowserAlertContainer';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import AIChat from './components/AIChat';
import Favorites from './components/Favorites';
import Feedback from './components/Feedback';
import OSINTTools from './components/OSINTTools';
import Investigation from './components/Investigation';
import Profile from './components/Profile';
import About from './components/About';
import SystemInfoToggle from './components/SystemInfoToggle';
import AdvancedOSINTTools from './components/AdvancedOSINTTools';
import PopupManager from './components/PopupManager';
import SubscriptionPlans from './components/SubscriptionPlans';
import ExportFeatures from './components/ExportFeatures';
import DesktopAppPromo from './components/DesktopAppPromo';
import DonationWidget from './components/DonationWidget';
import SimpleBrowser from './components/SimpleBrowser';
import subscriptionService from './services/subscriptionService';

// Performance utilities only
import { 
  LoadingFallback,
  performanceMonitor,
  preconnectToDomain
} from './utils/performance';

// PWA and Analytics
import pwaManager from './utils/pwa';
import analyticsManager from './utils/analytics';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showSimpleBrowser, setShowSimpleBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [browserConfig, setBrowserConfig] = useState(null);

  // Handle opening browser with configuration
  const handleOpenBrowser = (url = 'https://www.google.com', config = null) => {
    setBrowserUrl(url);
    setBrowserConfig(config);
    setShowSimpleBrowser(true);
  };

  useEffect(() => {
    // Initialize performance monitoring
    performanceMonitor.init();
    
    // Initialize PWA features
    pwaManager.init();
    
    // Initialize analytics
    analyticsManager.trackPageView('app_init');
    
    // Preconnect to essential domains for OSINT tools
    preconnectToDomain('https://api.shodan.io');
    preconnectToDomain('https://api.virustotal.com');
    preconnectToDomain('https://api.hunter.io');
    preconnectToDomain('https://ipinfo.io');
    preconnectToDomain('https://ipapi.co');
    
    // Log app start performance
    const appStartTime = performance.now();
    console.log('App initialization time:', appStartTime);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      
      // Track authentication state
      analyticsManager.trackAuth(user ? 'login_detected' : 'logout_detected');
      
      if (user) {
        // Initialize subscription service for the user
        await subscriptionService.initializeUser(user);
        
        // Set user in analytics
        analyticsManager.setUser(user.uid, {
          email: user.email,
          display_name: user.displayName,
          email_verified: user.emailVerified
        });
        
        // If user is already logged in, skip landing page
        setShowLanding(false);
        
        analyticsManager.trackFeatureUsage('user_authenticated', { 
          user_type: 'returning',
          email_verified: user.emailVerified 
        });
      }

      // Log authentication performance
      const authTime = performance.now() - appStartTime;
      console.log('Authentication check time:', authTime);
      analyticsManager.trackPerformance('auth_check_time', authTime);
    });

    // Listen for global events
    const handleOpenSubscription = () => setShowSubscription(true);

    window.addEventListener('openSubscription', handleOpenSubscription);

    return () => {
      unsubscribe();
      performanceMonitor.cleanup();
      window.removeEventListener('openSubscription', handleOpenSubscription);
    };
  }, []);

  // Handle "Get Started" button click
  const handleGetStarted = () => {
    setShowLanding(false);
  };

  // Handle opening chat with predefined message
  const handleOpenChatWithMessage = (message) => {
    setChatInitialMessage(message);
    setIsChatOpen(true);
    setIsChatMinimized(false);
  };

  // Track view changes
  useEffect(() => {
    if (currentView && user) {
      analyticsManager.trackPageView(currentView, {
        user_id: user.uid,
        timestamp: Date.now()
      });
    }
  }, [currentView, user]);

  useEffect(() => {
    // Listen to Electron menu events
    if (window.electronAPI) {
      window.electronAPI.onNewInvestigation(() => {
        setCurrentView('investigation');
      });

      window.electronAPI.onSaveInvestigation(() => {
        // Trigger save in current component
        // This would be handled by the active component
      });

      // Cleanup
      return () => {
        window.electronAPI.removeAllListeners('new-investigation');
        window.electronAPI.removeAllListeners('save-investigation');
      };
    }

    // Handle PWA deep linking parameters
    if (window.infoscopeParams) {
      const { view, action } = window.infoscopeParams;
      if (view) {
        setCurrentView(view);
      }
      if (action === 'browser') {
        // Trigger browser selector modal
        // This could be handled by setting a state that Navigation component reads
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        {showLanding ? (
          <LandingPage onGetStarted={handleGetStarted} />
        ) : (
          <AuthScreen />
        )}
      </ThemeProvider>
    );
  }

  return (
    <BrowserAlertProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Navigation 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            user={user}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenFavorites={() => setShowFavorites(true)}
            onOpenFeedback={() => setShowFeedback(true)}
            onShowLanding={() => setShowLanding(true)}
            onOpenBrowser={handleOpenBrowser}
          />
      
        <main className="transition-all duration-200">
          {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
          {currentView === 'investigation' && <Investigation />}
          {currentView === 'osint-tools' && <OSINTTools />}
          {currentView === 'advanced-osint' && <AdvancedOSINTTools />}
          {currentView === 'profile' && <Profile user={user} setCurrentView={setCurrentView} />}
          {currentView === 'about' && <About />}
        </main>

        {/* AI Chat Component */}
        <AIChat
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatInitialMessage(null);
          }}
          onMinimize={setIsChatMinimized}
          isMinimized={isChatMinimized}
          initialMessage={chatInitialMessage}
        />

        {/* Favorites Component */}
        <Favorites
          user={user}
          isOpen={showFavorites}
          onClose={() => setShowFavorites(false)}
        />

        {/* Feedback Component */}
        <Feedback
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
        />

        {/* Subscription Plans Modal */}
        <SubscriptionPlans
          isOpen={showSubscription}
          onClose={() => setShowSubscription(false)}
        />

        {/* Unified Popup Manager - handles all popups in correct order */}
        <PopupManager
          user={user}
          onOpenChat={handleOpenChatWithMessage}
        />

        {/* System Info Toggle - Floating component for OSINT context */}
        <SystemInfoToggle />

        {/* Donation Widget - Bottom left corner */}
        {user && <DonationWidget />}

        {/* Desktop App Promotion - Bottom right corner */}
        <DesktopAppPromo />

        {/* Browser Alert Container */}
        <BrowserAlertContainer />

        {/* Simple Browser */}
        <SimpleBrowser
          isOpen={showSimpleBrowser}
          onClose={() => setShowSimpleBrowser(false)}
          initialUrl={browserUrl}
          enableProxy={browserConfig?.torMode || browserConfig?.proxyMode || false}
          proxyConfig={browserConfig}
        />
      </div>
    </ThemeProvider>
  </BrowserAlertProvider>
  );
}

export default App;
