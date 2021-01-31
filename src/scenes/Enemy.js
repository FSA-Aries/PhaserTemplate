import Phaser from "phaser";

const ENEMY_KEY = "enemy";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, type, player) {
    super(scene, x, y, key, type);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.enemy = this.scene.physics.add.sprite(x, y, key);
    this.player = player;
    this.init();
    this.update();
  }
  init() {
    this.enemy.setCollideWorldBounds(true);
    this.enemy.anims.create({
      key: "zombie-idleFront",
      frames: this.anims.generateFrameNumbers(ENEMY_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      repeat: -1,
    });
    this.enemy.anims.create({
      key: "zombie-left",
      frames: this.anims.generateFrameNumbers(ENEMY_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    }),
      this.enemy.anims.create({
        key: "zombie-right",
        frames: this.anims.generateFrameNumbers(ENEMY_KEY, {
          start: 6,
          end: 8,
        }),
        frameRate: 10,
        repeat: -1,
      }),
      this.enemy.anims.create({
        key: "zombie-idleBack",
        frames: this.anims.generateFrameNumbers(ENEMY_KEY, {
          start: 9,
          end: 11,
        }),
        frameRate: 10,
        repeat: -1,
      });
  }
  update() {
    //Use A* search algo or Pathfinder algo to find shortest distance
    if (Phaser.Math.Distance.BetweenPoints(this.player, this.enemy) < 400) {
      if (this.player.x < this.enemy.x) {
        this.enemy.setVelocityX(-50);
        this.enemy.anims.play("zombie-left", true);
      } else {
        this.enemy.setVelocityX(50);
        this.enemy.anims.play("zombie-right", true);
      }
      if (this.player.y < this.enemy.y) {
        this.enemy.setVelocityY(-50);
        this.enemy.anims.play("zombie-idleBack", true);
      } else {
        this.enemy.setVelocityY(50);
        this.enemy.anims.play("zombie-idleFront", true);
      }
    }
  }
}
