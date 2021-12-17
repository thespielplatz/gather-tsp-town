const fs = require('fs');
const dir = './static/img/lightning';

class LightningScreen {
    constructor(app, gather, db, auth, objId) {
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

        // Init Auth
        auth.registerObject(objId);

        console.log(`LightningScreen at: /pages/lightning/${objId}`)
        this.app.get(`/pages/lightning/${objId}`, (req, res) => {

            res.render("lightning", { title: 'Lightning Wallet',
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
    }
}


module.exports = LightningScreen;
