const { SlashCommandBuilder } = require('@discordjs/builders');
const { state } = require('../bot');
const fs = require('fs');
const path = require('path');
const {
	AudioPlayerStatus,
	entersState,
	joinVoiceChannel,
	VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    StreamType,
    VoiceConnectionDisconnectReason,
} = require('@discordjs/voice');

const { baseurl, files, params } = require('../audio/audio.json');
const wait = require('util').promisify(setTimeout);

const minTime = parseInt(process.env.MIN_TIME || '150');
const minAllowedMax = parseInt(process.env.MIN_ALLOWED_MAX || '300');

let annoyState = {idle: idle};
state.annoyState = annoyState;

function idle() {
    console.log('Starting idle.');

    annoyState.isIdle = true;
    annoyState.handle = undefined;
    annoyState.channel = undefined;
    annoyState.audioPlayer?.stop();
    annoyState.audioPlayer = undefined;
    annoyState.connection?.destroy();
    annoyState.connection = undefined;

    let largest;
    let largestSize = 0;
    for (const snowflake in state.voiceChannels) {
        if (state.voiceChannels[snowflake].size > largestSize) {
            largest = snowflake;
            largestSize = state.voiceChannels[snowflake].size;
        }
    }

    if (largestSize != 0) {
        queueNextAnnoyTast(1000);
        annoyState.isIdle = false;
        return;
    }

    annoyState.handle = setTimeout(idle, 600_000);
}

async function annoy() {
    annoyState.handle = undefined;

    let largest;
    let largestSize = 0;
    for (const snowflake in state.voiceChannels) {
        if (state.voiceChannels[snowflake].size > largestSize) {
            largest = snowflake;
            largestSize = state.voiceChannels[snowflake].size;
        }
    }

    if (largestSize == 0) {
        idle();
        return;
    }

    console.log('Annoy time');

    annoyState.isIdle = false;

    let channel = state.voiceChannels[largest].chan;

    joinChannelOrNothing(channel);

    try {
        await entersState(annoyState.connection, VoiceConnectionStatus.Ready, 20e3);
    } catch (e) {
        console.warn(e);
        annoyState.notifChannel.send(`Failed to join the voice channel ${channel.id} in 20s. <@${annoyState.notifUser.id}>`).catch(console.warn);
        return;
    }

    const file = files[getRandomInt(files.length, 0)];

    const resource = createAudioResource(baseurl + file + params, {
        inputType: StreamType.Arbitrary
    });

    annoyState.audioPlayer.play(resource);
}

function joinChannelOrNothing(channel) {
    if (annoyState.channel === channel) {
        console.log(`Already conencted to ${channel.name}`);
        return;
    }

    annoyState.channel = channel;

    annoyState.connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: annoyState.guild.id,
        adapterCreator: annoyState.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
    });
    annoyState.connection.on('error', console.warn);
    annoyState.connection.on('error', () => {annoyState.connection = undefined; annoyState.channel = undefined});
    // borrowed from https://github.com/discordjs/voice/blob/main/examples/music-bot/src/music/subscription.ts#L32
    annoyState.connection.on('stateChange', async (_, newState) => {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
            if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                try {
                    await entersState(annoyState.connection, VoiceConnectionStatus.Connecting, 5_000);
                } catch {
                    annoyState.connection.destroy();
                }
            } else if (annoyState.connection.rejoinAttempts < 5) {
                await wait((annoyState.connection.rejoinAttempts + 1) * 5_000);
                annoyState.connection.rejoin();
            } else {
                annoyState.connection.destroy();
            }
        } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        } else if (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling) {
            try {
                await entersState(annoyState.connection, VoiceConnectionStatus.Ready, 20_000);
            } catch {
                if (annoyState.connection.state.status !== VoiceConnectionStatus.Destroyed) annoyState.connection.destroy();
            }
        }
    });
    
    annoyState.audioPlayer = createAudioPlayer();
    annoyState.audioPlayer.on('stateChange', (oldState, newState) => {
        if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
            // just finished playing something, do some sort of interesting logic here about queing the next annoy call
            queueNextAnnoyTast();
            return;
        }
        if (newState.status === AudioPlayerStatus.Playing) {
            // TODO possible use of metadata to do on start and on stop logic?
        }
    });
    annoyState.audioPlayer.on('error', console.warn);

    annoyState.connection.subscribe(annoyState.audioPlayer);
}

async function execute(interaction) {
    let allowed = false;
    if (state.alphaUsers.includes(interaction.member.id)) {
        allowed = true;
    }
    let hasAlphaRole = false;
    for (let i in state.alphaRoles) {
        let role = state.alphaRoles[i];
        if (interaction.member.roles.cache.get(role)) {
            hasAlphaRole = true;
            break;
        }
    }
    if (hasAlphaRole) {
        allowed = true;
    }
    if (!allowed) {
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
            annoyState = {idle: idle};
            state.annoyState = annoyState;
            return;
        }
        
        clearTimeout(annoyState.handle);

        annoyState = {idle: idle};
        state.annoyState = annoyState;

        interaction.reply('Stopping annoy job.');
        return;
    }

    if (annoyState.handle) {
        interaction.reply('There is already an annoy process running bozo.');
        return;
    }

    if (maxTime < minAllowedMax) {
        interaction.reply(`The max timeout ${maxTime} is too low (and too annoying).\nMax timeout must be greater or equal to ${minAllowedMax}.`);
        return;
    }

    const maxAnnoy = interaction.options.getInteger('maxannoyances');
    if (maxAnnoy && maxAnnoy >= 1) {
        annoyState.maxAnnoy = maxAnnoy;
    } else {
        annoyState.maxAnnoy = -1;
    }

    if (annoyState.isIdle) {
        annoyState.isIdle = false;
        clearTimeout(annoyState.handle);
    }

    await interaction.reply(`Annoyance timeout set to be some time between ${minTime}s and ${maxTime}s`);

    annoyState.max = maxTime;

    annoyState.guild = interaction.guild;

    annoyState.notifChannel = interaction.channel;
    annoyState.notifUser = interaction.member;

    queueNextAnnoyTast(100);
}

function queueNextAnnoyTast(miliTilNext) {
    if (annoyState.maxAnnoy == 0) {
        console.log('No more annoy states left, stopping.');
        annoyState.channel = undefined;
        annoyState.audioPlayer?.stop();
        annoyState.audioPlayer = undefined;
        annoyState.connection?.destroy();
        annoyState.connection = undefined;
        return;
    }

    if (annoyState.maxAnnoy > 0) {
        annoyState.maxAnnoy--;
    }

    let timeTillNext = getRandomInt(annoyState.max + 1, minTime) * 1000;
    console.log(timeTillNext);

    if (miliTilNext) {
        timeTillNext = miliTilNext;
    }

    console.log(`Queued annoy task to occur in ${timeTillNext} ms`);

    annoyState.handle = setTimeout(annoy, timeTillNext);
}

function getRandomInt(max, min) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('annoy')
        .setDescription('You probably cannot run this command.')
        .addIntegerOption(option => option.setName('maxtime').setDescription(`The max time between triggers in s. Min time is ${minTime} seconds. Use with 0 to disable.`))
        .addIntegerOption(option => option.setName('maxannoyances').setDescription('The max number of annoyances until the command needs to be called again.')),
    execute,
};
