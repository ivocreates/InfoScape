import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Shield, 
  Eye, 
  Settings, 
  Monitor,
  Zap,
  Lock,
  AlertTriangle,
  Info,
  ExternalLink,
  X,
  Chrome
} from 'lucide-react';

// Browser icon components (simplified versions)
const BrowserIcons = {
  Chrome: ({ className }) => (
    <div className={`${className} rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 flex items-center justify-center`}>
      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
    </div>
  ),
  Firefox: ({ className }) => (
    <div className={`${className} rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center`}>
      <div className="w-3 h-3 bg-white rounded-full"></div>
    </div>
  ),
  Edge: ({ className }) => (
    <div className={`${className} rounded bg-gradient-to-r from-blue-600 to-green-500 flex items-center justify-center`}>
      <div className="w-3 h-3 bg-white rounded"></div>
    </div>
  )
};

function BrowserSelector({ isOpen, onClose, url, onBrowserSelect }) {
  const [availableBrowsers, setAvailableBrowsers] = useState({});
  const [selectedBrowser, setSelectedBrowser] = useState('builtin');
  const [proxyConfig, setProxyConfig] = useState({
    enabled: false,
    type: 'http',
    host: '',
    port: '',
    username: '',
    password: ''
  });
  const [torMode, setTorMode] = useState(false);
  const [selectedExitNode, setSelectedExitNode] = useState('auto');
  const [chainMode, setChainMode] = useState(false);
  const [selectedChain, setSelectedChain] = useState([]);

  useEffect(() => {
    if (isOpen && window.electronAPI) {
      window.electronAPI.getAvailableBrowsers().then(browsers => {
        setAvailableBrowsers(browsers);
      });
    }
  }, [isOpen]);

  const browserIcons = {
    builtin: Globe,
    chrome: BrowserIcons.Chrome,
    firefox: BrowserIcons.Firefox,
    edge: BrowserIcons.Edge,
    brave: Shield,
    tor: Lock
  };

  const proxyProfiles = {
    none: { name: 'No Proxy', description: 'Direct connection' },
    tor: { name: 'Tor Network', description: 'Anonymous browsing via Tor', host: '127.0.0.1', port: '9050' },
    custom: { name: 'Custom Proxy', description: 'Configure your own proxy server' }
  };

  const predefinedProxies = {
    tor_socks: { name: 'Tor SOCKS5', host: '127.0.0.1', port: '9050', type: 'socks5' },
    tor_http: { name: 'Tor HTTP (Privoxy)', host: '127.0.0.1', port: '8118', type: 'http' },
    i2p_http: { name: 'I2P HTTP Proxy', host: '127.0.0.1', port: '4444', type: 'http' },
    i2p_socks: { name: 'I2P SOCKS Proxy', host: '127.0.0.1', port: '4447', type: 'socks5' },
    freenet: { name: 'Freenet HTTP Proxy', host: '127.0.0.1', port: '8888', type: 'http' },
    psiphon: { name: 'Psiphon Proxy', host: '127.0.0.1', port: '8080', type: 'http' },
    lantern: { name: 'Lantern Proxy', host: '127.0.0.1', port: '8787', type: 'http' },
    ultrasurf: { name: 'UltraSurf Proxy', host: '127.0.0.1', port: '9666', type: 'http' }
  };

  const torExitNodes = {
    auto: { name: 'Auto Select', country: 'auto', flag: '🌍', description: 'Let Tor choose optimal exit node' },
    us: { name: 'United States', country: 'us', flag: '🇺🇸', description: 'Exit via US servers' },
    uk: { name: 'United Kingdom', country: 'uk', flag: '🇬🇧', description: 'Exit via UK servers' },
    de: { name: 'Germany', country: 'de', flag: '🇩🇪', description: 'Exit via German servers' },
    fr: { name: 'France', country: 'fr', flag: '🇫🇷', description: 'Exit via French servers' },
    nl: { name: 'Netherlands', country: 'nl', flag: '🇳🇱', description: 'Exit via Dutch servers' },
    se: { name: 'Sweden', country: 'se', flag: '🇸🇪', description: 'Exit via Swedish servers' },
    ch: { name: 'Switzerland', country: 'ch', flag: '🇨🇭', description: 'Exit via Swiss servers' },
    ca: { name: 'Canada', country: 'ca', flag: '🇨🇦', description: 'Exit via Canadian servers' },
    au: { name: 'Australia', country: 'au', flag: '🇦🇺', description: 'Exit via Australian servers' },
    jp: { name: 'Japan', country: 'jp', flag: '🇯🇵', description: 'Exit via Japanese servers' },
    sg: { name: 'Singapore', country: 'sg', flag: '🇸🇬', description: 'Exit via Singapore servers' },
    no: { name: 'Norway', country: 'no', flag: '🇳🇴', description: 'Exit via Norwegian servers' },
    is: { name: 'Iceland', country: 'is', flag: '🇮🇸', description: 'Exit via Icelandic servers' },
    fi: { name: 'Finland', country: 'fi', flag: '🇫🇮', description: 'Exit via Finnish servers' },
    at: { name: 'Austria', country: 'at', flag: '🇦🇹', description: 'Exit via Austrian servers' },
    be: { name: 'Belgium', country: 'be', flag: '🇧🇪', description: 'Exit via Belgian servers' },
    dk: { name: 'Denmark', country: 'dk', flag: '🇩🇰', description: 'Exit via Danish servers' },
    ro: { name: 'Romania', country: 'ro', flag: '🇷🇴', description: 'Exit via Romanian servers' },
    cz: { name: 'Czech Republic', country: 'cz', flag: '🇨🇿', description: 'Exit via Czech servers' }
  };

  const chainProfiles = {
    single: { name: 'Single Hop', description: 'Standard Tor circuit (3 hops)', hops: 1 },
    double: { name: 'Double VPN', description: 'Chain through 2 different countries', hops: 2 },
    triple: { name: 'Triple Chain', description: 'Maximum anonymity (3 proxy chains)', hops: 3 }
  };

  const handleBrowserSelect = (browserKey) => {
    setSelectedBrowser(browserKey);
    
    // Auto-configure for Tor browser
    if (browserKey === 'tor') {
      setProxyConfig({
        enabled: true,
        type: 'socks5',
        host: '127.0.0.1',
        port: '9050',
        username: '',
        password: ''
      });
      setTorMode(true);
    } else if (browserKey === 'mullvad') {
      setTorMode(true); // Mullvad Browser has Tor-like features
    } else {
      setTorMode(false);
    }
  };

  const addToChain = (nodeKey) => {
    if (selectedChain.length < 3 && !selectedChain.includes(nodeKey) && nodeKey !== 'auto') {
      setSelectedChain([...selectedChain, nodeKey]);
    }
  };

  const removeFromChain = (nodeKey) => {
    setSelectedChain(selectedChain.filter(key => key !== nodeKey));
  };

  const clearChain = () => {
    setSelectedChain([]);
  };

  const handleProxyProfileSelect = (profileKey) => {
    if (profileKey === 'none') {
      setProxyConfig(prev => ({ ...prev, enabled: false }));
    } else if (profileKey === 'tor') {
      setProxyConfig({
        enabled: true,
        type: 'socks5',
        host: '127.0.0.1',
        port: '9050',
        username: '',
        password: ''
      });
    }
  };

  const handlePredefinedProxy = (proxyKey) => {
    const proxy = predefinedProxies[proxyKey];
    setProxyConfig({
      enabled: true,
      type: proxy.type,
      host: proxy.host,
      port: proxy.port,
      username: '',
      password: ''
    });
  };

  const handleLaunch = () => {
    const browserConfig = {
      browser: selectedBrowser,
      proxy: proxyConfig.enabled ? 
        `${proxyConfig.type}://${proxyConfig.host}:${proxyConfig.port}` : null,
      torMode: torMode,
      exitNode: selectedExitNode,
      chainMode: chainMode,
      proxyChain: selectedChain,
      url: url
    };

    if (onBrowserSelect) {
      onBrowserSelect(browserConfig);
    }

    // Launch the browser with enhanced configuration
    if (window.electronAPI) {
      if (selectedBrowser === 'tor' || torMode || proxyConfig.enabled) {
        // Use enhanced proxy launching for Tor and privacy browsers
        window.electronAPI.openBrowserWithProxy(url, browserConfig);
      } else if (selectedBrowser === 'builtin') {
        window.electronAPI.openBrowser(url);
      } else {
        window.electronAPI.openBrowserWith(url, selectedBrowser);
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">OSINT Browser Launcher</h2>
            <p className="text-sm text-gray-600 mt-1">Choose browser and proxy configuration for investigation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* URL Display */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Target URL:</span>
            </div>
            <div className="text-sm text-gray-900 font-mono break-all">{url}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Browser Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Browser</h3>
              <div className="space-y-3">
                {Object.entries(availableBrowsers).map(([key, browser]) => {
                  const IconComponent = browserIcons[key] || Globe;
                  return (
                    <div
                      key={key}
                      onClick={() => browser.available && handleBrowserSelect(key)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedBrowser === key
                          ? 'border-blue-500 bg-blue-50'
                          : browser.available
                          ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-6 h-6 ${
                          selectedBrowser === key ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{browser.name}</div>
                          <div className="text-sm text-gray-500">
                            {browser.available ? 
                              (browser.proxy ? 'Proxy support available' : 'Standard browsing') :
                              'Not installed'
                            }
                          </div>
                        </div>
                        {selectedBrowser === key && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Proxy Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proxy Configuration</h3>
              
              {/* Quick Proxy Profiles */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Quick Profiles</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(proxyProfiles).map(([key, profile]) => (
                    <button
                      key={key}
                      onClick={() => handleProxyProfileSelect(key)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        (key === 'none' && !proxyConfig.enabled) ||
                        (key === 'tor' && proxyConfig.enabled && proxyConfig.host === '127.0.0.1' && proxyConfig.port === '9050')
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{profile.name}</div>
                      <div className="text-sm text-gray-500">{profile.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Predefined Proxies */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Predefined Proxies</label>
                <div className="space-y-2">
                  {Object.entries(predefinedProxies).map(([key, proxy]) => (
                    <button
                      key={key}
                      onClick={() => handlePredefinedProxy(key)}
                      className="w-full p-2 text-left border border-gray-200 rounded hover:border-gray-300 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{proxy.name}</div>
                      <div className="text-xs text-gray-500">{proxy.host}:{proxy.port} ({proxy.type})</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Proxy Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableProxy"
                    checked={proxyConfig.enabled}
                    onChange={(e) => setProxyConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="enableProxy" className="text-sm font-medium text-gray-700">
                    Enable Custom Proxy
                  </label>
                </div>

                {proxyConfig.enabled && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Type</label>
                        <select
                          value={proxyConfig.type}
                          onChange={(e) => setProxyConfig(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="http">HTTP</option>
                          <option value="https">HTTPS</option>
                          <option value="socks4">SOCKS4</option>
                          <option value="socks5">SOCKS5</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Host</label>
                        <input
                          type="text"
                          value={proxyConfig.host}
                          onChange={(e) => setProxyConfig(prev => ({ ...prev, host: e.target.value }))}
                          placeholder="127.0.0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Port</label>
                      <input
                        type="text"
                        value={proxyConfig.port}
                        onChange={(e) => setProxyConfig(prev => ({ ...prev, port: e.target.value }))}
                        placeholder="9050"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tor Configuration (only show when Tor mode is enabled) */}
            {(torMode || selectedBrowser === 'tor') && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Tor Network Configuration
                </h3>
                
                {/* Exit Node Selection */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Select Exit Node Location</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {Object.entries(torExitNodes).map(([key, node]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedExitNode(key)}
                        className={`p-2 text-left border rounded-lg transition-colors ${
                          selectedExitNode === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{node.flag}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{node.name}</div>
                            <div className="text-xs text-gray-500 truncate">{node.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chain Mode Configuration */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="enableChain"
                      checked={chainMode}
                      onChange={(e) => setChainMode(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="enableChain" className="text-sm font-medium text-gray-700">
                      Enable Proxy Chaining (Multi-hop)
                    </label>
                  </div>

                  {chainMode && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Create a chain of proxy servers for maximum anonymity. Select up to 3 countries in order.
                      </div>
                      
                      {/* Chain Display */}
                      {selectedChain.length > 0 && (
                        <div className="mb-4">
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Current Chain:</label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-500">Your Device</span>
                            {selectedChain.map((nodeKey, index) => (
                              <React.Fragment key={nodeKey}>
                                <span className="text-gray-400">→</span>
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 border border-blue-200 rounded">
                                  <span>{torExitNodes[nodeKey]?.flag}</span>
                                  <span className="text-sm font-medium text-blue-900">{torExitNodes[nodeKey]?.name}</span>
                                  <button
                                    onClick={() => removeFromChain(nodeKey)}
                                    className="ml-1 text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </React.Fragment>
                            ))}
                            <span className="text-gray-400">→</span>
                            <span className="text-sm text-gray-500">Target Website</span>
                          </div>
                          <button
                            onClick={clearChain}
                            className="mt-2 text-xs text-red-600 hover:text-red-800"
                          >
                            Clear Chain
                          </button>
                        </div>
                      )}

                      {/* Add to Chain */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Add to Chain:</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                          {Object.entries(torExitNodes).map(([key, node]) => {
                            if (key === 'auto' || selectedChain.includes(key) || selectedChain.length >= 3) return null;
                            return (
                              <button
                                key={key}
                                onClick={() => addToChain(key)}
                                className="p-1 text-center border border-gray-200 rounded hover:border-gray-300 transition-colors"
                              >
                                <div className="text-sm">{node.flag}</div>
                                <div className="text-xs text-gray-600 truncate">{node.country.toUpperCase()}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Security Warnings */}
          {(selectedBrowser === 'tor' || proxyConfig.enabled) && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Security Notice</h4>
                  <div className="text-sm text-amber-800 mt-1 space-y-1">
                    <p>• Using proxy/Tor may slow down browsing but increases anonymity</p>
                    <p>• Ensure proxy server is trustworthy and secure</p>
                    <p>• Some websites may block proxy/Tor traffic</p>
                    <p>• Always comply with local laws and website terms of service</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Configuration will be used for this session only</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunch}
                disabled={!availableBrowsers[selectedBrowser]?.available}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Launch Browser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowserSelector;