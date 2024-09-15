import {execFile} from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Loads the background sync service to the main process
 */
export async function loadBgSyncService() {
    return new Promise((resolve) => {
        //const exec = require('child_process').execFile;
        // const path = require('path');
        const cmd = "python";
        const args = [path.join(process.env.APP_INS_ROOT, 'Sync Tool', 'main.py')];
        execFile(cmd, args, function (err: any) {
            if (err) {
                // reject(err);
                //return;
                fs.appendFile(`./log.txt`, `${new Date().toISOString()} - ${err.message}\n - ${process.env.APP_INS_ROOT}\n`, (writeErr) => {
                    if (writeErr) {
                        console.log("Failed to write error to log file:", writeErr);
                    } else {
                    }
                });
                console.log(err);
            }
        });
        resolve("");
    });
}