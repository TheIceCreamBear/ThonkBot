// the new main file for the bot
import { config } from 'dotenv';
import { init } from './bot.js';
import { deconstructAllListeners } from './listeners/listeners.js';

config();

// main function to run the bot
async function run() {
    while (true) {
        try {
            console.log('Initializing bot');
            await init();
            // TODO more stuff here
            console.log('Initialization completed');

            while (true) {
                const waiting = new Promise(resolve => setTimeout(resolve, 1_000_000_000));
                await waiting;
            }
        } catch (e) {
            // have to do this somewhere
            deconstructAllListeners();
            console.log(e);
        }
    }
}

run();
