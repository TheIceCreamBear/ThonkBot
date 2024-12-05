import { Client, GatewayIntentBits } from 'discord.js';

const state = {};

async function init() {
    state.clientID = process.env.DISCORD_CLIENT_ID;
    state.focusedGuild = process.env.DISCORD_GUILD_ID;

    // setup alpha users and alpha roles
    state.alphaUsers = getAlphaUserArray();
    state.alphaRoles = getAlphaRoleArray();

    state.client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers],
    });

    state.client.once('ready', () => {
        console.log('Ready!');
    });

    // init commands
    import('./commands/init.js');
    // init listeners
    import('./listeners/loader.js');

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
    let roleString = process.env.DISCORD_ALPHA_ROLE || '';
    let roles = [];
    let splits = roleString.split(',');
    for (let i in splits) {
        let split = splits[i];
        roles.push(split);
    }
    return roles;
}

export { state, init };
