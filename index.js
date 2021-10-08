// pull in envs for local dev
require('dotenv').config();

const { Client, Intents } = require('discord.js');

// create new client
const client = new Client({intents: [Intents.FLAGS.GUILDS]});

client.once('ready', () => {
    console.log('Ready!');
});

client.login(process.env.DISCORD_BOT_TOKEN);
