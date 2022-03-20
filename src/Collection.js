const fs = require("fs");
const BreadError = require("./BreadError.js");
const Command = require("./Command.js");

module.exports = class Collection extends Map {
    constructor({path, filetype = ".js", isCommands = false, client}) {
        super();
        this.path = path;
        this.isCommands = isCommands;
        this.filetype = filetype.toLocaleLowerCase();
    }
    setPath(path) {
        this.path = path;
    }
    load() {
        return new Promise((resolve, reject) => {
            try {
                var files = fs.readdirSync(this.path).filter(file => file.toLocaleLowerCase().endsWith(this.filetype));
                files.forEach(file=>{
                    var requiredFile = require(this.path + "/" + file);
                    if (this.isCommands) {
                        requiredFile = new Command(requiredFile);
                    }
                    this.set(file.substr(0,file.length-this.filetype.length), requiredFile);
                });
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