const PORT = 2222;

const NAME = require('./package.json').name;
const VERSION = require('./package.json').version;

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const favicon = require('express-favicon');
const fs = require('fs');

const app = express();
app.use(favicon(__dirname + '/static/img/favicon.png'));
app.use('/static', express.static('static'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

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

// -----------------------> Exclude TRACE and TRACK methods to avoid XST attacks.
app.use((req, res, next) => {
  const allowedMethods = [
    "OPTIONS",
    "HEAD",
    "CONNECT",
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
  ];

  if (!allowedMethods.includes(req.method)) {
    res.status(405).render("error", { title: "405",
      'message' : `${req.method} not allowed. 🤔<br><span style="font-style: normal;">${req.method} ${req.path}</span>` }).end();
    return;
  }

  next();
});

// Default Route
app.get('/', (req, res) => {
  res.render("title", { title: NAME, 'message' : VERSION });
});

app.get('/api/ping', (req, res) => {
  res.json({ status: "ok", message: "pong" }).end();
});

// Add 404
const add404 = () => {
  app.use((req, res, next) => {
    res.status(404).render("error", { title: "404", 'message' : `Page not found 🤔<br><span style="font-style: normal;">${req.method} ${req.path}</span>` });
  });
}

const start = (callback) => {
  add404();

  app.listen(PORT, () => { // Listen on port 3000
    console.log(`Listening on ${PORT}`); // Log when listen success

    if (callback != undefined) {
      callback();
    }
  });
}

module.exports = {
  app: app,
  start
}
