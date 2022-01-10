import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('isgbasign')
        .setDescription('Simply states that gb is a sign.'),
    async execute(interaction) {
        await interaction.reply('Bro of course, what else would he be.');
    },
};
