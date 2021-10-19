const { Client, Intents } = require('discord.js');

let state = {};

async function init() {
    state.clientID = process.env.DISCORD_CLIENT_ID;
    state.focusedGuild = process.env.DISCORD_GUILD_ID;

    // setup alpha users and alpha roles
    state.alphaUsers = getAlphaUserArray();
    state.alphaRoles = getAlphaRoleArray();
    
    state.client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MEMBERS]});
    
    state.client.once('ready', () => {
        console.log('Ready!');
    });
    
    // init commands
    require('./commands/init');
    // init listeners
    require('./listeners/loader');

    await state.client.login();
}

function getAlphaUserArray() {
    let userString = process.env.DISCORD_ALPHA_USER || '';
    let users = [];
    let splits = userString.split(',');
    for (let i in splits) {
        let split = splits[i];
        users.push(split);
    }
    return users;
}

function getAlphaRoleArray() {
    let userString = process.env.DISCORD_ALPHA_ROLE || '';
    let roles = [];
    let splits = userString.split(',');
    for (let i in splits) {
        let split = splits[i];
        roles.push(split);
    }
    return roles;
}

module.exports.state = state;
module.exports.init = init;
