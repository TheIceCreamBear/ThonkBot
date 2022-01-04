// the new main file for the bot
require('dotenv').config();
const { client } = require('./stateful/dbhandler');

const { state, init, save } = require('./bot');

// main function to run the bot
async function run() {
    await client.connect();
    while (true) {
        const interval = setInterval(() => {
            save();
        }, 1000 * 60 * 5);
        try {
            console.log('Initializing bot');
            await init();
            // TODO more stuff here
            console.log('Initialization completed');
            
            while (true) {
                const waiting = new Promise((resolve) => setTimeout(resolve, 1_000_000_000));
                await waiting;
            }
        } catch (e) {
            console.log(e);
        }
        clearInterval(interval);
    }
}

run();