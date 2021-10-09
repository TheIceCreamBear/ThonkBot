const { SlashCommandBuilder } = require('@discordjs/builders');
const { state } = require('../bot');
const fs = require('fs');
const audioFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.wav'));
const wait = require('util').promisify(setTimeout);

let annoyState = {};

function annoy() {
    let largest;
    let largestSize = 0;
    for (const [snowflake, chanProp] of state.voiceChannels.entries()) {
        if (chanProp.size > largestSize) {
            largest = snowflake;
            largestSize = chanProp.size;
        }
    }

    let channel = state.voiceChannels[largest];

    // TODO join that channel and run the audio
}

async function execute(interaction) {
    if (interaction.member.id != process.env.DISCORD_ALPHA_USER) {
        interaction.reply('You may not run that command bruv.');
        return;
    }
    if (interaction.guild.id != process.env.DISCORD_GUILD_ID) {
        interaction.reply('Invalid guild for this command.');
        return;
    }
    const maxTime = interaction.options.getInteger('maxtime');
    if (maxTime == 0) {
        if (!annoyState.handle) {
            interaction.reply('No annoy job running to cancel.');
            annoyState = {};
            return;
        }
        
        clearTimeout(annoystate.handle);

        annoyState = {};
        return;
    }

    if (maxTime <= 600) {
        interaction.reply(`The max timeout ${maxTime} is too low (and too annoying).`);
        return;
    }

    await interaction.reply(`Annoyance timeout set to be some time between 150s and ${maxTime}`);

    annoyState.max = maxTime;

    let timeTillNext = getRandomInt(maxTime + 1, 150) * 1000;
    console.log(timeTillNext);

    annoyState.handle = setTimeout(annoy, timeTillNext);

    annoyState.guild = interaction.guild;
}

function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alphamove')
        .setDescription('You probably cannot run this command.')
        .addIntegerOption(option => option.setName('maxtime').setDescription('The max time between triggers in s. Min time is 150 seconds. Use with 0 to disable.')),
    execute,
};
