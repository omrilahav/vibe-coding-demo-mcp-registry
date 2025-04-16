import { app, BrowserWindow, session } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Add CSP headers for security but ensure development servers can connect
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:3001 http://localhost:5173 ws://localhost:3001 ws://localhost:5173"
        ]
      }
    });
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: !isDev, // Disable web security in dev mode
    },
  });

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../../renderer/index.html')}`;

  console.log(`Loading URL: ${startUrl}`);
  
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  try {
    // Start the Express server first using dynamic import
    const server = await import('../server');
    server.startServer();
    
    // Then create the Electron window
    setTimeout(() => {
      createWindow();
    }, 1000); // Small delay to ensure server is up
  } catch (error) {
    console.error('Failed to start server:', error);
    
    // Create window anyway, even if server failed
    createWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 