import { BrowserWindow, IpcMain, Menu, MenuItemConstructorOptions } from "electron";

export function setMainMenu(win:BrowserWindow | null, ipcMain:IpcMain) {
    
    const template:Array<MenuItemConstructorOptions> = [
        {
            label: "File",
            role: 'fileMenu',
            submenu: [
                {
                    label: "Options",
                    // opwn settings window as new window
                    click:()=>{
                        ipcMain.emit('open-settings');
                    },
                },
                {
                    label: "Log Out",
                    click:()=>{
                        win?.webContents.send('navigate-to-logout');
                    },
                },
                {
                    label: "Exit",
                    click:()=>{
                        win?.webContents.send('exit');
                    },
                },
            ],
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Documentation',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://electronjs.org')
                    }
                },
                {
                    label: 'Online Support',
                    click: async () => {
                        const { shell } = require('electron')
                        await shell.openExternal('https://flexaro.net/support/cloud-pos')
                    }
                }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}