import Phaser from "phaser";
import assets from "../../public/assets";
import HealthBar from "../hud/healthbar";
import { config } from "../main";
import EventEmmiter from "../events/Emitter";

class Fumiko extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physics.world.enable(this);
    this.cursors = undefined;
    this.playerId = undefined;
    this.hidden = false;

    this.damage = 100;
    this.x = x;
    this.y = y;

    this.init();
    this.initEvents();
  }

  init() {
    this.hasBeenHit = false;
    this.bounceVelocity = 250;
    this.setCollideWorldBounds(true);
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });
    this.health = 75;

    this.hp = new HealthBar(
      this.scene,
      config.leftTopCorner.x + 5,
      config.leftTopCorner.y + 5,
      3,
      this.health
    );

    this.anims.create({
      key: "left",
      frames: [
        { key: assets.FUMIKO_LEFT1_KEY },
        { key: assets.FUMIKO_LEFT2_KEY },
        { key: assets.FUMIKO_LEFT3_KEY },
        { key: assets.FUMIKO_LEFT4_KEY },
      ],
      frameRate: 10,
    });

    this.anims.create({
      key: "right",
      frames: [
        { key: assets.FUMIKO_RIGHT1_KEY },
        { key: assets.FUMIKO_RIGHT2_KEY },
        { key: assets.FUMIKO_RIGHT3_KEY },
        { key: assets.FUMIKO_RIGHT4_KEY },
      ],
      frameRate: 10,
    });
    this.anims.create({
      key: "up",
      frames: [
        { key: assets.FUMIKO_UP1_KEY },
        { key: assets.FUMIKO_UP2_KEY },
        { key: assets.FUMIKO_UP3_KEY },
        { key: assets.FUMIKO_UP4_KEY },
      ],
      frameRate: 10,
    });
    this.anims.create({
      key: "down",
      frames: [
        { key: assets.FUMIKO_DOWN1_KEY },
        { key: assets.FUMIKO_DOWN2_KEY },
        { key: assets.FUMIKO_DOWN3_KEY },
        { key: assets.FUMIKO_DOWN4_KEY },
      ],
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

    if (this.cursors.left.isDown) {
      this.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(300);
    }
    if (this.cursors.up.isDown) {
      this.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(300);
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

      if (this.anims.getName() === "left") {
        this.setTexture(assets.FUMIKO_LEFT1_KEY, 0);
      } else if (this.anims.getName() === "right") {
        this.setTexture(assets.FUMIKO_RIGHT1_KEY, 0);
      } else if (this.anims.getName() === "up") {
        this.setTexture(assets.FUMIKO_UP1_KEY, 0);
      } else if (this.anims.getName() === "down") {
        this.setTexture(assets.FUMIKO_DOWN1_KEY, 0);
      }
    }

    if (this.cursors.shift.isDown) {
      if (this.hidden === false) {
        console.log('hidden:', this.hidden)
        this.ability();
        this.scene.time.addEvent({
          delay: 3000,
          callback: () => {
            this.hidden = false;
            this.body.checkCollision.none = false;
            this.setAlpha(1)
          }
        })
      }
    }
  }

  ability() {
    this.hidden = true;
    this.body.checkCollision.none = true
    this.setAlpha(.5)

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

  static loadSprite(scene) {
    scene.load.image(assets.FUMIKO_UP1_KEY, assets.FUMIKO_UP1_URL);
    scene.load.image(assets.FUMIKO_UP2_KEY, assets.FUMIKO_UP2_URL);
    scene.load.image(assets.FUMIKO_UP3_KEY, assets.FUMIKO_UP3_URL);
    scene.load.image(assets.FUMIKO_UP4_KEY, assets.FUMIKO_UP4_URL);

    scene.load.image(assets.FUMIKO_DOWN1_KEY, assets.FUMIKO_DOWN1_URL);
    scene.load.image(assets.FUMIKO_DOWN2_KEY, assets.FUMIKO_DOWN2_URL);
    scene.load.image(assets.FUMIKO_DOWN3_KEY, assets.FUMIKO_DOWN3_URL);
    scene.load.image(assets.FUMIKO_DOWN4_KEY, assets.FUMIKO_DOWN4_URL);

    scene.load.image(assets.FUMIKO_LEFT1_KEY, assets.FUMIKO_LEFT1_URL);
    scene.load.image(assets.FUMIKO_LEFT2_KEY, assets.FUMIKO_LEFT2_URL);
    scene.load.image(assets.FUMIKO_LEFT3_KEY, assets.FUMIKO_LEFT3_URL);
    scene.load.image(assets.FUMIKO_LEFT4_KEY, assets.FUMIKO_LEFT4_URL);

    scene.load.image(assets.FUMIKO_RIGHT1_KEY, assets.FUMIKO_RIGHT1_URL);
    scene.load.image(assets.FUMIKO_RIGHT2_KEY, assets.FUMIKO_RIGHT2_URL);
    scene.load.image(assets.FUMIKO_RIGHT3_KEY, assets.FUMIKO_RIGHT3_URL);
    scene.load.image(assets.FUMIKO_RIGHT4_KEY, assets.FUMIKO_RIGHT4_URL);
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

  createTexture() {
    this.setTexture(assets.FUMIKO_DOWN1_KEY, 0).setBodySize(22, 46, false);
  }
}

export default Fumiko;
