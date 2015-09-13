//Based on node-slack-client @ https://github.com/slackhq/node-slack-client

var https = require('https');
var WebSocket = require('ws');

var apiOptions = {
    hostname: "slack.com/api/",
    method: "POST"
};

module.exports = SlackBot;

require('util').inherits(SlackBot, require('events').EventEmitter);

function SlackBot(slackToken) {
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
SlackBot.prototype.connect = function() {
    var tempHolder = this._apiCall("rtm.start", { "token": this.token, "simple_latest": true, "no_unreads": true });
};

//Make calls to the Slack API
SlackBot.prototype._apiCall = function(method, optionalArgs) {
    var data = optionalArgs;

    apiOptions.path = method;

    var reg = https.request(apiOptions, function(res) {
        res.on("data", function(data) {

        });
    });
};