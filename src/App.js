import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Investigation from './components/Investigation';
import OSINTTools from './components/OSINTTools';
import Profile from './components/Profile';
import About from './components/About';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';
import AIChat from './components/AIChat';
import WeeklySupportPopup from './components/WeeklySupportPopup';
import Favorites from './components/Favorites';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [showWeeklySupport, setShowWeeklySupport] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // Show weekly support popup after user logs in (with a delay)
      if (user && !loading) {
        setTimeout(() => {
          setShowWeeklySupport(true);
        }, 3000); // Show after 3 seconds to let user settle in
      }
    });

    return () => unsubscribe();
  }, [loading]);

  // Handle opening chat with predefined message
  const handleOpenChatWithMessage = (message) => {
    setChatInitialMessage(message);
    setIsChatOpen(true);
    setIsChatMinimized(false);
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
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenFavorites={() => setShowFavorites(true)}
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

      {/* Weekly Support Popup */}
      <WeeklySupportPopup
        isVisible={showWeeklySupport}
        onClose={() => setShowWeeklySupport(false)}
        onOpenChat={handleOpenChatWithMessage}
      />
    </div>
  );
}

export default App;
