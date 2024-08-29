import {execFile} from 'child_process';
import * as path from 'path';

/**
 * Loads the background sync service to the main process
 */
export async function loadBgSyncService() {
    return new Promise((resolve) => {
        //const exec = require('child_process').execFile;
        // const path = require('path');
        const cmd = "python";
        const args = [path.join(process.env.APP_ROOT, 'Sync Tool', 'main.py')];
        execFile(cmd, args, function (err: any) {
            if (err) {
                // reject(err);
                //return;
                console.log(err);
            }
        });
        resolve("");
    });
}