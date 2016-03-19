const Discord = require("./lib/discord.js");
var uwot = new Discord(process.env.email, process.env.password);
uwot.once("login", (data) => {
    console.log(data);
    uwot.openSocket();
});

uwot.once("connected", () => {
    console.log("Hai");
    uwot.updateGame("Hexagon Simulator");
});

uwot.on('data', (d) => {
    console.log(d);
});