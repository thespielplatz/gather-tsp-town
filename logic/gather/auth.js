const jwt = require('jsonwebtoken');
const userIdentCookie = "tspUserIdentification";

class Auth {
    constructor(app, gather, db) {
        const self = this;
        this.gather = gather;

        // Init DB
        if (db.get("auth").value() === undefined) {
            db.get("auth").set({

            }).save();
        }

        app.get('/auth/isidentified/', self.checkAuth.bind(self), (req, res) => {
            if (res.locals.playerId) {
                const p = gather.getPlayer(res.locals.playerId);

                res.json({ status: "ok",
                    player: {
                        id: res.locals.playerId,
                        name: p.name,
                        outfitString: ("outfitString" in p ? p.outfitString : undefined),
                        avatarUrl: ("avatarUrl" in p ? p.avatarUrl : false)
                    }
                }).end();
            } else {
                res.json({ status: "unkown" }).end();
            }
        });

        app.get('/auth/auth/', (req, res) => {
            if ('gatherPlayerId' in req.query) {
                self.setAuth(req, res, req.query.gatherPlayerId);
                res.render("gather/auth/result", { title: 'Authenticated', color: "#138600"});
            } else {
                res.render("gather/auth/result", { title: 'Auth Error', color: "#f87416"});
            }
        });

        app.get('/auth/delauth', (req, res) => {
            self.delAuth(req, res);
            res.json({ status: "ok" }).end();
        });

        app.get('/auth/info', (req, res) => {
            console.log('Cookies: ', req.cookies)
            res.send(JSON.stringify(req.cookies)).end();
        });

        app.get('/auth/setfil', (req, res) => {
            console.log('Cookies: ', req.cookies)

            var payload = {
                playerId: process.env.GATHER_DEV_ID,
            }
            var token = jwt.sign(payload, process.env.JWT_SIGN_SECRET);

            res.cookie("tspUserIdentification", token, {
                secure: true,
                httpOnly: true,
            });

            res.send("ok");
        });
    }

    setAuth(req, res, playerId) {
        const payload = {
            playerId: playerId,
        }
        const token = jwt.sign(payload, process.env.JWT_SIGN_SECRET);

        res.cookie("tspUserIdentification", token, {
            secure: true,
            httpOnly: true,
            sameSite: "None"
        });
    }

    delAuth(req, res) {
        console.log("Clearing Auth Cookie");
        res.clearCookie(userIdentCookie, { path: '/' })
    }

    apiAuth(req, res, next) {
        this.checkAuth(req, res, () => {
            if (res.locals.playerId) {
                next();
            } else {
                res.json({ status: "error", info: "no auth" }).end();
            }
        });
    }

    checkAuth(req, res, next) {
        if (!(userIdentCookie in req.cookies)) {
            next();
            return;
        }

        const token = req.cookies[userIdentCookie];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SIGN_SECRET);

            // Check Payload
            if (!('playerId' in decoded)) {
                console.log(decoded);
                throw new Error("payload incorrect");
            }

            const playerId = decoded.playerId;

            // Ignore Developer Id, so development can be done without actually beeing logged in
            // &&
            // Check if player is online
            if (playerId != process.env.DEV_ID && this.gather.game.players.playerId != null) {
                console.log(decoded);
                throw new Error("player not on server");
            }

            this.gather.updatePlayer(playerId);
            res.locals.playerId = decoded.playerId;
        } catch(err) {
            console.log(`[Auth|checkAuth|Error]: ${err.name} - ${err.message}`);
            console.log(err);
            this.delAuth(req, res);
        }
        next();
    }
}

module.exports = Auth;
