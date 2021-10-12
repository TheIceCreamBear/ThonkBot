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

        if (process.env.RESET_COMMANDS) {
            console.log('Deleting old commands.');
            rest.get(Routes.applicationCommands(process.env.DISCORD_CLEINT_ID)).then(data => {
                const promises = [];
                for (const command of data) {
                    const deleteUrl = `${Routes.applicationCommands(process.env.DISCORD_CLEINT_ID)}/${command.id}`;
                    promises.push(rest.delete(deleteUrl));
                }
                return Promise.all(promises);
            }).then(() => console.log('Old commands deleted.'))
            .catch(() => console.error);
        }

        console.log('Setting up new commands.');
        rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLEINT_ID, process.env.DISCORD_GUILD_ID), { body: commands })
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error);

        console.log('Successfully reloaded application (/) commands.');
    } catch (e) {
        console.log(e);
    }
})();