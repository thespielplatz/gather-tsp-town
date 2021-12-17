global.WebSocket = require("isomorphic-ws");

class Gather {
    constructor() {
        this.config = require("./config.js");
        this.game = undefined;

        this.setup();

        this.subscriptions = {
            "playerInteracts" : []
        };
    }

    setup() {
        const self = this;
        const { Game } = require("@gathertown/gather-game-client");
        this.game = new Game(() => Promise.resolve({ apiKey: this.config.API_KEY }));
        this.game.connect(this.config.SPACE_ID); // replace with your spaceId of choice
        this.game.subscribeToConnection((connected) => console.log("connected?", connected));

        this.players = this.game.players;

        // player Interacts with Objects
        /*
        this.game.subscribeToEvent("playerInteracts", (data, context) => {
            console.log(JSON.stringify(data));
            console.log(self.game.players[context.playerId].name);
            const objId = data.playerInteracts.objId;

            self.subscriptions["playerInteracts"].forEach((sub) => {
               if (sub.objId === objId) {
                   sub.callback(context.playerId, self.game.players[context.playerId]);
               }
            });
        });*/
    }

    /*
        subscribeToPlayerInteracts(objId, callback) {
            this.subscriptions["playerInteracts"].push({ objId, callback });
        }*/

    getPlayer(playerId) {
        return this.game.players[playerId];
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
