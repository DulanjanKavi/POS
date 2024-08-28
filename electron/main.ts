/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, BrowserWindow,ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { loadBgSyncService } from './fnServer/loadBgSyncService'
import * as dotenv from 'dotenv'
import { getUserData, saveUserData } from './fnServer/handleUserData'
dotenv.config()

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
let cashierID: any;
let ID: any;
let holdArray: never[]=[];



// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname||"D:\\websites\\POS\\POS.k\\ss", '..');
process.env.JWT_TOKEN = "";


// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')


process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null


const sqlite3 = require('sqlite3').verbose();
const dbPath=path.join(process.env.APP_ROOT, 'pos.db')

var db:any = null;

async function initialLoadingProcess() {
  // start the queue manager
  return new Promise(async (resolve, reject) => {
    console.log(process.env.APP_NAME);
    console.log('starting Sync Tool')
    await loadBgSyncService().catch((err) => {
      console.error("Sync Tool", err)
      reject(err)
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
    console.log('Ready to serve')
    
    setTimeout(() => {
      resolve('done')
    }, 4000);
  });
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
    frame: false,
    title: process.env.APP_NAME||"TEST POS",
  })
  splash.loadFile(path.join(process.env.APP_ROOT, 'html/splash.html'))
  splash.center()
  // splash.webContents.openDevTools()

  initialLoadingProcess().then(() => {
    if (!win) {
      console.error('Window is not defined')
      return
    }
    win.show()
    win.webContents.on('did-finish-load', () => {
      win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })
    win.maximize();
  
    if (VITE_DEV_SERVER_URL) {
      win.loadURL(VITE_DEV_SERVER_URL)
    } else {
      // win.loadFile('dist/index.html')
      win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
    win.webContents.openDevTools()
    splash.destroy()
  }).catch((err) => {
    console.error(err)
    splash.destroy()
  })
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





const  paymentMethod=['Cash','Card','Bank Transfer','Cheque']
ipcMain.handle('get-pay-method',async()=>{
  return paymentMethod
})

ipcMain.handle('getCashierName',async()=>{
  return cashierID
})

ipcMain.handle('getCashierID',async()=>{
  return ID
})


ipcMain.handle('getHoldArray',async()=>{
  return holdArray
})

ipcMain.handle('setHoldArray',async(_event,array)=>{
  holdArray=array;
  console.log('set new hold array')
  console.log(array)
})







ipcMain.handle('getUserID', async (_event, args) => {
  const { userName, password } = args;
  return new Promise(async(resolve, reject) => {

    const url = process.env.SERVER_URL + "/login";
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email:userName, password }),
    });

    if (!response.ok) {
      resolve(null);
    }

    const data = await response.json();

    console.log(data);
    if (!data.token) {
      resolve(null);
      return;
    }


    // update user_data.json
    saveUserData({
      company_id: data.user.comapny,
      user_id: data.user._id,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      role: data.user.role,
      email: data.user.email,
      token: data.token,
    });

    ID=data.user._id
    cashierID=data.user.first_name
    process.env.JWT_TOKEN = data.token;
    resolve(data.user._id);


    /*db.get("SELECT userID FROM user WHERE userName = ? AND password = ?", [userName, password], (err: { message: any }, row: { userID: unknown }) => {
      if (err) {
        reject(err.message);
      } else if (row) {
        console.log(`User ID: ${row.userID}`);
        ID=row.userID
        resolve(row.userID);
        cashierID=userName
      } else {
        console.log('No matching user found.');
        resolve(null);
      }
    });*/
  });
});

ipcMain.handle('userAutoLogin', async () => {
  return new Promise(async(resolve, _) => {
    const userData = getUserData();
    if (!userData) {
      resolve(null);
      return;
    }

    // validate 
    // ...

    ID=userData.user_id
    cashierID=userData.first_name
    process.env.JWT_TOKEN = userData.token;
    resolve(userData.user_id);
  });
});

ipcMain.handle('getItemDetails', async (_event, snumber) => {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM items WHERE snumber = ? OR snumber2=?", [snumber,snumber], (err: any, row: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('verifyItem', async (_event, snumber) => {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT name FROM items WHERE snumber = ? OR snumber2=?", [snumber,snumber], (err: any, row: unknown) => {
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
      return [];
    }
  } catch (error) {
    throw new Error();
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle('searchItem', async (_event, searchTearm) => {
  try {
    const rows:any = await new Promise((resolve, reject) => {
      db.all("SELECT name,snumber,SKU,thumbnail FROM items WHERE name LIKE CONCAT('%',?,'%') OR snumber LIKE CONCAT('%',?,'%') OR snumber2 LIKE CONCAT('%',?,'%') OR SKU LIKE CONCAT('%',?,'%')",[searchTearm,searchTearm,searchTearm,searchTearm], (err: any, rows: unknown) => {
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
      return [];
    }
  } catch (error) {
    console.log(error);
    throw new Error();
  }
});


ipcMain.handle('getCustemorData', async (_event, tp) => {
  try {
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM LoyalCustomer WHERE TP = ?", [tp], (err: any, row: unknown) => {
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
    throw new Error();
  }
});


ipcMain.handle('updateLoyalPoints', async (_event, tp, newPoint) => {
  try {
    await db.run("UPDATE LoyalCustomer SET points = ? WHERE TP = ?", [newPoint, tp]);
    console.log(`Points updated for TP ${tp}. New points: ${newPoint}`);
  } catch (error) {
    console.error(error);
  }
});


ipcMain.handle('addLoyalCustomer', async (_event, tp, name, points) => {
  try {
    await db.run("INSERT INTO LoyalCustomer (TP, name, points) VALUES (?, ?, ?)", [tp, name, points]);
    console.log(`New customer added: TP ${tp}, Name: ${name}, Points: ${points}`);
  } catch (error) {
    console.error(error);
  }
});

ipcMain.handle('processBill', async (_event, total, pMethod, customerID, discount, withdrowPoints, additionalDetails) => {
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

ipcMain.handle('returnBill', async (_event,OldBillNumber,total,cart) => {
  console.log(cart)
  try {
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString(); 
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    
      await db.run("INSERT INTO ReturnItems (OldBillNumber, total, cashierID, date, time, cart  ) VALUES (?, ?, ?, ?, ?, ?)",
          [OldBillNumber,total,cashierID,currentDateFormatted,currentTime,cart]);
  } catch (error) {
      console.error(error);
      return null;
  }
});

ipcMain.handle('verifyBillNumber', async (_event, billNumber) => {
  try {
    console.log('Bill Number:', billNumber);
    const row = await new Promise((resolve, reject) => {
      db.get("SELECT total FROM bill WHERE biiNumber = ?", [billNumber], (err: any, row: unknown) => {
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
    throw new Error();
  }
});


ipcMain.handle('getTotalCashPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [cashierID,'Cash',currentDateFormatted], (err: any, row: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getTotalCardPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [cashierID,'Card',currentDateFormatted], (err: any, row: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getTotalBankPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    console.log(cashierID)
    console.log(typeof(cashierID))
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [cashierID,'Bank',currentDateFormatted], (err: any, row: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getTotalReturnPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM ReturnItems Where cashierID=? AND date=?",[cashierID,currentDateFormatted], (err: any, row: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getTotalCheckPayment', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [cashierID,'Check',currentDateFormatted], (err: any, row: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getTotal', async () => {
  try {
    const row = await new Promise((resolve, reject) => {
      const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
      db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND date=?", [cashierID,currentDateFormatted], (err: any, row: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getCheckDetails', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows:any = await new Promise((resolve, reject) => {
      db.all("SELECT total, aditionalDetails,biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [cashierID, currentDateFormatted, 'Check'], (err: any, rows: unknown) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (Number(rows.length) > 0) {
      console.log(rows); 
      return rows;
    } else {
      console.log('No matching items found.');
      return null;
    }
  } catch (error) {
    throw new Error();
  }
});

ipcMain.handle('getAllSalseDetails', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows:any = await new Promise((resolve, reject) => {
      db.all("SELECT total, biiNumber,pMethod FROM bill WHERE cashierID=? AND date=? ", [cashierID, currentDateFormatted], (err: any, rows: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getAllCashPayment', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows:any = await new Promise((resolve, reject) => {
      db.all("SELECT total, biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [cashierID, currentDateFormatted,'Cash'], (err: any, rows: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getAllCardPayment', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows:any = await new Promise((resolve, reject) => {
      db.all("SELECT total, biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [cashierID, currentDateFormatted,'Card'], (err: any, rows: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getAllBankPayment', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows:any = await new Promise((resolve, reject) => {
      db.all("SELECT total, biiNumber,aditionalDetails FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [cashierID, currentDateFormatted,'Bank'], (err: any, rows: unknown) => {
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
    throw new Error();
  }
});

ipcMain.handle('getAllReturnPayment', async () => {
  try {
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const rows:any = await new Promise((resolve, reject) => {
      db.all("SELECT total, OldBillNumber,ReturnBillNumber FROM ReturnItems WHERE cashierID=? AND date=? ", [cashierID, currentDateFormatted], (err: any, rows: unknown) => {
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
    throw new Error();
  }
});








app.whenReady().then(createWindow)
