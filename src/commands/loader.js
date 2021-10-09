const fs = require('fs');
const path = require('path');
const { state } = require('../bot');
const { Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

state.commands = new Collection();
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && !file.includes('loader.js') && !file.includes('handler.js') && !file.includes('init.js'));
const commands = [];

for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));
    commands.push(command.data.toJSON());
    state.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);


(async () => {
    try {
        console.log('Starting refersh of application (/) commands.');

        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLEINT_ID), { body: commands })

        console.log('Cussessfully reloaded application (/) commands.');
    } catch (e) {
        console.log(e);
    }
})();
