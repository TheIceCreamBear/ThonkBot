const { Client, Intents } = require('discord.js');

let state = {};

async function init() {
    state.clientID = process.env.DISCORD_CLIENT_ID;
    state.focusedGuild = process.env.DISCORD_GUILD_ID;
    
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

module.exports.state = state;
module.exports.init = init;
