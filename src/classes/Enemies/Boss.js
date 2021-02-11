import Phaser from 'phaser';
import Enemy from './Enemy';

const BOSS_KEY = 'boss';
import assets from '../../../public/assets/index';

export default class Boss extends Enemy {
  constructor(scene, x, y, key, type, player) {
    super(scene, x, y, key, type);
    this.x = x;
    this.y = y;
    this.scene = scene;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.player = player;
    this.health = 1000;
    this.damage = 50;

    this.init();
    this.initEvents();
  }

  init() {
    this.setCollideWorldBounds(true);
    this.setBodySize(100, 100, true);

    this.anims.create({
      key: 'boss-idleFront',
      frames: this.anims.generateFrameNumbers(assets.BOSS_KEY, {
        start: 312,
        end: 323,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: 'boss-left',
      frames: this.anims.generateFrameNumbers(assets.BOSS_KEY, {
        start: 385,
        end: 396,
      }),
      frameRate: 10,
    }),
      this.anims.create({
        key: 'boss-right',
        frames: this.anims.generateFrameNumbers(assets.BOSS_KEY, {
          start: 216,
          end: 227,
        }),
        frameRate: 10,
      }),
      this.anims.create({
        key: 'boss-idleBack',
        frames: this.anims.generateFrameNumbers(BOSS_KEY, {
          start: 240,
          end: 251,
        }),
        frameRate: 10,
      });
    this.setImmovable(true);
  }

  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  takesHit(damage) {
    console.log(this.health);
    if (this.health > 0) {
      this.health -= damage;
    }
    const hitAnim = this.playBossTween();

    //controls how far and for how long the bounce happens
    this.scene.time.delayedCall(300, () => {
      hitAnim.stop();
      this.clearTint();
    });
  }

  update() {
    if (!this.active) {
      return;
    }

    if (Phaser.Math.Distance.BetweenPoints(this.player, this) < 400) {
      if (Math.abs(this.x - this.player.x) > Math.abs(this.y - this.player.y)) {
        if (this.player.x < this.x) {
          this.setVelocityX(-50);
          this.anims.play('boss-left', true);
        } else {
          this.setVelocityX(50);
          this.anims.play('boss-right', true);
        }
      } else {
        if (this.player.y < this.y) {
          this.setVelocityY(-50);
          this.anims.play('boss-idleBack', true);
        } else {
          this.setVelocityY(50);
          this.anims.play('boss-idleFront', true);
        }
      }
    }

    if (this.health <= 0) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
      this.destroy();
    }
  }

  playBossTween() {
    return this.scene.tweens.add({
      targets: this,
      duration: 100,
      repeat: -1,
      tint: 0xff0000,
    });
  }

  // takesHit(damage) {
  //   if (this.health > 0) {
  //     if (this.hasBeenHit) {
  //       return;
  //     }
  //     this.health -= damage;
  //     this.hasBeenHit = true;
  //     const hitAnim = this.playBossTween();

  //     //controls how far and for how long the bounce happens
  //     this.scene.time.delayedCall(300, () => {
  //       this.hasBeenHit = false;
  //       hitAnim.stop();
  //       this.clearTint();
  //     });
  //   }
  // }
}
