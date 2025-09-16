const { app, BrowserWindow, ipcMain, shell, Menu, session } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let browserWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'favicon.ico'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (browserWindow) {
      browserWindow.close();
      browserWindow = null;
    }
  });

  // Create application menu
  createMenu();
}

function createBrowserWindow(url) {
  if (browserWindow) {
    browserWindow.focus();
    browserWindow.loadURL(url);
    return;
  }

  browserWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    parent: mainWindow,
    titleBarStyle: 'default',
    show: false
  });

  browserWindow.loadURL(url);

  browserWindow.once('ready-to-show', () => {
    browserWindow.show();
  });

  browserWindow.on('closed', () => {
    browserWindow = null;
  });

  // Handle external links
  browserWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
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
          label: 'Save Investigation',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('save-investigation');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Open Browser',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            createBrowserWindow('https://www.google.com');
          }
        },
        {
          label: 'Clear Cache',
          click: () => {
            session.defaultSession.clearStorageData();
          }
        }
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
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('open-browser', async (event, url) => {
  createBrowserWindow(url);
});

ipcMain.handle('open-browser-with', async (event, url, browserType) => {
  try {
    const { spawn } = require('child_process');
    
    switch (browserType) {
      case 'chrome':
        try {
          spawn('chrome', [url], { detached: true, stdio: 'ignore' });
        } catch {
          try {
            spawn('google-chrome', [url], { detached: true, stdio: 'ignore' });
          } catch {
            // Fallback to system default
            shell.openExternal(url);
          }
        }
        break;
      case 'firefox':
        try {
          spawn('firefox', [url], { detached: true, stdio: 'ignore' });
        } catch {
          shell.openExternal(url);
        }
        break;
      case 'msedge':
      case 'edge':
        try {
          spawn('msedge', [url], { detached: true, stdio: 'ignore' });
        } catch {
          shell.openExternal(url);
        }
        break;
      case 'brave':
        try {
          spawn('brave', [url], { detached: true, stdio: 'ignore' });
        } catch {
          try {
            spawn('brave-browser', [url], { detached: true, stdio: 'ignore' });
          } catch {
            shell.openExternal(url);
          }
        }
        break;
      default:
        shell.openExternal(url);
    }
  } catch (error) {
    console.error('Error opening browser:', error);
    shell.openExternal(url);
  }
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
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
