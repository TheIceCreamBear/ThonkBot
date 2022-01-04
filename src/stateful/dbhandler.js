const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
const db = client.db();
const stateC = db.collection('state');
const STERM = 'BOTSAVESTATE';

function saveState(state) {
    state.STERM = state.STERM || STERM;
    stateC.findOneAndReplace({ STERM: state.STERM }, state, err => {
        stateC.insertOne(state, err => {
            console.error(err);
        });
    });
}

async function loadState() {
    const state = await stateC.findOne({ STERM: STERM });
    console.log('state', state);
    return state;
}

module.exports = {
    client,
    saveState,
    loadState
}
