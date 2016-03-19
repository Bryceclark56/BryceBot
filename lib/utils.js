"use strict";
const http = require("http");
const https = require("https");
const URL = require("url");
class bUtils {
    static request = function(secure, args) {
        secure = secure || false;

        var realRequest = (method, data, secure) => {
            return new Promise((resolve, reject) => {
                var errorHandler = function(e) {
                    e = !(e instanceof Error) ? e : new Error(e);
                    reject(e);
                };
                if (typeof data.url !== "string" || data.url === "") {
                    errorHandler("URL must be a non-empty string, not ${typeof data.url}");
                }
                if (!(data.method === 'POST' || data.method === 'GET')) {
                    errorHandler("${data.method.toString()} of type ${typeof data.method} is not a valid method");
                }
                const u = URL.parse(data.url);
                var protocol = null;
                if (u.protocol === 'http:') {
                    protocol = http;
                }
                else if (u.protocol === 'https:') {
                    protocol = https;
                }
                else {
                    errorHandler("${u.protocol} is not valid");
                }
                var responseHandler = (res) => { //Gets the data from the response
                    var data = "";
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
                    protocol.get(options, responseHandler).on('error', errorHandler);
                }
                else if (method === 'POST') {
                    let req = protocol.request(options, responseHandler).on('error', errorHandler);
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
}

module.exports = bUtils;