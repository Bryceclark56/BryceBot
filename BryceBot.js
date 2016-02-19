//var NetworkHandler = require("lib/NetworkHandler.js");
//var mongoDB = require("mongodb");

//var networks = NetworkHandler.loadNetworks();

const Discord = require("./lib/discord.js");
var uwot = new Discord(process.env.email, process.env.password, "test", "test");
uwot.once("login", (data) => {
    console.log(data);
    uwot.openSocket();
});

uwot.once("connected", () => {
    console.log("Hai");
});
