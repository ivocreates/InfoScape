const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openBrowser: (url) => ipcRenderer.invoke('open-browser', url),
  openBrowserWith: (url, browser) => ipcRenderer.invoke('open-browser-with', url, browser),
  openBrowserWithProxy: (url, config) => ipcRenderer.invoke('open-browser-with-proxy', url, config),
  getAvailableBrowsers: () => ipcRenderer.invoke('get-available-browsers'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Browser management
  getLaunchedBrowsers: () => ipcRenderer.invoke('get-launched-browsers'),
  closeBrowserProcess: (processId) => ipcRenderer.invoke('close-browser-process', processId),
  closeAllBrowsers: () => ipcRenderer.invoke('close-all-browsers'),
  
  // Listen to menu events
  onNewInvestigation: (callback) => ipcRenderer.on('new-investigation', callback),
  onSaveInvestigation: (callback) => ipcRenderer.on('save-investigation', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
