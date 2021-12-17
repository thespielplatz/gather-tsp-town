class Auth {
    constructor(app, gather, db) {
        const self = this;

        this.registeredObjects = {};

        let timeoutId = undefined;
        let time = 0;
        let timeoutCheck = () => {
            console.log("auth.timeoutCheck - Tick");
            if (self.lastInteractionIds.length <= 0) {
                console.log("deleteTimeoutCheck - Stopped no Ids");
                clearTimeout(timeoutId);
                timeoutId = undefined;
                return;
            }
            if (Date.now() < time) return;
            console.log("deleteTimeoutCheck - Stopped > 2sec");

            //self.lastInteractionIds.splice(0, self.lastInteractionIds.length);
            clearTimeout(timeoutId);
            timeoutId = undefined;
            return;
        }

        app.get('/auth/identified', (req, res) => {
            // Check Cookie

            // Todo: do something about
            // self.registeredObjects[objId].ids.push(playerId);

            res.json({ status: "unkown" }).end();
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

            console.log("[Auth|Interact] " + gather.players[context.playerId].name + " with " + objId);

            if (objId in self.registeredObjects) {
                // Todo: do something about the identified Players
                self.registeredObjects[objId].ids.push(playerId);
                self.registeredObjects[objId].serverTime = Date.now();
            }
        });
    }

/*
    gather.subscribeToPlayerInteracts(objId, (playerId, player) => {
        self.lastInteractionIds.push(playerId);
        deleteTime = Date.now() + 1000 * 2;
        if (deleteTimeoutId === undefined) {
            deleteTimeoutId = setInterval(deleteTimeoutCheck, 1000);
        }

        });


    }
*/
    registerObject(objId) {
        this.registeredObjects[objId] = {
            ids: [],
            timeout: 0
        };
    }
}

module.exports = Auth;
