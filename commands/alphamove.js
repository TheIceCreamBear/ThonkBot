const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);

async function execute(interaction) {
    if (process.env.NEVER_SET_THIS == false || process.env.NEVER_SET_THIS == undefined) {
        return;
    }
    if (interaction.member.id != process.env.DISCORD_ALPHA_USER) {
        interaction.reply('You may not run that command bruv.');
        return;
    }
    const mentionable = interaction.options.getMentionable('sigma');
    mentionable.voice.disconnect();
    await interaction.reply('Anything for you.');
    await wait(2000);
    await interaction.deleteReply();
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('alphamove')
		.setDescription('You probably cannot run this command.')
        .addMentionableOption(option => option.setName('sigma').setDescription('The poor dude')),
	execute,
};
