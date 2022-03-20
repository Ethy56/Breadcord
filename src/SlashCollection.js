const fs = require("fs");
const BreadError = require("./BreadError.js");
const Collection = require("./Collection.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = class SlashCollection extends Collection {
    constructor({path, filetype = ".js", client, clientid}) {
        super({path, filetype, client, isComands:false});
        this.client = client;
        this.clientid = clientid;
        this.path = path;
        this.filetype = filetype.toLocaleLowerCase();
    }
    setPath(path) {
        this.path = path;
    }
    load() {
        return new Promise(async (resolve, reject) => {
            if (!this.client.slashRest) {
                this.client.slashRest = new REST({ version: '9' }).setToken(this.client.token);
            }
            try {
                var builders = [];
                var files = fs.readdirSync(this.path).filter(file => file.toLocaleLowerCase().endsWith(this.filetype));
                files.forEach(file=>{
                    var requiredFile = require(this.path + "/" + file);
                    if (!requiredFile.builder) {
                        throw new BreadError("No builder found in " + this.path + "/" + file);
                    } else {
                        var data = Object.assign({}, requiredFile, {builderData: requiredFile.builder.toJSON()});
                        builders.push(data.builderData);
                        this.set(file.substr(0,file.length-this.filetype.length), data);
                    }
                });
                await this.client.slashRest.put(
                    Routes.applicationCommands(this.clientid),
                    { body: builders },
                );
                resolve(this);
            } catch(err) {
                console.error(err);
                reject((new BreadError(err)).error);
            }
        })
    }
    unload() {
        this.forEach(file=>{
            delete require.cache[require.resolve(this.path + "/" + file + this.filetype)];
        })
        this.clear();
    }
    async reload() {
        await this.unload();
        this.load();
    }
}