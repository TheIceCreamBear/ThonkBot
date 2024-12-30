import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandDefinition } from './commands.js';

export default () => {
    const userCommand = new CommandDefinition();
    userCommand.command = new SlashCommandBuilder()
        .setName('user')
        .setDescription('Replies with user info!');

    userCommand.execute = async interaction => {
        interaction.reply(`Your tag: ${interaction.user.tag}`);
    };

    return userCommand;
};
