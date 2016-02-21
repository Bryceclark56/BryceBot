"use strict";
module.exports = Network;

class Network {
    constructor() {
        this.channels = [];
    }

    connect() {
        for (channel in this.channels) {
            channel.connect();
        }
    }

    addChannel() {
        
    }
}