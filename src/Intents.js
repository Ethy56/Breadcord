const Discord = require("discord.js");

module.exports = class Intents extends Discord.Intents {
    constructor(vals = {GUILDS: false, DIRECTS: false, ALL: false}) {
        super()
        if (vals.ALL) {
            for (const intent of Object.keys(Discord.Intents.FLAGS)){  
                if (intent.includes("GUILD")) { 
                    this.add(intent);
                }
            }
        } else {
            if (vals.GUILDS) {
                for (const intent of Object.keys(Discord.Intents.FLAGS)){  
                    if (intent.includes("GUILD")) { 
                        this.add(intent);
                    }
                }
            }
            if (vals.DIRECTS) {
                for (const intent of Object.keys(Discord.Intents.FLAGS)){  
                    if (intent.includes("DIRECT")) { 
                        this.add(intent);
                    }
                } 
            }
        }
    }
}