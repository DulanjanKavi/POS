import { IpcMain } from "electron";
import { getUserData, saveUserData, validateUserToken } from "../../fnServer/handleUserData";
//const { PosPrinter} = require('@plick/electron-pos-printer');
//import { PosPrinter } from '@plick/electron-pos-printer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {PosPrinter} = require("@plick/electron-pos-printer");
import path from 'node:path'




export default function registerPOSHandles(ipcMain:IpcMain, db: any, ipcGlobals: any) {
    const  paymentMethod=['Cash','Card','Bank Transfer','Cheque']
    ipcMain.handle('get-pay-method',async()=>{
      return paymentMethod
    })
    
    ipcMain.handle('getCashierName',async()=>{
      return ipcGlobals.cashierID
    })
    
    ipcMain.handle('getCashierID',async()=>{
      return ipcGlobals.ID
    })
    
    
    ipcMain.handle('getHoldArray',async()=>{
      return ipcGlobals.holdArray
    })
    
    ipcMain.handle('setHoldArray',async(_event,array)=>{
    ipcGlobals.holdArray=array;
      console.log('set new hold array')
      console.log(array)
    })
    

    
ipcMain.handle('getUserID', async (_event, args) => {
    const { userName, password } = args;
    const url = process.env.SERVER_URL + "/login";
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email:userName, password }),
    });

    if (!response.ok) {
        return null;
    }

    const data = await response.json();

    console.log(data);
    if (!data.token) {
        return null;
    }


    // update user_data.json
    const userData = getUserData();

    saveUserData({
      company_id: data.user.comapny||userData?.company_id||'',
      user_id: data.user._id,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
      role: data.user.role,
      email: data.user.email,
      token: data.token,
    });


    // set sync tool to sync company info
    try {
        await fetch(`http://localhost:24332/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add_to_queue',
                queue_action: "get_company_info",
                data: JSON.stringify({ id: data.user.comapny })
            })
        });
    } catch (error) {
        console.error(error);
    }

    ipcGlobals.ID=data.user._id
    ipcGlobals.cashierID=data.user.first_name
    process.env.JWT_TOKEN = data.token;
    return data.user._id;
    /*return new Promise(async(resolve, _) => {
  
      
  
  
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
    });*/
  });
  
  ipcMain.handle('userAutoLogin', async () => {
      const userData = getUserData();
      if (!userData || !userData.token || !userData.user_id) {
        return null;
      }
      
      // validate 
      // ...
      const validate = await validateUserToken();
      if (!validate) {
        return null;
      }

      ipcGlobals.ID=userData.user_id
      ipcGlobals.cashierID=userData.first_name
      process.env.JWT_TOKEN = userData.token;
      return userData.user_id;
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
      }).catch((err)=>{
        console.log(err, db)
      });
  
      if (rows && rows.length > 0) {
        // console.log(rows); 
        return rows;
      } else {
        // console.log('No matching items found.');
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
        // console.log(row);
        return row;
      } else {
        // console.log('No matching item found for loyal customer.');
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
            [customerID, ipcGlobals.cashierID, total, pMethod, discount, withdrowPoints, additionalDetails,currentDateFormatted,currentTime]);
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
            [OldBillNumber,total,ipcGlobals.cashierID,currentDateFormatted,currentTime,cart]);
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
        db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [ipcGlobals.cashierID,'Cash',currentDateFormatted], (err: any, row: unknown) => {
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
        db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [ipcGlobals.cashierID,'Card',currentDateFormatted], (err: any, row: unknown) => {
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
      console.log(ipcGlobals.cashierID)
      console.log(typeof(ipcGlobals.cashierID))
        db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [ipcGlobals.cashierID,'Bank',currentDateFormatted], (err: any, row: unknown) => {
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
        db.get("SELECT SUM(total) FROM ReturnItems Where cashierID=? AND date=?",[ipcGlobals.cashierID,currentDateFormatted], (err: any, row: unknown) => {
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
        db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND pMethod=? AND date=?", [ipcGlobals.cashierID,'Check',currentDateFormatted], (err: any, row: unknown) => {
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
        db.get("SELECT SUM(total) FROM bill WHERE cashierID=? AND date=?", [ipcGlobals.cashierID,currentDateFormatted], (err: any, row: unknown) => {
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
        db.all("SELECT total, aditionalDetails,biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [ipcGlobals.cashierID, currentDateFormatted, 'Check'], (err: any, rows: unknown) => {
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
        db.all("SELECT total, biiNumber,pMethod FROM bill WHERE cashierID=? AND date=? ", [ipcGlobals.cashierID, currentDateFormatted], (err: any, rows: unknown) => {
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
        db.all("SELECT total, biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [ipcGlobals.cashierID, currentDateFormatted,'Cash'], (err: any, rows: unknown) => {
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
        db.all("SELECT total, biiNumber FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [ipcGlobals.cashierID, currentDateFormatted,'Card'], (err: any, rows: unknown) => {
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
        db.all("SELECT total, biiNumber,aditionalDetails FROM bill WHERE cashierID=? AND date=? AND pMethod=?", [ipcGlobals.cashierID, currentDateFormatted,'Bank'], (err: any, rows: unknown) => {
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
        db.all("SELECT total, OldBillNumber,ReturnBillNumber FROM ReturnItems WHERE cashierID=? AND date=? ", [ipcGlobals.cashierID, currentDateFormatted], (err: any, rows: unknown) => {
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

/*
  ipcMain.handle("printBill", async (_event, array,total,payAmount,selectedPaymentMethod,bNumber) => {
    console.log("bill printing .......");
    console.log(array);
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const currentTimeFormatted = currentDate.toLocaleTimeString();
    const l=array.length;
  
    let P=0;
      for(let i=0;i<array.length;i++)
      {
        P+=array[i].NoOfItems;
      }
  
    const options:any = {
      preview: true,
      margin: '0px',
      copies: 1,
      printerName: 'Microsoft Print to PDF',
      pageSize: '80mm',
      //height: 'auto'
      //silent: true,
    };
  
    const data:any = [
      //shop details
      {
        type:'image',
        path:path.join(__dirname,'../src/assets/icons/shopLogo.png'),
        position: "center", // position of image: 'left' | 'center' | 'right'
        width: "auto", // width of image in px; default: auto
        height: "60px",
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'SHOP NAME',
        style: { fontWeight: '700', textAlign: 'center', fontSize: '24px' },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'No. XY, XXXXXX Rd, YYYYYYYYYYYY ',
        style: { fontWeight: '400', textAlign: 'center', fontSize: '10px' },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'Tel : 037 XXXXXXX / 072 YYYYYYY',
        style: { fontWeight: '400', textAlign: 'center', fontSize: '10px',paddingBottom: '10px' },
      },
      {
        type: 'divider', // we could style it using the style property, we can use divider anywhere, except on the table header
      },
      //bill details and cashier details
      {
        type: 'table',
        style: { fontFamily: 'sans-serif' },
        tableHeader: [
        ],
        tableBody:  [
          [
            { type: 'text', value: "Invoice number: "+bNumber,style: {textAlign: 'left',paddingTop: '10px'} },
            { type: 'text', value: currentDateFormatted,style: {textAlign: 'right',paddingTop: '10px'} },
          ],
          [
            { type: 'text', value: "Cashier: "+ ipcGlobals.cashierID,style: {textAlign: 'left',paddingBottom: '10px'} },
            { type: 'text', value: currentTimeFormatted,style: {textAlign: 'right',paddingBottom: '10px'} },
          ],  
        ],
        tableFooter: [
        ],
        tableHeaderStyle: {},
        tableBodyStyle: { padding:'10px 10px', margins:'20px 20px',textAlign: 'center', fontSize: '14 px',fontWeight: '400'  },
        tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        tableHeaderCellStyle: { padding: '2px 2px' },
        tableBodyCellStyle: {  },
        tableFooterCellStyle: { padding: '5px 2px', fontWeight: '400' },
      },
  
  
  
  
  
  
      {
        type: 'divider', // we could style it using the style property, we can use divider anywhere, except on the table header
      },
      {
        type: 'table',
        style: { fontFamily: 'sans-serif' },
        tableHeader: [
          { type: 'text', value: 'Price' },
          { type: 'text', value: 'Qty' },
          { type: 'text', value: 'Discount' },
          { type: 'text', value: 'Amount' },
        ],
        tableBody: array.flatMap((item: { iname: { toString: () => any }; selectedValue: { toString: () => any }; NoOfItems: { toString: () => any }; selectedDiscount: { toString: () => any }; Amount: { toString: () => any } }) => [
          [
            { type: 'text', value: item.iname.toString(),style:{textAlign: 'left'} },
          ],
          [
            { type: 'text', value: Number(item.selectedValue).toFixed(2) },
            { type: 'text', value: item.NoOfItems.toString() },
            { type: 'text', value: (Number(item.selectedDiscount)*Number(item.NoOfItems.toString())).toFixed(2) },
            { type: 'text', value: Number(item.Amount).toFixed(2) },
          ],
        ]),
        tableFooter: [
        ],
        tableHeaderStyle: {textAlign: 'right' },
        tableBodyStyle: { padding:'0px 0px', margins:'0px 0px', },
        tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        tableHeaderCellStyle: { padding: '2px 2px' },
        tableBodyCellStyle: {textAlign: 'right' },
        tableFooterCellStyle: { padding: '5px 2px', fontWeight: '400' },
      },
      {
        type: 'divider', // we could style it using the style property, we can use divider anywhere, except on the table header
      },
      {
        type: 'table',
        style: { fontFamily: 'sans-serif' },
        tableHeader: [
        ],
        tableBody:  [
          [
            { type: 'text', value: "Net amount",style: {textAlign: 'left',paddingTop: '10px'} },
            { type: 'text', value: Number(total).toFixed(2),style: {textAlign: 'right',paddingTop: '10px'} },
          ],
          ...(selectedPaymentMethod === "Cash" ? [
            [
              { type: 'text', value: "Cash", style: { textAlign: 'left' } },
              { type: 'text', value: Number(payAmount).toFixed(2), style: { textAlign: 'right' } },
            ]
          ] : []),
  
          ...(selectedPaymentMethod === "Cash" ? [
            [
              { type: 'text', value: "Balance", style: { textAlign: 'left' } },
              { type: 'text', value: (Number(payAmount) - Number(total)).toFixed(2), style: { textAlign: 'right' } },
            ]
          ] : []),
          
          ...(selectedPaymentMethod !== "Cash" ? [
            [
              { type: 'text', value: "Payment method",style: {textAlign: 'left'} },
              { type: 'text', value: selectedPaymentMethod ,style: {textAlign: 'right'}},
            ]
          ] : []),
          
        ],
        tableFooter: [
        ],
        tableHeaderStyle: {},
        tableBodyStyle: { padding:'0px 0px', margins:'2px 2px',textAlign: 'center', fontSize: '16 px',fontWeight: '600'  },
        tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        tableHeaderCellStyle: { padding: '2px 2px' },
        tableBodyCellStyle: {  },
        tableFooterCellStyle: { padding: '5px 2px', fontWeight: '400' },
      },
      {
        type: 'table',
        style: { fontFamily: 'sans-serif' },
        tableHeader: [
        ],
        tableBody:  [
          [
            { type: 'text', value: "Number of items: ",style: {textAlign: 'left',paddingTop: '10px'} },
            { type: 'text', value: l,style: {textAlign: 'right',paddingTop: '10px'} },
          ],
          [
            { type: 'text', value: "Number of pieces: ",style: {textAlign: 'left',paddingBottom: '10px'} },
            { type: 'text', value: P,style: {textAlign: 'right',paddingBottom: '10px'} },
          ],  
        ],
        tableFooter: [
        ],
        tableHeaderStyle: {},
        tableBodyStyle: { padding:'10px 10px', margins:'20px 20px',textAlign: 'center', fontSize: '14 px',fontWeight: '400'  },
        tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        tableHeaderCellStyle: { padding: '2px 2px' },
        tableBodyCellStyle: {  },
        tableFooterCellStyle: { padding: '5px 2px', fontWeight: '400' },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'Thank You. Come Again!',
        style: { fontWeight: '600', textAlign: 'center', fontSize: '16px',paddingTop: '20px' },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'Software @ XXXXXXXXXX +94 YY YYY YYYYY',
        style: { fontWeight: '400', textAlign: 'center', fontSize: '10px',paddingBottom: '10px' },
      },
    ];
  
    PosPrinter.print(data, options)
      .then(console.log)
      .catch((error: any) => {
        console.log(error);
      });
  });*/

  ipcMain.handle("printBill", async (_event, array,total,payAmount,selectedPaymentMethod,bNumber) => {
    console.log("bill printing .......");
    const currentDate = new Date();
    const currentDateFormatted = currentDate.toLocaleDateString(); 
    const currentTimeFormatted = currentDate.toLocaleTimeString();
    const l=array.length;
  
    let P=0;
      for(let i=0;i<array.length;i++)
      {
        P+=array[i].NoOfItems;
      }
  
  
  
  
  
  
  
  
  
    const options= {
      preview: false,
      margin: '0 0 0 0',   
      padding: '5 5 5 5', 
      copies: 1,
      printerName: 'POS-58',
      timeOutPerLine: 400,
      pageSize: '58mm', // page size
      silent:true
      
    };
  
    const data = [
     //shop details
      {
        type:'image',
        path:path.join(__dirname,'../src/assets/icons/shopLogo.png'),
        position: "center", // position of image: 'left' | 'center' | 'right'
        width: "auto", // width of image in px; default: auto
        height: "60px",
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'SHOP NAME',
        style: { fontWeight: '700', textAlign: 'center', fontSize: '24px' },
      },
      
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'No. XY, XXXXXX Rd, YYYYYYYYYYYY ',
        style: { fontWeight: '400', textAlign: 'center', fontSize: '10px' },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'Tel : 037 XXXXXXX / 072 YYYYYYY',
        style: { fontWeight: '400', textAlign: 'center', fontSize: '10px',paddingBottom: '10px' },
      },
      {
        type: 'divider', // we could style it using the style property, we can use divider anywhere, except on the table header
      },
      //bill details and cashier details
      {
        type: 'table',
        style: { fontFamily: 'sans-serif' },
        tableHeader: [
        ],
        tableBody:  [
          [
            { type: 'text', value: "Invoice number: "+bNumber,style: {textAlign: 'left',paddingTop: '10px'} },
            { type: 'text', value: currentDateFormatted,style: {textAlign: 'right',paddingTop: '10px'} },
          ],
          [
            { type: 'text', value: "Cashier: "+ipcGlobals.cashierID,style: {textAlign: 'left',paddingBottom: '10px'} },
            { type: 'text', value: currentTimeFormatted,style: {textAlign: 'right',paddingBottom: '10px'} },
          ],  
        ],
        tableFooter: [
        ],
        tableHeaderStyle: {},
        tableBodyStyle: { padding:'1px 1px', margins:'2px 2px',textAlign: 'center', fontSize: '10 px',fontWeight: '400'  },
        tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        tableHeaderCellStyle: { padding: '2px 2px' },
        tableBodyCellStyle: {  },
        tableFooterCellStyle: { padding: '5px 2px', fontWeight: '400' },
      },
  
  
  
  
  
  
      {
        type: 'divider', // we could style it using the style property, we can use divider anywhere, except on the table header
      },
      {
        type: 'table',
        style: { fontFamily: 'sans-serif' },
        tableHeader: [
          { type: 'text', value: 'Price' },
          { type: 'text', value: 'Qty' },
          { type: 'text', value: 'Discount' },
          { type: 'text', value: 'Amount' },
        ],
        tableBody: array.flatMap((item: { iname: { toString: () => any }; selectedValue: { toString: () => any }; NoOfItems: { toString: () => any }; selectedDiscount: { toString: () => any }; Amount: { toString: () => any } }) => [
          [
            { type: 'text', value: item.iname.toString(),style:{textAlign: 'left'} },
          ],
          [
            { type: 'text', value: Number(item.selectedValue).toFixed(2) },
            { type: 'text', value: item.NoOfItems.toString() },
            { type: 'text', value: (Number(item.selectedDiscount)*Number(item.NoOfItems.toString())).toFixed(2) },
            { type: 'text', value: Number(item.Amount).toFixed(2) },
          ],
        ]),
        tableFooter: [
        ],
        tableHeaderStyle: {textAlign: 'right' },
        tableBodyStyle: { padding:'0px 0px', margins:'0px 20px ', },
        tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        tableHeaderCellStyle: { padding: '2px 2px' },
        tableBodyCellStyle: {textAlign: 'right' },
        tableFooterCellStyle: { padding: '5px 2px', fontWeight: '400' },
      },
      {
        type: 'divider', // we could style it using the style property, we can use divider anywhere, except on the table header
      },
      {
        type: 'table',
        style: { fontFamily: 'sans-serif' },
        tableHeader: [
        ],
        tableBody:  [
          [
            { type: 'text', value: "Net amount",style: {textAlign: 'left',paddingTop: '10px'} },
            { type: 'text', value: Number(total).toFixed(2),style: {textAlign: 'right',paddingTop: '10px'} },
          ],
          ...(selectedPaymentMethod === "Cash" ? [
            [
              { type: 'text', value: "Cash", style: { textAlign: 'left' } },
              { type: 'text', value: Number(payAmount).toFixed(2), style: { textAlign: 'right' } },
            ]
          ] : []),
  
          ...(selectedPaymentMethod === "Cash" ? [
            [
              { type: 'text', value: "Balance", style: { textAlign: 'left' } },
              { type: 'text', value: (Number(payAmount) - Number(total)).toFixed(2), style: { textAlign: 'right' } },
            ]
          ] : []),
          
          ...(selectedPaymentMethod !== "Cash" ? [
            [
              { type: 'text', value: "Payment method",style: {textAlign: 'left'} },
              { type: 'text', value: selectedPaymentMethod ,style: {textAlign: 'right'}},
            ]
          ] : []),
          
        ],
        tableFooter: [
        ],
        tableHeaderStyle: {},
        tableBodyStyle: { padding:'0px 0px', margins:'2px 2px',textAlign: 'center', fontSize: '16 px',fontWeight: '600'  },
        tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        tableHeaderCellStyle: { padding: '2px 2px' },
        tableBodyCellStyle: {  },
        tableFooterCellStyle: { padding: '5px 2px', fontWeight: '400' },
      },
      {
        type: 'table',
        style: { fontFamily: 'sans-serif' },
        tableHeader: [
        ],
        tableBody:  [
          [
            { type: 'text', value: "Number of items: ",style: {textAlign: 'left',paddingTop: '10px'} },
            { type: 'text', value: l,style: {textAlign: 'right',paddingTop: '10px'} },
          ],
          [
            { type: 'text', value: "Number of pieces: ",style: {textAlign: 'left',paddingBottom: '10px'} },
            { type: 'text', value: P,style: {textAlign: 'right',paddingBottom: '10px'} },
          ],  
        ],
        tableFooter: [
        ],
        tableHeaderStyle: {},
        tableBodyStyle: { padding:'10px 10px', margins:'20px 20px',textAlign: 'center', fontSize: '14 px',fontWeight: '400'  },
        tableFooterStyle: { backgroundColor: '#000', color: 'white' },
        tableHeaderCellStyle: { padding: '2px 2px' },
        tableBodyCellStyle: {  },
        tableFooterCellStyle: { padding: '5px 2px', fontWeight: '400' },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'Thank You. Come Again!',
        style: { fontWeight: '600', textAlign: 'center', fontSize: '16px',paddingTop: '20px' },
      },
      {
        type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table' | 'divider'
        value: 'Software @ XXXXXXXXXX +94 YY YYY YYYYY',
        style: { fontWeight: '400', textAlign: 'center', fontSize: '10px',paddingBottom: '10px' },
      }
    ];
  
    
  
    PosPrinter.print(data, options)
      .then(()=>{})
      .catch((error: any) => {
        console.log(error);
      });
  });
}