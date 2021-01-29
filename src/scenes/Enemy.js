import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, type) {
    super(scene, x, y, key, type);
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.enemy = this.scene.physics.add.sprite(x, y, "enemy");
  }
  // update(){
  //   this.enemy.outOfBoundsKill = true;
  //   if (this.game.physics.arcade.distanceBetween(this.enemy, this.enemy) < 400) {
  //     if(this.pe.x < this.enemy.x && this.enemy.body.velocity.x >= 0) {
  //       this.enemy.body.velocity
  //     }
  //   }
  // }
}
