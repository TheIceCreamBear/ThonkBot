const fs = require('fs');
const path = require('path');
const { state } = require('../bot');
const { Collection } = require('discord.js');

state.commands = new Collection();
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && !file.includes('loader.js') && !file.includes('handler.js') && !file.includes('init.js') && !file.includes('deploy.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));
    state.commands.set(command.data.name, command);
}
