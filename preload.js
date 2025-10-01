const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('app-version'),
  isDev: () => ipcRenderer.invoke('is-dev'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Theme management
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  
  // Data export and save
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  saveInvestigation: (data) => ipcRenderer.invoke('save-investigation', data),
  loadInvestigation: () => ipcRenderer.invoke('load-investigation'),
  
  // Menu actions and event listeners
  onNewInvestigation: (callback) => ipcRenderer.on('new-investigation', callback),
  onExportResults: (callback) => ipcRenderer.on('export-results', callback),
  onOpenPreferences: (callback) => ipcRenderer.on('open-preferences', callback),
  onNavigateToTools: (callback) => ipcRenderer.on('navigate-to-tools', callback),
  onNavigateToChat: (callback) => ipcRenderer.on('navigate-to-chat', callback),
  onNavigateToInvestigation: (callback) => ipcRenderer.on('navigate-to-investigation', callback),
  onSaveInvestigation: (callback) => ipcRenderer.on('save-investigation', callback),
  
  // Send events to main process
  triggerSaveInvestigation: (data) => ipcRenderer.send('trigger-save-investigation', data),
  triggerExportResults: (data) => ipcRenderer.send('trigger-export-results', data),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
  
  // File operations
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data, defaultPath) => ipcRenderer.invoke('save-file', data, defaultPath),
  
  // Platform detection
  platform: process.platform,
  isElectron: true,
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Development helpers
  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),
  reload: () => ipcRenderer.invoke('reload')
});

// Expose version info
contextBridge.exposeInMainWorld('appInfo', {
  version: process.env.npm_package_version || '1.1.0',
  name: 'InfoScope OSINT Platform',
  author: 'ivocreates',
  description: 'Comprehensive OSINT investigation platform'
});

// Enhanced security settings
window.addEventListener('DOMContentLoaded', () => {
  // Disable context menu in production
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }
  
  // Disable drag and drop
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
    return false;
  });
  
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    return false;
  });
});