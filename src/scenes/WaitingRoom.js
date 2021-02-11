import Phaser from "phaser";
import socket from "../socket/index.js";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("WaitingRoom");
    this.state = {};
    this.hasBeenSet = false;
    this.roomKey = "";
  }

  preload() {
    this.load.html("codeform", "assets/text/codeform.html");
  }

  create() {
    const scene = this;

    scene.popUp = scene.add.graphics();
    scene.boxes = scene.add.graphics();

    // for popup window
    scene.popUp.lineStyle(1, 0xffffff);
    scene.popUp.fillStyle(0x03192d, 0.5);

    // for boxes
    scene.boxes.lineStyle(1, 0xffffff);
    scene.boxes.fillStyle(0x03192d, 1);

    // popup window
    scene.popUp.strokeRect(25, 25, 750, 500);
    scene.popUp.fillRect(25, 25, 750, 500);

    //title
    scene.title = scene.add.text(200, 75, "Two-Player Competitive", {
      color: "#EFF6EE",
      fontSize: "40px",
      fontStyle: "bold",
      fontFamily: "Stencil Std, fantasy",
    });

    //left popup
    scene.boxes.strokeRect(100, 200, 275, 100);
    scene.boxes.fillRect(100, 200, 275, 100);
    scene.requestButton = scene.add.text(140, 215, "Request Room Key", {
      color: "#EFF6EE",
      fontSize: "20px",
      fontStyle: "bold",
      fontFamily: "Stencil Std, fantasy",
    });

    //right popup
    scene.boxes.strokeRect(425, 200, 275, 100);
    scene.boxes.fillRect(425, 200, 275, 100);
    scene.inputElement = scene.add.dom(562.5, 250).createFromCache("codeform");
    scene.inputElement.addListener("click");
    scene.inputElement.on("click", function (event) {
      console.log("Enter room -->", event.target.name);
      if (event.target.name === "enterRoom") {
        const input = scene.inputElement.getChildByName("code-form");
        socket.emit("isKeyValid", input.value);
      }
    });

    scene.requestButton.setInteractive();
    scene.requestButton.on("pointerdown", () => {
      socket.emit("getRoomCode");
    });

    scene.notValidText = scene.add.text(670, 295, "", {
      color: "#273043",
      fontSize: "15px",
      fontFamily: "Stencil Std, fantasy",
    });
    scene.roomKeyText = scene.add.text(210, 250, "", {
      color: "#00ff00",
      fontSize: "20px",
      fontStyle: "bold",
      fontFamily: "Stencil Std, fantasy",
    });

    socket.on("roomCreated", function (roomKey) {
      console.log("WaitingRoom key --> ", roomKey);
      scene.roomKey = roomKey;
      scene.roomKeyText.setText(scene.roomKey);
    });

    socket.on("keyNotValid", function () {
      scene.notValidText.setText("Invalid Room Key");
    });
    socket.on("keyIsValid", function (input) {
      scene.scene.start("Multiplayer", { input: input });
    });
  }
  update() {}
}
