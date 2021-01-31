import Phaser from "phaser";

const ENEMY_KEY = "enemy";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, type) {
    super(scene, x, y, key, type);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.enemy = this.scene.physics.add.sprite(x, y, key);
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
    });
    this.enemy.anims.create({
      key: "zombie-right",
      frames: this.anims.generateFrameNumbers(ENEMY_KEY, {
        start: 6,
        end: 8,
      }),
    });
    this.enemy.anims.create({
      key: "zombie-idleBack",
      frames: this.anims.generateFrameNumbers(ENEMY_KEY, {
        start: 9,
        end: 11,
      }),
    });
  }
  update() {
    this.enemy.anims.play("zombie-idleFront");
  }

  // //   this.enemy.outOfBoundsKill = true;
  // //   if (this.game.physics.arcade.distanceBetween(this.enemy, this.enemy) < 400) {
  // //     if(this.pe.x < this.enemy.x && this.enemy.body.velocity.x >= 0) {
  // //       this.enemy.body.velocity
  // //     }
  // //   }
  // }
}
