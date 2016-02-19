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

/*uwot.on("data", (data, flags, nData) => {
    if (nData.d["guild_id"] == "99691464396652544") {
        uwot.apiCall("guilds/${nData.d['guild_id']}/channels", null, uwot.token).then((data) => {uwot.apiCall()}).catch((e)=>{});
    }
});*/
