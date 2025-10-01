import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Search, Home, User, Settings, LogOut, Globe, Link, Shield, Info, Heart, Monitor, MessageCircle, Star, MessageSquare, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import BrowserSelector from './BrowserSelector';
import BrowserManager from './BrowserManager';
import InfoScopeIcon from './InfoScopeIcon';

function Navigation({ currentView, setCurrentView, user, onOpenChat, onOpenFavorites, onOpenFeedback }) {
  const [showBrowserSelector, setShowBrowserSelector] = useState(false);
  const [showBrowserManager, setShowBrowserManager] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

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

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 transition-colors relative">
      <div className="flex items-center justify-between">
        {/* Logo and Title - Clickable to open About page */}
        <button 
          onClick={() => handleNavClick('about')}
          className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-all duration-200 group"
          title="InfoScope OSINT - Professional Intelligence Platform"
        >
          <div className="relative">
            <InfoScopeIcon 
              size={32} 
              variant="gradient"
              className="group-hover:scale-110 transition-transform duration-200" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent transition-colors">
              InfoScope
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              OSINT Platform
            </p>
          </div>
          <h1 className="sm:hidden text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent transition-colors">
            InfoScope
          </h1>
        </button>

        {/* Desktop Navigation Items */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === id
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}

          {/* Browser Button */}
          <button
            onClick={handleOpenBrowser}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-all duration-200"
            title="Open Browser with Options"
          >
            <Globe className="w-4 h-4" />
            Browser
          </button>

          {/* Browser Manager Button */}
          <button
            onClick={() => setShowBrowserManager(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-all duration-200"
            title="Manage Browser Instances"
          >
            <Monitor className="w-4 h-4" />
            Manager
          </button>
          {/* Action Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {/* AI Chat Button */}
            <button
              onClick={onOpenChat}
              className="px-3 py-2 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-purple-200 dark:border-purple-700 flex items-center gap-2 transition-all duration-200"
              title="Open AI Assistant"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden xl:inline">AI Help</span>
            </button>

            {/* Favorites Button */}
            <button
              onClick={onOpenFavorites}
              className="px-3 py-2 rounded-lg text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 flex items-center gap-2 transition-all duration-200"
              title="View Favorites"
            >
              <Star className="w-4 h-4" />
              <span className="hidden xl:inline">Favorites</span>
            </button>

            {/* Feedback Button */}
            <button
              onClick={onOpenFeedback}
              className="px-3 py-2 rounded-lg text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2 transition-all duration-200"
              title="Send Feedback"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden xl:inline">Feedback</span>
            </button>
          </div>
        </div>

        {/* User Menu & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* User Profile - Desktop */}
          <button
            onClick={() => handleNavClick('profile')}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              currentView === 'profile'
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title="View Profile"
          >
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=000&color=fff`}
              alt={user?.displayName || 'User'}
              className="w-6 h-6 rounded-full"
            />
            <span className={`text-sm font-medium max-w-[100px] truncate ${
              currentView === 'profile' ? 'text-white dark:text-black' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {user?.displayName || user?.email || 'User'}
            </span>
            <User className="w-3 h-3 opacity-60" />
          </button>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {/* Sign Out - Desktop */}
          <button
            onClick={handleSignOut}
            className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            title="Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="px-4 py-4 space-y-2">
            {/* Mobile Navigation Items */}
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleNavClick(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  currentView === id
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}

            {/* Mobile Browser Actions */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
              <button
                onClick={() => {
                  handleOpenBrowser();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">Open Browser</span>
              </button>
              
              <button
                onClick={() => {
                  setShowBrowserManager(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <Monitor className="w-5 h-5" />
                <span className="font-medium">Browser Manager</span>
              </button>
            </div>

            {/* Mobile Action Buttons */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 space-y-2">
              <button
                onClick={() => {
                  onOpenChat();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </button>

              <button
                onClick={() => {
                  onOpenFavorites();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all duration-200"
              >
                <Star className="w-5 h-5" />
                <span className="font-medium">Favorites</span>
              </button>

              <button
                onClick={() => {
                  onOpenFeedback();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="font-medium">Send Feedback</span>
              </button>
            </div>

            {/* Mobile User Actions */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3 space-y-2">
              <button
                onClick={() => handleNavClick('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentView === 'profile'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <img
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=000&color=fff`}
                  alt={user?.displayName || 'User'}
                  className="w-5 h-5 rounded-full"
                />
                <span className="font-medium">{user?.displayName || user?.email || 'User'}</span>
              </button>

              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
