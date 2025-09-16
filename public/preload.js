const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openBrowser: (url) => ipcRenderer.invoke('open-browser', url),
  openBrowserWith: (url, browser) => ipcRenderer.invoke('open-browser-with', url, browser),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Listen to menu events
  onNewInvestigation: (callback) => ipcRenderer.on('new-investigation', callback),
  onSaveInvestigation: (callback) => ipcRenderer.on('save-investigation', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
