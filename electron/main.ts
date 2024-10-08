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
// eslint-disable-next-line @typescript-eslint/no-unused-vars



//let cashierID: any;
// let ID: any;
// let holdArray: never[]=[];

//const sqlite3 = require('sqlite3').verbose();
//const dbPath='pos.db'

/*const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err: { message: any }) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});*/




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
//console.log(app.getAppPath())
if (process.env.APP_ROOT.includes('app.asar')) {
  process.env.APP_INS_ROOT = path.join(app.getAppPath(), '..', '..');
} else {
  process.env.APP_INS_ROOT = process.env.APP_ROOT;
}

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
const sqlite3 = require('sqlite3').verbose();
const dbPath=path.join(process.env.APP_INS_ROOT, 'pos.db')

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
      win.loadFile(...createFileRoute(path.join(RENDERER_DIST, 'index.html'), "main"))
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

/*





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
  return new Promise((resolve, reject) => {
    db.get("SELECT userID FROM user WHERE userName = ? AND password = ?", [userName, password], (err: { message: any }, row: { userID: unknown }) => {
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
    });
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
      return null;
    }
  } catch (error) {
    throw new Error();
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
ipcMain.handle('searchItem', async (_event, searchTearm) => {
  try {

    const rows:any = await new Promise((resolve, reject) => {
      db.all("SELECT name,snumber,SKU FROM items WHERE name LIKE CONCAT('%',?,'%') OR snumber LIKE CONCAT('%',?,'%') OR snumber2 LIKE CONCAT('%',?,'%') OR SKU LIKE CONCAT('%',?,'%')",[searchTearm,searchTearm,searchTearm,searchTearm], (err: any, rows: unknown) => {
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
*/


app.whenReady().then(createWindow)
