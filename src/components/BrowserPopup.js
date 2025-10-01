import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Home, 
  X, 
  Shield,
  Globe,
  Lock,
  AlertTriangle,
  Settings,
  ExternalLink,
  Download,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Chrome,
  Monitor
} from 'lucide-react';

const BrowserPopup = ({ isOpen, onClose, initialUrl = 'https://www.google.com', enableProxy = false, proxyConfig = null, isWebApp = false }) => {
  const [url, setUrl] = useState(initialUrl);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [incognito, setIncognito] = useState(true);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (currentUrl) {
      setIsSecure(currentUrl.startsWith('https://'));
    }
  }, [currentUrl]);

  const handleNavigate = (newUrl) => {
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    setCurrentUrl(newUrl);
    setIsLoading(true);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    handleNavigate(url);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      setCanGoBack(window.history.length > 1);
    }
  };

  const handleForward = () => {
    window.history.forward();
    setCanGoForward(true);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
      setIsLoading(true);
    }
  };

  const handleHome = () => {
    setUrl('https://www.google.com');
    handleNavigate('https://www.google.com');
  };

  const openInExternal = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (!isOpen) return null;

  const containerClass = isMaximized 
    ? "fixed inset-4 z-50" 
    : "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-4/5 h-4/5";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${containerClass} bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col`}>
        {/* Browser Header */}
        <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
          {/* Window Controls */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleHome}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Home className="w-4 h-4" />
            </button>
          </div>

          {/* URL Bar */}
          <form onSubmit={handleUrlSubmit} className="flex-1 mx-3">
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {isSecure ? (
                  <Lock className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
                {enableProxy && (
                  <Shield className="w-4 h-4 text-blue-500" title="Proxy Enabled" />
                )}
                {incognito && (
                  <Eye className="w-4 h-4 text-purple-500" title="Incognito Mode" />
                )}
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-20 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter URL or search..."
              />
            </div>
          </form>

          {/* Browser Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={openInExternal}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Open in external browser"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={toggleMaximize}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Browser Content */}
        <div className="flex-1 relative bg-white dark:bg-gray-900">
          {isWebApp ? (
            // Web App Version - Limited iframe or fallback
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center p-8">
                <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Built-in Browser (Web Mode)
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Web version has limited browser capabilities due to browser security policies.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={openInExternal}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Your Browser
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentUrl).then(() => {
                        alert('URL copied to clipboard!');
                      }).catch(() => {
                        alert('Copy this URL: ' + currentUrl);
                      });
                    }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Download the desktop app for full browser functionality with proxy support and security features.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Electron Version - Full webview
            <webview
              ref={iframeRef}
              src={currentUrl}
              className="w-full h-full"
              onLoadStart={() => setIsLoading(true)}
              onLoadStop={() => setIsLoading(false)}
              onNavigate={(e) => setCurrentUrl(e.url)}
              partition={incognito ? 'persist:incognito' : 'persist:main'}
              allowpopups="true"
              useragent={incognito ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' : undefined}
            />
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
              <div className="h-full bg-blue-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowserPopup;