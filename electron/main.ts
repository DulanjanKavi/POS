import { app, BrowserWindow,ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { loadBgSyncService } from './fnServer/loadBgSyncService'
import * as dotenv from 'dotenv'
import registerPOSHandles from './ipc_handles/pos_handles/pos_handles_all'
import { setMainMenu } from './mainWindowMenu'
import { registerSettingsWindowIpc } from './ipc_handles/settings/sentings'
import { createFileRoute, createURLRoute } from 'electron-router-dom'
dotenv.config()

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))


// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');
process.env.JWT_TOKEN = "";


export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST



let win: BrowserWindow | null;
const sqlite3 = require('sqlite3').verbose();
const dbPath=path.join(process.env.APP_ROOT, 'pos.db')

var db:any = null;
const ipcGlobals = {
  ID: null,
  cashierID: null,
  holdArray: [],
  db: null,
}

async function initialLoadingProcess() {
  // start the queue manager
  console.log(process.env.APP_NAME);
  console.log('starting Sync Tool')
  await loadBgSyncService().catch((err) => {
    console.error("Sync Tool", err)
    return false;
  });
  console.log('Sync Tool started')
  try {
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: { message: any }) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Connected to the SQLite database.');
      }
    });
    console.log('Database connected');

  } catch (error) {
    console.error("SQLite", error);
  }

  try {
    if (!db) {
      throw new Error("Database is not connected");
    }
    // register ipcMain handlers here
    // we move the handlers to a separate file for better organization
    registerPOSHandles(ipcMain, db, ipcGlobals);
    registerSettingsWindowIpc(ipcMain);
  } catch (error) {
    console.error("IPC Handlers", error);
  }
  console.log('Ready to serve')
  
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 4000)
  })
  return true;
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    minWidth:950,
    minHeight:750,
    show: false,
    title: process.env.APP_NAME||"TEST POS",
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  
  // adding a splash screen
  const splash = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    width: 600,
    height: 350,
    transparent: true,
    frame: false,
    title: process.env.APP_NAME||"TEST POS",
  })
  splash.loadFile(path.join(process.env.APP_ROOT, 'html/splash.html'))
  splash.center()

  initialLoadingProcess().then(() => {
    if (!win) {
      console.error('Window is not defined')
      return
    }
    setMainMenu(win, ipcMain);

    win.show()
    win.webContents.on('did-finish-load', () => {
      win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })
    win.maximize();
  
    if (VITE_DEV_SERVER_URL) {
      win.loadURL(createURLRoute(VITE_DEV_SERVER_URL, "main"))
    } else {
      win.loadFile(...createFileRoute(path.join(RENDERER_DIST, 'index.html'), "settings"))
    }
    // win.webContents.openDevTools()
    splash.destroy()
  }).catch((err) => {
    console.error(err)
    splash.destroy()
  })
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('minimize', () => {
  if(win)
  {
    win.isMinimized() ? win.restore() : win.minimize()
  }
  
})

ipcMain.on('maximize', () => {
  if(win)
  {
    win.maximize()
  }
  
})

ipcMain.on('restore', () => {
  if(win)
  {
    win.restore()
  }

})


app.whenReady().then(createWindow)
