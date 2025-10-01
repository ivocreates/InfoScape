import React, { useState, useEffect } from 'react';
import { 
  Info, 
  X, 
  Globe, 
  MapPin, 
  Shield, 
  Server,
  Eye,
  EyeOff,
  Wifi,
  Monitor
} from 'lucide-react';

const SystemInfoToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    browser: 'Unknown',
    browserVersion: 'Unknown',
    ip: 'Loading...',
    location: 'Loading...',
    proxy: 'None',
    userAgent: '',
    platform: '',
    language: '',
    timezone: '',
    screenResolution: '',
    connection: 'Unknown'
  });

  useEffect(() => {
    // Detect browser
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      let browser = 'Unknown';
      let version = 'Unknown';

      if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
        browser = 'Chrome';
        version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
      } else if (userAgent.includes('Firefox')) {
        browser = 'Firefox';
        version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browser = 'Safari';
        version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
      } else if (userAgent.includes('Edge')) {
        browser = 'Edge';
        version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
      }

      return { browser, version };
    };

    // Get system information
    const getSystemInfo = async () => {
      const { browser, version } = detectBrowser();
      
      try {
        // Get IP and location info
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();

        // Get connection info
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        setSystemInfo({
          browser,
          browserVersion: version,
          ip: ipData.ip || 'Unknown',
          location: `${ipData.city || 'Unknown'}, ${ipData.country_name || 'Unknown'}`,
          proxy: 'None', // Will be updated based on proxy detection
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screenResolution: `${screen.width}x${screen.height}`,
          connection: connection ? `${connection.effectiveType || 'Unknown'} (${connection.downlink || 'Unknown'}Mbps)` : 'Unknown'
        });
      } catch (error) {
        console.warn('Failed to fetch IP/location info:', error);
        setSystemInfo(prev => ({
          ...prev,
          browser,
          browserVersion: version,
          ip: 'Unable to fetch',
          location: 'Unable to fetch',
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screenResolution: `${screen.width}x${screen.height}`,
          connection: 'Unknown'
        }));
      }
    };

    getSystemInfo();
  }, []);

  const getBrowserIcon = () => {
    switch (systemInfo.browser.toLowerCase()) {
      case 'chrome':
        return <Globe className="w-4 h-4" />;
      case 'firefox':
        return <Globe className="w-4 h-4" />;
      case 'safari':
        return <Globe className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110
            ${isOpen 
              ? 'bg-blue-600 text-white shadow-blue-500/25' 
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 shadow-gray-500/25 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
            border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500
          `}
          title={isOpen ? "Hide System Info" : "Show System Info"}
        >
          {isOpen ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* System Info Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-30"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="fixed bottom-20 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 animate-in slide-in-from-bottom-5 duration-300">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Info</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* System Information */}
              <div className="space-y-3">
                {/* Browser Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getBrowserIcon()}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Browser</span>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-900 dark:text-white">{systemInfo.browser}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">v{systemInfo.browserVersion}</div>
                  </div>
                </div>

                {/* IP Address */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IP Address</span>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-900 dark:text-white font-mono">{systemInfo.ip}</div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</span>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-900 dark:text-white">{systemInfo.location}</div>
                  </div>
                </div>

                {/* Proxy Status */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Proxy</span>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-900 dark:text-white">{systemInfo.proxy}</div>
                  </div>
                </div>

                {/* Connection */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Connection</span>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-900 dark:text-white">{systemInfo.connection}</div>
                  </div>
                </div>

                {/* Platform */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform</span>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-gray-900 dark:text-white">{systemInfo.platform}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{systemInfo.screenResolution}</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Language:</span>
                      <div className="text-gray-900 dark:text-white font-mono">{systemInfo.language}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Timezone:</span>
                      <div className="text-gray-900 dark:text-white font-mono text-xs">{systemInfo.timezone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  System information for OSINT investigation context
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SystemInfoToggle;