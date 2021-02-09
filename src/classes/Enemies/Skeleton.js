import Phaser from "phaser";
import Enemy from "./Enemy";

const SKELETON_KEY = "skeleton";

//set this to just skeleton

export default class Skeleton extends Enemy {
  constructor(scene, x, y, key, type, player) {
    super(scene, x, y, key, type, player);
    //100
    this.damage = 100;
    this.health = 50;
    this.init();
  }

  init() {
    this.anims.create({
      key: "skeleton-idleFront",
      frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "skeleton-left",
      frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
    }),
      this.anims.create({
        key: "skeleton-right",
        frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
          start: 6,
          end: 8,
        }),
        frameRate: 10,
      }),
      this.anims.create({
        key: "skeleton-idleBack",
        frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
          start: 9,
          end: 11,
        }),
        frameRate: 10,
      });
    this.anims.create({
      key: "skeletonHit",
      frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
        start: 12,
        end: 14,
      }),
      frameRate: 10,
    });
  }

  update() {
    if (!this.active) {
      return;
    }
    if (Phaser.Math.Distance.BetweenPoints(this.player, this) < 2000) {
      if (Math.abs(this.x - this.player.x) > Math.abs(this.y - this.player.y)) {
        if (this.player.x < this.x) {
          this.setVelocityX(-50);
          this.anims.play("skeleton-left", true);
          //Add skeletonhit for now for demo purposes but revert back to above after
          //this.anims.play("skeletonHit", true);
        } else {
          this.setVelocityX(50);
          this.anims.play("skeleton-right", true);
        }
      } else {
        if (this.player.y < this.y) {
          this.setVelocityY(-50);
          this.anims.play("skeleton-idleBack", true);
        } else {
          this.setVelocityY(50);
          this.anims.play("skeleton-idleFront", true);
        }
      }
    }

    if (this.health <= 0) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      this.destroy();
    }
  }
}
