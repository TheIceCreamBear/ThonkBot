import { ChannelType, VoiceState } from 'discord.js';
import { state, UserVcState, VcData } from '../bot.js';

state.client.on('voiceStateUpdate', async (oldState, newState) => {
    // TODO: this is old, remove this soon
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

        const data = state.voiceChannels.get(oldState.channelId);
        if (data) {
            data.size -= 1;
            if (data.size < 0) {
                data.size = 0;
            }
        }
    }
    if (newState.channelId) {
        console.log('Voice channel join for user %s in channel %s', newState.id, newState.channelId);
        const data = state.voiceChannels.get(oldState.channelId);
        if (data) {
            data.size += 1;
        }
    }
});

// TODO: move to a class
function updateUserVcState(user: UserVcState, newState: VoiceState) {
    user.userMuted = newState.selfMute;
    user.userDeafened = newState.selfDeaf;
    user.streaming = newState.streaming;
    user.cameraOn = newState.selfVideo;
    user.serverMuted = newState.serverMute;
    user.serverDeafened = newState.serverDeaf;
}

function addNewUserVcState(newState: VoiceState) {
    const user = new UserVcState();
    user.userId = newState.id;
    user.channelId = newState.channelId;

    updateUserVcState(user, newState);

    // AGAIN bruh, why cant they just name this normally?????
    state.userVcStates.set(user.userId, user);
}

state.client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.guild.id != state.focusedGuild) {
        console.log('Guild %s is not the focused guild.', oldState.guild.id);
        return;
    }

    const userSnowflake = newState.id;

    // if in the same channel, just update the state, dont worry about anything else
    if (oldState.channelId == newState.channelId) {
        const user = state.userVcStates.get(userSnowflake);
        if (!user) {
            console.log('We were not tracking state for %s correctly, data may be lost...', userSnowflake);
            addNewUserVcState(newState);

            return;
        }

        updateUserVcState(user, newState);

        return;
    }

    // they were in a channel previously, but it doesnt match our new channel (possibly none, meaning leave)
    if (oldState.channelId) {
        // treat this as a disconnect
        const user = state.userVcStates.get(userSnowflake);
        if (!user) {
            console.log('Got disconnect for %s, but we dont think they were in vc, data may be lost...', userSnowflake);
        } else {
            // why cant the JS standard just use normal names for shit??? why they gotta name this 'delete' instead of remove.....
            state.userVcStates.delete(userSnowflake);
        }
    }

    // they are now in a channel, and it doesnt match an existing channel (possibly none, meaning join)
    if (newState.channelId) {
        // treat this as a connect
        addNewUserVcState(newState);
    }
});

// Goal of this: initialize the state as we wake up
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
        let members = await guild.members.fetch({ cache: false, user: undefined });
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
        if (channel.type !== ChannelType.GuildVoice) {
            continue;
        }

        const vState = new VcData();
        vState.chan = channel;
        vState.size = channel.members.size;
        state.voiceChannels.set(snowflake, vState);
    }
});
