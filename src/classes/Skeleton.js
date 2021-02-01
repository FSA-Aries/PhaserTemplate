import Phaser from "phaser";

const SKELETON_KEY = "skeleton";

export default class Skeleton extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, type, player) {
    super(scene, x, y, key, type);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.skeleton = this.scene.physics.add.sprite(x, y, key);
    this.player = player;
    this.init();
    this.initEvents();
  }

  init() {
    this.skeleton.setCollideWorldBounds(true);
    this.skeleton.anims.create({
      key: "skeleton-idleFront",
      frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
    this.skeleton.anims.create({
      key: "skeleton-left",
      frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
    }),
      this.skeleton.anims.create({
        key: "skeleton-right",
        frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
          start: 6,
          end: 8,
        }),
        frameRate: 10,
      }),
      this.skeleton.anims.create({
        key: "skeleton-idleBack",
        frames: this.anims.generateFrameNumbers(SKELETON_KEY, {
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
    //Use A* search algo or Pathfinder algo to find shortest distance
    if (Phaser.Math.Distance.BetweenPoints(this.player, this.skeleton) < 400) {
      if (
        Math.abs(this.skeleton.x - this.player.x) >
        Math.abs(this.skeleton.y - this.player.y)
      ) {
        if (this.player.x < this.skeleton.x) {
          this.skeleton.setVelocityX(-50);
          this.skeleton.anims.play("skeleton-left", true);
        } else {
          this.skeleton.setVelocityX(50);
          this.skeleton.anims.play("skeleton-right", true);
        }
      } else {
        if (this.player.y < this.skeleton.y) {
          this.skeleton.setVelocityY(-50);
          this.skeleton.anims.play("skeleton-idleBack", true);
        } else {
          this.skeleton.setVelocityY(50);
          this.skeleton.anims.play("skeleton-idleFront", true);
        }
      }
    }
  }
}
