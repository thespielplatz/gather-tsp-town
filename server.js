const NO_EXECUTION = process.argv.includes('--noexec');
console.log(NO_EXECUTION);

const PORT = 2222;

let NAME = require('./package.json').name;
let VERSION = require('./package.json').version;

const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('express-favicon');
const fs = require('fs');

const app = express();
app.use(favicon(__dirname + '/static/img/favicon.png'));
app.use('/static', express.static('static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Template Engine
app.engine('ntl', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(err)
    // this is an extremely simple template engine
    var rendered = content.toString();

    for (const [key, value] of Object.entries(options)) {
      if (key == "settings") continue;
      if (key == "_locals") continue;
      if (key == "cache") continue;

      var re = new RegExp("#" + key + "#", "g");
      rendered = rendered.replace(re, value);
    }

    return callback(null, rendered)
  })
})
app.set('views', './pages') // specify the views directory
app.set('view engine', 'ntl') // register the template engine

// -----------------------> Logging
app.use((req, res, next) => {
  console.log(`${req.method}:${req.url} ${res.statusCode}`);
  next();
});

// Default Route
app.get('/', (req, res) => {
  res.render("main", { title: NAME, 'version' : VERSION });
});


// Shutdown

// Require child_process
var exec = require('child_process').exec;

app.get('/api/shutdown', (req, res) => {
  if (NO_EXECUTION) {
    res.json({ status: "NO_EXECUTION" }).end();
    return;
  }

  // Reboot computer
  exec('shutdown now', (error, stdout, stderr) => {
    console.log("error");
    console.log(error);
    console.log("stdout");
    console.log(stdout);
    console.log("stderr");
    console.log(stderr);

    if (error !== null) {
      res.json({ status: "error", message: stderr }).end();
      return;
    }

    res.json({ status: "ok", message: stderr }).end();
  });
});

app.get('/api/getip', (req, res) => {
  if (NO_EXECUTION) {
    res.json({ status: "NO_EXECUTION" }).end();
    return;
  }

  // Reboot computer
  exec('hostname -I', (error, stdout, stderr) => {
    if (stderr) {
      res.json({ status: "error", message: stderr }).end();
      return;
    }

    res.json({ status: "ok", message: stdout }).end();
  });
});

// Add 404
app.use((req, res, next) => {
  res.status(404).render("error", { title: "404", 'message' : `Page not found 🤔<br><span style="font-style: normal;">${req.method} ${req.path}</span>` });
});

app.listen(PORT, () => { // Listen on port 3000
  console.log(`Listening on ${PORT}`); // Log when listen success
})

