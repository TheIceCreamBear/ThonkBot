const fs = require('fs');
const path = require('path');

console.log('Initializing listeners');

const listenerFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && !file.includes('loader.js') && !file.includes('handler.js') && !file.includes('init.js'));

for (const file of listenerFiles) {
    require(path.join(__dirname, file));
}

console.log('Listener creation successful.');
