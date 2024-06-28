import { ipcRenderer, contextBridge } from 'electron'

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
 
  

}

contextBridge.exposeInMainWorld('WINDOW_API', WINDOW_API)

const LOGIN_API = {
  getUserID: async (userName, password) => {
    try {
      console.log("check user id and password");
      const result = await ipcRenderer.invoke('getUserID', { userName, password });
      return result;
    } catch (error) {
      console.error(error);
    }
  }
};

contextBridge.exposeInMainWorld('LOGIN_API', LOGIN_API);

const ITEM_API={
  getItem:async(snumber)=>{
    try {
      console.log("check item detais");
      const result = await ipcRenderer.invoke('getItemDetails', snumber);
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
contextBridge.exposeInMainWorld('Item_API', ITEM_API);

const Loyal_API={
  getCustemorData:async(tp)=>{
    try {
      console.log("check  loyal customer data");
      const result = await ipcRenderer.invoke('getCustemorData', tp);
      return result;
    } catch (error) {
      console.error(error);
    }
  },
  updateLoyalPoints:async(tp,newPoint)=>{
    try {
      await ipcRenderer.invoke('updateLoyalPoints', tp, newPoint);
      console.log(`Points updated for TP ${tp}. New points: ${newPoint}`);
    } catch (error) {
      console.error(error);
    }

  },
  addLoyalCustomer:async(tp, name, points)=>{
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
  processBill:async(total,pMethod,customerID,discount,withdrowPoints,additionalDetails)=>{
    try {
      console.log("billl process");
      await ipcRenderer.invoke('processBill', total,pMethod,customerID,discount,withdrowPoints,additionalDetails);
      
    } catch (error) {
      console.error(error);
    }
  }
}
contextBridge.exposeInMainWorld('BILL_API', BILL_API);


