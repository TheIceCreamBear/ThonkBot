import { ChannelType, VoiceState } from 'discord.js';
import { state, UserVcState, VcData } from '../bot.js';

export default class VoiceTrackingListener {
    init() {
        // TODO: this works right? this doesnt break any `this` references right?
        state.client.on('voiceStateUpdate', this.handleVcUpdate);
        state.client.once('ready', this.initializeState);
    }
    
    deconstruct() {
        state.client.removeListener('voiceStateUpdate', this.handleVcUpdate);
    }

    private updateUserVcState(user: UserVcState, newState: VoiceState) {
        user.userMuted = newState.selfMute;
        user.userDeafened = newState.selfDeaf;
        user.streaming = newState.streaming;
        user.cameraOn = newState.selfVideo;
        user.serverMuted = newState.serverMute;
        user.serverDeafened = newState.serverDeaf;
    }

    private addNewUserVcState(newState: VoiceState) {
        const user = new UserVcState();
        user.userId = newState.id;
        user.channelId = newState.channelId;

        this.updateUserVcState(user, newState);

        // AGAIN bruh, why cant they just name this normally?????
        state.userVcStates.set(user.userId, user);
    }

    private async handleVcUpdate(oldState: VoiceState, newState: VoiceState) {
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
                this.addNewUserVcState(newState);
    
                return;
            }
    
            this.updateUserVcState(user, newState);
    
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
            this.addNewUserVcState(newState);
        }
    }

    private async initializeState() {
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

        // leave this untyped, let the type be assumed
        let channels;
        try {
            channels = await guild.channels.fetch();
        } catch (e) {
            console.log('Some error happened with fetching the guild channels');
            console.log(e);
            return;
        }
    
        for (const [_, channel] of channels) {
            if (channel.type !== ChannelType.GuildVoice) {
                continue;
            }
            
            for (const [snowflake, member] of channel.members) {
                // check for an existing state (there shouldnt be one, but what ever)
                const existing = state.userVcStates.get(snowflake);
                if (existing) {
                    state.userVcStates.delete(snowflake);
                }

                this.addNewUserVcState(member.voice);
            }
        }
    }
}
