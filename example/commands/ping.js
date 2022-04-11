module.exports = {
    name: "ping", // command name
    bot_permissions: [""], // defualt - [], bot permissions needed to run (checks for SEND_MESSAGES by default) used by breadcord handler
    user_permissions: [""], // same as above but for the user
    callback: async (ctx) => {
        var { client, channel } = ctx;
        var embed = await client.defaultEmbed({
            title: "Ping Pong!",
            description: "`" + client.ws.ping + "`"
        });
        channel.send({embeds:[embed]});
    } // the function to run, must be callback if using breadcords message handler
}