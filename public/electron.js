const { app, BrowserWindow, Menu, ipcMain, shell, session, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const windowStateKeeper = require('electron-window-state');

// Enable live reload for Electron in development
if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

class InfoScopeElectronApp {
  constructor() {
    this.mainWindow = null;
    this.isQuitting = false;
    this.appConfig = {
      name: 'InfoScope OSINT Platform',
      version: '2.3.0',
      description: 'Professional Desktop OSINT Investigation Tool'
    };
  }

  init() {
    // Configure app properties
    app.setName(this.appConfig.name);
    app.setVersion(this.appConfig.version);
    
    // Security: Prevent new window creation
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });
    });

    // App event handlers
    app.whenReady().then(() => this.createMainWindow());
    app.on('window-all-closed', () => this.handleWindowAllClosed());
    app.on('activate', () => this.handleActivate());
    app.on('before-quit', () => this.handleBeforeQuit());

    // Security configurations
    this.setupSecurity();
    
    // Auto-updater setup
    if (!isDev) {
      this.setupAutoUpdater();
    }
  }

  createMainWindow() {
    // Load window state
    let mainWindowState = windowStateKeeper({
      defaultWidth: 1400,
      defaultHeight: 900
    });

    // Create the browser window
    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 1000,
      minHeight: 700,
      show: false, // Don't show until ready
      icon: path.join(__dirname, '../assets/icons/icon.png'),
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
        experimentalFeatures: false
      }
    });

    // Let windowStateKeeper manage the window
    mainWindowState.manage(this.mainWindow);

    // Load the application
    const startUrl = isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, '../build/index.html')}`;
    
    this.mainWindow.loadURL(startUrl);

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      
      // Focus window on creation
      if (isDev) {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Prevent external navigation
    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      if (url !== this.mainWindow.webContents.getURL()) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });

    // Set up application menu
    this.createApplicationMenu();

    // Set up IPC handlers
    this.setupIPC();
  }

  createApplicationMenu() {
    const template = [
      {
        label: 'InfoScope',
        submenu: [
          {
            label: 'About InfoScope',
            click: () => this.showAboutDialog()
          },
          { type: 'separator' },
          {
            label: 'Preferences...',
            accelerator: 'CmdOrCtrl+,',
            click: () => this.openPreferences()
          },
          { type: 'separator' },
          {
            label: 'Hide InfoScope',
            accelerator: 'CmdOrCtrl+H',
            role: 'hide'
          },
          {
            label: 'Hide Others',
            accelerator: 'CmdOrCtrl+Shift+H',
            role: 'hideothers'
          },
          {
            label: 'Show All',
            role: 'unhide'
          },
          { type: 'separator' },
          {
            label: 'Quit InfoScope',
            accelerator: 'CmdOrCtrl+Q',
            click: () => app.quit()
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
        ]
      },
      {
        label: 'Tools',
        submenu: [
          {
            label: 'OSINT Framework',
            click: () => this.sendToRenderer('navigate-to', 'osint-tools')
          },
          {
            label: 'Domain Analysis',
            click: () => this.sendToRenderer('navigate-to', 'domain-analyzer')
          },
          {
            label: 'People Search',
            click: () => this.sendToRenderer('navigate-to', 'profile-analyzer')
          },
          { type: 'separator' },
          {
            label: 'API Configuration',
            click: () => this.sendToRenderer('navigate-to', 'api-config')
          },
          {
            label: 'Built-in Browser',
            click: () => this.openBuiltinBrowser()
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
          { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
          { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
          { type: 'separator' },
          { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
          { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
          { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
          { type: 'separator' },
          { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
        ]
      },
      {
        label: 'Window',
        submenu: [
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
          { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' }
        ]
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'InfoScope Documentation',
            click: () => shell.openExternal('https://github.com/ivocreates/InfoScope/wiki')
          },
          {
            label: 'Report Issue',
            click: () => shell.openExternal('https://github.com/ivocreates/InfoScope/issues')
          },
          { type: 'separator' },
          {
            label: 'Check for Updates',
            click: () => this.checkForUpdates()
          }
        ]
      }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
      template[0].submenu.unshift({
        label: 'Services',
        role: 'services',
        submenu: []
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupSecurity() {
    // Content Security Policy
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "connect-src 'self' https: wss: ws:; " +
            "img-src 'self' data: https:; " +
            "style-src 'self' 'unsafe-inline' https:;"
          ]
        }
      });
    });

    // Disable node integration globally
    app.on('web-contents-created', (event, contents) => {
      contents.on('will-attach-webview', (event, webPreferences, params) => {
        delete webPreferences.preload;
        webPreferences.nodeIntegration = false;
        webPreferences.contextIsolation = true;
      });
    });
  }

  setupIPC() {
    // Handle application info requests
    ipcMain.handle('get-app-info', () => {
      return {
        name: this.appConfig.name,
        version: this.appConfig.version,
        platform: process.platform,
        arch: process.arch,
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node
      };
    });

    // Handle external link opening
    ipcMain.handle('open-external', (event, url) => {
      shell.openExternal(url);
    });

    // Handle file dialog
    ipcMain.handle('show-open-dialog', async (event, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow, options);
      return result;
    });

    // Handle save dialog
    ipcMain.handle('show-save-dialog', async (event, options) => {
      const result = await dialog.showSaveDialog(this.mainWindow, options);
      return result;
    });

    // Handle navigation
    ipcMain.on('navigate-to', (event, view) => {
      this.sendToRenderer('navigate-to', view);
    });
  }

  setupAutoUpdater() {
    autoUpdater.checkForUpdatesAndNotify();
    
    autoUpdater.on('update-available', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update available',
        message: 'A new version of InfoScope is available. It will be downloaded in the background.',
        buttons: ['OK']
      });
    });

    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update ready',
        message: 'Update downloaded. InfoScope will restart to apply the update.',
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  }

  sendToRenderer(channel, data) {
    if (this.mainWindow && this.mainWindow.webContents) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  showAboutDialog() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'About InfoScope',
      message: this.appConfig.name,
      detail: `Version: ${this.appConfig.version}\n${this.appConfig.description}\n\nBuilt with Electron and React\nCopyright © 2024 InfoScope Team`,
      buttons: ['OK']
    });
  }

  openPreferences() {
    this.sendToRenderer('navigate-to', 'api-config');
  }

  openBuiltinBrowser() {
    this.sendToRenderer('navigate-to', 'browser');
  }

  checkForUpdates() {
    if (isDev) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Updates',
        message: 'Update checking is disabled in development mode.',
        buttons: ['OK']
      });
    } else {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }

  handleWindowAllClosed() {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  }

  handleActivate() {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createMainWindow();
    }
  }

  handleBeforeQuit() {
    this.isQuitting = true;
  }
}

// Initialize the application
const infoScopeApp = new InfoScopeElectronApp();
infoScopeApp.init();

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (infoScopeApp.mainWindow) {
      if (infoScopeApp.mainWindow.isMinimized()) infoScopeApp.mainWindow.restore();
      infoScopeApp.mainWindow.focus();
    }
  });
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

ipcMain.handle('open-browser-with-proxy', async (event, url, browserConfig) => {
  try {
    const { spawn } = require('child_process');
    const os = require('os');
    const platform = os.platform();
    
    let command, args = [];
    
    // Configure browser based on type and proxy settings
    switch (browserConfig.browser) {
      case 'tor':
        // Tor Browser configuration with better path detection
        const possibleTorPaths = [
          `${process.env.LOCALAPPDATA}\\Tor Browser\\Browser\\firefox.exe`,
          `C:\\Users\\${os.userInfo().username}\\Desktop\\Tor Browser\\Browser\\firefox.exe`,
          'C:\\Program Files\\Tor Browser\\Browser\\firefox.exe',
          'C:\\Program Files (x86)\\Tor Browser\\Browser\\firefox.exe'
        ];
        
        let torPath = null;
        for (const path of possibleTorPaths) {
          try {
            if (require('fs').existsSync(path)) {
              torPath = path;
              break;
            }
          } catch (error) {
            console.log('Checking Tor path failed:', path);
          }
        }
        
        if (platform === 'win32' && torPath) {
          command = torPath;
          args = ['-profile', `${require('path').dirname(torPath)}\\..\\TorBrowser\\Data\\Browser\\profile.default`];
        } else if (platform === 'darwin') {
          command = '/Applications/Tor Browser.app/Contents/MacOS/firefox';
          args = ['-profile', '/Applications/Tor Browser.app/Contents/Resources/TorBrowser/Tor/PluggableTransports'];
        } else if (platform === 'linux') {
          command = 'torbrowser-launcher';
          args = [];
        } else {
          // Fallback to regular Firefox if Tor is not found
          console.log('Tor Browser not found, falling back to Firefox');
          return ipcMain.handle('open-browser-with-proxy', event, url, { ...browserConfig, browser: 'firefox' });
        }

        // Add Tor-specific configurations if provided
        if (browserConfig.exitNode && browserConfig.exitNode !== 'auto') {
          // Create custom torrc configuration for exit node selection
          const torrc_config = `ExitNodes {${browserConfig.exitNode}}`;
          console.log('Tor Exit Node Configuration:', torrc_config);
          // Note: In production, this would write to a temporary torrc file
        }

        if (browserConfig.chainMode && browserConfig.proxyChain && browserConfig.proxyChain.length > 0) {
          // Configure proxy chaining for maximum anonymity
          const chain_config = `ExitNodes {${browserConfig.proxyChain.join(',')}}`;
          console.log('Tor Chain Configuration:', chain_config);
          // Note: In production, this would configure multiple proxy hops
        }

        args.push(url);
        break;

      case 'tails':
        // Tails OS Browser (if running on Tails)
        if (platform === 'linux') {
          command = 'tor-browser';
          args = [url];
        } else {
          // Fallback to Tor Browser
          return ipcMain.handle('open-browser-with-proxy', event, url, { ...browserConfig, browser: 'tor' });
        }
        break;

      case 'whonix':
        // Whonix Gateway Browser
        if (platform === 'linux') {
          command = 'firefox-esr';
          args = ['-private-window', url];
        } else {
          // Fallback to Tor Browser
          return ipcMain.handle('open-browser-with-proxy', event, url, { ...browserConfig, browser: 'tor' });
        }
        break;

      case 'mullvad':
        // Mullvad Browser (privacy-focused fork of Tor Browser)
        if (platform === 'win32') {
          command = 'C:\\Program Files\\Mullvad Browser\\Browser\\firefox.exe';
        } else if (platform === 'darwin') {
          command = '/Applications/Mullvad Browser.app/Contents/MacOS/firefox';
        } else {
          command = 'mullvad-browser';
        }
        args = ['-private-window', url];
        break;
        
      case 'chrome-proxy':
        // Chrome with custom proxy - Enhanced detection
        const possibleChromePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
          `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`
        ];
        
        let chromePath = null;
        if (platform === 'win32') {
          for (const path of possibleChromePaths) {
            try {
              if (require('fs').existsSync(path)) {
                chromePath = path;
                break;
              }
            } catch (error) {
              console.log('Checking Chrome path failed:', path);
            }
          }
          command = chromePath || 'chrome';
        } else if (platform === 'darwin') {
          command = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
        } else {
          command = 'google-chrome';
        }
        
        args = [
          '--incognito',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--user-data-dir=' + require('os').tmpdir() + '/chrome-proxy-' + Date.now()
        ];
        
        if (browserConfig.proxy) {
          args.push('--proxy-server=' + browserConfig.proxy);
        }
        
        args.push(url);
        break;
        
      case 'firefox-proxy':
        // Firefox with custom proxy
        if (platform === 'win32') {
          command = 'firefox';
        } else if (platform === 'darwin') {
          command = '/Applications/Firefox.app/Contents/MacOS/firefox';
        } else {
          command = 'firefox';
        }
        
        args = ['-private-window'];
        
        if (browserConfig.proxy) {
          // Create temporary profile with proxy settings
          const tempProfile = require('os').tmpdir() + '/firefox-proxy-' + Date.now();
          args.push('-profile', tempProfile);
          
          // Note: Firefox proxy configuration would need additional setup
          // This is a simplified version
        }
        
        args.push(url);
        break;
        
      case 'brave-tor':
        // Brave with Tor support
        if (platform === 'win32') {
          command = 'brave';
        } else if (platform === 'darwin') {
          command = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
        } else {
          command = 'brave-browser';
        }
        
        args = [
          '--incognito',
          '--tor',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          url
        ];
        break;

      case 'epic':
        // Epic Privacy Browser
        if (platform === 'win32') {
          command = 'C:\\Program Files\\Epic Privacy Browser\\Application\\epic.exe';
        } else if (platform === 'darwin') {
          command = '/Applications/Epic Privacy Browser.app/Contents/MacOS/Epic Privacy Browser';
        } else {
          command = 'epic-browser';
        }
        
        args = ['--incognito', url];
        break;

      case 'librewolf':
        // LibreWolf (privacy-focused Firefox fork)
        if (platform === 'win32') {
          command = 'C:\\Program Files\\LibreWolf\\librewolf.exe';
        } else if (platform === 'darwin') {
          command = '/Applications/LibreWolf.app/Contents/MacOS/librewolf';
        } else {
          command = 'librewolf';
        }
        
        args = ['-private-window'];
        if (browserConfig.proxy) {
          // LibreWolf proxy configuration would need additional setup
        }
        args.push(url);
        break;

      case 'mullvad':
        // Mullvad Browser (Tor Browser without Tor network)
        if (platform === 'win32') {
          command = `${process.env.LOCALAPPDATA}\\Mullvad Browser\\Browser\\firefox.exe`;
        } else if (platform === 'darwin') {
          command = '/Applications/Mullvad Browser.app/Contents/MacOS/firefox';
        } else {
          command = 'mullvad-browser';
        }
        
        args = ['-private-window'];
        if (browserConfig.proxy) {
          // Mullvad Browser proxy configuration
          args.push('--proxy-server=' + browserConfig.proxy);
        }
        args.push(url);
        break;

      case 'tor':
        // Tor Browser
        if (platform === 'win32') {
          command = `${process.env.LOCALAPPDATA}\\Tor Browser\\Browser\\firefox.exe`;
        } else if (platform === 'darwin') {
          command = '/Applications/Tor Browser.app/Contents/MacOS/firefox';
        } else {
          command = 'torbrowser-launcher';
        }
        
        args = ['-private-window', url];
        // Tor Browser has built-in Tor proxy, no additional proxy needed
        break;

      case 'tails':
        // Tails Browser (if available on system)
        if (platform === 'win32') {
          command = 'C:\\Program Files\\Tails\\Browser\\firefox.exe';
        } else {
          command = 'tails-browser';
        }
        
        args = ['-private-window', url];
        break;

      case 'whonix':
        // Whonix Browser
        if (platform === 'win32') {
          command = 'C:\\Program Files\\Whonix-Gateway\\Browser\\firefox.exe';
        } else {
          command = 'whonix-browser';
        }
        
        args = ['-private-window', url];
        break;
        
      default:
        // Fallback to standard browser opening
        return ipcMain.handle('open-browser-with', event, url, browserConfig.browser);
    }
    
    // Launch the browser with proxy configuration
    const child = spawn(command, args, { 
      detached: true, 
      stdio: 'ignore'
    });
    
    child.unref();
    
  } catch (error) {
    console.error('Error opening browser with proxy:', error);
    // Fallback to built-in browser
    createBrowserWindow(url);
  }
});

ipcMain.handle('open-browser-with', async (event, url, browserType) => {
  try {
    const { spawn } = require('child_process');
    const fs = require('fs');
    const platform = process.platform;
    
    // Enhanced browser path detection
    const browserPaths = {
      chrome: {
        win32: [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
          `${process.env.USERPROFILE}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`
        ],
        darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
        linux: ['google-chrome', 'chrome', 'google-chrome-stable']
      },
      firefox: {
        win32: [
          'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
          'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe',
          `${process.env.LOCALAPPDATA}\\Mozilla Firefox\\firefox.exe`
        ],
        darwin: ['/Applications/Firefox.app/Contents/MacOS/firefox'],
        linux: ['firefox', 'firefox-esr']
      },
      edge: {
        win32: [
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
          `${process.env.PROGRAMFILES}\\Microsoft\\Edge\\Application\\msedge.exe`,
          `${process.env['PROGRAMFILES(X86)']}\\Microsoft\\Edge\\Application\\msedge.exe`
        ],
        darwin: ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
        linux: ['microsoft-edge', 'microsoft-edge-stable']
      },
      brave: {
        win32: [
          `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
          'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
          'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
        ],
        darwin: ['/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'],
        linux: ['brave-browser', 'brave']
      }
    };

    const findBrowserPath = (browserType) => {
      const paths = browserPaths[browserType]?.[platform] || [];
      
      for (const path of paths) {
        try {
          if (fs.existsSync(path)) {
            console.log(`Found ${browserType} at: ${path}`);
            return path;
          }
        } catch (error) {
          console.log(`Error checking path ${path}:`, error.message);
        }
      }
      
      // Return command name as fallback
      return paths[paths.length - 1] || browserType;
    };

    const launchBrowser = (browserPath, args) => {
      return new Promise((resolve, reject) => {
        const browserProcess = spawn(browserPath, args, { 
          detached: true, 
          stdio: 'ignore' 
        });
        
        // Track the process for potential cancellation
        const processId = Date.now().toString();
        launchedBrowsers.set(processId, {
          process: browserProcess,
          browser: browserType,
          url: url,
          timestamp: Date.now()
        });
        
        browserProcess.on('error', (error) => {
          console.error(`Browser launch error for ${browserPath}:`, error.message);
          launchedBrowsers.delete(processId);
          reject(error);
        });
        
        browserProcess.on('exit', () => {
          console.log(`Browser process ${processId} exited`);
          launchedBrowsers.delete(processId);
        });
        
        browserProcess.on('spawn', () => {
          console.log(`Successfully launched ${browserPath} with process ID: ${processId}`);
          resolve(processId);
        });
        
        // Unref to allow parent process to exit
        browserProcess.unref();
      });
    };
    
    switch (browserType) {
      case 'chrome':
        const chromePath = findBrowserPath('chrome');
        try {
          await launchBrowser(chromePath, ['--incognito', url]);
        } catch (error) {
          console.log('Chrome launch failed, using system default');
          shell.openExternal(url);
        }
        break;
        
      case 'firefox':
        const firefoxPath = findBrowserPath('firefox');
        try {
          await launchBrowser(firefoxPath, ['-private-window', url]);
        } catch (error) {
          console.log('Firefox launch failed, using system default');
          shell.openExternal(url);
        }
        break;
        
      case 'msedge':
      case 'edge':
        const edgePath = findBrowserPath('edge');
        try {
          await launchBrowser(edgePath, ['-inprivate', url]);
        } catch (error) {
          console.log('Edge launch failed, using system default');
          shell.openExternal(url);
        }
        break;
        
      case 'brave':
        const bravePath = findBrowserPath('brave');
        try {
          await launchBrowser(bravePath, ['--incognito', url]);
        } catch (error) {
          console.log('Brave launch failed, using system default');
          shell.openExternal(url);
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

ipcMain.handle('get-available-browsers', async () => {
  const { spawn } = require('child_process');
  const os = require('os');
  const fs = require('fs');
  const platform = os.platform();
  
  const browsers = {
    builtin: { name: 'Built-in Browser', available: true, proxy: false },
    chrome: { name: 'Google Chrome', available: false, proxy: true },
    firefox: { name: 'Mozilla Firefox', available: false, proxy: true },
    edge: { name: 'Microsoft Edge', available: false, proxy: true },
    brave: { name: 'Brave Browser', available: false, proxy: true },
    tor: { name: 'Tor Browser', available: false, proxy: false },
    mullvad: { name: 'Mullvad Browser', available: false, proxy: false },
    librewolf: { name: 'LibreWolf', available: false, proxy: true },
    epic: { name: 'Epic Privacy Browser', available: false, proxy: false },
    tails: { name: 'Tails Browser', available: false, proxy: false },
    whonix: { name: 'Whonix Browser', available: false, proxy: false }
  };
  
  // Enhanced browser path detection - reuse the same logic as browser launching
  const browserPaths = {
    chrome: {
      win32: [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env.USERPROFILE}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`
      ],
      darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'],
      linux: ['google-chrome', 'chrome', 'google-chrome-stable']
    },
    firefox: {
      win32: [
        'C:\\Program Files\\Mozilla Firefox\\firefox.exe',
        'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe',
        `${process.env.LOCALAPPDATA}\\Mozilla Firefox\\firefox.exe`
      ],
      darwin: ['/Applications/Firefox.app/Contents/MacOS/firefox'],
      linux: ['firefox', 'firefox-esr']
    },
    edge: {
      win32: [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        `${process.env.PROGRAMFILES}\\Microsoft\\Edge\\Application\\msedge.exe`,
        `${process.env['PROGRAMFILES(X86)']}\\Microsoft\\Edge\\Application\\msedge.exe`
      ],
      darwin: ['/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'],
      linux: ['microsoft-edge', 'microsoft-edge-stable']
    },
    brave: {
      win32: [
        `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
        'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
        'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
      ],
      darwin: ['/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'],
      linux: ['brave-browser', 'brave']
    },
    tor: {
      win32: [
        `C:\\Users\\${os.userInfo().username}\\Desktop\\Tor Browser\\Browser\\firefox.exe`,
        `${process.env.LOCALAPPDATA}\\Tor Browser\\Browser\\firefox.exe`,
        'C:\\Program Files\\Tor Browser\\Browser\\firefox.exe',
        'C:\\Program Files (x86)\\Tor Browser\\Browser\\firefox.exe'
      ],
      darwin: ['/Applications/Tor Browser.app/Contents/MacOS/firefox'],
      linux: ['/usr/bin/tor-browser', '/opt/tor-browser/Browser/firefox']
    },
    mullvad: {
      win32: [
        `${process.env.LOCALAPPDATA}\\Mullvad Browser\\Browser\\firefox.exe`,
        'C:\\Program Files\\Mullvad Browser\\Browser\\firefox.exe'
      ],
      darwin: ['/Applications/Mullvad Browser.app/Contents/MacOS/firefox'],
      linux: ['/usr/bin/mullvad-browser']
    },
    librewolf: {
      win32: [
        'C:\\Program Files\\LibreWolf\\librewolf.exe',
        'C:\\Program Files (x86)\\LibreWolf\\librewolf.exe'
      ],
      darwin: ['/Applications/LibreWolf.app/Contents/MacOS/librewolf'],
      linux: ['librewolf']
    },
    epic: {
      win32: [
        `${process.env.LOCALAPPDATA}\\Epic Privacy Browser\\Application\\epic.exe`,
        'C:\\Program Files\\Epic Privacy Browser\\Application\\epic.exe'
      ],
      darwin: ['/Applications/Epic Privacy Browser.app/Contents/MacOS/Epic Privacy Browser'],
      linux: ['epic']
    },
    tails: {
      win32: ['C:\\Program Files\\Tails\\Browser\\firefox.exe'],
      darwin: ['/Applications/Tails.app/Contents/MacOS/firefox'],
      linux: ['/usr/bin/tails-browser']
    },
    whonix: {
      win32: ['C:\\Program Files\\Whonix-Gateway\\Browser\\firefox.exe'],
      darwin: ['/Applications/Whonix.app/Contents/MacOS/firefox'],
      linux: ['/usr/bin/whonix-browser']
    }
  };
  
  // Check browser availability
  try {
    Object.keys(browserPaths).forEach(browserKey => {
      if (browsers[browserKey]) {
        const paths = browserPaths[browserKey][platform] || [];
        browsers[browserKey].available = paths.some(path => {
          try {
            return fs.existsSync(path);
          } catch (error) {
            console.log(`Error checking ${browserKey} path ${path}:`, error.message);
            return false;
          }
        });
        
        if (browsers[browserKey].available) {
          console.log(`✓ ${browsers[browserKey].name} is available`);
        }
      }
    });
  } catch (error) {
    console.error('Error checking browser availability:', error);
  }
  
  return browsers;
});

ipcMain.handle('open-external', async (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('get-app-version', async () => {
  return app.getVersion();
});

// Browser process management
ipcMain.handle('get-launched-browsers', async () => {
  const browsers = Array.from(launchedBrowsers.entries()).map(([id, data]) => ({
    id,
    browser: data.browser,
    url: data.url,
    timestamp: data.timestamp,
    running: !data.process.killed
  }));
  return browsers;
});

ipcMain.handle('close-browser-process', async (event, processId) => {
  try {
    const browserData = launchedBrowsers.get(processId);
    if (browserData && browserData.process && !browserData.process.killed) {
      browserData.process.kill();
      launchedBrowsers.delete(processId);
      return { success: true, message: `Browser process ${processId} closed` };
    } else {
      return { success: false, message: 'Browser process not found or already closed' };
    }
  } catch (error) {
    console.error('Error closing browser process:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('close-all-browsers', async () => {
  try {
    let closedCount = 0;
    for (const [id, data] of launchedBrowsers.entries()) {
      if (data.process && !data.process.killed) {
        data.process.kill();
        closedCount++;
      }
    }
    launchedBrowsers.clear();
    return { success: true, message: `Closed ${closedCount} browser processes` };
  } catch (error) {
    console.error('Error closing all browsers:', error);
    return { success: false, message: error.message };
  }
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
