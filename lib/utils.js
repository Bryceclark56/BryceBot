"use strict";
const http = require("http");
const https = require("https");
const URL = require("url");
var bUtils = {};
//Fuck you guys, I'm doing whatever I want
bUtils.request = function(secure, args) {
    secure = (typeof secure === 'undefined') ? false : secure;

    var realRequest = (method, data, secure) => {
        return new Promise((resolve, reject) => {
            var errorHandler = (e) => {
                if (!(e instanceof Error)) {
                    e = new Error(e);
                }
                reject(e);
            };
            if (typeof data.url !== "string" || data.url === "") {
                errorHandler("URL must be a non-empty string, not ${typeof data.url}");
            }
            if (!(data.method === 'POST' || data.method === 'GET')) {
                errorHandler("${data.method.toString()} of type ${typeof data.method} is not a valid method");
            }
            var u = URL.parse(data.url);
            var type = null;
            if (u.protocol === 'http:') {
                type = http;
            }
            else if (u.protocol === 'https:') {
                type = https;
            }
            else {
                errorHandler("${u.protocol} is not valid");
            }
            var responseHandler = (res) => { //Gets the data from the response
                let data = "";
                res.on('data', (chunks) => {
                    data += chunks.toString();
                })
                .on('end', () => {
                    resolve(JSON.parse(data));
                });
            };
            const options = {
                hostname: u.hostname,
                path: u.path,
                method: method,
                headers: data.headers ? data.headers : {}
            };
            if (method === 'GET') {
                type.get(options, responseHandler).on('error', errorHandler);
            }
            else if (method === 'POST') {
                let req = type.request(options, responseHandler).on('error', errorHandler);
                req.write(JSON.stringify(data.body));
                req.end();
            }
        });
    };

    if (args) {
        return realRequest(args.method, args, secure);
    }

    return {
        'get': (data) => {
            return realRequest('GET', data, secure);
        },
        'post': (data) => {
            return realRequest('POST', data, secure);
        }
    };
};

module.exports = bUtils;