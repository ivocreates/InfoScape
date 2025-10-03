import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Settings, 
  Download, 
  Share, 
  Copy, 
  AlertTriangle,
  Wifi,
  WifiOff,
  UserCheck,
  Search,
  Trash2,
  History,
  Bookmark,
  ExternalLink
} from 'lucide-react';

function BuiltInBrowser() {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('about:blank');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [bookmarks, setBookmarks] = useState([]);
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [jsEnabled, setJsEnabled] = useState(true);
  const [imagesEnabled, setImagesEnabled] = useState(true);
  const [userAgent, setUserAgent] = useState('Mozilla/5.0 (InfoScope OSINT Browser)');
  const [incognitoMode, setIncognitoMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [proxyConfig, setProxyConfig] = useState({
    enabled: false,
    type: 'socks5',
    host: '127.0.0.1',
    port: '9050',
    auth: false,
    username: '',
    password: ''
  });

  const webviewRef = useRef(null);

  // OSINT-focused bookmarks
  const osintBookmarks = [
    { name: 'OSINT Framework', url: 'https://osintframework.com' },
    { name: 'Shodan', url: 'https://shodan.io' },
    { name: 'Have I Been Pwned', url: 'https://haveibeenpwned.com' },
    { name: 'VirusTotal', url: 'https://virustotal.com' },
    { name: 'Wayback Machine', url: 'https://web.archive.org' },
    { name: 'Google Dorks', url: 'https://google.com/advanced_search' },
    { name: 'TinEye', url: 'https://tineye.com' },
    { name: 'WhitePages', url: 'https://whitepages.com' },
    { name: 'Pipl', url: 'https://pipl.com' },
    { name: 'Maltego', url: 'https://maltego.com' }
  ];

  // User agents for anonymity
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/120.0',
    'Mozilla/5.0 (InfoScope OSINT Browser) Privacy/Enhanced'
  ];

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('infoscope_browser_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setProxyConfig(settings.proxyConfig || proxyConfig);
      setUserAgent(settings.userAgent || userAgent);
      setJsEnabled(settings.jsEnabled !== undefined ? settings.jsEnabled : true);
      setImagesEnabled(settings.imagesEnabled !== undefined ? settings.imagesEnabled : true);
    }

    // Load bookmarks
    const savedBookmarks = localStorage.getItem('infoscope_browser_bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    } else {
      setBookmarks(osintBookmarks);
    }

    // Load history
    const savedHistory = localStorage.getItem('infoscope_browser_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      proxyConfig,
      userAgent,
      jsEnabled,
      imagesEnabled
    };
    localStorage.setItem('infoscope_browser_settings', JSON.stringify(settings));
    
    if (!incognitoMode) {
      localStorage.setItem('infoscope_browser_bookmarks', JSON.stringify(bookmarks));
      localStorage.setItem('infoscope_browser_history', JSON.stringify(history));
    }
  };

  const navigateToUrl = (targetUrl) => {
    if (!targetUrl) return;
    
    setIsLoading(true);
    setCurrentUrl(targetUrl);
    
    // Add to history
    if (!incognitoMode) {
      const newHistory = [...history];
      if (historyIndex < newHistory.length - 1) {
        newHistory.splice(historyIndex + 1);
      }
      newHistory.push({
        url: targetUrl,
        title: targetUrl,
        timestamp: new Date().toISOString()
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    // Configure webview with security settings
    if (webviewRef.current) {
      const webview = webviewRef.current;
      
      // Set user agent
      webview.setUserAgent(userAgent);
      
      // Configure proxy if enabled
      if (proxyConfig.enabled && window.electronAPI?.browser?.configureProxy) {
        window.electronAPI.browser.configureProxy(proxyConfig);
      }
      
      // Load URL
      webview.src = targetUrl;
    }

    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    let targetUrl = url.trim();
    
    if (!targetUrl) return;
    
    // Add protocol if missing
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    
    navigateToUrl(targetUrl);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      navigateToUrl(history[historyIndex - 1].url);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      navigateToUrl(history[historyIndex + 1].url);
    }
  };

  const refresh = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  const addBookmark = () => {
    const newBookmark = {
      name: currentUrl,
      url: currentUrl,
      timestamp: new Date().toISOString()
    };
    setBookmarks([...bookmarks, newBookmark]);
  };

  const clearBrowsingData = () => {
    if (window.electronAPI?.browser?.clearData) {
      window.electronAPI.browser.clearData({
        cookies: true,
        cache: true,
        localStorage: true,
        sessionStorage: true
      });
    }
    setHistory([]);
    setHistoryIndex(-1);
  };

  const toggleProxy = () => {
    setProxyConfig(prev => ({ ...prev, enabled: !prev.enabled }));
    setProxyEnabled(!proxyEnabled);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
  };

  const openInSystemBrowser = () => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(currentUrl);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Browser Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 p-3">
        {/* Navigation Controls */}
        <div className="flex items-center space-x-2 mb-3">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={refresh}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => navigateToUrl('about:blank')}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* URL Bar and Controls */}
        <div className="flex items-center space-x-2">
          {/* Security Indicators */}
          <div className="flex items-center space-x-1">
            {proxyConfig.enabled ? (
              <Wifi className="w-4 h-4 text-green-400" title="Proxy Enabled" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" title="Direct Connection" />
            )}
            
            {incognitoMode ? (
              <EyeOff className="w-4 h-4 text-blue-400" title="Incognito Mode" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" title="Normal Mode" />
            )}
            
            <Shield className="w-4 h-4 text-green-400" title="Security Enhanced" />
          </div>

          {/* URL Input */}
          <form onSubmit={handleUrlSubmit} className="flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL or search term..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            />
          </form>

          {/* Action Buttons */}
          <button
            onClick={copyUrl}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600"
            title="Copy URL"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={addBookmark}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600"
            title="Bookmark"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          
          <button
            onClick={openInSystemBrowser}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600"
            title="Open in System Browser"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Proxy Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Proxy & Privacy</h3>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={proxyConfig.enabled}
                  onChange={() => setProxyConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className="rounded"
                />
                <span className="text-sm">Enable Proxy (Tor-like)</span>
              </label>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={proxyConfig.host}
                  onChange={(e) => setProxyConfig(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="127.0.0.1"
                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                />
                <input
                  type="text"
                  value={proxyConfig.port}
                  onChange={(e) => setProxyConfig(prev => ({ ...prev, port: e.target.value }))}
                  placeholder="9050"
                  className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                />
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={incognitoMode}
                  onChange={(e) => setIncognitoMode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Incognito Mode</span>
              </label>
            </div>

            {/* Security Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Security</h3>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={jsEnabled}
                  onChange={(e) => setJsEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Enable JavaScript</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={imagesEnabled}
                  onChange={(e) => setImagesEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Load Images</span>
              </label>
              
              <select
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
              >
                {userAgents.map((ua, index) => (
                  <option key={index} value={ua}>
                    {ua.includes('InfoScope') ? 'InfoScope Browser' : 
                     ua.includes('Chrome') ? 'Chrome' :
                     ua.includes('Firefox') ? 'Firefox' : 'Custom'}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Actions</h3>
              
              <button
                onClick={clearBrowsingData}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Data</span>
              </button>
              
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                <History className="w-4 h-4" />
                <span>View History</span>
              </button>
              
              <button
                onClick={saveSettings}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center space-x-4 overflow-x-auto">
          <span className="text-xs text-gray-400 whitespace-nowrap">OSINT Tools:</span>
          {bookmarks.slice(0, 10).map((bookmark, index) => (
            <button
              key={index}
              onClick={() => navigateToUrl(bookmark.url)}
              className="text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap"
            >
              {bookmark.name}
            </button>
          ))}
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 bg-white">
        {currentUrl === 'about:blank' ? (
          <div className="h-full flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <Globe className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400 mb-2">InfoScope OSINT Browser</h2>
              <p className="text-gray-500 mb-6">Enhanced privacy and security for OSINT investigations</p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl">
                {osintBookmarks.map((bookmark, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToUrl(bookmark.url)}
                    className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                  >
                    <div className="text-sm font-medium text-white">{bookmark.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <webview
            ref={webviewRef}
            src={currentUrl}
            className="w-full h-full"
            allowpopups="true"
            useragent={userAgent}
            webpreferences="javascript=${jsEnabled},images=${imagesEnabled}"
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>Status: {isLoading ? 'Loading...' : 'Ready'}</span>
            <span>Mode: {incognitoMode ? 'Incognito' : 'Normal'}</span>
            <span>Proxy: {proxyConfig.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-3 h-3" />
            <span>Secure OSINT Browser</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuiltInBrowser;