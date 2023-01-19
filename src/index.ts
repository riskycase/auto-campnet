import { get, request, RequestOptions } from 'https';
import { networkInterfaces } from 'os';
import { stringify } from 'querystring';

import { config } from 'dotenv';
import { remainingData } from './remaining';

config();
interface network {
    name: string,
    ip: string
}

let networks: Array<network> = [];

function checkCampnetSite(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        get('https://campnet.bits-goa.ac.in:8090/', (response) => {
            resolve(true);
        }).on('error', () => {
            resolve(false);
        })
    });
}

function loginCampnet() {
    const parameters = {
        mode: 191,
        username: process.env.CAMPNET_USERNAME,
        password: process.env.CAMPNET_PASSWORD,
        a: Date.now(),
        producttype: 0
    }

    const options: RequestOptions = {
        hostname: 'campnet.bits-goa.ac.in',
        port: "8090",
        path: '/login.xml',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': stringify(parameters).length
        }
    }

    const req = request(options, (response) => {
        let chunks = [];
        response.on('data', fragments => chunks.push(fragments));
        response.on('end', () => {
            const responseString = Buffer.concat(chunks).toString();
            
            if(/CDATA\[LIVE\]/.test(responseString))
                console.log("Logged in");
            else
                console.log("Username error")
        })
        response.on('error', err => console.error(err));
    })
    req.on('error', err => console.error(err));
    req.write(stringify(parameters));
    req.end();
}

function interfaceUpdater() {
    let newNetworks: Array<network> = [];
    const ni = networkInterfaces();
    for (const iface in ni) {
        const ip4 = ni[iface].find(iface => iface.family === 'IPv4');
        if(ip4 && !ip4.internal)
            newNetworks.push({
                name: iface,
                ip: ip4.address
            })
    } 
    newNetworks.sort((network1, network2) => network1.name.localeCompare(network2.name));
    if(newNetworks.toString().localeCompare(networks.toString()) !== 0){
        networks = newNetworks;
        checkCampnetSite().then(result => {
            if(result) loginCampnet();
        });
    }
    setTimeout(interfaceUpdater, 500);
}

setInterval(remainingData, Number(process.env.REMAINING_DATA_CHECK_INTERVAL || 30000));
interfaceUpdater();