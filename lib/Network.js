module.exports = Network;

function Network() {
    this.channels = [];
}

Network.prototype.connect = function() {
    for (channel of this.channels) {
        channel.connect();
    }
};

Network.prototype.addChannel = function() {

};