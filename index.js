require('dotenv').config()

/* #######################################################
#################### CONSOLE OVERRIDE ####################
####################################################### */

const instanceId = require("crypto").randomBytes(64).toString('hex')
const instanceIdShortend = instanceId.substring(0, 4)
console.log(`InstanceId:${instanceIdShortend} Full:${instanceId}`)

console.log = (() => {

    const time = new Date().toLocaleString("en-AT", { timeZone: "Europe/Vienna" })
    const orig = console.log
    return function() {
        let tmp
        try {
            tmp = process.stdout
            process.stdout = process.stderr
            arguments[0] = `[${instanceIdShortend}|${time}] ${arguments[0]}`
            orig.apply(console, arguments);
        } finally {
            process.stdout = tmp;
        }
    };
})();

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

function startCallback() {
    barbot.start()
}

server.start(() => {
    console.log("go!");
});

