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
    defaults - defaults for the bot to use, check readme for valid defaults
    clientid - only needed if using slash commands
NOTES: If you want to use message commands as well look at the normal commands example on the github https://github.com/Ethy56/Breadcord
*/
const BreadClient = new BreadCord.Client({
    intents: Intents,
    token: process.env.token,
    clientid: process.env.clientid,
    defaults: {
        color: "#ff0000",
        ephemeral: true
    }
});

/*
Create a list of slash_commands from "slashes" folder
    path - absolute path to directory
    filetype - the filetype to use (defaults to .js)
    load - (bool) should it automatically load when creating
*/
BreadClient.addLoader("slash_commands", {
    path: path.join(process.cwd(), "slashes"),
    filetype: ".js",
    load: true
});

/* use breadcords slash handler
    true - uses breadcord on slash handler, false - use your own
*/
BreadClient.handleSlashes(true);

// connect to discord api
BreadClient.connect();