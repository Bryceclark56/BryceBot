//Based on node-slack-client @ https://github.com/slackhq/node-slack-client

var https = require('https');
var WebSocket = require('ws');

class SlackClient extends EventEmitter {
    constructor(token) {
        super();
        this.token = slackToken;
        this.socket = null;
        this.channels = null;
        this.users = null;
        this.bots = null;
        this.self = null;
        this.team = null;
        this.groups = null;
        this.dms = null;
        this.socketURL = null;
        this._messageID = 0;
    }

    //Connect to the Slack RTM API
    connect() {
        var temp = this.apiCall("rtm.start", { "token": this.token, "simple_latest": true, "no_unreads": true });
    }

    //Make calls to the Slack API
    static apiCall(method, optionalArgs) {
        var data = optionalArgs;

        apiOptions.path = method;

        var reg = https.request(apiOptions, function(res) {
            res.on("data", function(data) {

            });
        });
    }
}

module.exports = SlackClient;