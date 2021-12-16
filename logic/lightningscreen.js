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
                   wallet: w.webpath
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
            self.db.get("lightning").get(playerId).set({
              name: self.gather.getPlayer(playerId).name,
              timestamp: Date.now(),
              webpath: webpath
            }).save();

            res.json({ status: "success", message: "Wallet saved!"}).end();
        });

        let deleteTimeoutId = undefined;
        let deleteTime = 0;
        let deleteTimeoutCheck = () => {
            console.log("deleteTimeoutCheck - Tick");
            if (self.lastInteractionIds.length <= 0) {
              console.log("deleteTimeoutCheck - Stopped no Ids");
              clearTimeout(deleteTimeoutId);
              deleteTimeoutId = undefined;
              return;
            }
            if (Date.now() < deleteTime) return;
            console.log("deleteTimeoutCheck - Stopped > 2sec");

            self.lastInteractionIds.splice(0, self.lastInteractionIds.length);
            clearTimeout(deleteTimeoutId);
            deleteTimeoutId = undefined;
            return;
        }

        this.app.get('/api/lightning/getplayer', (req, res) => {
            if (self.lastInteractionIds.length <= 0) {
                res.json({ status: "noplayer" }).end();
                return;
            }

            const playerId = self.lastInteractionIds.shift();

            res.json({
                status: "ok",
                playerId: playerId,
                playerName: self.gather.getPlayer(playerId).name
            }).end();
        });

        this.gather.subscribeToPlayerInteracts(objId, (playerId, player) => {
            self.lastInteractionIds.push(playerId);
            deleteTime = Date.now() + 1000 * 2;
            if (deleteTimeoutId === undefined) {
              deleteTimeoutId = setInterval(deleteTimeoutCheck, 1000);
            }
        });
    }
}


module.exports = LightningScreen;
