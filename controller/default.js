const express = require('express')
const {name: NAME, VERSION} = require("../package.json");

const router = express.Router()

// Default Route Home Screen
router.get('/', (req, res) => {
    res.render("hero-full", { title: NAME, 'version' : VERSION });
});

// Default Route API ping
router.get('/api/ping', (req, res) => {
    res.json("pong").end();
});

module.exports = router
