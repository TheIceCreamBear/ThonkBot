import { SlashCommandBuilder } from '@discordjs/builders';
import { state } from '../bot.js';

async function execute(interaction) {
    if (interaction.guild.id != process.env.DISCORD_GUILD_ID) {
        interaction.reply('Invalid guild for this command.');
        return;
    }
    let allowed = false;
    if (state.alphaUsers.includes(interaction.member.id)) {
        allowed = true;
    }
    for (let i in state.alphaRoles) {
        let role = state.alphaRoles[i];
        if (interaction.member.roles.cache.get(role)) {
            allowed = true;
            break;
        }
    }
    if (!allowed) {
        interaction.reply('You may not run this command.');
        return;
    }

    const destination = interaction.options.getChannel('destination', true);
    if (!destination.isVoice()) {
        interaction.reply('Destination channel must be a voice channel.', { emphermal: true });
        return;
    }

    const usersToMove = [];

    const only = interaction.options.getChannel('only');
    if (only) {
        if (!only.isVoice()) {
            interaction.reply('Only channel must be a voice channel.', { emphermal: true });
            return;
        }

        only.members.each((member) => {
            usersToMove.push(member);
        });
        await interaction.reply(`Moving all users in ${only.name} to ${destination.name}`);
    } else {
        for (const [key, value] of Object.entries(state.voiceChannels)) {
            if (value.chan.snowflake == value.chan.guild.afkChannelId) {
                continue;
            }

            if (value.chan.snowflake == destination.id) {
                continue;
            }

            value.chan.members.each((member) => {
                usersToMove.push(member);
            });
        }
        await interaction.reply(`Moving all users to ${destination.name}`);
    }

    for (const user of usersToMove) {
        user.voice.setChannel(destination);
    }
}

export default {
    data: new SlashCommandBuilder()
        .setName('moveall')
        .setDescription('Moves all users to one voice channel.')
        .addChannelOption(option =>
            option.setName('destination').setDescription('Destination channel for selected users').setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('only')
                .setDescription(
                    'Can be used to limit the users which are moved to only the users in the specified channel'
                )
        ),
    execute,
};
