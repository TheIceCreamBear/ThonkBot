import { ChannelType } from 'discord.js';
import { state } from '../bot.js';

state.voiceChannels = {};

state.client.on('voiceStateUpdate', async (oldState, newState) => {
    // console.log(JSON.stringify(oldState), JSON.stringify(newState));
    console.log(newState);
    if (oldState.guild.id != newState.guild.id) {
        console.log('Old state guild doesnt match new state guild');
        return;
    }
    if (oldState.guild.id != state.focusedGuild) {
        console.log('Guild %s is not the focused guild.', oldState.guild.id);
        return;
    }
    if (oldState.channelId == newState.channelId) {
        console.log('channels are the same, nothing to track');
        return;
    }
    if (oldState.channelId) {
        console.log('Voice channel leave for user %s in channel %s', oldState.id, oldState.channelId);
        if (!state.voiceChannels[oldState.channelId].size) {
            state.voiceChannels[oldState.channelId].size = 0;
        }
        state.voiceChannels[oldState.channelId].size -= 1;

        if (state.voiceChannels[oldState.channelId].size == 1 && state.annoyState.channel?.id == oldState.channelId) {
            console.log('Disconnecting and idleing, we are the only ones left in the channel');
            state.annoyState.idle();
        }
    }
    if (newState.channelId) {
        console.log('Voice channel join for user %s in channel %s', newState.id, newState.channelId);
        if (!state.voiceChannels[newState.channelId].size) {
            state.voiceChannels[newState.channelId].size = 0;
        }
        state.voiceChannels[newState.channelId].size += 1;

        if (state.annoyState.isIdle) {
            clearTimeout(state.annoyState.handle);
            // funny enough, this idle call will actually not idle us, it should pick up that we should stop idlining
            state.annoyState.idle();
        }
    }
});

state.client.once('ready', async () => {
    let guild;
    try {
        guild = await state.client.guilds.fetch(state.focusedGuild);
    } catch (e) {
        console.log('Some error happened with fetching the guild');
        console.log(e);
        return;
    }
    // https://discord.com/channels/81384788765712384/381889950666457088/896320105854672916
    guild.shardId = 0;
    // the above is a hack and should not be used if sharding
    try {
        let members = await guild.members.fetch({ cache: false });
    } catch (e) {
        console.log('Some error happened with fetching the guild members');
        console.log(e);
    }
    let channels;
    try {
        channels = await guild.channels.fetch();
    } catch (e) {
        console.log('Some error happened with fetching the guild channels');
        console.log(e);
        return;
    }

    for (const [snowflake, channel] of channels) {
        if (!channel.type == ChannelType.GuildVoice) {
            continue;
        }
        state.voiceChannels[snowflake] = {};
        state.voiceChannels[snowflake].chan = channel;
        state.voiceChannels[snowflake].size = channel.members.size;
    }
});
