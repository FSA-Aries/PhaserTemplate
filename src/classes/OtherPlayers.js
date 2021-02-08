import Phaser from "phaser";
import assets from "../../public/assets";
import HealthBar from "../hud/healthbar";
import { config } from "../main";
import EventEmmiter from "../events/Emitter";

class OtherPlayerSprite extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.physics.world.enable(this);
    this.playerId = undefined;

    //Mixins
    this.damage = 50;
    this.x = x;
    this.y = y;

    this.init();
    this.initEvents();
    this.oldPosition = { x: this.x, y: this.y };
  }

  init() {
    this.hasBeenHit = false;
    this.bounceVelocity = 250;
    this.setCollideWorldBounds(true);
    this.health = 100;

    this.hp = new HealthBar(
      this.scene,
      config.rightTopCorner.x - 5,
      config.rightTopCorner.y - 5,
      3,
      this.health
    );

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
    if (this.hasBeenHit || !this.body) {
      return;
    }
    // var x = this.x;
    // var y = this.y;
    // if (x !== this.oldPosition.x || y !== this.oldPosition.y)
    //   this.moving = true;
    // socket.emit("playerMovement", {
    //   x: this.x,
    //   y: this.y,
    // });

    // this.oldPosition = {
    //   x: this.x,
    //   y: this.y,
    //   rotation: this.rotation,
    // };
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
    if (this.health <= 0) {
      EventEmmiter.emit("PLAYER_LOSE");
      return;
    }
    // this.body.checkCollision.none = true; ????
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

    // this.scene.time.addEvent({
    //   //controls how far and for how long the bounce happens
    //   delay: 250,
    //   callback: () => {
    //     this.hasBeenHit = false;
    //   },
    //   loop: false,
    // });
  }
  // bounceBack(monster) {
  //   // 1) Animation that we play
  //   // 2) The velocity that moves
  //   let direction;
  //   if (this.body.touching.right) {
  //     direction = "right";
  //   } else if (this.body.touching.left) {
  //     direction = "left";
  //   } else if (this.body.touching.up) {
  //     direction = "up";
  //   } else if (this.body.touching.down) {
  //     direction = "down";
  //   }

  //   console.log("DIRECTION ->", direction);
  //   console.log("VELOCITY ->", this.body.velocity);
  //   if (direction === "left") {
  //     // this.anims.play("right", true);
  //     this.setVelocityX(-600);
  //   } else if (direction === "right") {
  //     // this.anims.play("left", true);
  //     this.setVelocityX(600);
  //   } else if (direction === "up") {
  //     // this.anims.play("down", true);
  //     this.setVelocityY(-600);
  //   } else if (direction === "down") {
  //     // this.anims.play("up", true);
  //     this.setVelocityY(600);
  //   }
  // }
}

export default OtherPlayerSprite;
