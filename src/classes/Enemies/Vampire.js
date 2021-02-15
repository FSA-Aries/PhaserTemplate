import Phaser from "phaser";
// import { getEnemyTypes } from "../../types";
import Enemy from "./Enemy";
const VAMPIRE_KEY = "vampire";

export default class Vampire extends Enemy {
  constructor(scene, x, y, key, type, player) {
    super(scene, x, y, key, type);

    this.health = 400;
    this.damage = 75;
    this.init();
    this.player = player;
  }

  init() {
    this.setCollideWorldBounds(true);
    this.vampireAttackSound = this.scene.sound.add("vampire-attack", {
      volume: 0.35,
    });

    this.anims.create({
      key: "vampire-down",
      frames: this.anims.generateFrameNumbers(VAMPIRE_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "vampire-left",
      frames: this.anims.generateFrameNumbers(VAMPIRE_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
    }),
      this.anims.create({
        key: "vampire-right",
        frames: this.anims.generateFrameNumbers(VAMPIRE_KEY, {
          start: 6,
          end: 8,
        }),
        frameRate: 10,
      }),
      this.anims.create({
        key: "vampire-up",
        frames: this.anims.generateFrameNumbers(VAMPIRE_KEY, {
          start: 9,
          end: 11,
        }),
        frameRate: 10,
      });
    this.anims.create({
      key: "vampire-taunt",
      frames: this.anims.generateFrameNumbers(VAMPIRE_KEY, {
        start: 12,
        end: 23,
      }),
    });
  }

  takesHit(damage) {
    if (this.health - damage >= 1) {
      this.health -= damage;
    } else {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);

      this.destroy();
    }
  }

  update() {
    if (!this.active) {
      return;
    }

    if (Phaser.Math.Distance.BetweenPoints(this.player, this) < 500) {
      if (Math.abs(this.x - this.player.x) > Math.abs(this.y - this.player.y)) {
        if (this.player.x < this.x) {
          this.setVelocityX(-200);
          this.anims.play("vampire-left", true);
        } else {
          this.setVelocityX(200);
          this.anims.play("vampire-right", true);
        }
      } else {
        if (this.player.y < this.y) {
          this.setVelocityY(-200);
          this.anims.play("vampire-up", true);
        } else {
          this.setVelocityY(200);
          this.anims.play("vampire-down", true);
        }
      }
    } else {
      this.anims.play("vampire-taunt", true);
    }

    if (this.health <= 0) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);

      this.destroy();
    }
  }
}
