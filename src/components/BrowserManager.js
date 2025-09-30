import React, { useState, useEffect } from 'react';
import { 
  X, Globe, Trash2, RefreshCw, Monitor, Clock, ExternalLink, 
  Settings, AlertCircle, CheckCircle, Activity, Wifi, WifiOff
} from 'lucide-react';

function BrowserManager({ isOpen, onClose }) {
  const [launchedBrowsers, setLaunchedBrowsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchLaunchedBrowsers();
      // Refresh every 5 seconds when open
      const interval = setInterval(fetchLaunchedBrowsers, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const fetchLaunchedBrowsers = async () => {
    try {
      if (window.electronAPI && window.electronAPI.getLaunchedBrowsers) {
        const browsers = await window.electronAPI.getLaunchedBrowsers();
        setLaunchedBrowsers(browsers);
      }
    } catch (error) {
      console.error('Error fetching launched browsers:', error);
    }
  };

  const closeBrowserProcess = async (processId) => {
    try {
      setLoading(true);
      if (window.electronAPI && window.electronAPI.closeBrowserProcess) {
        const result = await window.electronAPI.closeBrowserProcess(processId);
        if (result.success) {
          console.log(result.message);
          fetchLaunchedBrowsers(); // Refresh the list
        } else {
          console.error(result.message);
        }
      }
    } catch (error) {
      console.error('Error closing browser:', error);
    } finally {
      setLoading(false);
    }
  };

  const closeAllBrowsers = async () => {
    try {
      setLoading(true);
      if (window.electronAPI && window.electronAPI.closeAllBrowsers) {
        const result = await window.electronAPI.closeAllBrowsers();
        if (result.success) {
          console.log(result.message);
          fetchLaunchedBrowsers(); // Refresh the list
        } else {
          console.error(result.message);
        }
      }
    } catch (error) {
      console.error('Error closing all browsers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getBrowserIcon = (browserType) => {
    const iconMap = {
      chrome: '🟢',
      firefox: '🟠',
      edge: '🔵',
      brave: '🦁',
      tor: '🧅',
      builtin: '🌐'
    };
    return iconMap[browserType] || '🌐';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Browser Manager</h2>
              <p className="text-sm text-gray-600">Monitor and control active browser instances</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
              <Activity className="w-4 h-4" />
              <span>{launchedBrowsers.filter(b => b.running).length} active</span>
            </div>
            <button
              onClick={fetchLaunchedBrowsers}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh browser list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close browser manager"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Enhanced Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="w-4 h-4" />
                <span>
                  <strong>{launchedBrowsers.length}</strong> browser instance{launchedBrowsers.length !== 1 ? 's' : ''} tracked
                </span>
              </div>
              {launchedBrowsers.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    {launchedBrowsers.filter(b => b.running).length} running
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <AlertCircle className="w-3 h-3" />
                    {launchedBrowsers.filter(b => !b.running).length} stopped
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {launchedBrowsers.length > 0 && (
                <>
                  <button
                    onClick={() => launchedBrowsers.forEach(b => b.running && closeBrowserProcess(b.id))}
                    disabled={loading || launchedBrowsers.filter(b => b.running).length === 0}
                    className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Stop All
                  </button>
                  <button
                    onClick={closeAllBrowsers}
                    disabled={loading}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Close All
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Enhanced Browser List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {launchedBrowsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Browser Instances</h3>
                <p className="text-gray-600 mb-1">Launch browsers through the Browser Selector to see them here</p>
                <p className="text-sm text-gray-500">You can monitor and control all your OSINT browsing sessions from this panel</p>
              </div>
            ) : (
              launchedBrowsers.map((browser) => (
                <div
                  key={browser.id}
                  className={`flex items-center justify-between p-4 border rounded-xl transition-all duration-200 hover:shadow-md ${
                    browser.running 
                      ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="text-2xl">
                        {getBrowserIcon(browser.browser)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        browser.running ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {browser.browser} Browser
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${
                          browser.running 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {browser.running ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                          {browser.running ? 'Active' : 'Stopped'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 truncate max-w-lg">
                          <span className="font-medium">URL:</span> {browser.url}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Started {formatTimestamp(browser.timestamp)}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span>Process ID: {browser.id.slice(-8)}</span>
                          {browser.proxy && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-blue-600">Proxy Enabled</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {browser.running && browser.url && (
                      <button
                        onClick={() => window.open(browser.url, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Open URL in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => closeBrowserProcess(browser.id)}
                      disabled={loading || !browser.running}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={browser.running ? "Close Browser" : "Browser already stopped"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Enhanced Help Section */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">💡</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Browser Management Tips:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-700">
                  <div>• Only InfoScope-launched browsers are tracked</div>
                  <div>• Green status indicates active browsing sessions</div>
                  <div>• "Stop All" closes browser windows gracefully</div>
                  <div>• "Close All" terminates all processes immediately</div>
                  <div>• Use refresh button to update browser status</div>
                  <div>• Click URL icon to open links in system browser</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowserManager;