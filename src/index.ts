import { get } from 'https';
import { networkInterfaces } from 'os';

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
        checkCampnetSite().then(result => console.log(result));
    }
    setTimeout(interfaceUpdater, 500);
}

interfaceUpdater();