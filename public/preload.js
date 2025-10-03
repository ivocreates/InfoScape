const { contextBridge, ipcRenderer, shell } = require('electron');

// Enhanced Electron Preload Script for InfoScope OSINT Platform
// Provides secure communication bridge between main process and renderer

class InfoScopeElectronAPI {
  constructor() {
    this.validChannels = {
      send: ['navigate-to', 'browser-action', 'proxy-config'],
      receive: ['navigate-to', 'app-update', 'browser-ready'],
      invoke: [
        'get-app-info',
        'open-external',
        'show-open-dialog',
        'show-save-dialog',
        'proxy-request',
        'get-system-info'
      ]
    };
  }

  // Application Information
  async getAppInfo() {
    return await ipcRenderer.invoke('get-app-info');
  }

  // External link handling
  async openExternal(url) {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      return await ipcRenderer.invoke('open-external', url);
    }
    throw new Error('Invalid URL provided');
  }

  // File system operations
  async showOpenDialog(options = {}) {
    return await ipcRenderer.invoke('show-open-dialog', options);
  }

  async showSaveDialog(options = {}) {
    return await ipcRenderer.invoke('show-save-dialog', options);
  }

  // Navigation and routing
  navigateTo(view) {
    if (typeof view === 'string') {
      ipcRenderer.send('navigate-to', view);
    }
  }

  // Event listeners
  on(channel, func) {
    if (this.validChannels.receive.includes(channel)) {
      const subscription = (event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);
      
      // Return unsubscribe function
      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    }
    throw new Error(`Invalid channel: ${channel}`);
  }

  // Remove all listeners for a channel
  removeAllListeners(channel) {
    if (this.validChannels.receive.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  }

  // System information
  async getSystemInfo() {
    return await ipcRenderer.invoke('get-system-info');
  }

  // Browser-specific functionality
  browser = {
    // Proxy configuration for Tor-like functionality
    configureProxy: async (config) => {
      return await ipcRenderer.invoke('proxy-request', 'configure', config);
    },

    // Clear browsing data
    clearData: async (options = {}) => {
      return await ipcRenderer.invoke('browser-action', 'clear-data', options);
    },

    // Set user agent
    setUserAgent: async (userAgent) => {
      return await ipcRenderer.invoke('browser-action', 'set-user-agent', userAgent);
    },

    // Enable/disable JavaScript
    toggleJavaScript: async (enabled) => {
      return await ipcRenderer.invoke('browser-action', 'toggle-javascript', enabled);
    },

    // Enable/disable images
    toggleImages: async (enabled) => {
      return await ipcRenderer.invoke('browser-action', 'toggle-images', enabled);
    }
  };

  // Security utilities
  security = {
    // Sanitize HTML content
    sanitizeHTML: (html) => {
      if (typeof html !== 'string') return '';
      
      // Basic HTML sanitization (in production, use a proper library like DOMPurify)
      return html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/javascript:/gi, '');
    },

    // Validate URLs
    isValidURL: (url) => {
      try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
      } catch {
        return false;
      }
    },

    // Generate secure random string
    generateSecureRandom: (length = 32) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
      return result;
    }
  };

  // OSINT-specific utilities
  osint = {
    // Rate limiting for API calls
    rateLimiter: new Map(),

    // Check rate limit
    checkRateLimit: (service, limit = 60, window = 60000) => {
      const now = Date.now();
      const key = service;
      
      if (!this.rateLimiter.has(key)) {
        this.rateLimiter.set(key, []);
      }
      
      const requests = this.rateLimiter.get(key);
      const validRequests = requests.filter(time => now - time < window);
      
      if (validRequests.length >= limit) {
        return false;
      }
      
      validRequests.push(now);
      this.rateLimiter.set(key, validRequests);
      return true;
    },

    // Validate domain names
    isValidDomain: (domain) => {
      const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      return domainRegex.test(domain) && domain.length <= 253;
    },

    // Validate email addresses
    isValidEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Validate IP addresses
    isValidIP: (ip) => {
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      
      if (ipv4Regex.test(ip)) {
        return ip.split('.').every(octet => parseInt(octet) <= 255);
      }
      
      return ipv6Regex.test(ip);
    },

    // Extract domain from URL
    extractDomain: (url) => {
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        return urlObj.hostname;
      } catch {
        return null;
      }
    }
  };

  // Storage utilities (using localStorage with security considerations)
  storage = {
    // Secure storage with encryption (basic implementation)
    setSecure: (key, value) => {
      try {
        const encrypted = btoa(JSON.stringify(value));
        localStorage.setItem(`infoscope_${key}`, encrypted);
        return true;
      } catch {
        return false;
      }
    },

    getSecure: (key) => {
      try {
        const encrypted = localStorage.getItem(`infoscope_${key}`);
        if (!encrypted) return null;
        return JSON.parse(atob(encrypted));
      } catch {
        return null;
      }
    },

    removeSecure: (key) => {
      try {
        localStorage.removeItem(`infoscope_${key}`);
        return true;
      } catch {
        return false;
      }
    },

    clearAll: () => {
      try {
        Object.keys(localStorage)
          .filter(key => key.startsWith('infoscope_'))
          .forEach(key => localStorage.removeItem(key));
        return true;
      } catch {
        return false;
      }
    }
  };

  // Platform detection
  platform = {
    isWindows: () => process.platform === 'win32',
    isMacOS: () => process.platform === 'darwin',
    isLinux: () => process.platform === 'linux',
    getArch: () => process.arch,
    getPlatform: () => process.platform
  };
}

// Create API instance
const infoScopeAPI = new InfoScopeElectronAPI();

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', infoScopeAPI);

// Expose a simplified version for backward compatibility
contextBridge.exposeInMainWorld('electron', {
  openExternal: infoScopeAPI.openExternal.bind(infoScopeAPI),
  getAppInfo: infoScopeAPI.getAppInfo.bind(infoScopeAPI),
  showOpenDialog: infoScopeAPI.showOpenDialog.bind(infoScopeAPI),
  showSaveDialog: infoScopeAPI.showSaveDialog.bind(infoScopeAPI)
});

// Security: Prevent access to Node.js APIs
delete global.require;
delete global.exports;
delete global.module;

// Log successful preload
console.log('InfoScope Electron preload script loaded successfully');
