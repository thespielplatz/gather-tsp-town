const SPACE_ID = require('../../config.js').SPACE_ID;
const API_KEY = require('../../config.js').API_KEY;

global.WebSocket = require("isomorphic-ws");
const Auth = require('./auth');
const web = require('./web');
const Avatar = require('./avatar');

class Gather {
    static Auth = Auth;

    constructor(db, app) {
        this.db = db;
        this.game = undefined;

        this.setup();

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

    setup() {
        const self = this;
        const {Game} = require("@gathertown/gather-game-client");
        this.game = new Game(() => Promise.resolve({apiKey: API_KEY}));
        this.game.connect(SPACE_ID); // replace with your spaceId of choice

        this.game.subscribeToConnection((connected) => {
            console.log("connected?", connected);
        });
    }

    updatePlayer(playerId) {
        const player = this.game.players[playerId];
        console.log("update player")
        if (player === undefined) return;
        console.log(player);
        console.log(typeof player);

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
}

module.exports = Gather;
