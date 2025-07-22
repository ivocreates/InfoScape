const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const { spawn } = require('child_process');

// Initialize electron store for persistent data
const store = new Store();

// Keep a global reference of the window object
let mainWindow;
let backendProcess;

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function startBackendServer() {
  if (!isDev) return; // In production, backend should be started separately

  try {
    const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
    const backendPath = path.join(__dirname, '../backend/main.py');
    
    backendProcess = spawn(pythonPath, [backendPath], {
      cwd: path.join(__dirname, '../backend')
    });

    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
    });

  } catch (error) {
    console.error('Failed to start backend server:', error);
  }
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
            mainWindow.webContents.send('menu-new-investigation');
          }
        },
        {
          label: 'Open Investigation',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'InfoScape Files', extensions: ['infoscape'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('menu-open-investigation', result.filePaths[0]);
            }
          }
        },
        {
          label: 'Save Investigation',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu-save-investigation');
          }
        },
        { type: 'separator' },
        {
          label: 'Export Report',
          submenu: [
            {
              label: 'Export as PDF',
              click: () => {
                mainWindow.webContents.send('menu-export-pdf');
              }
            },
            {
              label: 'Export as CSV',
              click: () => {
                mainWindow.webContents.send('menu-export-csv');
              }
            },
            {
              label: 'Export as JSON',
              click: () => {
                mainWindow.webContents.send('menu-export-json');
              }
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('menu-settings');
          }
        },
        { type: 'separator' },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Search',
      submenu: [
        {
          label: 'People Search',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('menu-people-search');
          }
        },
        {
          label: 'Reverse Lookup',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.send('menu-reverse-lookup');
          }
        },
        {
          label: 'Social Intelligence',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.send('menu-social-intel');
          }
        },
        {
          label: 'Domain Intelligence',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow.webContents.send('menu-domain-intel');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'OSINT Tools Manager',
          click: () => {
            mainWindow.webContents.send('menu-tools-manager');
          }
        },
        {
          label: 'Data Correlation',
          click: () => {
            mainWindow.webContents.send('menu-data-correlation');
          }
        },
        {
          label: 'Network Visualization',
          click: () => {
            mainWindow.webContents.send('menu-network-viz');
          }
        },
        { type: 'separator' },
        {
          label: 'Database Manager',
          click: () => {
            mainWindow.webContents.send('menu-database-manager');
          }
        },
        {
          label: 'Clear Cache',
          click: () => {
            mainWindow.webContents.send('menu-clear-cache');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('menu-dashboard');
          }
        },
        {
          label: 'Results',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('menu-results');
          }
        },
        {
          label: 'Timeline',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('menu-timeline');
          }
        },
        { type: 'separator' },
        {
          role: 'reload'
        },
        {
          role: 'forceReload'
        },
        {
          role: 'toggleDevTools'
        },
        { type: 'separator' },
        {
          role: 'resetZoom'
        },
        {
          role: 'zoomIn'
        },
        {
          role: 'zoomOut'
        },
        { type: 'separator' },
        {
          role: 'togglefullscreen'
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          role: 'minimize'
        },
        {
          role: 'close'
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://github.com/ivocreates/InfoScape/wiki');
          }
        },
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
        },
        { type: 'separator' },
        {
          label: 'About InfoScape',
          click: () => {
            mainWindow.webContents.send('menu-about');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event listeners
app.whenReady().then(() => {
  createMainWindow();
  createMenu();
  
  // Start backend server in development
  if (isDev) {
    setTimeout(startBackendServer, 2000); // Delay to allow frontend to start
  }
});

app.on('window-all-closed', () => {
  // Kill backend process if running
  if (backendProcess) {
    backendProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
});

ipcMain.handle('show-message-box', async (event, options) => {
  const result = await dialog.showMessageBox(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('shell-open-external', async (event, url) => {
  await shell.openExternal(url);
});

// Handle app protocol for deep linking
app.setAsDefaultProtocolClient('infoscape');

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
