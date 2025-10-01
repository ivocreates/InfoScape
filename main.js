const { app, BrowserWindow, Menu, shell, dialog, ipcMain, nativeTheme } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const isDev = require('electron-is-dev');
const { spawn } = require('child_process');

// Keep a global reference of the window object
let mainWindow;
let devServerProcess;

// Configure auto-updater
autoUpdater.checkForUpdatesAndNotify();

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version is available. It will be downloaded in the background.',
    buttons: ['OK']
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
});

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded');
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded. The application will restart to apply the update.',
    buttons: ['Restart Now', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, './public/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false,
    backgroundColor: '#0f172a', // Dark theme background
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#ffffff'
    }
  });

  // Set window title
  mainWindow.setTitle('InfoScope OSINT Platform');

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      // Open DevTools in development
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    
    // Kill dev server process if running
    if (devServerProcess) {
      devServerProcess.kill();
      devServerProcess = null;
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Investigation',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-investigation');
          }
        },
        {
          label: 'Export Results',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('export-results');
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-preferences');
          }
        },
        { type: 'separator' },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'OSINT Tools',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('navigate-to-tools');
          }
        },
        {
          label: 'AI Assistant',
          accelerator: 'CmdOrCtrl+A',
          click: () => {
            mainWindow.webContents.send('navigate-to-chat');
          }
        },
        {
          label: 'Investigation Manager',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('navigate-to-investigation');
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About InfoScope',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About InfoScope OSINT Platform',
              message: 'InfoScope OSINT Platform',
              detail: 'Version 1.1.0\n\nA comprehensive OSINT investigation platform with AI assistance and professional tools.\n\nDeveloped with ❤️ for the OSINT community.',
              buttons: ['OK']
            });
          }
        },
        {
          label: 'Check for Updates',
          click: () => {
            autoUpdater.checkForUpdatesAndNotify();
          }
        },
        { type: 'separator' },
        {
          label: 'GitHub Repository',
          click: () => {
            shell.openExternal('https://github.com/ivocreates/InfoScape');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/ivocreates/InfoScape/issues');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[5].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Start React dev server in development mode
function startDevServer() {
  if (isDev && !devServerProcess) {
    console.log('Starting React development server...');
    
    devServerProcess = spawn('npm', ['start'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });

    devServerProcess.on('error', (err) => {
      console.error('Failed to start dev server:', err);
    });

    devServerProcess.on('close', (code) => {
      console.log(`Dev server process exited with code ${code}`);
      devServerProcess = null;
    });
  }
}

// App event handlers
app.whenReady().then(() => {
  if (isDev) {
    startDevServer();
    
    // Wait for dev server to start, then create window
    setTimeout(createWindow, 5000);
  } else {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle app updates
app.on('ready', () => {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// IPC handlers for renderer communication
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('is-dev', () => {
  return isDev;
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

// Theme handling
ipcMain.handle('set-theme', (event, theme) => {
  nativeTheme.themeSource = theme;
});

ipcMain.handle('get-theme', () => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
});

// Export data handling
ipcMain.handle('export-data', async (event, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Investigation Data',
    defaultPath: `infoscope-investigation-${new Date().toISOString().split('T')[0]}.json`,
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    const fs = require('fs');
    try {
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, canceled: true };
});

// Save investigation data
ipcMain.handle('save-investigation', async (event, data) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Investigation',
    defaultPath: `investigation-${new Date().toISOString().split('T')[0]}.osint`,
    filters: [
      { name: 'InfoScope Investigation', extensions: ['osint'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    const fs = require('fs');
    try {
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2));
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, canceled: true };
});

// Load investigation data
ipcMain.handle('load-investigation', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Load Investigation',
    filters: [
      { name: 'InfoScope Investigation', extensions: ['osint'] },
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const fs = require('fs');
    try {
      const data = fs.readFileSync(result.filePaths[0], 'utf8');
      return { success: true, data: JSON.parse(data), path: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, canceled: true };
});

// File operations
ipcMain.handle('open-file', async (event) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const fs = require('fs');
    try {
      const data = fs.readFileSync(result.filePaths[0], 'utf8');
      return { success: true, data, path: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, canceled: true };
});

ipcMain.handle('save-file', async (event, data, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save File',
    defaultPath: defaultPath || 'untitled.txt',
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    const fs = require('fs');
    try {
      fs.writeFileSync(result.filePath, data);
      return { success: true, path: result.filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  return { success: false, canceled: true };
});

// Window controls
ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// Development helpers
ipcMain.handle('open-dev-tools', () => {
  if (mainWindow) mainWindow.webContents.openDevTools();
});

ipcMain.handle('reload', () => {
  if (mainWindow) mainWindow.webContents.reload();
});

// Handle triggered saves from renderer
ipcMain.on('trigger-save-investigation', (event, data) => {
  mainWindow.webContents.send('save-investigation', data);
});

ipcMain.on('trigger-export-results', (event, data) => {
  mainWindow.webContents.send('export-results', data);
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}