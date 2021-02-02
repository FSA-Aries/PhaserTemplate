import Phaser from "phaser";
import assets from "../../public/assets";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    // scene.physics.add.existing(this);
    scene.physics.world.enable(this);
    this.cursors = undefined;

    //Mixins
    this.health = 500;
    this.damage = 50;

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
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
  }
  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    //const { left, right, up, down } = this.cursors;

    this.setVelocity(0);
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

  takesHit(damage) {
    if (this.health > 0) {
      this.health -= damage;
    }
  }
  // hasHit(player) {
  //   console.log("I have hit,", player);
  // }
}

export default Player;
