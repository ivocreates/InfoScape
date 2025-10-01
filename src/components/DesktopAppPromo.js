import React, { useState, useEffect } from 'react';
import { X, Download, Monitor, Zap, Shield, ExternalLink, Crown } from 'lucide-react';

const DesktopAppPromo = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if we're in the web app (not Electron)
    const isWebApp = !window.electronAPI;
    
    // Check if user has dismissed the promo
    const dismissed = localStorage.getItem('infoscope-desktop-promo-dismissed');
    
    if (isWebApp && !dismissed) {
      // Show promo after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('infoscope-desktop-promo-dismissed', Date.now().toString());
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleDownload = () => {
    window.open('https://github.com/ivocreates/InfoScope/releases', '_blank');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out ${
      isMinimized ? 'transform translate-y-2' : ''
    }`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isMinimized ? 'w-64' : 'w-80'
      } transition-all duration-300`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              <span className="font-semibold text-sm">Desktop App Available</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMinimize}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <div className={`w-3 h-0.5 bg-white transition-transform ${
                  isMinimized ? 'rotate-90' : ''
                }`}></div>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Unlock Full Potential
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get the desktop app for enhanced features and better performance.
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Zap className="w-3 h-3 text-purple-500" />
                  <span>Advanced browser configurations</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Shield className="w-3 h-3 text-blue-500" />
                  <span>Enhanced proxy & Tor support</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Crown className="w-3 h-3 text-yellow-500" />
                  <span>Premium export features</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Monitor className="w-3 h-3 text-green-500" />
                  <span>Native desktop experience</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => window.open('https://github.com/ivocreates/InfoScope#installation', '_blank')}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm transition-colors flex items-center gap-1"
                  title="Learn more"
                >
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Dismiss Option */}
              <div className="text-center">
                <button
                  onClick={handleDismiss}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Don't show again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimized View */}
        {isMinimized && (
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Desktop App</span>
              </div>
              <button
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
              >
                Get
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopAppPromo;