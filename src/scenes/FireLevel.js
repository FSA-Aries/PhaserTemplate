import Phaser from "phaser";
import Zombie from "../classes/Enemies/Zombie.js";
import Skeleton from "../classes/Enemies/Skeleton.js";
import Boss from "../classes/Enemies/Boss";
import Player from "../classes/Player";
import Bullet from "../classes/Bullet";
import assets from "../../public/assets";
import socket from "../socket/index.js";
import Score from "../hud/score";
import Imp from "../classes/Enemies/Imp";

import EventEmitter from "../events/Emitter";
import { config } from "../main";

// import { getEnemyTypes } from "../types";

export default class FireLevel extends Phaser.Scene {
  constructor() {
    super("fire-level");
    this.player = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    //Setup Sockets
    this.socket = socket;
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
    this.load.spritesheet(assets.PLAYER_KEY, assets.PLAYER_URL, {
      frameWidth: 50,
      frameHeight: 69,
    });

    this.load.audio(
      "zombie-attack",
      "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
    );

    //Enemies
    this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
      frameWidth: 30,
      frameHeight: 60,
    });

    this.load.spritesheet(assets.IMP_KEY, assets.IMP_URL, {
      frameWidth: 64,
      frameHeight: 64,
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
  }

  ///// CREATE /////
  create({ gameStatus }) {
    let map = this.make.tilemap({ key: assets.FIREMAP_KEY });
    let tileSet = map.addTilesetImage("Fireset", assets.FIRESET_KEY);
    // map.createLayer("Underneath", tileSet, 0, 0);
    map.createLayer("Floor", tileSet, 0, 0);
    let lava = map.createLayer("Collision", tileSet, 0, 0);
    lava.setCollisionByExclusion([-1]);

    this.player = this.createPlayer();
    this.player.setTexture(assets.PLAYER_KEY, 1);

    this.physics.add.collider(this.player, lava);

    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      this.getScore()
    );

    //Zombie and Skeleton Groups
    let zombieGroup = this.physics.add.group();
    let skeletonGroup = this.physics.add.group();
    let impGroup = this.physics.add.group();

    // Enemy Creation
    for (let i = 0; i < 4; i++) {
      this.time.addEvent({
        delay: 5000,
        callback: () => {
          zombieGroup.add(this.createZombie().setTint(0xff0000));
        },
        repeat: 3,
      });

      //DON'T DELETE- TO HAVE SET AMOUNT OF ENEMIES INSTEAD OF ENDLESS
      //repeat: 15
    }
    for (let i = 0; i < 2; i++) {
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          impGroup.add(this.createImp());
        },
        repeat: 3,
      });
    }
    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 20000,
        callback: () => {
          skeletonGroup.add(this.createSkeleton().setTint(0xff0000));
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
    this.physics.add.collider(this.player, impGroup, this.onPlayerCollision);

    this.physics.add.collider(zombieGroup, skeletonGroup);
    this.physics.add.collider(zombieGroup, zombieGroup);
    this.physics.add.collider(skeletonGroup, skeletonGroup);
    this.physics.add.collider(impGroup, skeletonGroup);
    this.physics.add.collider(impGroup, impGroup);
    this.physics.add.collider(impGroup, zombieGroup);

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
    this.physics.add.collider(
      playerBullets,
      impGroup,
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

  update() {}


  // PLAYER ANIMATION
  createPlayer() {
    return new Player(this, 350, 400);
  }

  getScore() {
    if (this.scene.settings.data.score) {
      return this.scene.settings.data.score;
    } else {
      0;
    }
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
  createImp(playerGroup) {
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();

    return new Imp(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.IMP_KEY,
      assets.IMP_URL,
      this.playerGroup,
      this.player
    );
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
      console.log("SCHENE", this.scene);
      console.log(this);
      this.score.addPoints(1);
      if (this.score.score >= 30) {
        this.scene.start("grassScene", {
          score: score,
        });
      }
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
