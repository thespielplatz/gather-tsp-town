global.WebSocket = require("isomorphic-ws");

class Gather {
    constructor(db) {
        this.db = db;
        this.config = require("./config.js");
        this.game = undefined;

        this.setup();

        // Init DB
        if (db.get("gather").value() === undefined) {
            db.get("gather").set({
                players : {}
            }).save();
        }

        this.subscriptions = {
            "playerInteracts" : []
        };
    }

    setup() {
        const self = this;
        const {Game} = require("@gathertown/gather-game-client");
        this.game = new Game(() => Promise.resolve({apiKey: this.config.API_KEY}));
        this.game.connect(this.config.SPACE_ID); // replace with your spaceId of choice

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
        if (playerId in this.game.players) return this.game.players[playerId];
        const savedPlayer = this.db.get("gather").get("players").get(playerId).value();
        if (savedPlayer != undefined) {
            return savedPlayer;
        } else {
            return {
                id: playerId,
                name: "unknown"
            }
        }
    }
}


/**** the good stuff ****/
/*
game.subscribeToEvent("playerMoves", (data, context) => {
    console.log(
        context?.player?.name ?? context.playerId,
        "moved in direction",
        data.playerMoves.directiona
    );
    console.log(JSON.stringify(data));
    game.setName(`Fil (${data.playerMoves.x}, ${data.playerMoves.y})`)
});
*/


module.exports = Gather;
