"use strict";
import * as https from 'node:https';
import { URL } from 'node:url';

let url: URL = new URL('https://mariokartcentral.com/');
url.searchParams.append('search', 'HIVE');

export function get(uri: string | URL) : Promise<string> {
    return new Promise((resolve) => {
        if (uri.toString().startsWith('https://')) {
            https.get(uri, (response) => {
                let data: string = '';
    
                response.on('data', (chunk) => {
                    data += chunk;
                });
    
                response.on('end', () => {
                    resolve(data);
                });
            })
            .on('error', (err) => {
                console.log('Error fetching data!\n' + err.message);
                throw new Error('Hier connection-error einfügen!'); // ToDo: better errors...
            });
        }
        else {
            throw new Error('Hier format-error einfügen!'); // ToDo: better errors...
        }
    });
}
