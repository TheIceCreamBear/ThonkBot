import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandDefinition } from './commands.js';

export default () => {
    const pingCommand = new CommandDefinition();
    pingCommand.command = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!');
    
    pingCommand.execute = async (interaction) => {
        interaction.reply('Pong!')
    }

    return pingCommand;
}
