const BreadError = require("./BreadError.js")

module.exports = class Command {
	constructor({name, aliases = [], user_permissions = [], bot_permissions = [], callback}) {
		try {
			if (!name) {
				throw (new BreadError("No name supplied for command " + JSON.stringify({
					name,
					aliases,
					user_permissions,
					bot_permissions,
					callback
				}))).error;
			}
			if (!callback) {
				throw (new BreadError("No callback supplied for command " + JSON.stringify({
					name,
					aliases,
					user_permissions,
					bot_permissions,
					callback
				}))).error;
			}
			this.name = name;
			this.aliases = aliases;
			this.user_permissions = user_permissions;
			this.bot_permissions = bot_permissions;
			this.callback = callback;
		} catch(e) {
			console.error(e);
			throw (new BreadError(e));
		}
	}
	setName(name) {
		this.name = name;
	}
	setAliases(aliases) {
		this.aliases = Array.from(aliases) || aliases;
	}
	setCallback(callback) {
		this.callback = callback;
	}
	setPermissions(type, permissions) {
		try {
			if (type.toLowerCase() === "bot") {
				this.bot_permissions === permissions;
			} else if (type.toLowerCase() === "user") {
				this.user_permissions === permissions;
			} else {
				throw (new BreadError("Unrecognized type supplied for " + JSON.stringify({
					type,
					permissions
				}))).error;
			}
		} catch(e) {
			throw (new BreadError(e))
		}
	}
}