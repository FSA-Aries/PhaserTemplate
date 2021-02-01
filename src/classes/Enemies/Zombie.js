import Phaser from "phaser";

const ZOMBIE_KEY = "zombie";

export default class Zombie extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, type, player) {
    super(scene, x, y, key, type);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.zombie = this.scene.physics.add.sprite(x, y, key);
    this.player = player;
    this.init();
    this.initEvents();
  }

  init() {
    this.zombie.setCollideWorldBounds(true);
    this.zombie.anims.create({
      key: "zombie-idleFront",
      frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
    this.zombie.anims.create({
      key: "zombie-left",
      frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
    }),
      this.zombie.anims.create({
        key: "zombie-right",
        frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
          start: 6,
          end: 8,
        }),
        frameRate: 10,
      }),
      this.zombie.anims.create({
        key: "zombie-idleBack",
        frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
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
    if (Phaser.Math.Distance.BetweenPoints(this.player, this.zombie) < 400) {
      if (
        Math.abs(this.zombie.x - this.player.x) >
        Math.abs(this.zombie.y - this.player.y)
      ) {
        if (this.player.x < this.zombie.x) {
          this.zombie.setVelocityX(-50);
          this.zombie.anims.play("zombie-left", true);
        } else {
          this.zombie.setVelocityX(50);
          this.zombie.anims.play("zombie-right", true);
        }
      } else {
        if (this.player.y < this.zombie.y) {
          this.zombie.setVelocityY(-50);
          this.zombie.anims.play("zombie-idleBack", true);
        } else {
          this.zombie.setVelocityY(50);
          this.zombie.anims.play("zombie-idleFront", true);
        }
      }
    }
  }
}
