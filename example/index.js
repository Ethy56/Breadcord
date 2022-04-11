require("dotenv").config();
const BreadCord = require("./src");

// create intents that are guild based
const Intents = new BreadCord.Intents({
    GUILDS: true
});

/* initiate client
    intents - Discord.js intents or BreadCord intents acceptable
    token - bot token
    prefix - bot prefix
*/
const BreadClient = new BreadCord.Client({
    intents: Intents,
    clientid: process.env.clientid,
    token: process.env.token,
    prefix: "!",
});

// set defaults
BreadClient.setDefaults({
    color: "#ff0000",
    ephemeral: true
});

// set commands dir to add commands
BreadClient.setCommandsDir("./commands");

// set slash commands dir to add slash commands
BreadClient.setSlashCommandsDir("./slashes");

// connect to discord api
BreadClient.connect();