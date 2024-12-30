import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { state } from '../bot.js';
import userCommand from './user.js';
import pingCommand from './ping.js';
import serverCommand from './server.js';

export class CommandDefinition {
    execute: (interaction: CommandInteraction) => Promise<void>;
    command: SlashCommandBuilder;
}

export function getAllCommandDefinitions(): CommandDefinition[] {
    return [userCommand(), pingCommand(), serverCommand()];
}

export function loadCommandDefinitions() {
    const defs = getAllCommandDefinitions();

    for (const def of defs) {
        state.commands.set(def.command.name, def);
    }
}

export function registerCommandListener() {
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
}
