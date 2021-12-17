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
            res.json({ status: "unkown" }).end();
        });

        app.get('/auth/auth/:objId/:pageTime', (req, res) => {
            const objId = req.params.objId;
            const pageTime = req.params.pageTime;
            console.log(objId);

            if (!(objId in this.registeredObjects)) {
                res.json({status: "error"}).end();
                return;
            }

            // Waiting
            if (self.registeredObjects[objId].ids.length <= 0) {
                res.json({status: "unkown"}).end();
                return;
            }

            // Two player at the same time
            if (self.registeredObjects[objId].ids.length >= 2) {
                self.registeredObjects[objId].length = 0;
                res.json({status: "error"}).end();
                return;
            }

            // Interaction times to wide > 1.5sec
            const interactionTimespan = Math.abs(pageTime - self.registeredObjects[objId].serverTime);

            if (interactionTimespan > 1.5 * 1000) {
                self.registeredObjects[objId].length = 0;
                res.json({status: "error"}).end();
                return;
            }

            // No interfierence for 2.5 sec - Waiting
            const start = Math.min(pageTime, self.registeredObjects[objId].serverTime);
            const timespan = Date.now() - start;

            if (timespan < 2.5 * 1000) {
                res.json({status: "unkown"}).end();
                return;
            }

            const playerId = self.registeredObjects[objId].shift();

            res.json({
                status: "ok",
                playerId: playerId,
                playerName: gather.getPlayer(playerId).name
            }).end();
        });

        // player Interacts with Objects
        gather.game.subscribeToEvent("playerInteracts", (data, context) => {
            const playerId = context.playerId;
            const objId = data.playerInteracts.objId;

            console.log(gather.players[context.playerId].name + " with " + objId);

            if (objId in self.registeredObjects) {
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
