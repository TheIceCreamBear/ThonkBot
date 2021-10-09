const { state } = require('../bot');

state.voiceChannels = {};

state.client.on('voiceStateUpdate', async (oldState, newState) => {
    console.log(JSON.stringify(oldState), JSON.stringify(newState));
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
        if (!state.voiceChannels[oldState.channelId].members) {
            state.voiceChannels[oldState.channelId].members = 0;
        }
        state.voiceChannels[oldState.channelId].members -= 1;
    }
    if (newState.channelId) {
        console.log('Voice channel leave for user %s in channel %s', newState.id, newState.channelId);
        if (!state.voiceChannels[newState.channelId].members) {
            state.voiceChannels[newState.channelId].members = 0;
        }
        state.voiceChannels[newState.channelId].members += 1;
    }
});

// TODO fix the below bugs: channel size is always zero, guild members.fetch causes error
state.client.once('ready', async () => {
    let guild = await state.client.guilds.fetch(state.focusedGuild);
    if (!guild) {
        console.log('Could not get guild %s to init voice tracking. Errors will occur', state.focusedGuild);
        return;
    }
    // let members = await guild.members.fetch({ cache: false });
    let channels = await guild.channels.fetch();
    if (!channels) {
        console.log('Something weird happened while getting the channels.');
        return;
    }
    console.log(JSON.stringify(channels));

    for (const [snowflake, channel] of channels) {
        if (!channel.isVoice()) {
            continue;
        }
        // console.log(JSON.stringify(channel), JSON.stringify(channel.members));
        state.voiceChannels[snowflake] = {};
        state.voiceChannels[snowflake].chan = channel;
        state.voiceChannels[snowflake].size = channel.members.size;
        console.log(JSON.stringify(state.voiceChannels));
    }
});
