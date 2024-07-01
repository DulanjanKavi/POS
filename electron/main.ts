import { app, BrowserWindow,ipcMain,Menu } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
let cashierID;

const sqlite3 = require('sqlite3').verbose();
const dbPath='pos.db'

let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

const query = "SELECT * FROM NewTable";

//db.run("CREATE TABLE IF NOT EXISTS Newtable2 (id INTEGER PRIMARY KEY, column1 TEXT, column2 TEXT)", (err) => {
 // if (err) {
   // console.error(err.message);
  //} else {
    //console.log('Table created or already exists.');
  //}
//});

{/*}
db.all(query, [], (err, rows) => {
  if (err) {
    throw err;
  }
  // Check if the table is empty
  if (rows.length === 0) {
    console.log('The table is empty.');
  } else {
    // Log each row to the console
    console.log("table is not empty")
    rows.forEach((row) => {
      console.log(row);
    });
  }
});


db.close((err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Closed the database connection.');
  }
});
*/}



// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    minWidth:600,
    minHeight:750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}
/*
const template = [
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [
      {
        label: "Log Out",
        click:()=>{
          console.log("click")
          win?.webContents.send('navigate-to-logout');
        },
      },
    ],
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  },
  //need to remove after development
  {
    label: 'need to remove',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
    ]
  },
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

ipcMain.on('navigate-to-logout', () => {
  console.log("navigate")
  const navigate = useNavigate();
  navigate('/logout');
});

/*
// Define your custom menu template
const customMenuTemplate = [
  {
    label: 'File', // Example menu category
    submenu: [
      // Other menu items (if needed)
      {
        label: 'Log Out',
        click: () => {
          // Handle logout logic here (e.g., clear session data, navigate to login page)
          console.log('User clicked "Log Out"');
          // Add your custom logout logic
        },
      },
    ],
  },
  // Other menu categories (if needed)
];

// Set the application menu using your custom template
Menu.setApplicationMenu(Menu.buildFromTemplate(customMenuTemplate));*/
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
//Menu.setApplicationMenu(null);


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

const  paymentMethod=['Cash','Card','Bank Transfer','Check']
ipcMain.handle('get-pay-method',async(event)=>{
  return paymentMethod
})

ipcMain.handle('getCashierName',async(event)=>{
  return cashierID
})





ipcMain.handle('getUserID', async (event, args) => {
  const { userName, password } = args;
  return new Promise((resolve, reject) => {
    db.get("SELECT userID FROM user WHERE userName = ? AND password = ?", [userName, password], (err, row) => {
      if (err) {
        reject(err.message);
      } else if (row) {
        console.log(`User ID: ${row.userID}`);
        resolve(row.userID);
        cashierID=userName
      } else {
        console.log('No matching user found.');
        resolve(null);
      }
    });
  });
});

ipcMain.handle('getItemDetails', async (event, snumber) => {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM items WHERE snumber = ?", [snumber], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    if (row) {
      console.log(row);
      return row;
    } else {
      console.log('No matching item found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});


ipcMain.handle('getCustemorData', async (event, tp) => {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM LoyalCustomer WHERE TP = ?", [tp], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    if (row) {
      console.log(row);
      return row;
    } else {
      console.log('No matching item found for loyal customer.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});


ipcMain.handle('updateLoyalPoints', async (event, tp, newPoint) => {
  try {
    await db.run("UPDATE LoyalCustomer SET points = ? WHERE TP = ?", [newPoint, tp]);
    console.log(`Points updated for TP ${tp}. New points: ${newPoint}`);
  } catch (error) {
    console.error(error);
  }
});


ipcMain.handle('addLoyalCustomer', async (event, tp, name, points) => {
  try {
    await db.run("INSERT INTO LoyalCustomer (TP, name, points) VALUES (?, ?, ?)", [tp, name, points]);
    console.log(`New customer added: TP ${tp}, Name: ${name}, Points: ${points}`);
  } catch (error) {
    console.error(error);
  }
});

ipcMain.handle('processBill', async (event, total, pMethod, customerID, discount, withdrowPoints, additionalDetails) => {
  try {
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString(); 
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    
      await db.run("INSERT INTO bill (customerID, cashierID, total, pMethod, discount, withdrowPoints, aditionalDetails,date,time) VALUES (?, ?, ?, ?, ?, ?, ?,?,?)",
          [customerID, cashierID, total, pMethod, discount, withdrowPoints, additionalDetails,currentDateFormatted,currentTime]);
  } catch (error) {
      console.error(error);
      return null;
  }
});


ipcMain.handle('getTotalCashPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [cashierID,'Cash',currentDateFormatted], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    if (row) {
      console.log(row);
      return row;
    } else {
      console.log('No matching item found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getTotalCardPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [cashierID,'Card',currentDateFormatted], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    if (row) {
      console.log(row);
      return row;
    } else {
      console.log('No matching item found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getTotalBankPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [cashierID,'Bank',currentDateFormatted], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    if (row) {
      console.log(row);
      return row;
    } else {
      console.log('No matching item found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getTotalCheckPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [cashierID,'Check',currentDateFormatted], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    if (row) {
      console.log(row);
      return row;
    } else {
      console.log('No matching item found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getTotal', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND date=?", [cashierID,currentDateFormatted], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
    if (row) {
      console.log(row);
      return row;
    } else {
      console.log('No matching item found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getCheckDetails', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT total, aditionalDetails,biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [cashierID, currentDateFormatted, 'Check'], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (rows.length > 0) {
      console.log(rows); 
      return rows;
    } else {
      console.log('No matching items found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getAllSalseDetails', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT total, biiNumber,pMethod FROM bill WHERE cashierID=? AND date=? ", [cashierID, currentDateFormatted], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (rows.length > 0) {
      console.log(rows); 
      return rows;
    } else {
      console.log('No matching items found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getAllCashPayment', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT total, biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [cashierID, currentDateFormatted,'Cash'], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (rows.length > 0) {
      console.log(rows); 
      return rows;
    } else {
      console.log('No matching items found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getAllCardPayment', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT total, biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [cashierID, currentDateFormatted,'Card'], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (rows.length > 0) {
      console.log(rows); 
      return rows;
    } else {
      console.log('No matching items found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});

ipcMain.handle('getAllBankPayment', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows = await new Promise((resolve, reject) => {
      db.all("SELECT total, biiNumber,aditionalDetails FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [cashierID, currentDateFormatted,'Bank'], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (rows.length > 0) {
      console.log(rows); 
      return rows;
    } else {
      console.log('No matching items found.');
      return null;
    }
  } catch (error) {
    throw new Error(error);
  }
});








app.whenReady().then(createWindow)
