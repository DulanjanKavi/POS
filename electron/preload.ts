import { ipcRenderer, contextBridge } from 'electron'
import { SYNC_TOOL_API } from './ipc_handles/settings/preload_settings';

// eslint-disable-next-line @typescript-eslint/no-var-requires


// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

contextBridge.exposeInMainWorld('SYNC_TOOL_API', SYNC_TOOL_API);


const WINDOW_API = {
  getPayMethodFromMain: async () => {
    try {
      console.log("get pay methods")
      const result = await ipcRenderer.invoke('get-pay-method');
      return result;
    } catch (error) {
      console.error(error);
    }
  },
  getCashierName: async()=>{
    try{
      const result=await ipcRenderer.invoke('getCashierName');
      return result
    }catch(error){
      console.error(error);
    }
    },
    getCashierID: async()=>{
      try{
        const result=await ipcRenderer.invoke('getCashierID');
        return result
      }catch(error){
        console.error(error);
      }
      },
      minimize:()=>{
        ipcRenderer.send('minimize')
      },
      maximize:()=>{
        ipcRenderer.send('maximize')
      },
      restore:()=>{
        ipcRenderer.send('restore')
      },
      getHoldArray: async()=>{
        try{
          const result=await ipcRenderer.invoke('getHoldArray');
          return result
        }catch(error){
          console.error(error);
        }
        },
        setHoldArray: (array: any)=>{
          try{
            ipcRenderer.invoke('setHoldArray',array);
            console.log(array)
            console.log('********************')
          }catch(error){
            console.error(error);
          }
          }

  
 
  

}

contextBridge.exposeInMainWorld('WINDOW_API', WINDOW_API)

const LOGIN_API = {
  getUserID: async (userName:string, password:string) => {
    try {
      console.log("check user id and password");
      const result = await ipcRenderer.invoke('getUserID', { userName, password });
      return result;
    } catch (error) {
      console.error(error);
    }
  },
  userAutoLogin: async () => {
    try {
      console.log("check user id and password");
      const result = await ipcRenderer.invoke('userAutoLogin');
      return result;
    } catch (error) {
      console.error(error);
    }
  }
};

contextBridge.exposeInMainWorld('LOGIN_API', LOGIN_API);

const ITEM_API={
  getItem:async(snumber:string)=>{
    try {
      console.log("check item detais");
      const result = await ipcRenderer.invoke('getItemDetails', snumber);
      return result;
    } catch (error) {
      console.error(error);
    }
  },
  verifyItem:async(snumber:string)=>{
    try {
      console.log("check item detais");
      const result = await ipcRenderer.invoke('verifyItem', snumber);
      return result;
    } catch (error) {
      console.error(error);
    }
  },
  searchItem:async(searchTearm:string)=>{
    try{
      const result=await ipcRenderer.invoke('searchItem',searchTearm);
      return result;
      
      
    }catch(error){
      console.error(error);
    }
  }
}
contextBridge.exposeInMainWorld('Item_API', ITEM_API);

const Loyal_API={
  getCustemorData:async(tp:any)=>{
    try {
      console.log("check  loyal customer data");
      const result = await ipcRenderer.invoke('getCustemorData', tp);
      return result;
    } catch (error) {
      console.error(error);
    }
  },
  updateLoyalPoints:async(tp:any,newPoint:any)=>{
    try {
      await ipcRenderer.invoke('updateLoyalPoints', tp, newPoint);
      console.log(`Points updated for TP ${tp}. New points: ${newPoint}`);
    } catch (error) {
      console.error(error);
    }

  },
  addLoyalCustomer:async(tp:any, name:any, points:any)=>{
    try {
      await ipcRenderer.invoke('addLoyalCustomer', tp,name, points);
      console.log(`new customer add ${tp}. New points: ${name}`);
    } catch (error) {
      console.error(error);
    }

  }
}
contextBridge.exposeInMainWorld('Loyal_API', Loyal_API);



const BILL_API={
  processBill:async(total:any,pMethod:any,customerID:any,discount:any,withdrowPoints:any,additionalDetails:any)=>{
    try {
      console.log("billl process");
      await ipcRenderer.invoke('processBill', total,pMethod,customerID,discount,withdrowPoints,additionalDetails);
      
    } catch (error) {
      console.error(error);
    }
  },
  returnBill:async(OldBillNumber:any,total:any,cart:any)=>{
    try {
      console.log("return bill process");
      await ipcRenderer.invoke('returnBill', OldBillNumber,total,cart);
      
    } catch (error) {
      console.error(error);
    }
  },
  verifyBillNumber:async(billNumber:any)=>{
    try {
      console.log("verify bill");
      console.log(billNumber)
      const result = await ipcRenderer.invoke('verifyBillNumber', billNumber);
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
contextBridge.exposeInMainWorld('BILL_API', BILL_API);


const REPORT_API={
  getTotalCashPayment:async()=>{
    try {
      const cashPayment=await ipcRenderer.invoke('getTotalCashPayment');
      return cashPayment
    } catch (error) {
      console.error(error);
    }
  },
  getTotalCardPayment:async()=>{
    try {
      const cardPayment=await ipcRenderer.invoke('getTotalCardPayment');
      return cardPayment
    } catch (error) {
      console.error(error);
    }
  },
  
  getTotalBankPayment:async()=>{
    try {
      const bankPayment=await ipcRenderer.invoke('getTotalBankPayment');
      return bankPayment
    } catch (error) {
      console.error(error);
    }
  },
  getTotalReturnPayment:async()=>{
    try {
      const bankPayment=await ipcRenderer.invoke('getTotalReturnPayment');
      return bankPayment
    } catch (error) {
      console.error(error);
    }
  },
  getTotalCheckPayment:async()=>{
    try {
      const checkPayment=await ipcRenderer.invoke('getTotalCheckPayment');
      return checkPayment
    } catch (error) {
      console.error(error);
    }
  },
  getTotal:async()=>{
    try {
      const Payment=await ipcRenderer.invoke('getTotal');
      return Payment
    } catch (error) {
      console.error(error);
    }
  },
  getCheckDetails:async()=>{
    try {
      const Payment=await ipcRenderer.invoke('getCheckDetails');
      return Payment
    } catch (error) {
      console.error(error);
    }
  },
  getAllSalseDetails:async()=>{
    try {
      const result=await ipcRenderer.invoke('getAllSalseDetails');
      return result
    } catch (error) {
      console.error(error);
    }
  },
  getAllCashPayment:async()=>{
    try {
      const result=await ipcRenderer.invoke('getAllCashPayment');
      return result
    } catch (error) {
      console.error(error);
    }
  },
  getAllCardPayment:async()=>{
    try {
      const result=await ipcRenderer.invoke('getAllCardPayment');
      return result
    } catch (error) {
      console.error(error);
    }
  },
  getAllBankPayment:async()=>{
    try {
      const result=await ipcRenderer.invoke('getAllBankPayment');
      return result
    } catch (error) {
      console.error(error);
    }
  },
  getAllReturnPayment:async()=>{
    try {
      const result=await ipcRenderer.invoke('getAllReturnPayment');
      return result
    } catch (error) {
      console.error(error);
    }
  },
  
}
contextBridge.exposeInMainWorld('REPORT_API', REPORT_API);