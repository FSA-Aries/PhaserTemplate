import Phaser from "phaser";
import assets from "../../public/assets";
import HealthBar from "../hud/healthbar";
import { config } from "../main";
import EventEmmiter from "../events/Emitter";

class Smol extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physics.world.enable(this);
    this.cursors = undefined;
    this.playerId = undefined;

    this.damage = 50;
    this.x = x;
    this.y = y;

    this.init();
    this.initEvents();
    this.oldPosition = { x: this.x, y: this.y, rotation: this.rotation };
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
    });
    this.health = 25;

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
        { key: assets.SMOL_LEFTSTART_KEY },
        { key: assets.SMOL_LEFTONE_KEY },
        { key: assets.SMOL_LEFTTWO_KEY },
      ],
      frameRate: 10,
    });

    this.anims.create({
      key: "right",
      frames: [
        { key: assets.SMOL_RIGHTSTART_KEY },
        { key: assets.SMOL_RIGHTONE_KEY },
        { key: assets.SMOL_RIGHTTWO_KEY },
      ],
      frameRate: 10,
    });
    this.anims.create({
      key: "up",
      frames: [
        { key: assets.SMOL_RIGHTSTART_KEY },
        { key: assets.SMOL_JUMPONE_KEY },
        { key: assets.SMOL_JUMPTWO_KEY },
      ],
      frameRate: 10,
    });
    this.anims.create({
      key: "down",
      frames: [
        { key: assets.SMOL_RIGHTSTART_KEY },
        { key: assets.SMOL_JUMPONE_KEY },
        { key: assets.SMOL_JUMPTWO_KEY },
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

      if (prevVelocity.x < 0) this.setTexture(assets.PLAYER_KEY, 0);
      else if (prevVelocity.x > 0) this.setTexture(assets.PLAYER_KEY, 0);
      else if (prevVelocity.y < 0) this.setTexture(assets.PLAYER_KEY, 0);
      else if (prevVelocity.y > 0) this.setTexture(assets.PLAYER_KEY, 0);
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
    scene.load.image(assets.SMOL_LEFTSTART_KEY, assets.SMOL_LEFTSTART_URL);
    scene.load.image(assets.SMOL_LEFTONE_KEY, assets.SMOL_LEFTONE_URL);
    scene.load.image(assets.SMOL_LEFTTWO_KEY, assets.SMOL_LEFTTWO_URL);
    scene.load.image(assets.SMOL_RIGHTSTART_KEY, assets.SMOL_RIGHTSTART_URL);
    scene.load.image(assets.SMOL_RIGHTONE_KEY, assets.SMOL_RIGHTONE_URL);
    scene.load.image(assets.SMOL_RIGHTTWO_KEY, assets.SMOL_RIGHTTWO_URL);
    scene.load.image(assets.SMOL_JUMPONE_KEY, assets.SMOL_JUMPONE_URL);
    scene.load.image(assets.SMOL_JUMPTWO_KEY, assets.SMOL_JUMPTWO_URL);
  }

  createTexture() {
    this.setTexture(assets.SMOL_RIGHTSTART_KEY, 0).setBodySize(12, 12, true);
  }
}

export default Smol;
