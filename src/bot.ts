import { Client, GatewayIntentBits, Snowflake, VoiceChannel } from 'discord.js';
import { listenerInit } from './listeners/loader.js';
import { CommandDefinition, loadCommandDefinitions, registerCommandListener } from './commands/commands.js';
import { deployCommandsToGuild } from './commands/deploy.js';

export class BotState {
    clientId: string;
    focusedGuild: string;

    adminUsers: string[];
    adminRoles: string[];

    client: Client;

    readonly voiceChannels: Map<string, VcData> = new Map();
    readonly userVcStates: Map<Snowflake, UserVcState> = new Map();
    readonly commands: Map<string, CommandDefinition> = new Map();
}

export class VcData {
    chan: VoiceChannel;
    size: number;
}

export class UserVcState {
    userId: Snowflake;
    channelId: Snowflake;

    userMuted: boolean;
    userDeafened: boolean;
    streaming: boolean;
    cameraOn: boolean;

    serverMuted: boolean;
    serverDeafened: boolean;
}

const state = new BotState();

async function init() {
    state.clientId = process.env.DISCORD_CLIENT_ID;
    state.focusedGuild = process.env.DISCORD_GUILD_ID;

    // setup alpha users and alpha roles
    state.adminUsers = getAlphaUserArray();
    state.adminRoles = getAlphaRoleArray();

    state.client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers],
    });

    state.client.once('ready', () => {
        console.log('Ready!');
    });

    // make sure the commands are deployed to the guild we will be working in
    deployCommandsToGuild();

    // init commands
    loadCommandDefinitions();
    registerCommandListener();
    // init listeners
    listenerInit();

    await state.client.login();
}

function getAlphaUserArray() {
    let userString = process.env.DISCORD_ALPHA_USER || '';
    let users = [];
    let splits = userString.split(',');
    for (let i in splits) {
        let split = splits[i];
        users.push(split);
    }
    return users;
}

function getAlphaRoleArray() {
    let roleString = process.env.DISCORD_ALPHA_ROLE || '';
    let roles = [];
    let splits = roleString.split(',');
    for (let i in splits) {
        let split = splits[i];
        roles.push(split);
    }
    return roles;
}

export { state, init };
