import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { ThemeProvider } from './contexts/ThemeContext';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import AIChat from './components/AIChat';
import WeeklySupportPopup from './components/WeeklySupportPopup';
import Favorites from './components/Favorites';
import Onboarding from './components/Onboarding';
import Feedback from './components/Feedback';
import OSINTTools from './components/OSINTTools';
import Investigation from './components/Investigation';
import Profile from './components/Profile';
import About from './components/About';
import DesktopAppPromotion from './components/DesktopAppPromotion';

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
  const [showWeeklySupport, setShowWeeklySupport] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

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
    
    // Log app start performance
    const appStartTime = performance.now();
    console.log('App initialization time:', appStartTime);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Track authentication state
      analyticsManager.trackAuth(user ? 'login_detected' : 'logout_detected');
      
      if (user) {
        // Set user in analytics
        analyticsManager.setUser(user.uid, {
          email: user.email,
          display_name: user.displayName,
          email_verified: user.emailVerified
        });
        
        // If user is already logged in, skip landing page
        setShowLanding(false);
        
        // Check if user is new (first time login)
        const hasSeenOnboarding = localStorage.getItem(`onboarding-seen-${user.uid}`);
        
        if (!hasSeenOnboarding) {
          // Show onboarding for new users
          setShowOnboarding(true);
          analyticsManager.trackFeatureUsage('onboarding_shown', { user_type: 'new' });
        } else {
          // Show weekly support popup for returning users (with a delay)
          setTimeout(() => {
            setShowWeeklySupport(true);
            analyticsManager.trackFeatureUsage('weekly_support_shown', { user_type: 'returning' });
          }, 3000);
        }
      }

      // Log authentication performance
      const authTime = performance.now() - appStartTime;
      console.log('Authentication check time:', authTime);
      analyticsManager.trackPerformance('auth_check_time', authTime);
    });

    return () => {
      unsubscribe();
      performanceMonitor.cleanup();
    };
  }, [loading]);

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

  // Handle onboarding completion
  const handleOnboardingComplete = (targetView = 'dashboard') => {
    if (user) {
      localStorage.setItem(`onboarding-seen-${user.uid}`, 'true');
    }
    setShowOnboarding(false);
    setCurrentView(targetView);
    
    // Track onboarding completion
    analyticsManager.trackFeatureUsage('onboarding_completed', { target_view: targetView });
    
    // Show weekly support popup after onboarding with delay
    setTimeout(() => {
      setShowWeeklySupport(true);
    }, 2000);
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

  // Handle onboarding skip
  const handleOnboardingSkip = () => {
    if (user) {
      localStorage.setItem(`onboarding-seen-${user.uid}`, 'true');
    }
    setShowOnboarding(false);
  };

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
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Navigation 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          user={user}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenFavorites={() => setShowFavorites(true)}
          onOpenFeedback={() => setShowFeedback(true)}
        />
      
      <main className="transition-all duration-200">
        {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
        {currentView === 'investigation' && <Investigation />}
        {currentView === 'osint-tools' && <OSINTTools />}
        {currentView === 'profile' && <Profile user={user} />}
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

      {/* Weekly Support Popup */}
      <WeeklySupportPopup
        isVisible={showWeeklySupport}
        onClose={() => setShowWeeklySupport(false)}
        onOpenChat={handleOpenChatWithMessage}
      />

      {/* Onboarding Component */}
      {showOnboarding && (
        <Onboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Desktop App Promotion - Only show in web version */}
      <DesktopAppPromotion />
      </div>
    </ThemeProvider>
  );
}

export default App;
