import Phaser from "phaser";
// import { getEnemyTypes } from "../../types";
import Enemy from "./Enemy";
const ZOMBIE_KEY = "zombie";

export default class Zombie extends Enemy {
  constructor(scene, x, y, key, type, playerGroup, player) {
    super(scene, x, y, key, type, playerGroup);

    this.health = 30;
    this.damage = 25;
    this.init();
    this.player = player;
    this.playerGroup = playerGroup;
  }

  ENEMY_KEY(monster) {
    let x = getEnemyTypes()[monster].toLowerCase();
    return x;
  }

  init() {
    this.setCollideWorldBounds(true);
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

    if (this.playerGroup) {
      this.playerGroup.getChildren().forEach((player) => {
        if (Phaser.Math.Distance.BetweenPoints(player, this) < 2000) {
          if (Math.abs(this.x - player.x) > Math.abs(this.y - player.y)) {
            if (player.x < this.x) {
              this.setVelocityX(-50);
              this.anims.play("zombie-left", true);
            } else {
              this.setVelocityX(50);
              this.anims.play("zombie-right", true);
            }
          } else {
            if (player.y < this.y) {
              this.setVelocityY(-50);
              this.anims.play("zombie-idleBack", true);
            } else {
              this.setVelocityY(50);
              this.anims.play("zombie-idleFront", true);
            }
          }
        }
      });
      // }
    } else {
      if (Phaser.Math.Distance.BetweenPoints(this.player, this) < 2000) {
        if (
          Math.abs(this.x - this.player.x) > Math.abs(this.y - this.player.y)
        ) {
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
    });
    // }

    if (this.health <= 0) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);

      this.destroy();
    }
  }
}
