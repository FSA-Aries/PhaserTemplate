import Phaser from "phaser";

export default class TankAtk extends Phaser.Physics.Arcade.Sprite {
  // Bullet Constructor
  constructor(scene) {
    super(scene, 0, 0, "axe");
    //Phaser.GameObjects.Image.call(this, scene, 0, 0, 'bullet');
    this.speed = 1;
    this.born = 0;
    this.direction = 0;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.damage = 15;

    //this.setSize(12, 12, true);
  }

  //Fires a bullet from the player to the reticle
  fire(shooter, target) {
    this.setPosition(shooter.x, shooter.y); // Initial position
    this.direction = Math.atan((target.x - this.x) / (target.y - this.y));
    //Calculate X and y velocity of bullet to moves it from shooter to target
    if (target.y >= this.y) {
      this.xSpeed = this.speed * Math.sin(this.direction);
      this.ySpeed = this.speed * Math.cos(this.direction);
    } else {
      this.xSpeed = -this.speed * Math.sin(this.direction);
      this.ySpeed = -this.speed * Math.cos(this.direction);
    }
    this.setVelocity(this.xSpeed * 1000, this.ySpeed * 1000);
    this.rotation = shooter.rotation; // angle bullet with shooters rotation
    this.born = 0; // Time since new bullet spawned
  }

  /*fire: function (shooter, target)
{
    this.setPosition(shooter.x, shooter.y); // Initial position

    // Calculate X and y velocity of bullet to moves it from shooter to target
    ...

    // set bullet's velocity
    // a factor of 1000 seems to be similar to the example you gave
    // you should probably omit that and edit this.speed in the constructor instead
    this.setVelocity(this.xSpeed * 1000, this.ySpeed * 1000);

    this.rotation = shooter.rotation; // angle bullet with shooters rotation
    th
 */
  hitsEnemy(target) {
    //target.setActive(false).setVisible(false);
    target.takesHit(this.damage);
    //target.destroyEvents();
    console.log(target.health);

    this.destroy();

    //target.destroy();
  }

  // Updates the position of the bullet each cycle
  update(time, delta) {
    //this.x += this.xSpeed * delta;
    //this.y += this.ySpeed * delta;
    this.born += delta;
    if (this.born > 1800) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}
