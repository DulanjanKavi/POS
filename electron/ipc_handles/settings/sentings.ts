import { BrowserWindow, IpcMain } from "electron";
import { createFileRoute, createURLRoute } from "electron-router-dom";
import path from 'path';

//const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')


export function registerSettingsWindowIpc(ipcMain:IpcMain){
    var settingsWindow:BrowserWindow | null = null;
    const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
    const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
    const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');

    console.log('registerSettingsWindowIpc');

    ipcMain.on('open-settings',()=>{
        if (settingsWindow) return;

        settingsWindow = new BrowserWindow({
            icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
            width: 800,
            height: 600,
            title: 'Settings',
            webPreferences: {
              preload: path.join(MAIN_DIST, 'preload.mjs'),
            },
        });
        settingsWindow.on('closed',()=>{
            settingsWindow = null;
        });
        settingsWindow.setMenu(null);
        if (VITE_DEV_SERVER_URL) {
            settingsWindow.loadURL(createURLRoute(VITE_DEV_SERVER_URL, "settings"))
        } else {
            // win.loadFile('dist/index.html')
            const file_url = `${path.join(RENDERER_DIST, 'index.html')}`;
            settingsWindow.loadFile(...createFileRoute(file_url, "settings"));
        }
        //settingsWindow.loadFile(path.join(process.env.APP_ROOT, 'html/settings.html'))
        settingsWindow.webContents.openDevTools();
        settingsWindow.show();
    });



    ipcMain.handle('getSyncToolStatus', async ()=>{
        const resp = await fetch(`http://localhost:24332/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'check_scheduler'
            })
        });
        if (resp.ok) return true;
        return false;
    });

    ipcMain.handle('getSyncToolQueue', async ()=>{
        const resp = await fetch(`http://localhost:24332/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'get_queue',
            })
        });
        if (resp.ok) return (await resp.json()).queue;
        return [];
    });
}