import Phaser from 'phaser';
import socket from '../socket/index.js';

export default class WaitingRoom extends Phaser.Scene {
  constructor() {
    super('WaitingRoom');
    this.state = {};
    this.hasBeenSet = false;
    this.roomKey = '';
    this.socket = socket;
  }

  preload() {
    this.load.html('codeform', 'assets/text/codeform.html');
    //var data = this.cache.html;
    //console.log('DATA ->', data);
  }

  create() {
    const scene = this;
    //console.log(this);
    // this.load.html("codeform", "assets/text/codeform.html");

    scene.popUp = scene.add.graphics();
    scene.boxes = scene.add.graphics();

    // for popup window
    scene.popUp.lineStyle(1, 0xffffff);
    scene.popUp.fillStyle(0xffffff, 0.5);

    // for boxes
    scene.boxes.lineStyle(1, 0xffffff);
    scene.boxes.fillStyle(0xa9a9a9, 1);

    // popup window
    scene.popUp.strokeRect(25, 25, 750, 500);
    scene.popUp.fillRect(25, 25, 750, 500);

    //title
    scene.title = scene.add.text(100, 75, 'Senior Phaser', {
      color: '#add8e6',
      fontSize: '66px',
      fontStyle: 'bold',
    });

    //left popup
    scene.boxes.strokeRect(100, 200, 275, 100);
    scene.boxes.fillRect(100, 200, 275, 100);
    scene.requestButton = scene.add.text(140, 215, 'Request Room Key', {
      color: '#000000',
      fontSize: '20px',
      fontStyle: 'bold',
    });

    //right popup
    scene.boxes.strokeRect(425, 200, 275, 100);
    scene.boxes.fillRect(425, 200, 275, 100);
    scene.add.dom(250, 250).createFromCache('codeform');
    // scene.add.dom(562.5, 250).createFromCache('codeform');
    // scene.inputElement.addListener("click");
    // scene.inputElement.on("click", function (event) {
    //   console.log("Enter room -->", event.target.name);
    //   if (event.target.name === "enterRoom") {
    //     const input = scene.inputElement.getChildByName("code-form");

    //     scene.socket.emit("isKeyValid", input.value);
    //   }
    // });

    scene.requestButton.setInteractive();
    scene.requestButton.on('pointerdown', () => {
      scene.socket.emit('getRoomCode');
    });

    scene.notValidText = scene.add.text(670, 295, '', {
      color: '#ff0000',
      fontSize: '15px',
    });
    scene.roomKeyText = scene.add.text(210, 250, '', {
      color: '#00ff00',
      fontSize: '20px',
      fontStyle: 'bold',
    });

    scene.socket.on('roomCreated', function (roomKey) {
      console.log('WaitingRoom key --> ', roomKey);
      scene.roomKey = roomKey;
      scene.roomKeyText.setText(scene.roomKey);
    });

    scene.socket.on('keyNotValid', function () {
      scene.notValidText.setText('Invalid Room Key');
    });
    scene.socket.on('keyIsValid', function (input) {
      scene.socket.emit('joinRoom', input);
      scene.scene.stop('WaitingRoom');
    });
  }
  update() {}
}
