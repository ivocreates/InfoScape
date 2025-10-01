import React, { useState } from 'react';
import { 
  Download, 
  ExternalLink, 
  Shield, 
  Globe, 
  CheckCircle, 
  AlertTriangle,
  Info,
  X,
  Zap,
  Lock
} from 'lucide-react';

const BrowserInstaller = ({ isOpen, onClose, onInstallComplete }) => {
  const [selectedBrowser, setSelectedBrowser] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const availableBrowsers = [
    {
      id: 'chrome',
      name: 'Google Chrome',
      description: 'Fast, secure web browser',
      icon: '🌐',
      downloadUrl: 'https://www.google.com/chrome/',
      features: ['Fast browsing', 'Extensions support', 'Sync across devices'],
      size: '~95 MB',
      recommended: true
    },
    {
      id: 'firefox',
      name: 'Mozilla Firefox',
      description: 'Privacy-focused open source browser',
      icon: '🦊',
      downloadUrl: 'https://www.mozilla.org/firefox/new/',
      features: ['Privacy protection', 'Open source', 'Customizable'],
      size: '~55 MB',
      privacy: 'high'
    },
    {
      id: 'edge',
      name: 'Microsoft Edge',
      description: 'Modern browser built on Chromium',
      icon: '🔷',
      downloadUrl: 'https://www.microsoft.com/edge',
      features: ['Built-in security', 'Microsoft integration', 'Performance'],
      size: '~125 MB'
    },
    {
      id: 'brave',
      name: 'Brave Browser',
      description: 'Privacy by default with ad blocking',
      icon: '🛡️',
      downloadUrl: 'https://brave.com/download/',
      features: ['Ad blocking', 'Privacy protection', 'Crypto rewards'],
      size: '~95 MB',
      privacy: 'very-high'
    },
    {
      id: 'tor',
      name: 'Tor Browser',
      description: 'Anonymous browsing through Tor network',
      icon: '🧅',
      downloadUrl: 'https://www.torproject.org/download/',
      features: ['Maximum anonymity', 'Tor network', 'Anti-tracking'],
      size: '~85 MB',
      privacy: 'maximum',
      osint: true
    },
    {
      id: 'opera',
      name: 'Opera',
      description: 'Feature-rich browser with built-in VPN',
      icon: '🎭',
      downloadUrl: 'https://www.opera.com/download',
      features: ['Built-in VPN', 'Ad blocker', 'Workspaces'],
      size: '~75 MB'
    }
  ];

  const handleDownload = async (browser) => {
    setIsDownloading(true);
    setSelectedBrowser(browser);
    
    // Open download URL
    if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
      await window.electronAPI.openExternal(browser.downloadUrl);
    } else {
      window.open(browser.downloadUrl, '_blank');
    }
    
    setTimeout(() => {
      setIsDownloading(false);
      onInstallComplete?.();
    }, 2000);
  };

  const getBrowserIcon = (browserId) => {
    const icons = {
      chrome: <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 flex items-center justify-center">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
      </div>,
      firefox: <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded-full"></div>
      </div>,
      edge: <div className="w-8 h-8 rounded bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center">
        <div className="w-3 h-3 bg-white rounded"></div>
      </div>,
      brave: <Shield className="w-8 h-8 text-orange-500" />,
      tor: <Lock className="w-8 h-8 text-purple-500" />,
      opera: <Globe className="w-8 h-8 text-red-500" />
    };
    return icons[browserId] || <Globe className="w-8 h-8 text-gray-500" />;
  };

  const getPrivacyBadge = (privacy) => {
    const badges = {
      'high': <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">High Privacy</span>,
      'very-high': <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Very High Privacy</span>,
      'maximum': <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">Maximum Privacy</span>
    };
    return badges[privacy];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto popup-scrollbar">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Download className="w-6 h-6 text-blue-500" />
              Install Browser
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose a browser to install for enhanced OSINT capabilities
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Why install additional browsers?</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Different browsers offer unique privacy features, proxy support, and OSINT capabilities. 
                  Having multiple browsers allows you to segregate investigations and maintain operational security.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {availableBrowsers.map((browser) => (
              <div
                key={browser.id}
                className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                  browser.recommended 
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getBrowserIcon(browser.id)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {browser.name}
                      </h3>
                      {browser.recommended && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Recommended
                        </span>
                      )}
                      {browser.osint && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          OSINT Ready
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {browser.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {browser.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Size: {browser.size}</span>
                        {browser.privacy && getPrivacyBadge(browser.privacy)}
                      </div>
                      
                      <button
                        onClick={() => handleDownload(browser)}
                        disabled={isDownloading && selectedBrowser?.id === browser.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-md transition-colors"
                      >
                        {isDownloading && selectedBrowser?.id === browser.id ? (
                          <>
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                            Opening...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-3 h-3" />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">Installation Notes</h3>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-1 list-disc list-inside space-y-1">
                  <li>Downloads will open in your default browser or download manager</li>
                  <li>After installation, restart InfoScope to detect new browsers</li>
                  <li>For Tor Browser, ensure it's properly configured before use</li>
                  <li>Some browsers may require additional setup for proxy configurations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserInstaller;