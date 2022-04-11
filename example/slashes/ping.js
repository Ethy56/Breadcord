const { SlashCommandBuilder } = require("@discordjs/builders");
module.exports = {
    builder: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Current ping"),
    name: "ping",
    callback: async (ctx) => {
        var { self, client } = ctx;
        var embed = await client.defaultEmbed({
            title: "Ping Pong!",
            description: "`" + client.ws.ping + "`"
        });
        self.editReply({embeds:[embed]});
    }
}