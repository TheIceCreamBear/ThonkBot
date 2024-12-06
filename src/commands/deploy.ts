import { APIApplicationCommand, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, RouteLike, Routes } from 'discord.js';
import { getAllCommandDefinitions } from './commands.js';

export async function deployCommandsToGuild() {
    const defs = getAllCommandDefinitions();
    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    for (const def of defs) {
        commands.push(def.command.toJSON());
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Starting refersh of application (/) commands.');

        if (process.env.DELETE_OLD) {
            console.log('Deleting old commands.');

            const existing = await rest.get(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID)) as APIApplicationCommand[];
            for (const cmd of existing) {
                // because discord.js used some fucked up types in their API, do this.
                const deleteUrl = `${Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID)}/${cmd.id}` as RouteLike;

                await rest.delete(deleteUrl);
            }
        }

        console.log('Setting up new commands.');
        await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: commands })
        console.log('Successfully reloaded application (/) commands.');
    } catch (e) {
        console.log(e);
    }
}
