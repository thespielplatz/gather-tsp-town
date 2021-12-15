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
        this.lastInteractionId = undefined;

        // Init DB
        if (db.get("lightning").value() === undefined) {
            db.get("lightning").set({}).save();
        }

        this.app.get('/pages/lightning', (req, res) => {
            let footerText = "Who are you?";
            if (self.lastInteractionId !== undefined) {
                footerText = `Hi ${self.gather.getPlayer(self.lastInteractionId).name}!`;
            }

            res.render("lightning", { title: 'Lightning Wallet',
                footerText: footerText,
                objId: objId,
                playerId: self.lastInteractionId
            });

            self.lastInteractionId = undefined;
        });

        this.app.get('/api/lightning', (req, res) => {
            let data = [];

            const wallets = db.get("lightning").value();
            Object.keys(wallets).forEach((playerId) => {
               data.push({
                   playerId: playerId,
                   player: self.gather.getPlayer(playerId).name,
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

        this.gather.subscribeToPlayerInteracts(objId, (playerId, player) => {
            this.lastInteractionId = playerId;
        });
    }
}


module.exports = LightningScreen;
