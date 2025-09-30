// Enhanced Proxy Management Service
// Provides free proxy servers and secure chain configurations for OSINT investigations

// Free public proxy servers (educational/testing purposes only)
export const freeProxyServers = [
  // HTTP Proxies
  {
    id: 'proxy1',
    host: '8.210.7.146',
    port: 3128,
    type: 'HTTP',
    country: 'Singapore',
    anonymity: 'Elite',
    speed: 'Fast',
    uptime: '98%',
    ssl: false,
    status: 'active'
  },
  {
    id: 'proxy2',
    host: '103.149.162.194',
    port: 80,
    type: 'HTTP',
    country: 'Thailand',
    anonymity: 'Anonymous',
    speed: 'Medium',
    uptime: '95%',
    ssl: false,
    status: 'active'
  },
  {
    id: 'proxy3',
    host: '47.88.3.19',
    port: 8080,
    type: 'HTTP',
    country: 'Hong Kong',
    anonymity: 'Elite',
    speed: 'Fast',
    uptime: '97%',
    ssl: false,
    status: 'active'
  },
  {
    id: 'proxy4',
    host: '162.223.94.164',
    port: 80,
    type: 'HTTP',
    country: 'USA',
    anonymity: 'Anonymous',
    speed: 'Medium',
    uptime: '94%',
    ssl: false,
    status: 'active'
  },
  {
    id: 'proxy5',
    host: '185.162.231.106',
    port: 80,
    type: 'HTTP',
    country: 'Netherlands',
    anonymity: 'Elite',
    speed: 'Fast',
    uptime: '96%',
    ssl: false,
    status: 'active'
  },
  // HTTPS Proxies
  {
    id: 'proxy6',
    host: '45.77.177.11',
    port: 3128,
    type: 'HTTPS',
    country: 'USA',
    anonymity: 'Elite',
    speed: 'Fast',
    uptime: '99%',
    ssl: true,
    status: 'active'
  },
  {
    id: 'proxy7',
    host: '103.159.46.2',
    port: 3128,
    type: 'HTTPS',
    country: 'Bangladesh',
    anonymity: 'Anonymous',
    speed: 'Medium',
    uptime: '92%',
    ssl: true,
    status: 'active'
  },
  // SOCKS5 Proxies
  {
    id: 'proxy8',
    host: '72.210.252.134',
    port: 46164,
    type: 'SOCKS5',
    country: 'USA',
    anonymity: 'Elite',
    speed: 'Fast',
    uptime: '97%',
    ssl: false,
    status: 'active'
  },
  {
    id: 'proxy9',
    host: '184.178.172.25',
    port: 15291,
    type: 'SOCKS5',
    country: 'USA',
    anonymity: 'Elite',
    speed: 'Fast',
    uptime: '98%',
    ssl: false,
    status: 'active'
  },
  {
    id: 'proxy10',
    host: '192.111.137.35',
    port: 4145,
    type: 'SOCKS5',
    country: 'Canada',
    anonymity: 'Elite',
    speed: 'Medium',
    uptime: '95%',
    ssl: false,
    status: 'active'
  }
];

// Proxy chain configurations for enhanced anonymity
export const proxyChains = [
  {
    id: 'chain1',
    name: 'Basic Chain',
    description: 'Single proxy for basic anonymity',
    proxies: ['proxy1'],
    security: 'Basic',
    speed: 'Fast',
    anonymity: 'Low'
  },
  {
    id: 'chain2',
    name: 'Double Hop',
    description: 'Two proxies for enhanced privacy',
    proxies: ['proxy3', 'proxy6'],
    security: 'Enhanced',
    speed: 'Medium',
    anonymity: 'Medium'
  },
  {
    id: 'chain3',
    name: 'Triple Chain',
    description: 'Three proxies for maximum anonymity',
    proxies: ['proxy8', 'proxy5', 'proxy6'],
    security: 'Maximum',
    speed: 'Slow',
    anonymity: 'High'
  },
  {
    id: 'chain4',
    name: 'Mixed Protocol',
    description: 'SOCKS5 + HTTPS for protocol diversity',
    proxies: ['proxy9', 'proxy7'],
    security: 'Enhanced',
    speed: 'Medium',
    anonymity: 'Medium'
  },
  {
    id: 'chain5',
    name: 'Global Route',
    description: 'Multi-country routing for geo-diversity',
    proxies: ['proxy2', 'proxy4', 'proxy10'],
    security: 'Maximum',
    speed: 'Slow',
    anonymity: 'High'
  }
];

// Tor exit node configurations
export const torExitNodes = [
  { country: 'USA', code: 'us', nodes: 1250, speed: 'Fast' },
  { country: 'Germany', code: 'de', nodes: 890, speed: 'Fast' },
  { country: 'France', code: 'fr', nodes: 456, speed: 'Medium' },
  { country: 'Netherlands', code: 'nl', nodes: 723, speed: 'Fast' },
  { country: 'United Kingdom', code: 'gb', nodes: 345, speed: 'Medium' },
  { country: 'Canada', code: 'ca', nodes: 234, speed: 'Medium' },
  { country: 'Sweden', code: 'se', nodes: 167, speed: 'Fast' },
  { country: 'Switzerland', code: 'ch', nodes: 198, speed: 'Fast' },
  { country: 'Norway', code: 'no', nodes: 89, speed: 'Medium' },
  { country: 'Finland', code: 'fi', nodes: 67, speed: 'Medium' }
];

// VPN service configurations (for reference)
export const vpnServices = [
  {
    name: 'ProtonVPN',
    type: 'Free Tier',
    countries: ['Netherlands', 'Japan', 'USA'],
    speed: 'Medium',
    logging: 'No logs',
    encryption: 'AES-256'
  },
  {
    name: 'Windscribe',
    type: 'Free Tier',
    countries: ['Canada', 'Hong Kong', 'France', 'Germany', 'Netherlands', 'Norway', 'Romania', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom', 'United States'],
    speed: 'Fast',
    logging: 'Minimal logs',
    encryption: 'AES-256'
  },
  {
    name: 'TunnelBear',
    type: 'Free Tier',
    countries: ['23 countries'],
    speed: 'Medium',
    logging: 'No logs',
    encryption: 'AES-256'
  }
];

// Security levels and their configurations
export const securityLevels = {
  low: {
    name: 'Basic Browsing',
    description: 'Standard browser with basic privacy settings',
    features: ['Clear cookies', 'Block trackers'],
    proxy: false,
    tor: false,
    vpn: false
  },
  medium: {
    name: 'Enhanced Privacy',
    description: 'Single proxy with privacy extensions',
    features: ['Single proxy', 'Privacy extensions', 'Script blocking'],
    proxy: true,
    tor: false,
    vpn: false
  },
  high: {
    name: 'Advanced Anonymity',
    description: 'Proxy chains with Tor routing',
    features: ['Proxy chains', 'Tor routing', 'Full script blocking'],
    proxy: true,
    tor: true,
    vpn: false
  },
  maximum: {
    name: 'Maximum Security',
    description: 'VPN + Tor + Proxy chains',
    features: ['VPN tunnel', 'Tor network', 'Multiple proxy hops'],
    proxy: true,
    tor: true,
    vpn: true
  }
};

// Proxy testing and validation functions
export class ProxyManager {
  static async testProxy(proxy) {
    try {
      // In a real implementation, this would test proxy connectivity
      // For now, we'll simulate the test
      const response = await fetch('/api/test-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxy)
      });
      
      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          latency: result.latency,
          anonymity: result.anonymity,
          location: result.location
        };
      }
      
      return { success: false, error: 'Proxy test failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getWorkingProxies() {
    // Filter only active proxies
    return freeProxyServers.filter(proxy => proxy.status === 'active');
  }

  static async findProxiesByCountry(country) {
    return freeProxyServers.filter(proxy => 
      proxy.country.toLowerCase() === country.toLowerCase() && 
      proxy.status === 'active'
    );
  }

  static async findProxiesByType(type) {
    return freeProxyServers.filter(proxy => 
      proxy.type === type && 
      proxy.status === 'active'
    );
  }

  static getChainConfiguration(chainId) {
    return proxyChains.find(chain => chain.id === chainId);
  }

  static generateChainConfig(security = 'medium') {
    const workingProxies = this.getWorkingProxies();
    
    switch (security) {
      case 'low':
        return {
          proxies: workingProxies.slice(0, 1),
          description: 'Single proxy for basic anonymity'
        };
      case 'medium':
        return {
          proxies: workingProxies.slice(0, 2),
          description: 'Double proxy chain for enhanced privacy'
        };
      case 'high':
        return {
          proxies: workingProxies.slice(0, 3),
          description: 'Triple proxy chain for maximum anonymity'
        };
      default:
        return {
          proxies: workingProxies.slice(0, 1),
          description: 'Default proxy configuration'
        };
    }
  }

  static generateProxyPAC(proxies) {
    // Generate Proxy Auto-Configuration script
    const proxyString = proxies.map(proxy => 
      `PROXY ${proxy.host}:${proxy.port}`
    ).join('; ');
    
    return `
function FindProxyForURL(url, host) {
  // Use proxy chain for all requests
  return "${proxyString}; DIRECT";
}`;
  }

  static async refreshProxyList() {
    try {
      // In a real implementation, this would fetch fresh proxy lists
      // from various free proxy providers
      const response = await fetch('/api/refresh-proxies');
      if (response.ok) {
        const newProxies = await response.json();
        return newProxies;
      }
      return freeProxyServers;
    } catch (error) {
      console.error('Failed to refresh proxy list:', error);
      return freeProxyServers;
    }
  }

  static getRandomProxy(type = null) {
    let availableProxies = freeProxyServers.filter(p => p.status === 'active');
    
    if (type) {
      availableProxies = availableProxies.filter(p => p.type === type);
    }
    
    if (availableProxies.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * availableProxies.length);
    return availableProxies[randomIndex];
  }

  static async checkProxyHealth() {
    const results = [];
    
    for (const proxy of freeProxyServers) {
      try {
        const health = await this.testProxy(proxy);
        results.push({
          ...proxy,
          health: health.success,
          latency: health.latency || 'Unknown',
          lastChecked: new Date().toISOString()
        });
      } catch (error) {
        results.push({
          ...proxy,
          health: false,
          error: error.message,
          lastChecked: new Date().toISOString()
        });
      }
    }
    
    return results;
  }
}

// Browser configuration presets
export const browserPresets = {
  stealth: {
    name: 'Stealth Mode',
    description: 'Maximum privacy and anonymity',
    settings: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      disableJavaScript: true,
      disableImages: false,
      disablePlugins: true,
      blockAds: true,
      blockTrackers: true,
      clearCookies: true,
      doNotTrack: true
    }
  },
  research: {
    name: 'Research Mode',
    description: 'Balanced privacy for OSINT research',
    settings: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      disableJavaScript: false,
      disableImages: false,
      disablePlugins: false,
      blockAds: true,
      blockTrackers: true,
      clearCookies: false,
      doNotTrack: true
    }
  },
  standard: {
    name: 'Standard Mode',
    description: 'Normal browsing with basic privacy',
    settings: {
      userAgent: 'default',
      disableJavaScript: false,
      disableImages: false,
      disablePlugins: false,
      blockAds: false,
      blockTrackers: false,
      clearCookies: false,
      doNotTrack: false
    }
  }
};

export default {
  freeProxyServers,
  proxyChains,
  torExitNodes,
  vpnServices,
  securityLevels,
  browserPresets,
  ProxyManager
};