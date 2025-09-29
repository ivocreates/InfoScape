import React, { useState, useEffect } from 'react';
import { X, Globe, Trash2, RefreshCw, Monitor, Clock } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full m-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-gray-700" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Browser Manager</h2>
              <p className="text-sm text-gray-600">Manage launched browser instances</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLaunchedBrowsers}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <span>{launchedBrowsers.length} browser instance(s) tracked</span>
            </div>
            {launchedBrowsers.length > 0 && (
              <button
                onClick={closeAllBrowsers}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Close All
              </button>
            )}
          </div>

          {/* Browser List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {launchedBrowsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No browser instances currently tracked</p>
                <p className="text-sm mt-1">Launch browsers through the Browser Selector to see them here</p>
              </div>
            ) : (
              launchedBrowsers.map((browser) => (
                <div
                  key={browser.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">
                      {getBrowserIcon(browser.browser)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 capitalize">
                          {browser.browser} Browser
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          browser.running 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {browser.running ? 'Running' : 'Stopped'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate max-w-md">
                        {browser.url}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>Launched at {formatTimestamp(browser.timestamp)}</span>
                        <span className="text-gray-400">•</span>
                        <span>ID: {browser.id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => closeBrowserProcess(browser.id)}
                    disabled={loading || !browser.running}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Close Browser"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Browser Management Tips:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Only browsers launched through InfoScope are tracked here</li>
                  <li>• Closing browsers here terminates the process completely</li>
                  <li>• Some browsers may continue running in the background even after closing tabs</li>
                  <li>• Use "Close All" to terminate all tracked browser processes at once</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowserManager;