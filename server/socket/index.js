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
      console.log("Roomkey -->", roomKey);
      socket.join(roomKey);
    });
    socket.on("isKeyValid", function (input) {
      const keyArray = Object.keys(gameRooms)
        ? socket.emit("keyisValid", input)
        : socket.emit("keyNotValid");
      console.log("keyArray -->", keyArray);
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
