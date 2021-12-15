const server = require('./server');
const {name, version} = require("./package.json");
const app = server.app;
const db = require('./db.js');
const Gather = require('./gather');
const gather = new Gather();

const LightningScreen = require('./logic/lightningscreen')

app.get('/ping', (req, res) => {
    res.json("pong").end();
});

const ls = new LightningScreen(app, gather, db, "KWM4F5HtsYYx8-UDKw2Et_60c1358a-0f17-4d0a-9aba-228808aca38e");

server.start(() => {
    console.log("go!");
});

