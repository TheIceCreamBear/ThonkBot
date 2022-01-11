import { MongoClient } from 'mongodb';

const STERM = 'BOTSAVESTATE';
let init = false;
const dbInfo = {};

async function initDb() {
    const client = new MongoClient(process.env.MONGO_DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    dbInfo.client = client;

    const db = client.db();
    dbInfo.db = db;

    const col = db.collection('state');
    dbInfo.col = col;

    init = true;

    console.log('Db Initialized');
}

function saveState(state) {
    if (!init) {
        throw new Error('Init me first bozo');
    }
    state.STERM = state?.STERM || STERM;
    dbInfo.col.findOneAndReplace({ STERM: state.STERM }, state, err => {
        dbInfo.col.insertOne(state, err => {
            console.error(err);
        });
    });
}

async function loadState() {
    if (!init) {
        throw new Error('Init me first bozo');
    }
    const state = await dbInfo.col.findOne({ STERM: STERM });
    console.log('Saved State:', state);
    return state;
}

export { initDb, saveState, loadState };
