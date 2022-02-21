global.WebSocket = require("isomorphic-ws");
const Auth = require('./auth');
const web = require('./web');
const Avatar = require('./avatar');

let startCallbackFired = false

class Gather {
    static Auth = Auth;

    constructor(db, app, startCallback) {
        this.db = db;
        this.game = undefined;

        this.setup(startCallback);

        // Init DB
        if (db.get("gather").value() === undefined) {
            db.get("gather").set({
                players : {}
            }).save();
        }

        // Init Auth
        this.auth = new Auth(app, this, db);

        // Help Routes
        web(app, this.auth);
    }

    setup(startCallback) {
        const self = this;
        const {Game} = require("@gathertown/gather-game-client");
        this.game = new Game(() => Promise.resolve({apiKey: process.env.GATHER_API_KEY}));
        this.game.connect(process.env.GATHER_SPACE_ID); // replace with your spaceId of choice

        this.game.subscribeToConnection((connected) => {
            if (startCallbackFired) {
                console.log("re-connected?", connected);
                return
            }

            console.log("connected?", connected);

            if (startCallback) startCallback()
            startCallbackFired = true
        });
    }

    updatePlayer(playerId) {
        const player = this.game.players[playerId];
        console.log("update player")
        if (player === undefined) return;

        this.db.get("gather").get("players").get(playerId).set(this.game.players[playerId]).save();
    }

    // Caches the player data
    getPlayer(playerId) {
        let player = undefined;

        // Get Player from Game
        if (playerId in this.game.players) {
            player = this.game.players[playerId];
        }

        // Get Player from Database
        if (player === undefined) {
            player = this.db.get("gather").get("players").get(playerId).value();
        }

        // Create Avatar Url
        if (player !== undefined && 'outfitString' in player) {
            player.avatarUrl = Avatar.makeAvatarUrl(player.outfitString);
        }

        // Default fallback
        if (player === undefined) {
            player = {
                id: playerId,
                name: "unknown"
            }
        }

        return player;
    }

    showInteractionEvents() {
        const self = this
        this.game.subscribeToEvent("playerInteracts", (data, context) => {
            // let's see what happened first
            console.log(context?.player?.name + " interacted with " + data.playerInteracts.objId);

            // magic, fills mapObject with data that looks like the obj we made above. this is the object the person interacted with
            let mapObject = self.game.getObject(data.playerInteracts.objId).obj
        })
    }
}

module.exports = Gather;
