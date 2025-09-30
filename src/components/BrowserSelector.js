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
  Chrome,
  RefreshCw,
  CheckCircle,
  Circle,
  Wifi,
  WifiOff,
  MapPin,
  Timer,
  Activity
} from 'lucide-react';
import { ProxyManager, freeProxyServers, proxyChains, torExitNodes, securityLevels, browserPresets } from '../utils/proxyManager';

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
  const [securityLevel, setSecurityLevel] = useState('medium');
  const [proxyConfig, setProxyConfig] = useState({
    enabled: false,
    type: 'http',
    host: '',
    port: '',
    username: '',
    password: '',
    selectedProxy: null
  });
  const [torMode, setTorMode] = useState(false);
  const [selectedExitNode, setSelectedExitNode] = useState('auto');
  const [chainMode, setChainMode] = useState(false);
  const [selectedChain, setSelectedChain] = useState('chain1');
  const [customChain, setCustomChain] = useState([]);
  const [proxyList, setProxyList] = useState(freeProxyServers);
  const [proxyTestResults, setProxyTestResults] = useState({});
  const [isTestingProxies, setIsTestingProxies] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('research');
  const [advancedMode, setAdvancedMode] = useState(false);

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
    cz: { name: 'Czech Republic', country: 'cz', flag: '🇨🇿', description: 'Exit via Czech servers' },
    pl: { name: 'Poland', country: 'pl', flag: '🇵🇱', description: 'Exit via Polish servers' },
    it: { name: 'Italy', country: 'it', flag: '🇮🇹', description: 'Exit via Italian servers' },
    es: { name: 'Spain', country: 'es', flag: '🇪🇸', description: 'Exit via Spanish servers' },
    pt: { name: 'Portugal', country: 'pt', flag: '🇵🇹', description: 'Exit via Portuguese servers' },
    gr: { name: 'Greece', country: 'gr', flag: '🇬🇷', description: 'Exit via Greek servers' },
    hu: { name: 'Hungary', country: 'hu', flag: '🇭🇺', description: 'Exit via Hungarian servers' },
    bg: { name: 'Bulgaria', country: 'bg', flag: '🇧🇬', description: 'Exit via Bulgarian servers' },
    hr: { name: 'Croatia', country: 'hr', flag: '🇭🇷', description: 'Exit via Croatian servers' },
    ee: { name: 'Estonia', country: 'ee', flag: '🇪🇪', description: 'Exit via Estonian servers' },
    lv: { name: 'Latvia', country: 'lv', flag: '🇱🇻', description: 'Exit via Latvian servers' },
    lt: { name: 'Lithuania', country: 'lt', flag: '🇱🇹', description: 'Exit via Lithuanian servers' },
    si: { name: 'Slovenia', country: 'si', flag: '🇸🇮', description: 'Exit via Slovenian servers' },
    sk: { name: 'Slovakia', country: 'sk', flag: '🇸🇰', description: 'Exit via Slovak servers' },
    ie: { name: 'Ireland', country: 'ie', flag: '🇮🇪', description: 'Exit via Irish servers' },
    lu: { name: 'Luxembourg', country: 'lu', flag: '🇱🇺', description: 'Exit via Luxembourg servers' },
    mt: { name: 'Malta', country: 'mt', flag: '🇲🇹', description: 'Exit via Maltese servers' },
    cy: { name: 'Cyprus', country: 'cy', flag: '🇨🇾', description: 'Exit via Cypriot servers' },
    kr: { name: 'South Korea', country: 'kr', flag: '🇰🇷', description: 'Exit via Korean servers' },
    tw: { name: 'Taiwan', country: 'tw', flag: '🇹🇼', description: 'Exit via Taiwanese servers' },
    hk: { name: 'Hong Kong', country: 'hk', flag: '🇭🇰', description: 'Exit via Hong Kong servers' },
    my: { name: 'Malaysia', country: 'my', flag: '🇲🇾', description: 'Exit via Malaysian servers' },
    th: { name: 'Thailand', country: 'th', flag: '🇹🇭', description: 'Exit via Thai servers' },
    ph: { name: 'Philippines', country: 'ph', flag: '🇵🇭', description: 'Exit via Philippine servers' },
    id: { name: 'Indonesia', country: 'id', flag: '🇮🇩', description: 'Exit via Indonesian servers' },
    vn: { name: 'Vietnam', country: 'vn', flag: '🇻🇳', description: 'Exit via Vietnamese servers' },
    in: { name: 'India', country: 'in', flag: '🇮🇳', description: 'Exit via Indian servers' },
    br: { name: 'Brazil', country: 'br', flag: '🇧🇷', description: 'Exit via Brazilian servers' },
    mx: { name: 'Mexico', country: 'mx', flag: '🇲🇽', description: 'Exit via Mexican servers' },
    ar: { name: 'Argentina', country: 'ar', flag: '🇦🇷', description: 'Exit via Argentine servers' },
    cl: { name: 'Chile', country: 'cl', flag: '🇨🇱', description: 'Exit via Chilean servers' },
    co: { name: 'Colombia', country: 'co', flag: '🇨🇴', description: 'Exit via Colombian servers' },
    za: { name: 'South Africa', country: 'za', flag: '🇿🇦', description: 'Exit via South African servers' },
    eg: { name: 'Egypt', country: 'eg', flag: '🇪🇬', description: 'Exit via Egyptian servers' },
    tr: { name: 'Turkey', country: 'tr', flag: '🇹🇷', description: 'Exit via Turkish servers' },
    il: { name: 'Israel', country: 'il', flag: '🇮🇱', description: 'Exit via Israeli servers' },
    ae: { name: 'UAE', country: 'ae', flag: '🇦🇪', description: 'Exit via UAE servers' },
    nz: { name: 'New Zealand', country: 'nz', flag: '🇳🇿', description: 'Exit via New Zealand servers' },
    ru: { name: 'Russia', country: 'ru', flag: '🇷🇺', description: 'Exit via Russian servers' },
    ua: { name: 'Ukraine', country: 'ua', flag: '🇺🇦', description: 'Exit via Ukrainian servers' }
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
        password: '',
        selectedProxy: null
      });
      setTorMode(true);
    } else if (browserKey === 'mullvad') {
      setTorMode(true); // Mullvad Browser has Tor-like features
    } else {
      setTorMode(false);
    }
  };

  // Enhanced proxy management functions
  const testSelectedProxy = async (proxy) => {
    setIsTestingProxies(true);
    try {
      const result = await ProxyManager.testProxy(proxy);
      setProxyTestResults(prev => ({
        ...prev,
        [proxy.id]: result
      }));
    } catch (error) {
      setProxyTestResults(prev => ({
        ...prev,
        [proxy.id]: { success: false, error: error.message }
      }));
    } finally {
      setIsTestingProxies(false);
    }
  };

  const refreshProxyList = async () => {
    setIsTestingProxies(true);
    try {
      const freshProxies = await ProxyManager.refreshProxyList();
      setProxyList(freshProxies);
      
      // Test all proxies
      const testResults = {};
      for (const proxy of freshProxies.slice(0, 5)) { // Test first 5 for performance
        try {
          const result = await ProxyManager.testProxy(proxy);
          testResults[proxy.id] = result;
        } catch (error) {
          testResults[proxy.id] = { success: false, error: error.message };
        }
      }
      setProxyTestResults(testResults);
    } catch (error) {
      console.error('Failed to refresh proxy list:', error);
    } finally {
      setIsTestingProxies(false);
    }
  };

  const selectRandomProxy = (type = null) => {
    const randomProxy = ProxyManager.getRandomProxy(type);
    if (randomProxy) {
      setProxyConfig(prev => ({
        ...prev,
        enabled: true,
        type: randomProxy.type.toLowerCase(),
        host: randomProxy.host,
        port: randomProxy.port.toString(),
        selectedProxy: randomProxy
      }));
    }
  };

  const applySecurityLevel = (level) => {
    setSecurityLevel(level);
    const config = securityLevels[level];
    
    if (config.proxy) {
      selectRandomProxy();
    }
    
    if (config.tor) {
      setTorMode(true);
      if (selectedBrowser !== 'tor') {
        setSelectedBrowser('tor');
      }
    }
    
    if (config.vpn) {
      // VPN configuration would go here in a real implementation
      console.log('VPN configuration needed for maximum security');
    }
  };

  const applyProxyChain = (chainId) => {
    const chain = proxyChains.find(c => c.id === chainId);
    if (chain) {
      setSelectedChain(chainId);
      setChainMode(true);
      
      // Configure first proxy in chain
      const firstProxy = proxyList.find(p => p.id === chain.proxies[0]);
      if (firstProxy) {
        setProxyConfig(prev => ({
          ...prev,
          enabled: true,
          type: firstProxy.type.toLowerCase(),
          host: firstProxy.host,
          port: firstProxy.port.toString(),
          selectedProxy: firstProxy
        }));
      }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto popup-scrollbar shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">OSINT Browser Launcher</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Choose browser and proxy configuration for investigation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop App Message */}
        {!window.electronAPI && (
          <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">Desktop Application Required</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  To use different browsers and advanced proxy features, please install the desktop application. 
                  The web version uses the built-in browser with limited proxy support.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.open('https://github.com/ivocreates/InfoScope/releases', '_blank')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download Desktop App
                  </button>
                  <button
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Web Browser Setup Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* URL Display */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target URL:</span>
            </div>
            <div className="text-sm text-gray-900 dark:text-white font-mono break-all">{url}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Browser Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Browser</h3>
              <div className="space-y-3">
                {Object.entries(availableBrowsers).map(([key, browser]) => {
                  const IconComponent = browserIcons[key] || Globe;
                  return (
                    <div
                      key={key}
                      onClick={() => browser.available && handleBrowserSelect(key)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedBrowser === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                          : browser.available
                          ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                          : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-6 h-6 ${
                          selectedBrowser === key ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{browser.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {browser.available ? 
                              (browser.proxy ? 'Proxy support available' : 'Standard browsing') :
                              'Not installed'
                            }
                          </div>
                        </div>
                        {selectedBrowser === key && (
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Browser Installation Section */}
              {!window.electronAPI && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Browser Installation Guide
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    For enhanced security and privacy during OSINT investigations:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href="https://www.torproject.org/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700/50 rounded-lg hover:bg-amber-25 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Tor Browser</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Maximum anonymity</div>
                      </div>
                    </a>
                    <a
                      href="https://brave.com/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700/50 rounded-lg hover:bg-amber-25 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Brave Browser</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Built-in privacy</div>
                      </div>
                    </a>
                    <a
                      href="https://www.mozilla.org/firefox/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700/50 rounded-lg hover:bg-amber-25 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <Globe className="w-4 h-4 text-red-600 dark:text-red-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Firefox</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Open source</div>
                      </div>
                    </a>
                    <a
                      href="https://mullvad.net/browser"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700/50 rounded-lg hover:bg-amber-25 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">Mullvad Browser</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Privacy focused</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Proxy Configuration */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proxy Configuration</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshProxyList}
                    disabled={isTestingProxies}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Refresh proxy list"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTestingProxies ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => setAdvancedMode(!advancedMode)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      advancedMode 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {advancedMode ? 'Simple' : 'Advanced'}
                  </button>
                </div>
              </div>

              {/* Security Level Quick Selection */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Security Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(securityLevels).map(([level, config]) => (
                    <button
                      key={level}
                      onClick={() => applySecurityLevel(level)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        securityLevel === level
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{config.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{config.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Free Proxy Servers */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Proxy Servers</label>
                  <button
                    onClick={() => selectRandomProxy()}
                    className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    Random Proxy
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto popup-scrollbar border border-gray-200 dark:border-gray-600 rounded-lg">
                  {proxyList.slice(0, 10).map((proxy) => {
                    const testResult = proxyTestResults[proxy.id];
                    const isSelected = proxyConfig.selectedProxy?.id === proxy.id;
                    
                    return (
                      <div
                        key={proxy.id}
                        onClick={() => setProxyConfig(prev => ({
                          ...prev,
                          enabled: true,
                          type: proxy.type.toLowerCase(),
                          host: proxy.host,
                          port: proxy.port.toString(),
                          selectedProxy: proxy
                        }))}
                        className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-gray-900 dark:text-white">{proxy.host}:{proxy.port}</span>
                              <span className={`px-1.5 py-0.5 text-xs rounded ${
                                proxy.type === 'HTTPS' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                proxy.type === 'SOCKS5' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}>
                                {proxy.type}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{proxy.country}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                proxy.anonymity === 'Elite' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                proxy.anonymity === 'Anonymous' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                                'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              }`}>
                                {proxy.anonymity}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">↑{proxy.uptime}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{proxy.speed}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {testResult ? (
                              testResult.success ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <X className="w-4 h-4 text-red-500" />
                              )
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  testSelectedProxy(proxy);
                                }}
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                title="Test proxy"
                              >
                                <Activity className="w-3 h-3" />
                              </button>
                            )}
                            {isSelected && <Circle className="w-3 h-3 text-blue-500 fill-current" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Proxy Profiles */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Quick Profiles</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(proxyProfiles).map(([key, profile]) => (
                    <button
                      key={key}
                      onClick={() => handleProxyProfileSelect(key)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        (key === 'none' && !proxyConfig.enabled) ||
                        (key === 'tor' && proxyConfig.enabled && proxyConfig.host === '127.0.0.1' && proxyConfig.port === '9050')
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{profile.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{profile.description}</div>
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
                          className="select-field"
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto popup-scrollbar border border-gray-200 rounded-lg p-3">
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
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 max-h-32 overflow-y-auto popup-scrollbar">
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
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Info className="w-4 h-4" />
              <span>Configuration will be used for this session only</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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