module.exports = class Context {
    constructor (client, value) {
        this.client = client;
        this.self = value;
        this.guild = value.guild;
        this.channel = value.channel;
        this.guildID = value.channel.id;
        this.channelID = value.channel.id;
        this.user = value.user || value.author;
        this.member = value.member;
        this.userID = this.user.id;
        this.memberID = this.userID;
        this.Discord = require("discord.js");
    }
    jsonify () {
        return {
            client: this.client,
            guild: this.guild,
            channel: this.channel,
            guildID: this.guildID,
            channelID: this.channelID,
            user: this.user,
            member: this.member,
            userID: this.userID,
            memberID: this.memberID,
            Discord: this.Discord
        };
    }
};