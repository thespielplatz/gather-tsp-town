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
const Alarms = require('./logic/modules/alarms')
const cron = require("node-cron");
const gather = new Gather(db, app, startCallback);


app.get('/ping', (req, res) => {
    res.json("pong").end();
});

const ls = new LightningScreen(app, gather, db,"KWM4F5HtsYYx8-UDKw2Et_60c1358a-0f17-4d0a-9aba-228808aca38e");
const barbot = new Bot(gather, db)
const alarm = new Alarms(app, gather, db, 't7E-faVNb4g77fhMzUWgm_2a32a6a6-5a74-429b-8ef2-fa2e177d36f5')
alarm.setBot(barbot)

// Times https://crontab.guru/
alarm.addAlarm({
    name: 'Mo Allgemeine Koordination',
    cron: '55 09 * * 1',
    chat: 'ℹ️ Allg. Koordination starts in 5 min'
})
alarm.addAlarm({
    name: 'Tu-Th Daily',
    cron: '40 11 * * 2-4',
    chat: 'ℹ️ Daily starts in 5 min'
})
alarm.addAlarm({
    name: 'Fr Review',
    cron: '55 09 * * 5',
    chat: 'ℹ️ Sprint Review starts in 5 min'
})
alarm.addAlarm({
    name: 'Fr 16:00 Freetime',
    cron: '00 16 * * 5',
    chat: '🎉 FEIERABEND 🎉\nFree satoshis for everyone!'
})

function startCallback() {
    barbot.start()
    // gather.showInteractionEvents()
}

server.start(() => {
    console.log("go!");
});

