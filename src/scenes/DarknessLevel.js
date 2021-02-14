import Phaser from "phaser";
import Zombie from "../classes/Enemies/Zombie.js";
import Skeleton from "../classes/Enemies/Skeleton.js";
import Boss from "../classes/Enemies/Boss";

import Player from "../classes/Player";
import Bullet from "../classes/Bullet";
import assets from "../../public/assets";
import socket from "../socket/index.js";
import Score from "../hud/score";

import EventEmitter from "../events/Emitter";
import { config } from "../main";

export default class DarknessLevel extends Phaser.Scene {
  constructor() {
    super("darkness-level");
    this.selectedCharacter = undefined;
    this.player = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    //Setup Sockets
    this.socket = socket;
    this.name = "darkness-level";
  }

  init(data) {
    this.selectedCharacter = data.character;
  }

  ///// PRELOAD /////
  preload() {
    this.load.audio("intro", "assets/audio/Intro.mp3");

    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();

    this.load.image(assets.SOUND_OFF_KEY, assets.SOUND_OFF_URL);
    this.load.image(assets.SOUND_ON_KEY, assets.SOUND_ON_URL);

    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
    this.load.image(assets.DARKSET_KEY, assets.DARKSET_URL);
    this.load.tilemapTiledJSON(assets.DARKMAP_KEY, assets.DARKMAP_URL);

    this.selectedCharacter.loadSprite(this);

    this.load.audio(
      "zombie-attack",
      "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
    );

    //Enemies
    this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
      frameWidth: 30,
      frameHeight: 62.5,
    });
    this.load.spritesheet(assets.SKELETON_KEY, assets.SKELETON_URL, {
      frameWidth: 30,
      frameHeight: 64,
    });
    this.load.spritesheet(assets.BOSS_KEY, assets.BOSS_URL, {
      frameWidth: 256,
      frameHeight: 256,
    });
  }

  ///// CREATE /////
  create({ gameStatus }) {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    let map = this.make.tilemap({ key: assets.DARKMAP_KEY });
    let tileSet = map.addTilesetImage("darkness", assets.DARKSET_KEY);

    map.createLayer("Floor", tileSet, 0, 0);
    let darkness = map.createLayer("Collision", tileSet, 0, 0);
    darkness.setCollisionByExclusion([-1]);

    this.player = this.createPlayer(this, { x: 200, y: 300 });

    this.physics.add.collider(this.player, darkness);

    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      this.getScore()
    );

    this.createSoundButton(
      config.rightTopCorner.x - 20,
      config.rightTopCorner.y + 20
    ).setScale(0.07, 0.07);

    //Zombie and Skeleton Groups
    let zombieGroup = this.physics.add.group();
    let skeletonGroup = this.physics.add.group();
    let bossGroup = this.physics.add.group();

    this.zombieGroup = zombieGroup;

    // Enemy Creation

    let boss = this.createBoss();
    boss.setScale(0.75, 0.75);
    bossGroup.add(boss);

    this.physics.add.collider(this.player, zombieGroup, this.onPlayerCollision);

    this.physics.add.collider(
      this.player,
      skeletonGroup,
      this.onPlayerCollision
    );

    this.physics.add.collider(this.player, bossGroup, this.onPlayerCollision);
    this.physics.add.collider(skeletonGroup, bossGroup);
    this.physics.add.collider(zombieGroup, bossGroup);
    this.physics.add.collider(zombieGroup, skeletonGroup, null);
    this.physics.add.collider(zombieGroup, zombieGroup, null);
    this.physics.add.collider(skeletonGroup, skeletonGroup, null);
    this.physics.add.collider(zombieGroup, darkness);
    this.physics.add.collider(skeletonGroup, darkness);
    this.physics.add.collider(bossGroup, darkness);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors = this.input.keyboard.addKeys({
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    });
    let playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.physics.add.collider(
      playerBullets,
      zombieGroup,
      this.onBulletCollision,
      null,
      this
    );
    this.physics.add.collider(
      playerBullets,
      bossGroup,
      this.onBulletCollision,
      null,
      this
    );

    this.physics.add.collider(
      playerBullets,
      skeletonGroup,
      this.onBulletCollision,
      null,
      this
    );

    this.reticle = this.physics.add.sprite(0, 0, assets.RETICLE_KEY);
    this.reticle.setDisplaySize(25, 25).setCollideWorldBounds(true);

    this.input.on(
      "pointerdown",
      function () {
        if (this.player.active === false) return;

        // Get bullet from bullets group
        let bullet = playerBullets.get().setActive(true).setVisible(true);
        bullet.setDamage(this.player.damage);

        if (bullet) {
          bullet.fire(this.player, this.reticle);
        }
      },
      this
    );

    this.setupFollowupCameraOn(this.player);

    this.input.on(
      "pointermove",
      function (pointer) {
        const transformedPoint = this.cameras.main.getWorldPoint(
          pointer.x,
          pointer.y
        );

        this.reticle.x = transformedPoint.x;
        this.reticle.y = transformedPoint.y;
      },
      this
    );

    if (gameStatus === "PLAYER_LOSE") {
      return;
    }
    this.createGameEvents();
  }

  update() {
    if (this.cursors.esc.isDown) {
      this.scene.pause();
      this.scene.launch("pause-scene", { key: this.name });
    }
  }

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION
  createPlayer(player, playerInfo) {
    this.player = new this.selectedCharacter(player, 750, 750);
    this.player.createTexture();
    return this.player;
  }

  getScore() {
    if (this.scene.settings.data.score) {
      return this.scene.settings.data.score;
    } else {
      0;
    }
  }

  setupFollowupCameraOn(player) {
    this.physics.world.setBounds(0, 0, config.width, config.height);

    this.cameras.main
      .setBounds(0, 0, config.width, config.height)
      .setZoom(config.zoomFactor);
    this.cameras.main.startFollow(player);
  }
  createZombie(playerGroup) {
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();
    return new Zombie(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.ZOMBIE_KEY,
      assets.ZOMBIE_URL,
      this.playerGroup,
      this.player
    );
  }
  createBoss(playerGroup) {
    return new Boss(
      this,
      100,
      100,
      assets.BOSS_KEY,
      assets.BOSS_URL,
      this.player
    );
  }
  enemyXSpawn() {
    if (this.player.x > 400) {
      if (this.player.x > 700) {
        return this.player.x / 2 - Math.floor(Math.random() * 301 + 200);
      }
      return this.player.x / 2 - Math.floor(Math.random() * 201 + 100);
    }

    if (this.player.x < 400) {
      if (this.player.x < 100)
        return this.player.x * 2 + Math.floor(Math.random() * 301 + 200);
    }
    return this.player.x * 2 + Math.floor(Math.random() * 201 + 100);
  }

  enemyYSpawn() {
    if (this.player.y > 375) {
      if (this.player.y > 700) {
        return this.player.y / 2 - Math.floor(Math.random() * 301 + 200);
      }
      return this.player.y / 2 - Math.floor(Math.random() * 201 + 100);
    }

    if (this.player.y < 375) {
      if (this.player.y < 100)
        return this.player.y * 2 + Math.floor(Math.random() * 301 + 200);
    }
    return this.player.y * 2 + Math.floor(Math.random() * 201 + 100);
  }

  introText() {
    this.time.addEvent({
      delay: 3000,
      callback: () => {
        let text1 = this.add.text(328, 365, "Welcome To", {
          fontSize: "25px",
          color: "red",
        });
        this.time.addEvent({
          delay: 3000,
          callback: () => {
            text1.destroy();
            let text2 = this.add.text(310, 370, "Senior Phaser", {
              fontSize: "25px",
              color: "red",
            });
            this.time.addEvent({
              delay: 3000,
              callback: () => {
                text2.destroy();
                let text3 = this.add.text(350, 290, "WASD to Move", {
                  fontSize: "25px",
                  color: "red",
                });
                let arrowImage = this.add
                  .image(450, 400, "arrow-keys")
                  .setScale(0.6);
                this.time.addEvent({
                  delay: 2500,
                  callback: () => {
                    text3.destroy();
                    arrowImage.destroy();
                    let mouseImage = this.add
                      .image(430, 400, "left-mouse-click")
                      .setScale(0.4);
                    let text4 = this.add.text(400, 280, "Shoot", {
                      fontSize: "25px",
                      color: "red",
                    });
                    this.zombieGroup.add(this.createZombie());
                    this.time.addEvent({
                      delay: 5000,
                      callback: () => {
                        let createdBy = this.add.text(310, 370, "Created By", {
                          fontSize: "40px",
                          color: "red",
                        });
                        let morgan = this.add.text(40, 40, "Morgan Hu", {
                          fontSize: "35px",
                          color: "red",
                        });
                        let juan = this.add.text(40, 600, "Juan Velazquez", {
                          fontSize: "35px",
                          color: "red",
                        });
                        let kelvin = this.add.text(520, 40, "Kelvin Lin", {
                          fontSize: "35px",
                          color: "red",
                        });
                        let brandon = this.add.text(520, 600, "Brandon Fox", {
                          fontSize: "35px",
                          color: "red",
                        });
                        text4.destroy();
                        mouseImage.destroy();
                        this.time.addEvent({
                          delay: 5000,
                          callback: () => {
                            createdBy.destroy();
                            kelvin.destroy();
                            juan.destroy();
                            brandon.destroy();
                            morgan.destroy();
                          },
                        });
                      },
                    });
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  createSkeleton() {
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();

    return new Skeleton(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.SKELETON_KEY,
      assets.SKELETON_URL,
      this.player
    );
  }

  createGameEvents() {
    EventEmitter.on("PLAYER_LOSE", () => {
      this.scene.start("game-over", { gameStatus: "PLAYER_LOSE" });
    });
  }
  onPlayerCollision(player, monster) {
    player.takesHit(monster);
    if (monster.zombieAttackSound) monster.zombieAttackSound.play();
  }

  onBulletCollision(bullet, monster) {
    let score = this.score.score;

    if (monster.health - bullet.damage <= 0) {
      this.score.addPoints(1);
      if (score >= 390) {
        this.scene.start("grassScene", {
          score: score,
          character: this.selectedCharacter,
        });
      }
    }
    bullet.hitsEnemy(monster);
  }

  createScoreLabel(x, y, score) {
    const style = {
      fontSize: "32px",
      fill: "#ffffff",
      fontStyle: "bold",
    };
    const label = new Score(this, x, y, score, style);
    label.setScrollFactor(0, 0).setScale(1);
    this.add.existing(label);
    return label;
  }
  createSoundButton(x, y) {
    const button = this.add.image(x, y, assets.SOUND_ON_KEY);
    button.setInteractive();

    button.setScrollFactor(0, 0).setScale(1);

    button.on("pointerdown", () => {
      if (button.texture.key === assets.SOUND_ON_KEY) {
        button.setTexture(assets.SOUND_OFF_KEY);
        this.sound.mute = true;
      } else {
        button.setTexture(assets.SOUND_ON_KEY);
        this.sound.mute = false;
      }
    });
    this.add.existing(button);
    return button;
  }
}
