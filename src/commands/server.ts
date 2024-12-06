import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandDefinition } from './commands.js';

export default () => {
    const serverCommand = new CommandDefinition();
    serverCommand.command = new SlashCommandBuilder()
        .setName('server')
        .setDescription('Replies with server info!');
    
    serverCommand.execute = async (interaction) => {
        interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    }
    
    return serverCommand;
}
