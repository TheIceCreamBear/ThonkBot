import { SlashCommandBuilder } from '@discordjs/builders';
import { state } from '../bot.js';

async function execute(interaction) {
}

export default {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Simply states that gb is a sign.'),
    execute,
};
