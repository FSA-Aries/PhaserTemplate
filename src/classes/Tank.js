import Phaser from "phaser";
import assets from "../../public/assets";
import HealthBar from "../hud/healthbar";
import { config } from "../main";
import EventEmmiter from "../events/Emitter";

class Tank extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physics.world.enable(this);
    this.cursors = undefined;
    this.playerId = undefined;
    this.usingAbility = false;
    this.abilityCounter = 0;
    this.damage = 50;
    this.x = x;
    this.y = y;

    this.init();
    this.initEvents();
    this.oldPosition = { x: this.x, y: this.y, rotation: this.rotation };
  }

  init() {
    this.setBodySize(60, 90, false);
    this.hasBeenHit = false;
    this.hasBeenHealed = false;
    this.bounceVelocity = 50;
    this.setCollideWorldBounds(true);
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.cursors = this.scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });
    this.health = 500;

    this.hp = new HealthBar(
      this.scene,
      config.leftTopCorner.x + 5,
      config.leftTopCorner.y + 5,
      3,
      this.health
    );

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers(assets.TANK_KEY, {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(assets.TANK_KEY, {
        start: 6,
        end: 11,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(assets.TANK_KEY, {
        start: 12,
        end: 17,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers(assets.TANK_KEY, {
        start: 18,
        end: 23,
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

      if (prevVelocity.x < 0) this.setTexture(assets.PLAYER_KEY, 4);
      else if (prevVelocity.x > 0) this.setTexture(assets.PLAYER_KEY, 8);
      else if (prevVelocity.y < 0) this.setTexture(assets.PLAYER_KEY, 10);
      else if (prevVelocity.y > 0) this.setTexture(assets.PLAYER_KEY, 1);
    }
    if (this.scene.input.keyboard.checkDown(this.cursors.shift, 9000)) {

      this.abilityCounter++;
    }
  }

  ability() {
    if (this.hasBeenHealed) {
      return
    }
    this.hasBeenHealed = true;
    this.health += 100
    if (this.health > 600) {
      this.health = 600
    }
    this.hp.increase(this.health);
    this.scene.sound.add(assets.TANKSKILL_KEY, {
      loop: false,
      volume: 0.3
    }).play();
    let healAnim = this.playHealTween();
    this.scene.time.delayedCall(300, () => {
      this.hasBeenHealed = false;
      healAnim.stop();
      this.clearTint();
    });

  }

  playDamageTween() {
    return this.scene.tweens.add({
      targets: this,
      duration: 100,
      repeat: -1,
      tint: 0xffffff,
    });
  }

  playHealTween() {
    return this.scene.tweens.add({
      targets: this,
      duration: 100,
      repeat: -1,
      tint: 0x228B22



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
    scene.load.spritesheet(assets.TANK_KEY, assets.TANK_URL, {
      frameWidth: 61,
      frameHeight: 86.75,
    });
  }

  createTexture() {
    this.setTexture(assets.TANK_KEY, 1);
  }
}

export default Tank;
