import Phaser from "phaser";

const PLAYER = "assets/characters/Player.png";
const PLAYER_KEY = "player";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.cursors = undefined;

    this.init();
    this.initEvents();
  }
  init() {
    this.setCollideWorldBounds(true);
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: PLAYER_KEY, frame: 4 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }
  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    const { left, right, up, down } = this.cursors;

    this.body.setVelocity(0);

    if (left.isDown) {
      this.setVelocityX(-150);
      this.anims.play("left", true);
    } else if (right.isDown) {
      this.setVelocityX(150);
      this.anims.play("right", true);
    } else {
      this.setVelocityX(0);
      this.anims.play("turn");
    }

    if (up.isDown) {
      this.setVelocityY(-150);
    } else if (down.isDown) {
      this.setVelocityY(150);
    }
  }
}

export default Player;
