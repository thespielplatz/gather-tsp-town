const jwt = require('jsonwebtoken');
const JWT_SIGN_SECRET = require('../../config.js').JWT_SIGN_SECRET;
const DEV_ID = require('../../config.js').DEV_ID;
const userIdentCookie = "tspUserIdentification";

class Auth {
    constructor(app, gather, db) {
        const self = this;

        this.registeredObjects = {};
        this.ignoreNextInteraction = [];

        let timeoutId = undefined;
        let time = 0;
        this.gather = gather;

        // Init DB
        if (db.get("auth").value() === undefined) {
            db.get("auth").set({

            }).save();
        }

        app.get('/auth/identified/', self.checkAuth.bind(self), (req, res) => {
            if (res.locals.playerId) {

                // Ignore Users interaction - delete from registered Objects
                Object.keys(self.registeredObjects).forEach((objId) => {
                    const data = self.registeredObjects[objId]
                    const index = data.ids.indexOf(res.locals.playerId);
                    if (index > -1) {
                        data.ids.splice(index, 1);
                    }
                })

                // Ignore next interaction
                const index = self.ignoreNextInteraction.indexOf(res.locals.playerId);
                if (index <= -1) {
                    self.ignoreNextInteraction.push(res.locals.playerId);
                }

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
                playerId: "ewEd2cOdove2tX9NCoTAMqaMxTU2",
            }
            var token = jwt.sign(payload, JWT_SIGN_SECRET);

            res.cookie("tspUserIdentification", token, {
                secure: true,
                httpOnly: true,
            });

            res.send("ok");
        });

        app.get('/auth/auth/:objId/:pageTime', (req, res) => {
            const objId = req.params.objId;
            const pageTime = req.params.pageTime;
            console.log(objId);

            if (!(objId in this.registeredObjects)) {
                res.json({status: "error", info: "objId does not exist"}).end();
                return;
            }

            // Waiting
            if (self.registeredObjects[objId].ids.length <= 0) {
                // Page time more than 1.5 sec
                const pageTimespan = Date.now() - pageTime;
                if (pageTimespan > 1.5 * 1000) {
                    res.json({status: "error", info: "Page time > than 1.5 sec"}).end();
                    return;
                }

                // Waiting
                res.json({status: "unkown", info: "no players interacted"}).end();
                return;
            }

            // Two player at the same time
            if (self.registeredObjects[objId].ids.length >= 2) {
                self.registeredObjects[objId].ids.length = 0;
                res.json({status: "error", info: "Two player at the same time"}).end();
                return;
            }

            // Interaction times to wide > 1.5sec
            const interactionTimespan = Math.abs(pageTime - self.registeredObjects[objId].serverTime);

            if (interactionTimespan > 1.5 * 1000) {
                self.registeredObjects[objId].ids.length = 0;
                res.json({status: "error", info: "Interaction times to wide > 1.5sec"}).end();
                return;
            }

            // No interfierence for 2.5 sec - Waiting
            const start = Math.min(pageTime, self.registeredObjects[objId].serverTime);
            const timespan = Date.now() - start;

            if (timespan < 2.5 * 1000) {
                res.json({status: "unkown", info: "No interfierence for 2.5 sec - Waiting"}).end();
                return;
            }

            const playerId = self.registeredObjects[objId].ids.shift();

            // Set Auth Cookie
            self.setAuth(req, res, playerId);

            res.json({
                status: "ok",
                player: {
                  id: playerId,
                  name: gather.getPlayer(playerId).name
                }
            }).end();
        });

        // player Interacts with Objects
        gather.game.subscribeToEvent("playerInteracts", (data, context) => {
            const playerId = context.playerId;
            const objId = data.playerInteracts.objId;

            console.log(`[Auth|Interact] ${gather.getPlayer(context.playerId).name} (${context.playerId}) with ${objId}`);

            // Ignoring Auth Interaction if player is already authenticated
            const index = self.ignoreNextInteraction.indexOf(playerId);

            if (index > -1) {
                console.log(`[Auth|Interact] ignoring interaction`);
                self.ignoreNextInteraction.splice(index, 1);
                return;
            }

            if (objId in self.registeredObjects) {
                self.registeredObjects[objId].ids.push(playerId);
                self.registeredObjects[objId].serverTime = Date.now();
            }
        });
    }

    registerObject(objId) {
        this.registeredObjects[objId] = {
            ids: [],
            timeout: 0
        };
    }

    setAuth(req, res, playerId) {
        const payload = {
            playerId: playerId,
        }
        const token = jwt.sign(payload, JWT_SIGN_SECRET);

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

    checkAuth(req, res, next) {
        if (!(userIdentCookie in req.cookies)) {
            next();
            return;
        }

        const token = req.cookies[userIdentCookie];
        try {
            const decoded = jwt.verify(token, JWT_SIGN_SECRET);

            // Check Payload
            if (!('playerId' in decoded)) {
                console.log(decoded);
                throw new Error("payload incorrect");
            }

            const playerId = decoded.playerId;

            // Check if player is online
            if (!(playerId in this.gather.game.players)) {

                // Ignore Developer Id
                if (DEV_ID !== playerId) {
                    console.log(decoded);
                    throw new Error("player not on server");
                }
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
