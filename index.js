const { API_KEY, SPACE_ID, ROOM_ID } = require("./config.js");
const { Game } = require("@gathertown/gather-game-client");
global.WebSocket = require("isomorphic-ws");

/**** setup ****/

// what's going on here is better explained in the docs:
// https://gathertown.notion.site/Gather-Websocket-API-bf2d5d4526db412590c3579c36141063
const game = new Game(() => Promise.resolve({ apiKey: API_KEY }));
game.connect(SPACE_ID); // replace with your spaceId of choice
game.subscribeToConnection((connected) => console.log("connected?", connected));

/**** the good stuff ****/

game.subscribeToEvent("playerMoves", (data, context) => {
    /*
    console.log(
        context?.player?.name ?? context.playerId,
        "moved in direction",
        data.playerMoves.direction
    );*/
    console.log(JSON.stringify(data));
    game.setName(`Fil (${data.playerMoves.x}, ${data.playerMoves.y})`)
});

game.subscribeToEvent("playerInteracts", (data, context) => {
    console.log(JSON.stringify(data));
});
