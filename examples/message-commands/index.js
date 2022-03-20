require("dotenv").config();
const path = require("path");
const BreadCord = require("breadcord");

// create intents that are guild based
const Intents = new BreadCord.Intents({
    GUILDS: true
});

/* initiate client
    intents - Discord.js intents or BreadCord intents acceptable
    token - bot token
    prefix - bot prefix
    defaults - defaults for the bot to use, check readme for valid defaults
NOTES: if you are not using breadcords message handler you do not need to provide a prefix option
If you want to use slash commands as well look at the slash commands example on the github https://github.com/Ethy56/Breadcord
*/
const BreadClient = new BreadCord.Client({
    intents: Intents,
    token: process.env.token,
    prefix: process.env.prefix,
    defaults: {
        color: "#ff0000"
    }
});

/*
Create a list of commands from "commands" folder
    path - absolute path to directory
    filetype - the filetype to use (defaults to .js)
    load - (bool) should it automatically load when creating
*/
BreadClient.addLoader("commands", {
    path: path.join(process.cwd(), "commands"),
    filetype: ".js",
    load: true
});


/* use breadcords message handler
    true - uses breadcord on message handler, false - uses custom from events loader
*/
BreadClient.handleMessages(true);

// connect to discord api
BreadClient.connect();