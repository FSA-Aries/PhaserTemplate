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

// import { getEnemyTypes } from "../types";

export default class FireLevel extends Phaser.Scene {
  constructor() {
    super("fire-level");
    this.selectedCharacter = undefined;
    this.player = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    //Setup Sockets
    this.socket = socket;
  }

  init(data) {
    this.selectedCharacter = data.character
  }

  ///// PRELOAD /////
  preload() {
    this.load.audio("intro", "assets/audio/Intro.mp3");

    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();

    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
    this.load.image(assets.FIRESET_KEY, assets.FIRESET_URL);
    this.load.tilemapTiledJSON(assets.FIREMAP_KEY, assets.FIREMAP_URL);


    /* this.load.spritesheet(assets.PLAYER_KEY, assets.PLAYER_URL, {
      frameWidth: 50,
      frameHeight: 69,
    }); */
    this.selectedCharacter.loadSprite(this);

    this.load.audio(
      "zombie-attack",
      "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
    );

    //Enemies
    this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
      frameWidth: 30,
      frameHeight: 60,
    });
    this.load.spritesheet(assets.SKELETON_KEY, assets.SKELETON_URL, {
      frameWidth: 30,
      frameHeight: 64,
    });
    this.load.spritesheet(assets.BOSS_KEY, assets.BOSS_URL, {
      frameWidth: 30,
      frameHeight: 60,
    });
    this.load.spritesheet(assets.BOSS_RIGHT_KEY, assets.BOSS_RIGHT_URL, {
      frameWidth: 30,
      frameHeight: 60,
    });
    this.load.spritesheet(assets.BOSS_DOWN_KEY, assets.BOSS_DOWN_URL, {
      frameWidth: 30,
      frameHeight: 60,
    });
    // this.physics.add.sprite(400, 375, assets.PLAYER_KEY);
  }

  ///// CREATE /////
  create({ gameStatus }) {
    let map = this.make.tilemap({ key: assets.FIREMAP_KEY });
    let tileSet = map.addTilesetImage("Fireset", assets.FIRESET_KEY);
    // map.createLayer("Underneath", tileSet, 0, 0);
    map.createLayer("Floor", tileSet, 0, 0);
    let lava = map.createLayer("Collision", tileSet, 0, 0);
    lava.setCollisionByExclusion([-1]);

    this.player = this.createPlayer(this, { x: 200, y: 300 });
    //this.player.setTexture(assets.PLAYER_KEY, 1);

    this.physics.add.collider(this.player, lava);

    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      0
    );
    //this.score = new Score(this, config.leftTopCorner.x + 5, config.rightTopCorner.y, 0)

    //Zombie and Skeleton Groups
    let zombieGroup = this.physics.add.group();
    let skeletonGroup = this.physics.add.group();

    this.zombieGroup = zombieGroup;

    // Enemy Creation

    for (let i = 0; i < 4; i++) {
      this.time.addEvent({
        delay: 5000,
        callback: () => {
          zombieGroup.add(this.createZombie());
        },
        repeat: 3,
      });
      //DON'T DELETE- TO HAVE SET AMOUNT OF ENEMIES INSTEAD OF ENDLESS
      //repeat: 15
    }
    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 20000,
        callback: () => {
          skeletonGroup.add(this.createSkeleton());
        },
        repeat: 3,
      });
    }

    this.physics.add.collider(this.player, zombieGroup, this.onPlayerCollision);

    this.physics.add.collider(
      this.player,
      skeletonGroup,
      this.onPlayerCollision
    );
    this.physics.add.collider(zombieGroup, skeletonGroup, null);
    this.physics.add.collider(zombieGroup, zombieGroup, null);
    this.physics.add.collider(skeletonGroup, skeletonGroup, null);

    this.cursors = this.input.keyboard.createCursorKeys();
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

        if (bullet) {
          bullet.fire(this.player, this.reticle);
          //this.physics.add.collider(enemy, bullet, enemyHitCallback);
        }
      },
      this
    );

    this.setupFollowupCameraOn(this.player);

    this.input.on(
      "pointermove",
      function (pointer) {
        //console.log(this.input.mousePointer.x)
        const transformedPoint = this.cameras.main.getWorldPoint(
          pointer.x,
          pointer.y
        );

        this.reticle.x = transformedPoint.x;
        this.reticle.y = transformedPoint.y;

        //this.player.rotation = angle;
      },
      this
    );
    // this.introText();

    if (gameStatus === "PLAYER_LOSE") {
      return;
    }
    this.createGameEvents();
  }

  //       this
  //     );
  //   }
  update() { }

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION
  createPlayer(player, playerInfo) {

    this.player = new this.selectedCharacter(player, playerInfo.x, playerInfo.y)
    this.player.createTexture();


    return this.player;
  }

  setupFollowupCameraOn(player) {
    this.physics.world.setBounds(
      0,
      0,
      config.width + config.mapOffset,
      config.height
    );

    this.cameras.main
      .setBounds(0, 0, config.width + config.mapOffset, config.height)
      .setZoom(config.zoomFactor);
    this.cameras.main.startFollow(player);
  }
  createZombie() {
    // const randomizedPosition = Math.random() * 800;
    return new Zombie(
      this,
      this.randomizedPosition(),
      this.randomizedPosition(),
      assets.ZOMBIE_KEY,
      assets.ZOMBIE_URL,
      undefined,
      this.player
    );
  }

  // createEnemies(monster) {
  //   const enemyTypes = getEnemyTypes();
  //   const randomizedPosition = Math.random() * 800;

  //   return new enemyTypes[monster](
  //     this,
  //     randomizedPosition,
  //     randomizedPosition,
  //     assets.SKELETON_KEY,
  //     assets.SKELETON_URL,
  //     this.player
  //   );
  // }
  randomizedPosition() {
    let position = Math.random() * 800;
    if (this.player.x !== position && this.player.y !== position) {
      return position;
    } else {
      this.randomizedPosition();
    }
  }

  introText() {
    // let zombieGroup = this.physics.add.group();
    // this.physics.add.collider(this.player, zombieGroup, this.onPlayerCollision);
    /*
    Welcome to
    Then

    Senior Phaser
    then
    Left Click to Shoot
    then
    WASD to move


    add text
    delay event-destroy text, add text
    delay event-destroy text, add text
    delay event-destroy


    */

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
    return new Skeleton(
      this,
      this.randomizedPosition(),
      this.randomizedPosition(),
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
    console.log("HEALTH ->", player.health);
    //It should be the bullet's damage but we will just set a default value for now to test
    // monster.takesHit(player.damage);
    console.log(monster);
    player.takesHit(monster);
    if (monster.zombieAttackSound) monster.zombieAttackSound.play();
    // player.setBounce(0.5, 0.5);
  }

  onBulletCollision(bullet, monster) {
    if (monster.health - bullet.damage <= 0) {
      console.log(this.score);
      this.score.addPoints(1);
    }

    bullet.hitsEnemy(monster);
  }

  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#ff0000", fontStyle: "bold" };
    const label = new Score(this, x, y, score, style);
    label.setScrollFactor(0, 0).setScale(1);
    this.add.existing(label);
    return label;
  }
}
