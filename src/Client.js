const Discord = require("discord.js");
const chalk = require("chalk");
const Collection = require("./Collection.js");
const SlashCollection = require("./SlashCollection.js");
const BreadError = require("./BreadError.js");

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = class Client extends Discord.Client {
    constructor({intents, token, prefix = "", defaults = {}, clientid = 0}) {
        console.log(chalk.green("Running Breadcord | Server: https://discord.gg/BTNvpyzHYq | GitHub: https://github.com/Ethy56/Breadcord"));
        super({intents});
        this.prefix = prefix;
        this.intents = intents;
        this.clientid = clientid;
        this.token = token;
        this.defaults = defaults;
    }
    handleMessages(bool) {
        this.handle_messages = bool;
    }
    handleSlashes(bool) {
        this.handle_slashes = bool;
    }
    connect(){
        try {
            var eventFilter = (event) => {
                if (event.name === "interactionCreate" && this.handle_slashes) {
                    return false;
                }
                if (event.name === "messageCreate" && this.handle_messages) {
                    return false;
                }
                return true;
            }
            if (this.events && this.events.size != 0) {
                var events = this.handle_messages || this.handle_slashes ? Array.from(this.events).filter(eventFilter) : Array.from(this.events);
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
            };
            if (this.handle_messages) {
                this.on("messageCreate", async (message) => {
                    if (this.prefix === "") {
                        throw (new BreadError("No prefix detected, set a prefix when initating client")).error;
                        return;
                    }
                    if (this.defaults.ignore_direct && !message.guild) return;
                    if (this.defaults.ignore_guilds && message.guild) return;
                    var PrefixRegex = new RegExp(`^(${escapeRegex(this.prefix)})`);
                    var args = message.content.split(/ +/);
                    var first = args.shift();
                    if (!PrefixRegex.test(first)) return;
                    first = first.replace(PrefixRegex,"");
                    if (!this.commands) return;
                    var command = this.commands.get(first) || Array.from(this.commands).filter(command => (command.aliases && command.aliases.includes(first)));
                    if (!command) return;
                    if (Array.isArray(command)) return;
                    if (message.guild) {
                        if (!message.guild.me.permissions.has("SEND_MESSAGES")) return;
                        if (!message.member.permissions.has(command.user_permissions || [])) {
                            return message.channel.send({ content: message.member.displayName + ", You're missing `" + Object.keys(Discord.Permissions.FLAGS).filter((perm)=>(command.user_permissions.includes(perm)&&!message.membr.permissions.has(perm))) + "` permissions to use `" + command.name + "`" });
                        }
                        if (!message.guild.me.permissions.has(command.bot_permissions || [])) {
                            return message.channel.send({ content: message.member.displayName + ", I'm missing `" + Object.keys(Discord.Permissions.FLAGS).filter((perm)=>(command.user_permissions.includes(perm)&&!message.membr.permissions.has(perm))) + "` permissions to use `" + command.name + "`" });
                        }
                        command.callback(this, message);
                    } else {
                        command.callback(this, message);
                    }
                });
            }
            if (this.handle_slashes) {
                this.on("interactionCreate", async (interaction) => {
                    if (!interaction.isCommand()) return;
                    var command = this.slash_commands.get(interaction.commandName);
                    await interaction.deferReply({ephemeral:this.defaults.ephemeral?this.defaults.ephemeral:false});
                    command.callback(this, interaction);
                });
            }
            this.login(this.token);
        } catch(e) {
            throw (new BreadError(e))
        }
    }
    async disconnect(){
        await this.destroy();
        this.removeAllListeners();
    }
    setDefaults(defaults) {
        this.defaults = Object.assign({}, this.defaults, defaults);
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
    addLoader(type, options) {
        if (["commands","slash_commands","events","includes"].includes(type)) {
            if (type === "slash_commands") {
                this.slash_commands = new SlashCollection(Object.assign({},options, {client:this, clientid: this.clientid}));
                if (options.load) {
                    this.slash_commands.load().catch(e=>{
                        throw (new BreadError(e).error);
                    });
                }
            } else {
                this[type] = new Collection(Object.assign({},options,(type==="commands"?{isCommands:true}:{isCommands:false})));
                if (options.load) {
                    this[type].load().catch(e=>{
                        throw (new BreadError(e).error);
                    });
                }
            }
        } else {
            if (!this.loaders) {
                this.loaders = {
                    type: new Collection(options)
                }
                if (options.load) {
                    this.loaders[type].load().catch(e=>{
                        throw (new BreadError(e).error);
                    });
                }
                return this.loaders[type];
            } else {
                this.loaders[type] = new Collection(options);
                if (options.load) {
                    this.loaders[type].load().catch(e=>{
                        throw (new BreadError(e).error);
                    });
                }
                return this.loaders[type];
            }
        }
    }
    removeLoader(type) {
        if (type === "events"){
            this.events.unload();
            delete this.events;
        } else if (type === "commands") {
            this.commands.unload();
            delete this.commands;
        } else if (type === "includes") {
            this.includes.unload();
            delete this.includes;  
        } else {
            if (this.loaders[type]) {
                this.loaders[type].unload();
                delete this.loaders[type];
            }
        }
    }
}