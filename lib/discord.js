"use strict";
const https = require("https");
const WebSocket = require("ws");
const EventEmitter = require("events").EventEmitter;
const util = require('util');

class DiscordClient extends EventEmitter {
    constructor(email, password, server, channels) {
        super();
        this.email = email;
        this.password = password;
        this.server = server;
        this.channels = channels;
        this.login();
    }

    openSocket() {
        console.log(this.token);
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
                console.log(data.url);
                this.socket = new WebSocket(data.url)
                .on("open", () => {
                    this.socket.send(JSON.stringify(initMsg));
                })
                .on("message", (data, flags) => {
                    let nData = JSON.parse(data);
                    if (nData.t == "READY") {
                        console.log(nData.d["heartbeat_interval"]);
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

    login() { //Gets an authorization token for later use
        this.apiCall("auth/login", {'email':this.email,'password':this.password}).then((data) => {
            this.token = data.token;
            this.emit("login", this.token);
        }).catch((e) => {throw new Error(e)});
    }

    apiCall(path, data, token) {
        let method = data ? 'POST' : 'GET';
        let fData = "";
        return new Promise((resolve, reject) => {
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