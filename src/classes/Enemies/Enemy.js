import Phaser from 'phaser';

const ZOMBIE_KEY = 'zombie';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, type, player) {
    super(scene, x, y, key, type);
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.player = player;
    this.health = 30;
    this.damage = 27;

    this.init();
    this.initEvents();
  }

  init() {
    this.setCollideWorldBounds(true);

    this.anims.create({
      key: 'zombie-idleFront',
      frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: 'zombie-left',
      frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
    }),
      this.anims.create({
        key: 'zombie-right',
        frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
          start: 6,
          end: 8,
        }),
        frameRate: 10,
      }),
      this.anims.create({
        key: 'zombie-idleBack',
        frames: this.anims.generateFrameNumbers(ZOMBIE_KEY, {
          start: 9,
          end: 11,
        }),
        frameRate: 10,
      });
    this.setImmovable(true);
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  takesHit(damage) {
    if (this.health > 0) {
      this.health -= damage;
    }
  }

  update() {
    if (!this.active) {
      return;
    }
    if (Phaser.Math.Distance.BetweenPoints(this.player, this) < 800) {
      if (Math.abs(this.x - this.player.x) > Math.abs(this.y - this.player.y)) {
        if (this.player.x < this.x) {
          this.setVelocityX(-50);
          this.anims.play('zombie-left', true);
        } else {
          this.setVelocityX(50);
          this.anims.play('zombie-right', true);
        }
      } else {
        if (this.player.y < this.y) {
          this.setVelocityY(-50);
          this.anims.play('zombie-idleBack', true);
        } else {
          this.setVelocityY(50);
          this.anims.play('zombie-idleFront', true);
        }
      }
    }
    if (this.health <= 0) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      this.destroy();
    }
  }
}
