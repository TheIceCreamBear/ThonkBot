import { state } from '../bot.js';

state.client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = state.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});
