import Phaser from "phaser";
import { getEnemyTypes } from "../../types";
import Enemy from "./Enemy";
const ZOMBIE_KEY = "zombie";

export default class Zombie extends Enemy {
  constructor(scene, x, y, key, type, player) {
    super(scene, x, y, key, type, player);

    this.health = 30;
    this.damage = 27;

    this.init();
  }

  ENEMY_KEY(monster) {
    let x = getEnemyTypes()[monster].toLowerCase();
    return x;
  }

  init() {
    this.zombieAttackSound = this.scene.sound.add("zombie-attack", {
      volume: 0.2,
    });

    this.anims.create({
      key: "zombie-idleFront",
      frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "zombie-left",
      frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
    }),
      this.anims.create({
        key: "zombie-right",
        frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
          start: 6,
          end: 8,
        }),
        frameRate: 10,
      }),
      this.anims.create({
        key: "zombie-idleBack",
        frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
          start: 9,
          end: 11,
        }),
        frameRate: 10,
      });
  }

  update() {
    //Use A* search algo or Pathfinder algo to find shortest distance

    if (!this.active) {
      return;
    }
    if (Phaser.Math.Distance.BetweenPoints(this.player, this) < 400) {
      if (Math.abs(this.x - this.player.x) > Math.abs(this.y - this.player.y)) {
        if (this.player.x < this.x) {
          this.setVelocityX(-50);
          this.anims.play("zombie-left", true);
        } else {
          this.setVelocityX(50);
          this.anims.play("zombie-right", true);
        }
      } else {
        if (this.player.y < this.y) {
          this.setVelocityY(-50);
          this.anims.play("zombie-idleBack", true);
        } else {
          this.setVelocityY(50);
          this.anims.play("zombie-idleFront", true);
        }
      }
    }

    if (this.health <= 0) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);

      this.destroy();
    }
  }
}
