require('dotenv').config()

const {version: VERSION, name: NAME} = require("./package.json");
const NODE_PORT = process.env.NODE_PORT || 2222;

const Log = require('./controller/log.js')
Log.init(NAME)

const Gather = require('./controller/gather/gather');
const Bot = require('./modules/bot')

const gather = new Gather(() => {
    bot.enter()
    // gather.showInteractionEvents()
})

const bot = new Bot(gather)

const app = require('./controller/app');

const defaultRouter = require('./controller/default')

app.use('/', defaultRouter)
app.use('/gather', gather.router)

app.listen(NODE_PORT,() => {
    console.log(`Starting on NODE_PORT: ${NODE_PORT}`)
})


/*

const LightningScreen = require('./controller/modules/lightningscreen')
const Alarms = require('./controller/modules/alarms')
const cron = require("node-cron");
const gather = new Gather(db, app, () => {
    barbot.start()
    // gather.showInteractionEvents()
});



const ls = new LightningScreen(app, gather, db,"KWM4F5HtsYYx8-UDKw2Et_60c1358a-0f17-4d0a-9aba-228808aca38e");
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



*/
