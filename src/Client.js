const Discord = require("discord.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const Collection = require("./Collection.js");
const BreadError = require("./BreadError.js");
const path = require("path");
const fs = require("fs");
const Context = require("./Context.js");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = class Client extends Discord.Client {
    constructor({intents, token, prefix = "", defaults = {}, clientid = 0}) {
        console.log("Running Breadcord | Server: https://discord.gg/BTNvpyzHYq | GitHub: https://github.com/Ethy56/Breadcord");
        super({intents});
        this.prefix = prefix;
        this.intents = intents;
        this.clientid = clientid;
        this.token = token;
        this.defaults = defaults;
        this.collections = {};
        this.on("eventAdd", (event)=>{
            this.on(event.name, async (...params) => {
                event.callback(this, ...params);
            });
        });
        this.on("eventRemove", (event)=>{
            this.removeListener(event);
        });
    }
    async pushSlahes() {
        if (this.collections && this.collections.slash_commands) {
            var builders = Array.from(this.collections.slash_commands).map(([, value])=>value.builder.toJSON());
            if (this.slashrest === undefined) {
                this.slashrest = new REST({ version: '9' }).setToken(this.token);
            }
            await this.slashrest.put(
                Routes.applicationCommands(this.clientid),
                { body: builders }
            );
        }
    }
    connect(){
        var events = this.collections.events !== undefined ? this.collections.events.array() : [];
        events.forEach(([,event])=>{
            if (event.type === "on") {
                this.on(event.name, async (...params) => {
                    event.run(this, ...params);
                });
            } else if (event.type === "once") {
                this.once(event.name, async (...params) => {
                    event.run(this, ...params);
                });
            } else {
                throw (new BreadError("Invalid Event type from " + JSON.stringify(event))).error;
            }
        });
        if (!events.includes("messageCreate")&&this.collections.commands) {
            this.on("messageCreate", async (message) => {
                if (this.prefix === "") {
                    throw (new BreadError("No prefix detected, set a prefix when initating client")).error;
                }
                if (this.defaults.ignore_direct && !message.guild) return;
                if (this.defaults.ignore_guilds && message.guild) return;
                var PrefixRegex = new RegExp(`^(${escapeRegex(this.prefix)})`);
                var args = message.content.split(/ +/);
                var first = args.shift();
                if (!PrefixRegex.test(first)) return;
                first = first.replace(PrefixRegex,"");
                var command = this.collections.commands.get(first) || this.collections.commands.items.filter(command => (command.aliases && command.aliases.includes(first)));
                var context = new Context(this, message);
                if (message.guild) {
                    if (!message.guild.me.permissions.has("SEND_MESSAGES")) return;
                    if (!message.member.permissions.has(command.user_permissions || [])) {
                        return message.channel.send({ content: message.member.displayName + ", You're missing `" + Object.keys(Discord.Permissions.FLAGS).filter((perm)=>(command.user_permissions.includes(perm)&&!message.membr.permissions.has(perm))) + "` permissions to use `" + command.name + "`" });
                    }
                    if (!message.guild.me.permissions.has(command.bot_permissions || [])) {
                        return message.channel.send({ content: message.member.displayName + ", I'm missing `" + Object.keys(Discord.Permissions.FLAGS).filter((perm)=>(command.bot_permissions.includes(perm)&&!message.guild.me.permissions.has(perm))) + "` permissions to use `" + command.name + "`" });
                    }
                    command.callback(context);
                } else {
                    command.callback(context);
                }
            });
        }
        if (!events.includes("interactionCreate")&&this.collections.slash_commands) {
            this.pushSlahes();
            this.on("interactionCreate", async (interaction) => {
                if (!interaction.isCommand()) return;
                var context = new Context(this, interaction);
                var command = this.collections.slash_commands.get(interaction.commandName);
                await interaction.deferReply({ephemeral:this.defaults.ephemeral?this.defaults.ephemeral:false});
                command.callback(context);
            });
        }
        this.login(this.token);
    }
    async disconnect(){
        await this.destroy();
        this.removeAllListeners();
    }
    setDefaults(defaults) {
        this.defaults = Object.assign({}, this.defaults, defaults);
        return this;
    }
    defaultEmbed(options) {
        if (options.length || options.length > 1) {
            var embeds = [];
            options.forEach(option=>{
                var embed = new Discord.MessageEmbed(option);
                if (!option.color && this.defaults != {}) {
                    if (this.defaults.color) {
                        embed.setColor(this.defaults.color);
                    }
                }
                if (!option.timestamp) {
                    embed.setTimestamp();
                }
                if (!option.footer) {
                    embed.setFooter({text: this.user.tag, iconURL: this.user.displayAvatarURL()});
                }
                embeds.push(embed);
            });
            return embeds;
        } else {
            var embed = new Discord.MessageEmbed(options);
            if (!options.color && this.defaults != {}) {
                if (this.defaults.color) {
                    embed.setColor(this.defaults.color);
                }
            }
            if (!options.timestamp) {
                embed.setTimestamp();
            }
            if (!options.footer) {
                embed.setFooter({text: this.user.tag, iconURL: this.user.displayAvatarURL()});
            }
            return embed;
        }
    }
    setCommandsDir(dir) {
        var files = fs.readdirSync(path.join(process.cwd(), dir)).filter(file=>file.endsWith(".js"));
        if (!this.collections.commands) {
            this.collections.commands = new Collection();
        }
        files.forEach(file=>{
            var req = require(path.join(process.cwd(), dir, file));
            this.addCommand(req);
        });
    }
    setSlashCommandsDir(dir) {
        var files = fs.readdirSync(path.join(process.cwd(), dir)).filter(file=>file.endsWith(".js"));
        if (!this.collections.slash_commands) {
            this.collections.slash_commands = new Collection();
        }
        files.forEach(file=>{
            var req = require(path.join(process.cwd(), dir, file));
            this.addSlashCommand(req);
        });
    }
    setEventsDir(dir) {
        var files = fs.readdirSync(path.join(process.cwd(), dir)).filter(file=>file.endsWith(".js"));
        if (!this.collections.events) {
            this.collections.events = new Collection();
        }
        files.forEach(file=>{
            var req = require(path.join(process.cwd(), dir, file));
            this.addEvent(req);
        });
    }
    addCommand(item = {name: null, callback: null}) {
        if (!item.name) {
            throw (new BreadError("No name provided for adding Item to Collection")).error;
        }
        if (!item.callback) {
            throw (new BreadError("No callback provided for adding Item to Collection")).error;
        }
        if (typeof this.collections !== "object") {
            this.collections = {};
        }
        if (!this.collections.commands) {
            this.collections.commands = new Collection([item]);
        } else {
            this.collections.commands.addItem(item);
        }
    }
    removeCommand(name) {
        if (!name) {
            throw (new BreadError("No name provided for adding Item to Collection")).error;
        }

        if (!this.collections.commands) {
            throw (new BreadError("No commands to remove")).error;
        }
        this.collections.commands.removeItem(name);
    }
    addSlashCommand(item = {name: null, callback: null}) {
        if (!item.name) {
            throw (new BreadError("No name provided for adding Item to Collection")).error;
        }
        if (!item.callback) {
            throw (new BreadError("No callback provided for adding Item to Collection")).error;
        }
        if (typeof this.collections !== "object") {
            this.collections = {};
        }
        if (!this.collections.slash_commands) {
            this.collections.slash_commands = new Collection([item]);
        } else {
            this.collections.slash_commands.addItem(item);
        }
    }
    removeSlashCommand(name) {
        if (!name) {
            throw (new BreadError("No name provided for adding Item to Collection")).error;
        }
        if (!this.collections.slash_commands) {
            throw (new BreadError("No slash commands to remove")).error;
        }
        this.collections.slash_commands.removeItem(name);
    }
    addEvent(event = {name: null, type: null, callback}) {
        if (!event.name) {
            throw (new BreadError("No name provided for adding Item to Collection")).error;
        }
        if (!event.callback) {
            throw (new BreadError("No callback provided for adding Item to Collection")).error;
        }
        if (!event.type) {
            throw (new BreadError("No type provided for adding Item to Collection")).error;
        }
        if (!this.collections.events) {
            this.collections.events = new Collection([event]);
        } else {
            this.collections.events.addItem(event);
        }
        this.emit("eventAdd", event);
    }
    removeEvent(name) {
        if (!name) {
            throw (new BreadError("No name provided for adding Item to Collection")).error;
        }
        if (!this.collections.events) {
            throw (new BreadError("No events to remove")).error;
        }
        this.collections.events.removeItem(name);
        this.emit("eventRemove", name);
    }
};