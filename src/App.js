import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Investigation from './components/Investigation';
import ProfileAnalyzer from './components/ProfileAnalyzer';
import LinkScanner from './components/LinkScanner';
import OSINTTools from './components/OSINTTools';
import Navigation from './components/Navigation';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      <Navigation currentView={currentView} setCurrentView={setCurrentView} user={user} />
      
      <main className="transition-all duration-200">
        {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
        {currentView === 'investigation' && <Investigation />}
        {currentView === 'profile-analyzer' && <ProfileAnalyzer />}
        {currentView === 'link-scanner' && <LinkScanner />}
        {currentView === 'osint-tools' && <OSINTTools />}
      </main>
    </div>
  );
}

export default App;
