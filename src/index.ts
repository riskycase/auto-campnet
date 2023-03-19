import { get, request, RequestOptions } from "https";
import { stringify } from "querystring";

import { config } from "dotenv";
import { remainingData } from "./remaining";

config();

function checkInternetConnectivity(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        get("https://www.google.com/", () => {
            resolve();
        }).on("error", () => {
            reject();
        });
    });
}

function checkCampnetSite(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        get("https://campnet.bits-goa.ac.in:8090/", () => {
            resolve();
        }).on("error", () => {
            reject();
        });
    });
}

function loginCampnet() {
    const parameters = {
        mode: 191,
        username: process.env.CAMPNET_USERNAME,
        password: process.env.CAMPNET_PASSWORD,
        a: Date.now(),
        producttype: 0,
    };

    const options: RequestOptions = {
        hostname: "campnet.bits-goa.ac.in",
        port: "8090",
        path: "/login.xml",
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": stringify(parameters).length,
        },
    };

    const req = request(options, (response) => {
        let chunks = [];
        response.on("data", (fragments) => chunks.push(fragments));
        response.on("end", () => {
            const responseString = Buffer.concat(chunks).toString();

            if (/CDATA\[LIVE\]/.test(responseString)) console.log("Logged in");
            else console.log("Username error");
        });
        response.on("error", (err) => console.error(err));
    });
    req.on("error", (err) => console.error(err));
    req.write(stringify(parameters));
    req.end();
}

function interfaceUpdater() {
    checkInternetConnectivity().catch(() =>
        checkCampnetSite().then(loginCampnet)
    );
    setTimeout(interfaceUpdater, 500);
}

setInterval(
    remainingData,
    Number(process.env.REMAINING_DATA_CHECK_INTERVAL || 30000)
);
interfaceUpdater();
