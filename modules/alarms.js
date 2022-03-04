const cron = require("node-cron");
const crypto = require('crypto');
const db = require('../controller/db')
const express = require("express");

class Alarms {
    constructor(gather, alarmId) {
        const self = this

        this.alarmId = alarmId

        this.gather = gather
        this.alarms = []

        this.bot = undefined

        // Init DB
        if (db.get("alarms").value() === undefined) {
            db.get("alarms").set({}).save();
        }
        if (db.get("alarms").get(alarmId).value() === undefined) {
            db.get("alarms").get(alarmId).set({}).save();
        }

        this.registered = db.get("alarms").get(alarmId)

        const router = express.Router()
        this.router = router

        router.get(`/${alarmId}`, (req, res) => {
            res.render("alarms", {
                title: 'Alarms',
                objId: alarmId,
            });
        });

        router.get(`/${alarmId}/api`, gather.auth.apiAuth.bind(gather.auth), (req, res) => {
            const playerId = res.locals.playerId

            const data = self.alarms.map(alarm => {
                let value = {...alarm}
                value.on = self.registered.get(alarm.key).get(playerId).value() == true
                return value
            })
            res.json(data).end();
        });

        router.post(`/${alarmId}/api`, gather.auth.apiAuth.bind(gather.auth), (req, res) => {
            const playerId = res.locals.playerId

            self.registered.get(req.body.key).get(playerId).set(req.body.on == "true")
            db.save()
            res.json({status: "ok"}).end();
        });
    }

    setBot(theBot) {
        this.bot = theBot
    }

    import(file) {
        const rootFile = '../' + file
        console.log('Loading Alarms from ', file)
        const alarms = require(rootFile);
        alarms.forEach((alarm) => { this.addAlarm(alarm)})
        console.log(`Loaded ${alarms.length}x Alarms from `, file)
    }

    addAlarm(alarm) {
        // Times https://crontab.guru/
        const self = this

        alarm.key = crypto.createHash('md5').update(alarm.name).digest('hex')
        this.alarms.push(alarm)

        // Create DB Entry
        if (!self.registered.get(alarm.key).value()) {
            self.registered.get(alarm.key).set({})
        }

        cron.schedule(alarm.cron, () => {
            console.log(`Sending: ${alarm.name}`)
            if (self.bot) self.bot.say("GLOBAL_CHAT", alarm.chat)

            const players = db.get("alarms").get(self.alarmId).get(alarm.key).value()
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
