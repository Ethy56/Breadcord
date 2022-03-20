# Breadcord
Breadcord is a Discord.JS Framework which provides easy use of DJS.

## Setup
To install Breadcord use:
`npm i breadcord`

## Support
You are welcome to join the [Discord](https://discord.gg/BTNvpyzHYq) to ask for support 

## Examples
Examples of Breadcord in action can be found on the [Github](https://github.com/Ethy56/Breadcord) page.

## Defaults
Defaults allow the bot to use things by default, such as a default color to use when using the default embed function to have similar embeds wherever you send an embed.
```
Client.setDefaults({
	color: "#0000FF", // default color, only needed if using default embed with client
	ignore_direct: true, // bool, whether to ignore direct messages or not
	ignore_guild: false, // bool, whether to ignore guild messages or not
	ephemeral: true, // bool, can be specified to have interactions be ephemeral by default
});
```