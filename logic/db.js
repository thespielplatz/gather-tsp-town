const StormDB = require("stormdb");

// start db with "./db.stormdb" storage location
// INFO: Relative Path starts with root here?
const engine = new StormDB.localFileEngine("./db.stormdb");
const db = new StormDB(engine);

// set default db value if db is empty
db.default({ users: {} });

// save changes to db
db.save();

module.exports = db;
