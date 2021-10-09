// the new main file for the bot
require('dotenv').config();

const {state, init} = require('./bot');

// main function to run the bot
async function run() {
    while (true) {
        try {
            await init();
            // TODO more stuff here and also have a time out here so it doesnt instantly try to init again
        } catch (e) {
            console.log(e);
        }
    }
}

run();