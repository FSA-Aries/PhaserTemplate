import Phaser from "phaser";

export default class Flame extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene, 0, 0, "fireKey");

        this.speed = 1;
        this.born = 0;
        this.direction = 0;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.damage = 20;
    }


    flameHit(target) {
        target.takesHit(this.damage);

    }

    setDamage(damage) {
        this.damage = damage;
    }

    // Updates the position of the bullet each cycle
    update() { }
}