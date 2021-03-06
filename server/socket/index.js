const gameRooms = {};

module.exports = (io) => {
  console.log("Socket.io is now listening!");
  io.on("connect", (socket) => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );

    socket.on("joinRoom", (roomKey) => {
      socket.join(roomKey);
      const roomInfo = gameRooms[roomKey];
      roomInfo.players[socket.id] = {
        rotation: 0,
        x: 400,
        y: 300,
        playerId: socket.id,
      };
      roomInfo.numPlayers = Object.keys(roomInfo.players).length;
      socket.emit("setState", roomInfo);
      socket.emit("currentPlayers", {
        player: roomInfo.players,
        numPlayers: roomInfo.numPlayers,
      });
      socket.to(roomKey).emit("newPlayer", {
        playerInfo: roomInfo.players[socket.id],
        numPlayers: roomInfo.numPlayers,
      });
    });

    socket.on("isKeyValid", function (input) {
      Object.keys(gameRooms).includes(input)
        ? socket.emit("keyIsValid", input)
        : socket.emit("keyNotValid");
    });
    socket.on("getRoomCode", async function () {
      let key = codeGenerator();
      Object.keys(gameRooms).includes(key) ? (key = codeGenerator()) : key;
      gameRooms[key] = {
        roomKey: key,
        players: {},
        numPlayers: 0,
      };
      socket.emit("roomCreated", key);
    });

    socket.on("playerMovement", function (data) {
      const { x, y, roomKey } = data;
      gameRooms[roomKey].players[socket.id].x = x;
      gameRooms[roomKey].players[socket.id].y = y;
      socket
        .to(roomKey)
        .emit("playerMoved", gameRooms[roomKey].players[socket.id]);
    });

    socket.on("bulletFire", function (data) {
      const { roomKey } = data;
      gameRooms[roomKey].players[socket.id];
      socket
        .to(roomKey)
        .emit("bulletFired", gameRooms[roomKey].players[socket.id]);
    });

    socket.on("scoreChanged", function (data) {
      const { roomKey, score } = data;
      gameRooms[roomKey].players[socket.id];
      socket.to(roomKey).emit("scoreChanges", {
        playerInfo: gameRooms[roomKey].players[socket.id],
        score: score,
      });
    });

    socket.on("disconnect", function () {
      let roomKey = "";
      for (let keys1 in gameRooms) {
        for (let keys2 in gameRooms[keys1]) {
          Object.keys(gameRooms[keys1][keys2]).map((el) => {
            if (el === socket.id) {
              roomKey = keys1;
            }
          });
        }
      }
      const roomInfo = gameRooms[roomKey];
      if (roomInfo) {
        console.log(`User ${socket.id} disconnected!`);
        delete roomInfo.players[socket.id];
        roomInfo.numPlayers = Object.keys(roomInfo.players).length;
        io.to(roomKey).emit("disconnected", {
          playerId: socket.id,
          numPlayers: roomInfo.numPlayers,
        });
      }
    });
  });
};

function codeGenerator() {
  let code = "";
  let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
