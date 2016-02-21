"use strict";
const bUtil = require("./utils.js");
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
        const initMsg = {
            "op": 2,
            "d": {
                "token": this.token,
                "v": 3,
                "properties": {
                    "$os": "BryceOS",
                    "$browser": "Bryce",
                    "$device": "Bryce",
                    "$referrer": "http://bc56.me/",
                    "$referring_domain":"bc56.me"
                },
                "large_threshold":100
            }
        };
        DiscordClient.api("gateway", null, this.token).then((data) => {
            this.socket = new WebSocket(data.url)
                .on("open", () => {
                    this.socket.send(JSON.stringify(initMsg));
                })
                .on("message", (data, flags) => {
                    data = JSON.parse(data);
                    if (data.t == "READY") {
                        setInterval(() => {
                            this.socket.send(JSON.stringify({
                                "op": 1,
                                "d": Date.now()
                            }));
                        }, data.d["heartbeat_interval"]);

                        this.emit("connected");
                    }
                    this.emit("data", data, flags);
                });
        }).catch((e) => {throw new Error(e)});
    }

    /**
     * Obtains an authorization token for later use
     * Uses the class instance's email and password values
     */
    login() {
        DiscordClient.api("auth/login", {'email':this.email,'password':this.password}).then((data) => {
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
    static api(path, data, token) {
        if (typeof path !== "string" || path == "") {
            Promise.reject("Missing path parameter");
        }

        const options = {
            method: data ? 'POST' : 'GET',
            url: "https://discordapp.com/api/" + path,
            headers: {}
        };

        if (token) options.headers["Authorization"] = token;
        if (options.method == "POST") {
            options.headers["Content-Type"] = "application/json";
            options.body = data;
        }

        return bUtil.request(true, options);
    }
}

module.exports = DiscordClient;