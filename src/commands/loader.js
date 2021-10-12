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

// TODO delete duplicate commands from server
(async () => {
    try {
        console.log('Starting refersh of application (/) commands.');

        console.log('Deleting old commands.');
        rest.get(Routes.applicationCommands(process.env.DISCORD_CLEINT_ID)).then(data => {
            const promises = [];
            for (const command of data) {
                const deleteUrl = `${Routes.applicationCommands(process.env.DISCORD_CLEINT_ID)}/${command.id}`;
                promises.push(rest.delete(deleteUrl));
            }
            return Promise.all(promises);
        });
        console.log('Old commands deleted.');

        console.log('Setting up new commands.');
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLEINT_ID), { body: commands });
        console.log('New commands set up.');

        console.log('Successfully reloaded application (/) commands.');
    } catch (e) {
        console.log(e);
    }
})();
