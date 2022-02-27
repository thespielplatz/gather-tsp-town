const NAME = require('./../package.json').name;
const VERSION = require('./../package.json').version;

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const favicon = require('express-favicon');

const fs = require('fs');

const app = express();

app.use(favicon(__dirname + '/../static/img/favicon.png'));
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
  if (process.env.DEV === 'true') console.log(`${req.method}:${req.url} ${res.statusCode}`);
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
    res.status(405).render("error", {
      title: "405",
      message : `${req.method} not allowed. 🤔<br><span style="font-style: normal;">${req.method} ${req.path}</span>`,
      name: NAME,
      version: VERSION,
    }).end();
    return;
  }

  next();
});

// Add 404
const add404 = () => {
  app.use((req, res, next) => {
    res.status(404).render("error", {
      title: "404",
      message : `Page not found 🤔<br><span style="font-style: normal;">${req.method} ${req.path}</span>`,
      name: NAME,
      version: VERSION,
    });
  });
}

let server
let shutdownCallback
let connections = [];

const _listen = app.listen

app.setShutdownCallback = (shutdownCallback_) => { shutdownCallback = shutdownCallback_ }

app.listen = function () {
  // Handle listen callback, if it's there
  let startCallback

  const lastIndex = (arguments.length - 1).toString()

  if (typeof arguments[lastIndex] === 'function') {
    startCallback = arguments[lastIndex]
    delete arguments[lastIndex]
    arguments.length--
  }

  // add own listen callback
  arguments[arguments.length] = () => {
    server.on('connection', connection => {
      connections.push(connection)
      connection.on('close', () => connections = connections.filter(curr => curr !== connection));
    })

    if (startCallback) startCallback()
  }
  arguments.length++

  // Add 404 error route at the end
  add404();

  server = _listen.apply(app, arguments)

  return server
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
  console.log('Received kill signal, shutting down gracefully');

  if (shutdownCallback) shutdownCallback()

  server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);

  connections.forEach(curr => curr.end());
  setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}

module.exports = app
