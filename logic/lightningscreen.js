const fs = require('fs');
const dir = './static/img/lightning';

class LightningScreen {
    constructor(app, gather, db, objId) {
        const self = this;

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        this.app = app;
        this.gather = gather;
        this.db = db;
        this.objId = objId;
        this.lastInteractionIds = [];

        // Init DB
        if (db.get("lightning").value() === undefined) {
            db.get("lightning").set({}).save();
        }

        this.app.get('/pages/lightning', (req, res) => {
            let footerText = "Who are you?";

            res.render("lightning", { title: 'Lightning Wallet',
                footerText: footerText,
                objId: objId
            });
        });

        this.app.get('/api/lightning', (req, res) => {
            let data = [];

            const wallets = db.get("lightning").value();
            Object.keys(wallets).forEach((playerId) => {
              const p = self.gather.getPlayer(playerId);
              console.log(p);

               data.push({
                   playerId: playerId,
                   player: (p === undefined ? "not online" : p.name),
                   wallet: wallets[playerId]
               });
            });

            res.json(data).end();
        });

        this.app.post('/api/lightning', (req, res) => {
            console.log(req.body);
            const playerId = req.body.playerId;

            const QR = require('qr-image');

            const image = QR.image(req.body.wallet, { type: 'png' });
            const filepath = dir + '/' + playerId + ".png";
            image.pipe(require('fs').createWriteStream(filepath));

            const webpath = filepath.substr(1);
            self.db.get("lightning").get(playerId).set(webpath).save();

            res.json({ status: "success", message: "Wallet saved!"}).end();
        });


        this.app.get('/api/lightning/getplayer', (req, res) => {
            if (self.lastInteractionIds.length <= 0) {
                res.json({ status: "noplayer" }).end();
                return;
            }

            const playerId = self.lastInteractionIds.shift();
            console.log(playerId);
            console.log(self.gather.getPlayer(playerId));

            res.json({
                status: "ok",
                playerId: playerId,
                playerName: self.gather.getPlayer(playerId).name
            }).end();
        });

        this.gather.subscribeToPlayerInteracts(objId, (playerId, player) => {
            self.lastInteractionIds.push(playerId);
        });
    }
}


module.exports = LightningScreen;
