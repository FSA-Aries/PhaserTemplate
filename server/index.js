const path = require("path");
const express = require("express");
const morgan = require("morgan");
//const compression = require('compression')
//const session = require('express-session')
//const passport = require('passport')
//const SequelizeStore = require('connect-session-sequelize')(session.Store)
//const db = require('./db')
//const sessionStore = new SequelizeStore({db})
const PORT = process.env.PORT || 8080;
const app = express();
const socketio = require("socket.io");
module.exports = app;

const createApp = () => {
  // logging middleware
  app.use(morgan("dev"));

  // body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // compression middleware
  //app.use(compression())

  // session middleware with passport
  /*   app.use(
      session({
        secret: process.env.SESSION_SECRET || 'my best friend is Cody',
        store: sessionStore,
        resave: false,
        saveUninitialized: false
      })
    )
    app.use(passport.initialize())
    app.use(passport.session()) */

  // auth and api routes
  //app.use('/auth', require('./auth'))
  //app.use('/api', require('./api'))

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, "..", "dist")));

  // // any remaining requests with an extension (.js, .css, etc.) send 404
  // app.use((req, res, next) => {
  //   if (path.extname(req.path).length) {
  //     const err = new Error("Not found");
  //     err.status = 404;
  //     next(err);
  //   } else {
  //     next();
  //   }
  // });

  // sends index.html
  app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "src/index.html"));
  });

  // error handling endware
  app.use((err, req, res, next) => {
    console.error(err);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || "Internal server error.");
  });
  // app.get("/", (req, res) => {
  //   const fileLocation = path.normalize(__dirname + "dist/index.html");
  //   const indexContent = fs.readFileSync(fileLocation, { encoding: "utf8" });
  //   const tagToInsertAfter = "<body>";
  //   const locationToInsertSocketScript =
  //     indexContent.indexOf(tagToInsertAfter) + tagToInsertAfter.length;
  //   const indexWithSocketScript =
  //     indexContent.slice(0, locationToInsertSocketScript) +
  //     '<script src="/socket.io/client-dist/socket.io.js"></script>' +
  //     indexContent.slice(locationToInsertSocketScript);

  //   fs.writeFileSync(fileLocation, indexWithSocketScript, { encoding: "utf8" });

  //   res.sendFile(fileLocation);
  // });
};

const startListening = () => {
  // start listening (and create a 'server' object representing our server)
  const server = app.listen(PORT, () =>
    console.log(`Mixing it up on port ${PORT}`)
  );

  // set up our socket control center
  const io = socketio(server);
  require("./socket/index")(io);
};

//const syncDb = () => db.sync()

async function bootApp() {
  //await sessionStore.sync()
  //await syncDb()
  await createApp();
  await startListening();
}
// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  bootApp();
} else {
  createApp();
}
