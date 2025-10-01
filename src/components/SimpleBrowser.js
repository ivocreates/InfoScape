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
  EyeOff
} from 'lucide-react';

const SimpleBrowser = ({ isOpen, onClose, initialUrl = 'https://www.google.com', enableProxy = false, proxyConfig = null }) => {
  const [url, setUrl] = useState(initialUrl);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [incognito, setIncognito] = useState(true);
  const webviewRef = useRef(null);

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
    if (webviewRef.current && canGoBack) {
      webviewRef.current.goBack();
    }
  };

  const handleForward = () => {
    if (webviewRef.current && canGoForward) {
      webviewRef.current.goForward();
    }
  };

  const handleRefresh = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
      setIsLoading(true);
    }
  };

  const handleHome = () => {
    handleNavigate('https://www.google.com');
  };

  const openInExternal = () => {
    if (window.electronAPI && typeof window.electronAPI.openExternal === 'function') {
      window.electronAPI.openExternal(currentUrl);
    } else {
      window.open(currentUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Browser Header */}
      <div className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Navigation Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={!canGoBack}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={!canGoForward}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="absolute left-3 top-1/2 transform -y-1/2 flex items-center gap-2">
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
            onClick={() => setIncognito(!incognito)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Toggle incognito mode"
          >
            {incognito ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Developer tools"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {(enableProxy || incognito) && (
        <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 text-xs">
          <div className="flex items-center gap-4 text-blue-800 dark:text-blue-200">
            {enableProxy && proxyConfig && (
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Proxy: {proxyConfig.host}:{proxyConfig.port}
              </span>
            )}
            {incognito && (
              <span className="flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                Incognito Mode - Browsing privately
              </span>
            )}
          </div>
        </div>
      )}

      {/* Browser Content */}
      <div className="flex-1 relative">
        {/* For Electron, we would use webview */}
        {window.electronAPI ? (
          <webview
            ref={webviewRef}
            src={currentUrl}
            className="w-full h-full"
            onLoadStart={() => setIsLoading(true)}
            onLoadStop={() => setIsLoading(false)}
            onNavigate={(e) => setCurrentUrl(e.url)}
            partition={incognito ? 'persist:incognito' : 'persist:main'}
            allowpopups="true"
            useragent={incognito ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' : undefined}
          />
        ) : (
          /* Fallback for web version - iframe with limitations */
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center p-8">
              <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Simple Browser (Web Mode)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The simple browser requires the desktop application for full functionality.
              </p>
              <button
                onClick={openInExternal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open in External Browser
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
            <div className="h-full bg-blue-500 animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Developer Tools */}
      {showDevTools && window.electronAPI && (
        <div className="h-64 border-t border-gray-200 dark:border-gray-700 bg-gray-900 text-green-400 p-4 font-mono text-xs overflow-y-auto">
          <div className="mb-2 text-white">Developer Tools</div>
          <div>Console, Network, and Security tools would be available here in the desktop version.</div>
        </div>
      )}
    </div>
  );
};

export default SimpleBrowser;