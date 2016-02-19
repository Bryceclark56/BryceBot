"use strict";
const https = require("https");
const WebSocket = require("ws");
const EventEmitter = require("events").EventEmitter;
const util = require('util');

class DiscordClient extends EventEmitter {
    /**
     * @param {string} email - Email of Discord account
     * @param {string} password - Password of Discord account
     */
    constructor(email, password) {
        super();
        this.email = email;
        this.password = password;
        this.login();
    }

    /**
     * Opens a Web Socket connection to Discord for monitoring events (Chat, typing, user updates, etc.)
     */
    openSocket() {
        if (!this.token) {
            throw new Error("Missing Authorization token");
        }
        let initMsg = {
            "op": 2,
            "d": {
                "token": this.token,
                "v": 3,
                "properties": {
                    "$os": "Windows",
                    "$browser": "Chrome",
                    "$device": "",
                    "$referrer": "https://discordapp.com/@me",
                    "$referring_domain":"discordapp.com"
                },
                "large_threshold":100
            }
        };
        this.apiCall("gateway", null, this.token).then((data) => {
                this.socket = new WebSocket(data.url)
                .on("open", () => {
                    this.socket.send(JSON.stringify(initMsg));
                })
                .on("message", (data, flags) => {
                    let nData = JSON.parse(data);
                    if (nData.t == "READY") {
                        setInterval(() => {
                            this.socket.send(JSON.stringify({
                                "op": 1,
                                "d": Date.now()
                            }));
                        }, nData.d["heartbeat_interval"]);
                        
                        this.emit("connected");
                    }
                    this.emit("data", data, flags, nData);
                });
        }).catch((e) => {throw new Error(e)});
    }

    /**
     * Obtains an authorization token for later use
     * Uses the class instance's email and password values
     */
    login() {
        this.apiCall("auth/login", {'email':this.email,'password':this.password}).then((data) => {
            this.token = data.token;
            this.emit("login", this.token);
        }).catch((e) => {throw new Error(e)});
    }

    /**
     * Makes calls to the Discord API
     * @param path - (Appended to "/api/") Path to the API location
     * @param data - (Optional) Data to send with the request
     * @param token - (Optional) Authorization token
     * @returns {Promise} - I promise I'll give you the returned data, eventually!
     */
    apiCall(path, data, token) {
        return new Promise((resolve, reject) => {
            if (!path || path == "") {
                reject("Missing path parameter");
            }

            let method = data ? 'POST' : 'GET';
            let fData = "";
            let options = {
                hostname: "discordapp.com",
                path: "/api/" + path,
                headers: {}
            };


            if (token) options.headers.Authorization = token;
            if (method == "POST") {
                options.headers["Content-Type"] = "application/json";
                options.method = method;

                let request = new https.request(options,
                    (res) => {
                        res.on("data", (d) => {
                                fData += d.toString();
                            })
                            .on("end", () => {
                                fData = JSON.parse(fData);
                                resolve(fData);
                            });
                    }
                ).on("error", (e) => {
                    reject(e);
                });

                request.write(JSON.stringify(data));
                request.end();
            }
            else {
                let request = new https.get(options, (res) => {
                    res.on("data", (d) => {
                            fData += d.toString();
                        })
                        .on("end", () => {
                            fData = JSON.parse(fData);
                            resolve(fData);
                        });
                }).on("error", (e) => {
                    reject(e);
                });
            }
        });
    }
}

module.exports = DiscordClient;