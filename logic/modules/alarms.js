const fs = require("fs");

class Alarms {
    constructor(app, gather, db, objId) {
        const self = this

        this.app = app
        this.gather = gather
        this.db = db

        this.bot = undefined

        // Init DB
        if (db.get("alarms").value() === undefined) {
            db.get("alarms").set({}).save();
        }

        console.log(`AlarmScreen at: /pages/alarms/${objId}`);

        this.app.get(`/pages/alarms/${objId}`, (req, res) => {
            res.render("alarms", { title: 'Alarms',
                objId: objId
            });
        });
/*
        this.app.get('/api/lightning', gather.auth.apiAuth.bind(gather.auth), (req, res) => {
            let data = [];

            const wallets = db.get("lightning").value();
            Object.keys(wallets).forEach((playerId) => {
                const p = self.gather.getPlayer(playerId);
                const w = wallets[playerId];

                let name = w.name;
                // Player online
                if (p !== undefined) {
                    name = p.name;

                    // Save Online name to DB
                    db.get("lightning").get(playerId).get("name").set(p.name).save();
                }

                data.push({
                    playerId: playerId,
                    player: name,
                    outfitString: ("outfitString" in p ? p.outfitString : false),
                    wallet: w.webpath
                });
            });

            res.json(data).end();
        });

        this.app.post('/api/lightning', gather.auth.apiAuth.bind(gather.auth), (req, res) => {
            console.log(req.body);
            const playerId = req.body.playerId;

            const QR = require('qr-image');

            const image = QR.image(req.body.wallet, { type: 'png' });
            const filepath = dir + '/' + playerId + ".png";
            image.pipe(require('fs').createWriteStream(filepath));

            const webpath = filepath.substr(1);
            self.db.get("lightning").get(playerId).set({
                name: self.gather.getPlayer(playerId).name,
                timestamp: Date.now(),
                webpath: webpath
            }).save();

            res.json({ status: "success", message: "Wallet saved!"}).end();
        });
    }
 */
}


module.exports = Alarms;
