import { ipcRenderer } from 'electron'


export const SYNC_TOOL_API = {
    getSyncToolStatus: async () => {
        try {
            const status = await ipcRenderer.invoke('getSyncToolStatus');
            return status;
        } catch (error) {
            console.error(error);
        }
    },

    getSyncToolQueue: async () => {
        try {
            const queue = await ipcRenderer.invoke('getSyncToolQueue');
            return queue;
        } catch (error) {
            console.error(error);
        }
    },

    addSyncToolQueue: async (action:string, data:any) => {
        try {
            await fetch(`http://localhost:24332/`, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'add_to_queue',
                    queue_action: action,
                    data: data
                })
            });
            // if (resp.ok) return resp;
            return true;
        } catch (error) {
            console.error(error);
        }
    },

    settingsGetUserData: async ()=>{
        try {
            const data = ipcRenderer.invoke('getSettingsUserData');
            return data;
        } catch (error) {
            console.error(error);
        }
    },


    settingsCheckUpdates: async ()=>{
        try {
            return await ipcRenderer.invoke('checkUpdates');
        } catch (error) {
            console.error(error);
        }
    },

    settingsDownloadUpdates: async ()=>{
        try {
            return await ipcRenderer.invoke('downloadUpdates');
        } catch (error) {
            console.error(error);
        }
    },

    settingsInstallDownloadedUpdates: async ()=>{
        try {
            return await ipcRenderer.invoke('installDownloadedUpdates');
        } catch (error) {
            console.error(error);
        }
    },
}

