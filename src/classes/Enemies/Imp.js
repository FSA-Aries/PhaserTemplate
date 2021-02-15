import Phaser from "phaser";
import Enemy from "./Enemy";
const IMP_KEY = "imp";
import assets from "../../../public/assets/index";

export default class Imp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, type, playerGroup, player) {
    super(scene, x, y, key, type, playerGroup);

    this.x = x;
    this.y = y;
    this.scene = scene;
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.player = player;
    this.health = 300;
    this.damage = 50;

    this.init();
    this.initEvents();
    this.playerGroup = playerGroup;
  }

  init() {
    this.setCollideWorldBounds(true);
    this.impAttackSound = this.scene.sound.add("imp-attack", {
      volume: 0.8,
    });

    this.anims.create({
      key: "imp-idleFront",
      frames: this.anims.generateFrameNumbers(assets.IMP_KEY, {
        start: 8,
        end: 11,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "imp-left",
      frames: this.anims.generateFrameNumbers(assets.IMP_KEY, {
        start: 4,
        end: 7,
      }),
      frameRate: 10,
    }),
      this.anims.create({
        key: "imp-right",
        frames: this.anims.generateFrameNumbers(IMP_KEY, {
          start: 12,
          end: 15,
        }),
        frameRate: 10,
      }),
      this.anims.create({
        key: "imp-idleBack",
        frames: this.anims.generateFrameNumbers(IMP_KEY, {
          start: 0,
          end: 3,
        }),
        frameRate: 10,
      });
  }
  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  takesHit(damage) {
    if (this.health - damage >= 1) {
      this.health -= damage;
    } else {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);

      this.destroy();
    }
  }

  update() {
    if (!this.active) {
      return;
    }
    if (this.playerGroup !== undefined) {
      this.playerGroup.getChildren().forEach((player) => {
        if (Phaser.Math.Distance.BetweenPoints(player, this) < 2000) {
          if (Math.abs(this.x - player.x) > Math.abs(this.y - player.y)) {
            if (player.x < this.x) {
              this.setVelocityX(-50);
              this.anims.play("imp-left", true);
            } else {
              this.setVelocityX(50);
              this.anims.play("imp-right", true);
            }
          } else {
            if (player.y < this.y) {
              this.setVelocityY(-50);
              this.anims.play("imp-idleBack", true);
            } else {
              this.setVelocityY(50);
              this.anims.play("imp-idleFront", true);
            }
          }
        }
      });
      // }
    } else {
      if (Phaser.Math.Distance.BetweenPoints(this.player, this) < 2000) {
        if (
          Math.abs(this.x - this.player.x) > Math.abs(this.y - this.player.y)
        ) {
          if (this.player.x < this.x) {
            this.setVelocityX(-50);
            this.anims.play("imp-left", true);
          } else {
            this.setVelocityX(50);
            this.anims.play("imp-right", true);
          }
        } else {
          if (this.player.y < this.y) {
            this.setVelocityY(-50);
            this.anims.play("imp-idleBack", true);
          } else {
            this.setVelocityY(50);
            this.anims.play("imp-idleFront", true);
          }
        }
      }
    }

    if (this.health <= 0) {
      this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);

      this.destroy();
    }
  }
}
