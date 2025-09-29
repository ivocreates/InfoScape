import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Search, Home, User, Settings, LogOut, Globe, Link, Shield, Info, Heart, Monitor } from 'lucide-react';
import BrowserSelector from './BrowserSelector';
import BrowserManager from './BrowserManager';

function Navigation({ currentView, setCurrentView, user }) {
  const [showBrowserSelector, setShowBrowserSelector] = useState(false);
  const [showBrowserManager, setShowBrowserManager] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleOpenBrowser = () => {
    setShowBrowserSelector(true);
  };

  const handleBrowserSelect = (browserConfig) => {
    console.log('Browser configuration selected:', browserConfig);
    
    // Log advanced Tor configurations
    if (browserConfig.torMode) {
      console.log('Tor mode enabled with exit node:', browserConfig.exitNode);
      if (browserConfig.chainMode) {
        console.log('Proxy chaining enabled with chain:', browserConfig.proxyChain);
      }
    }
    
    // You can add additional handling here, such as:
    // - Saving browser preferences to localStorage
    // - Updating app state with browser selection
    // - Displaying notifications about anonymity level
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'investigation', label: 'Investigation', icon: Search },
    { id: 'osint-tools', label: 'OSINT Tools', icon: Shield },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Title - Clickable to open About page */}
        <button 
          onClick={() => setCurrentView('about')}
          className="flex items-center gap-3 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
          title="InfoScope OSINT - Click to view About page"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg">
            <Search className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">InfoScope OSINT</h1>
        </button>

        {/* Navigation Items */}
        <div className="flex items-center gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                currentView === id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}

          {/* Quick Search Button */}
          <button
            onClick={() => setCurrentView('investigation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              currentView === 'investigation'
                ? 'bg-blue-600 text-white'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200'
            }`}
            title="Quick Search - Go to Investigation"
          >
            <Search className="w-4 h-4" />
            Search
          </button>

          {/* Browser Button */}
          <button
            onClick={handleOpenBrowser}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2"
            title="Open Browser with Options"
          >
            <Globe className="w-4 h-4" />
            Browser
          </button>

          {/* Browser Manager Button */}
          <button
            onClick={() => setShowBrowserManager(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2"
            title="Manage Browser Instances"
          >
            <Monitor className="w-4 h-4" />
            Manager
          </button>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          {/* User Profile - Clickable to access profile */}
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              currentView === 'profile'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            title="View Profile"
          >
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=000&color=fff`}
              alt={user?.displayName || 'User'}
              className="w-6 h-6 rounded-full"
            />
            <span className={`text-sm font-medium max-w-[120px] truncate ${
              currentView === 'profile' ? 'text-white' : 'text-gray-700'
            }`}>
              {user?.displayName || user?.email || 'User'}
            </span>
            <User className="w-3 h-3 opacity-60" />
          </button>
          
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Browser Selector Modal */}
      <BrowserSelector
        isOpen={showBrowserSelector}
        onClose={() => setShowBrowserSelector(false)}
        url="https://www.google.com"
        onBrowserSelect={handleBrowserSelect}
      />

      {/* Browser Manager Modal */}
      <BrowserManager
        isOpen={showBrowserManager}
        onClose={() => setShowBrowserManager(false)}
      />
    </nav>
  );
}

export default Navigation;
