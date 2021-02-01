import Phaser from "phaser";
import addCollider from "../mixins/collidable";
import assets from "../../public/assets";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.cursors = undefined;

    //Mixins
    Object.assign(this, addCollider);

    this.addCollider = addCollider;

    this.init();
    this.initEvents();
  }
  init() {
    this.setCollideWorldBounds(true);
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
      //repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: assets.PLAYER_KEY, frame: 1 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 6,
        end: 8,
      }),
      frameRate: 10,
      //repeat: -1,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
      //repeat: -1
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      //repeat: -1
    });
  }
  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    //const { left, right, up, down } = this.cursors;

    this.body.setVelocity(0);
    const prevVelocity = this.body.velocity.clone();

    if (this.cursors.left.isDown) {
      this.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(150);
    }
    if (this.cursors.up.isDown) {
      this.setVelocityY(-150);
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(150);
    }

    if (this.cursors.left.isDown) {
      this.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.anims.play("right", true);
    } else if (this.cursors.up.isDown) {
      this.anims.play("up", true);
    } else if (this.cursors.down.isDown) {
      this.anims.play("down", true);
    } else {
      this.anims.stop();

      if (prevVelocity.x < 0) this.setTexture(assets.PLAYER_KEY, 4);
      else if (prevVelocity.x > 0) this.setTexture(assets.PLAYER_KEY, 8);
      else if (prevVelocity.y < 0) this.setTexture(assets.PLAYER_KEY, 10);
      else if (prevVelocity.y > 0) this.setTexture(assets.PLAYER_KEY, 1);
    }
  }

  takesHit() {
    console.log("I have been hit");
  }
}

export default Player;
