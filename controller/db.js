const StormDB = require("stormdb");

// start db with "./db.stormdb" storage location
// INFO: Relative Path starts with root here?

const STORMDB_FILE = `${process.env.DATA_PATH || './'}db.stormdb`

console.log(`Opening StormDB File at ${STORMDB_FILE}`)
const engine = new StormDB.localFileEngine(STORMDB_FILE);
const db = new StormDB(engine);

// set default db value if db is empty
db.default({ users: {} });

// save changes to db
db.save();

module.exports = db;
