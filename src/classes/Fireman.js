import Phaser from "phaser";
import assets from "../../public/assets";
import HealthBar from "../hud/healthbar";
import { config } from "../main";
import EventEmmiter from "../events/Emitter";

class Fireman extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physics.world.enable(this);
    this.cursors = undefined;
    this.playerId = undefined;

    this.damage = 100;
    this.x = x;
    this.y = y;

    this.init();
    this.initEvents();
    this.oldPosition = { x: this.x, y: this.y, rotation: this.rotation };
  }

  init() {
    this.hasBeenHit = false;
    this.bounceVelocity = 50;
    this.setCollideWorldBounds(true);
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.health = 150;

    this.setBodySize(50, 61, false);

    this.hp = new HealthBar(
      this.scene,
      config.leftTopCorner.x + 5,
      config.leftTopCorner.y + 5,
      3,
      this.health
    );

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers(assets.FIREMAN_KEY, {
        //keep these incase there's a switch to elemental.png
        // start: 3,
        // end: 5,
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(assets.FIREMAN_KEY, {
        // start: 15,
        // end: 17,
        start: 3,
        end: 5,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(assets.FIREMAN_KEY, {
        // start: 27,
        // end: 29,
        start: 6,
        end: 8,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers(assets.FIREMAN_KEY, {
        // start: 39,
        // end: 41,
        start: 9,
        end: 11,
      }),
      frameRate: 10,
    });
  }
  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    if (this.hasBeenHit || !this.body) {
      return;
    }
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
    }
  }

  playDamageTween() {
    return this.scene.tweens.add({
      targets: this,
      duration: 100,
      repeat: -1,
      tint: 0xffffff,
    });
  }

  bounceOff() {
    if (this.body.touching.right) {
      setTimeout(() => this.setVelocityX(-this.bounceVelocity), 0);
    }
    if (this.body.touching.left) {
      setTimeout(() => this.setVelocityX(this.bounceVelocity), 0);
    }
    if (this.body.touching.up) {
      setTimeout(() => this.setVelocityY(this.bounceVelocity), 0);
    }
    if (this.body.touching.down) {
      setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
    }
  }

  takesHit(monster) {
    if (this.hasBeenHit) {
      return;
    }
    if (this.health - monster.damage <= 0) {
      EventEmmiter.emit("PLAYER_LOSE");
      return;
    }
    this.hasBeenHit = true;
    this.bounceOff();
    const hitAnim = this.playDamageTween();
    this.health -= monster.damage;
    this.hp.decrease(this.health);

    //controls how far and for how long the bounce happens
    this.scene.time.delayedCall(300, () => {
      this.hasBeenHit = false;
      hitAnim.stop();
      this.clearTint();
    });
  }
  static loadSprite(scene) {
    scene.load.spritesheet(assets.FIREMAN_KEY, assets.FIREMAN_URL, {
      frameWidth: 50,
      frameHeight: 61,
    });
  }

  createTexture() {
    //keep these incase there's a switch to elemental.png
    // this.setTexture(assets.FIREMAN_KEY, 4);
    this.setTexture(assets.FIREMAN_KEY, 1);
  }
}

export default Fireman;
