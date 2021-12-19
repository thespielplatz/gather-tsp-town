const server = require('./server');
const {name, version} = require("./package.json");
const app = server.app;
const db = require('./db.js');
const moment = require('moment');
const Gather = require('./gather');

const gather = new Gather(db);

var jwt = require('jsonwebtoken');
const JWT_SIGN_SECRET = require('./config.js').JWT_SIGN_SECRET;

const Auth = require('./logic/auth');
const LightningScreen = require('./logic/lightningscreen')

app.get('/ping', (req, res) => {
    res.json("pong").end();
});

const auth = new Auth(app, gather, db);
const ls = new LightningScreen(app, gather, db, auth,"KWM4F5HtsYYx8-UDKw2Et_60c1358a-0f17-4d0a-9aba-228808aca38e");

server.start(() => {
    console.log("go!");
});

