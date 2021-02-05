const gameRooms = {
  // [roomKey]: {
  //   users: [],
  //   scores: [],
  //   players: {},
  // },
};
module.exports = (io) => {
  console.log("Socket.io is now listening!");
  io.on("connect", (socket) => {
    console.log(
      `A socket connection to the server has been made: ${socket.id}`
    );
    socket.on("joinRoom", (roomKey) => {
      console.log("Joined room -->", roomKey);
      socket.join(roomKey);
      const roomInfo = gameRooms[roomKey];
      console.log("roomInfo -->", roomInfo);
      roomInfo.players[socket.id] = {
        rotation: 0,
        x: 400,
        y: 300,
        playerId: socket.id,
      };
      roomInfo.numPlayers = Object.keys(roomInfo.players).length;
      socket.emit("setState", roomInfo);
      console.log("roomInfo ->", roomInfo);
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
      console.log("key -->", key);
      Object.keys(gameRooms).includes(key) ? (key = codeGenerator()) : key;
      gameRooms[key] = {
        roomKey: key,
        players: {},
        numPlayers: 0,
      };
      socket.emit("roomCreated", key);
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
