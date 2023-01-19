import axios from "axios";
import { writeFile } from "fs/promises";
import { stringify } from "querystring";

const client = axios.create();

function getCookie() {
    return client
        .post(
            "https://campnet.bits-goa.ac.in:8093/userportal/Controller",
            stringify({
                mode: 451,
                json: JSON.stringify({
                    username: "f20202095",
                    password: "ZeaenN.123@wifi",
                    languageid: 1,
                    browser: "Chrome_106",
                }),
            })
        )
        .then((res) => res.headers["set-cookie"][0].split(";")[0]);
}

function getCSRF() {
    return getCookie().then((cookie) =>
        client
            .get(
                "https://campnet.bits-goa.ac.in:8093/userportal/webpages/myaccount/index.jsp",
                {
                    headers: {
                        Cookie: cookie,
                    },
                }
            )
            .then((res) => ({
                cookie,
                csrf: String(res.data).match(/k3n = '(.+)'/)[1],
            }))
    );
}

export const remainingData = () => {
    getCSRF()
        .then((creds) =>
            client.get(
                `https://campnet.bits-goa.ac.in:8093/userportal/webpages/myaccount/AccountStatus.jsp`,
                {
                    headers: {
                        Cookie: creds.cookie,
                        "X-CSRF-Token": creds.csrf,
                        Referer:
                            "https://campnet.bits-goa.ac.in:8093/userportal/webpages/myaccount/login.jsp",
                    },
                    params: {
                        popup: 0,
                        t: Date.now(),
                    },
                }
            )
        )
        .then((res) => {
            return res.data
                .split("Language.CycleDataTrasfer")[1]
                .match(/>\s+(\d+\.?\d*)&nbsp;<label id='Language\.\w+/g)
                .map((val) =>
                    val
                        .replace(/\s/g, "")
                        .replace(">", "")
                        .replace("&nbsp;<labelid='Language.", "")
                );
        })
        .then((traffics) => ({
            total: traffics[0],
            used_prev_sess: traffics[1],
            used_this_sess: traffics[2],
            used_total: traffics[3],
            remaining: traffics[4],
        }))
        .then((json) => {
            writeFile(
                process.env.REMAINING_DATA_PATH || "/dev/null",
                json.remaining
            );
            writeFile(
                process.env.USED_DATA_PATH || "/dev/null",
                json.used_total
            );
            writeFile(process.env.TOTAL_DATA_PATH || "/dev/null", json.total);
        });
};
