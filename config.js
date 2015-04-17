var config = {};

config.version = "0.1.2";

// hipchat user that the bot will be using
config.userJid = ""; // must end with /bot
config.password = "";

// hipchat v2 API token
config.apiToken = "";

// rooms to automatically join on startup regardless of memory
config.autojoin = [];

// the command test regex
// note that currently the command is $2 of the regex matches
config.commandTest = new RegExp("^(nooicenooice|nooice nooice) please (.+)$","i");

module.exports = config;
