const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('isgbasign')
		.setDescription('Simply states that gb is a sign.'),
	async execute(interaction) {
		await interaction.reply('Bro of course, what else would he be.');
	},
};
