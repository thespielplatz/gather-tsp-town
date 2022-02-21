const cron = require("node-cron");
const crypto = require('crypto');

class Alarms {
    constructor(app, gather, db, objId) {
        const self = this

        this.app = app
        this.gather = gather
        this.db = db
        this.alarms = []

        this.bot = undefined

        // Init DB
        if (db.get("alarmsregistered").value() === undefined) {
            db.get("alarmsregistered").set({}).save();
        }

        console.log(`AlarmScreen at: /pages/alarms/${objId}`);

        app.get(`/pages/alarms/${objId}`, (req, res) => {
            res.render("alarms", {
                title: 'Alarms',
                objId: objId
            });
        });

        app.get('/api/alarms', gather.auth.apiAuth.bind(gather.auth), (req, res) => {
            const playerId = res.locals.playerId

            const data = self.alarms.map(alarm => {
                let value = {...alarm}
                value.on = db.get("alarmsregistered").get(alarm.key).get(playerId).value() == true
                return value
            })
            res.json(data).end();
        });

        app.post('/api/alarms', gather.auth.apiAuth.bind(gather.auth), (req, res) => {
            const playerId = res.locals.playerId

            db.get("alarmsregistered").get(req.body.key).get(playerId).set(req.body.on == "true")
            db.save()
            res.json({status: "ok"}).end();
        });
    }

    setBot(theBot) {
        this.bot = theBot
    }

    addAlarm(alarm) {
        const self = this

        alarm.key = crypto.createHash('md5').update(alarm.name).digest('hex')
        this.alarms.push(alarm)

        if (!this.db.get("alarmsregistered").get(alarm.key).value()) {
            this.db.get("alarmsregistered").get(alarm.key).set({})
        }

        cron.schedule(alarm.cron, () => {
            console.log(`Sending: ${alarm.name}`)
            if (self.bot) self.bot.say("GLOBAL_CHAT", alarm.chat)

            const players = self.db.get("alarmsregistered").get(alarm.key).value()
            Object.keys(players).forEach(playerId => {
                if (players[playerId] == true) {
                    self.bot.say(playerId, alarm.chat)
                    self.gather.game.playSound("https://tools.thespielplatz.com/staticassets/sounds/alarm_beep.mp3",
                        1.0,
                        playerId)
                }
            })
        },{ scheduled: true, timezone: "Europe/Vienna" });
    }
}


module.exports = Alarms
