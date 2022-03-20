const { SlashCommandBuilder } = require('@discordjs/builders');

const builder = new SlashCommandBuilder()
.setName("ping")
.setDescription("Get Bots Ping")

module.exports = {
    builder,
    callback: async (client, interaction) => {
        await interaction.editReply({content: `Pong \`${client.ws.ping}ms\``});
    }
}