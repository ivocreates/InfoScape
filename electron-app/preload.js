const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Store operations (persistent data)
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key)
  },
  
  // Dialog operations
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Shell operations
  openExternal: (url) => ipcRenderer.invoke('shell-open-external', url),
  
  // Menu event listeners
  onMenuAction: (callback) => {
    const channels = [
      'menu-new-investigation',
      'menu-open-investigation',
      'menu-save-investigation',
      'menu-export-pdf',
      'menu-export-csv',
      'menu-export-json',
      'menu-settings',
      'menu-people-search',
      'menu-reverse-lookup',
      'menu-social-intel',
      'menu-domain-intel',
      'menu-tools-manager',
      'menu-data-correlation',
      'menu-network-viz',
      'menu-database-manager',
      'menu-clear-cache',
      'menu-dashboard',
      'menu-results',
      'menu-timeline',
      'menu-about'
    ];
    
    channels.forEach(channel => {
      ipcRenderer.on(channel, (event, ...args) => {
        callback(channel, ...args);
      });
    });
    
    // Return cleanup function
    return () => {
      channels.forEach(channel => {
        ipcRenderer.removeAllListeners(channel);
      });
    };
  },
  
  // Window operations
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  
  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  
  // System information
  platform: process.platform,
  arch: process.arch
});

// Expose a limited Node.js API
contextBridge.exposeInMainWorld('nodeAPI', {
  process: {
    platform: process.platform,
    versions: process.versions
  }
});
