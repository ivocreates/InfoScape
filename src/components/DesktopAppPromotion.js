import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Monitor, 
  Shield, 
  Zap, 
  Star,
  ChevronRight,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const DesktopAppPromotion = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only show on web version (not in Electron)
    if (window.electronAPI) {
      return;
    }

    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('desktop-app-promo-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('desktop-app-promo-dismissed', 'true');
  };

  const handleDownload = () => {
    window.open('https://github.com/ivocreates/InfoScope/releases', '_blank');
    handleDismiss();
  };

  if (!isVisible || isDismissed || window.electronAPI) {
    return null;
  }

  return (
    <>
      {/* Floating Promotion Banner */}
      <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-2xl p-6 text-white">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Get the Desktop App!</h3>
              <p className="text-blue-100 text-sm mb-3">
                Unlock advanced features with the full desktop experience
              </p>
              
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Enhanced browser management</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Built-in Tor & proxy support</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3" />
                  <span>Offline investigation tools</span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Free
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Banner (Alternative/Additional) */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-1.5">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold">Enhanced OSINT Experience</span>
              <span className="text-blue-100 ml-2 text-sm">
                Get the desktop app for advanced browser management & privacy features
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
              <ChevronRight className="w-3 h-3" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Feature comparison component for main page
export const DesktopAppFeatures = () => {
  const features = [
    {
      feature: 'OSINT Tools',
      web: true,
      desktop: true,
      description: 'Access to 50+ intelligence gathering tools'
    },
    {
      feature: 'Browser Management',
      web: false,
      desktop: true,
      description: 'Launch multiple browsers with proxy configurations'
    },
    {
      feature: 'Built-in Tor Browser',
      web: false,
      desktop: true,
      description: 'Anonymous browsing with integrated Tor support'
    },
    {
      feature: 'Advanced Proxy Support',
      web: false,
      desktop: true,
      description: 'Chain proxies, VPN integration, exit node selection'
    },
    {
      feature: 'Offline Investigation',
      web: false,
      desktop: true,
      description: 'Save and analyze data without internet connection'
    },
    {
      feature: 'Auto-Updates',
      web: false,
      desktop: true,
      description: 'Automatic updates with new tools and features'
    },
    {
      feature: 'Enhanced Security',
      web: false,
      desktop: true,
      description: 'Sandboxed browsing and secure data handling'
    },
    {
      feature: 'File Operations',
      web: false,
      desktop: true,
      description: 'Save investigations, export reports, import data'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Web vs Desktop Experience
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Unlock the full potential of InfoScope with our desktop application
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="font-semibold text-gray-900 dark:text-white">Features</div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 dark:text-white">Web Version</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                <Monitor className="w-5 h-5" />
                Desktop App
              </div>
              <div className="text-sm text-blue-500">Recommended</div>
            </div>
          </div>

          {features.map((item, index) => (
            <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.feature}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
              </div>
              <div className="flex justify-center">
                {item.web ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-gray-300" />
                )}
              </div>
              <div className="flex justify-center">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => window.open('https://github.com/ivocreates/InfoScope/releases', '_blank')}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="w-6 h-6" />
            Download Desktop App
            <ExternalLink className="w-5 h-5" />
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Free • Windows, macOS, Linux • 216 MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesktopAppPromotion;