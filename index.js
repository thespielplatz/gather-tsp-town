const NAME = require('./package.json').name;

require('dotenv').config()
const Log = require('./logic/log.js')
Log.init(NAME)

const server = require('./logic/server');
const app = server.app;
const db = require('./logic/db.js');
const Gather = require('./logic/gather/gather');

const LightningScreen = require('./logic/modules/lightningscreen')
const Bot = require('./logic/modules/bot')
const gather = new Gather(db, app, startCallback);


app.get('/ping', (req, res) => {
    res.json("pong").end();
});

const ls = new LightningScreen(app, gather, db,"KWM4F5HtsYYx8-UDKw2Et_60c1358a-0f17-4d0a-9aba-228808aca38e");
const barbot = new Bot(gather, db)

// Alarm Screen: t7E-faVNb4g77fhMzUWgm_2a32a6a6-5a74-429b-8ef2-fa2e177d36f5

function startCallback() {
    barbot.start()
    // gather.showInteractionEvents()
}

server.start(() => {
    console.log("go!");
});

