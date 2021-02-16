import Phaser from "phaser";
import socket from "../socket/index.js";
import assets from "../../public/assets/index";
import { config } from "../main.js";

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super("WaitingRoom");
    this.state = {};
    this.hasBeenSet = false;
    this.roomKey = "";
    this.cursors = undefined;
    this.name = "WaitingRoom";
    this.clicked = undefined;
  }

  preload() {
    this.load.html("codeform", "assets/text/codeform.html");
    this.load.image(assets.BACKBUTTON_KEY, assets.BACKBUTTON_URL);
    this.load.audio(assets.DMCMENU_KEY, assets.DMCMENU_URL);
  }

  create() {
    const scene = this;
    this.clicked = this.sound.add(assets.DMCMENU_KEY, {
      loop: false,
      volume: 0.53,
    });

    this.backButton = this.add
      .image(700, 72, assets.BACKBUTTON_KEY)
      .setScale(0.05, 0.05);
    this.backButton.setInteractive();
    this.backButton.on("pointerover", () => {
      this.backButton.setScale(0.07, 0.07);
    });
    this.backButton.on("pointerout", () => {
      this.backButton.setScale(0.05, 0.05);
    });
    this.backButton.on("pointerdown", this.handleClick, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors = this.input.keyboard.addKeys({
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    });

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
    scene.inputElement = scene.add
      .dom(config.rightTopCorner.x + 60, config.rightTopCorner.y + 100)
      .createFromCache("codeform");
    scene.inputElement.addListener("click");
    scene.inputElement.on("click", function (event) {
      if (event.target.name === "enterRoom") {
        const input = scene.inputElement.getChildByName("code-form");
        socket.emit("isKeyValid", input.value);
      }
    });

    scene.requestButton.setInteractive();
    scene.requestButton.on("pointerdown", () => {
      socket.emit("getRoomCode");
    });

    scene.notValidText = scene.add.text(500, 275, "", {
      color: "#00ff00",
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
  update() {
    if (this.cursors.esc.isDown) {
      this.scene.pause();
      this.scene.launch("pause-scene", { key: this.name });
    }
  }
  handleClick() {
    this.clicked.play();

    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      (cam, effect) => {
        this.scene.start("menu-scene");
      }
    );
  }
}
