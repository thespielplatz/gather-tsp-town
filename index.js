const server = require('./server');
const {name, version} = require("./package.json");
const app = server.app;
const db = require('./db.js');
const Gather = require('./gather');
const gather = new Gather();

const Auth = require('./logic/auth');
const LightningScreen = require('./logic/lightningscreen')

app.get('/ping', (req, res) => {
    res.json("pong").end();
});

app.get('/auth/authplayer', (req, res) => {

    res.json({status: "wainting"}).end();
});

const auth = new Auth(app, gather, db);
const ls = new LightningScreen(app, gather, db, auth,"KWM4F5HtsYYx8-UDKw2Et_60c1358a-0f17-4d0a-9aba-228808aca38e");

server.start(() => {
    console.log("go!");
});

