import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Search, Home, User, Settings, LogOut, Globe, Link, Shield } from 'lucide-react';

function Navigation({ currentView, setCurrentView, user }) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleOpenBrowser = () => {
    if (window.electronAPI) {
      window.electronAPI.openBrowser('https://www.google.com');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'investigation', label: 'Investigation', icon: Search },
    { id: 'link-scanner', label: 'Link Scanner', icon: Link },
    { id: 'profile-analyzer', label: 'Profile Analyzer', icon: User },
    { id: 'osint-tools', label: 'OSINT Tools', icon: Shield },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg">
            <Search className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">InfoScope OSINT</h1>
        </div>

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

          {/* Browser Button */}
          <button
            onClick={handleOpenBrowser}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 flex items-center gap-2"
            title="Open Built-in Browser"
          >
            <Globe className="w-4 h-4" />
            Browser
          </button>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&background=000&color=fff`}
              alt={user?.displayName || 'User'}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {user?.displayName || user?.email || 'User'}
            </span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
