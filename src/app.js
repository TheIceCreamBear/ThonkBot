// the new main file for the bot
require('dotenv').config();

const {state, init} = require('./bot');

// main function to run the bot
async function run() {
    while (true) {
        try {
            console.log('Initializing bot');
            await init();
            // TODO more stuff here and also have a time out here so it doesnt instantly try to init again
            console.log('Initialization completed');
            
            while (true) {
                const waiting = new Promise((resolve) => setTimeout(resolve, 1_000_000_000));
                await waiting;
            }
        } catch (e) {
            console.log(e);
        }
    }
}

run();