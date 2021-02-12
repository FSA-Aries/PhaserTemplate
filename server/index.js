const path = require("path");
const express = require("express");
const morgan = require("morgan");
const PORT = process.env.PORT || 8000;
const app = express();
const socketio = require("socket.io");
module.exports = app;

const createApp = () => {
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, "..", "dist")));

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
};

const startListening = () => {
  const server = app.listen(PORT, () =>
    console.log(`Mixing it up on port ${PORT}`)
  );
  const io = socketio(server);

  require("./socket/index")(io);
};

async function bootApp() {
  await createApp();
  await startListening();
}
if (require.main === module) {
  bootApp();
} else {
  createApp();
}
