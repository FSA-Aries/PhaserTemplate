
import Phaser, { Scene } from 'phaser';
import Zombie from '../classes/Enemies/Zombie.js';
import Skeleton from '../classes/Enemies/Skeleton.js';
//import Player from '../classes/Player';
import OtherPlayerSprite from '../classes/OtherPlayers';
import Bullet from '../classes/Bullet';
import assets from '../../public/assets';
import socket from '../socket/index.js';
import Score from '../hud/score';

import EventEmitter from '../events/Emitter';
import { config } from '../main';
import Smol from '../classes/Smol.js';

export default class LevelOne extends Phaser.Scene {
  constructor() {
    super('LevelOne');
    this.selectedCharacter = undefined;
    this.player = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    this.socket = socket;
    this.state = {};
    this.otherPlayer = undefined;
  }

  init(data) {
    this.selectedCharacter = data.character
  }

  ///// PRELOAD /////
  preload() {
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();

    // SMOL
    this.selectedCharacter.loadSprite(this)
    /* this.load.image(assets.SMOL_LEFTSTART_KEY, assets.SMOL_LEFTSTART_URL);
    this.load.image(assets.SMOL_LEFTONE_KEY, assets.SMOL_LEFTONE_URL);
    this.load.image(assets.SMOL_LEFTTWO_KEY, assets.SMOL_LEFTTWO_URL);
    this.load.image(assets.SMOL_RIGHTSTART_KEY, assets.SMOL_RIGHTSTART_URL);
    this.load.image(assets.SMOL_RIGHTONE_KEY, assets.SMOL_RIGHTONE_URL);
    this.load.image(assets.SMOL_RIGHTTWO_KEY, assets.SMOL_RIGHTTWO_URL);
    this.load.image(assets.SMOL_JUMPONE_KEY, assets.SMOL_JUMPONE_URL);
    this.load.image(assets.SMOL_JUMPTWO_KEY, assets.SMOL_JUMPTWO_URL); */

    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
    this.load.image(assets.TILESET2_KEY, assets.TILESET2_URL);
    this.load.tilemapTiledJSON(assets.TILEMAP2_KEY, assets.TILEMAP2_URL);
    // this.load.spritesheet(assets.PLAYER_KEY, assets.PLAYER_URL, {
    //   frameWidth: 50,
    //   frameHeight: 69,
    // });

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

    // this.physics.add.sprite(400, 375, assets.PLAYER_KEY);
  }

  ///// CREATE /////
  create({ gameStatus }) {
    this.playerGroup = this.add.group();
    //const scene = this;
    let map = this.make.tilemap({ key: assets.TILEMAP2_KEY });
    let tileSet = map.addTilesetImage("TiledSet2", assets.TILESET2_KEY);
    map.createLayer("Ground", tileSet, 0, 0);
    let walls = map.createLayer("Walls", tileSet, 0, 0);
    walls.setCollisionByExclusion([-1]);
    map.createLayer('Details', tileSet, 0, 0);

    //Create player and playerGroup
    this.player = this.createPlayer(this, { x: 200, y: 300 });

    this.playerGroup.add(this.player);
    //CREATE OTHER PLAYERS GROUP
    //this.player.setTexture(assets.SMOL_RIGHTSTART_KEY, 0);
    this.physics.add.collider(this.player, walls);

    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      this.getScore()
    );
    //this.score = new Score(this, config.leftTopCorner.x + 5, config.rightTopCorner.y, 0)

    //Zombie and Skeleton Groups
    let zombieGroup = this.physics.add.group();
    let skeletonGroup = this.physics.add.group();

    // Enemy Creation

    for (let i = 0; i < 4; i++) {
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          zombieGroup.add(this.createZombie().setTint(0x0000ff));
        },
        repeat: 25,
      });
    }
    for (let i = 0; i < 2; i++) {
      this.time.addEvent({
        delay: 5000,
        callback: () => {
          skeletonGroup.add(this.createSkeleton().setTint(0xea0909));
        },

        loop: true,
      });
    }
    //1) We need to create a player group and add it to colliders
    //2) We need to refactor how we create the enemy classes (specify which player zombie follows)
    ////Can add a method that takes in array of zombies and all of the players and for each monster --> checks distance and points towards player
    //Add method to each monster and velocity updates

    this.physics.add.collider(
      this.playerGroup,
      zombieGroup,
      this.onPlayerCollision
    );
    this.physics.add.collider(
      this.playerGroup,
      skeletonGroup,
      this.onPlayerCollision
    );

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

    if (gameStatus === "PLAYER_LOSE") {
      return;
    }
    this.createGameEvents();
  }

  //       this
  //     );
  //   }
  update() {
    // const scene = this;
    // var x = scene.player.x;
    // var y = scene.player.y;
    // // if (x !== scene.player.oldPosition.x || y !== scene.player.oldPosition.y) {
    // //   scene.player.moving = true;
    // //   socket.emit('playerMovement', {
    // //     x: scene.player.x,
    // //     y: scene.player.y,
    // //     roomKey: scene.state.roomKey,
    // //   });
    // // }
    // scene.player.oldPosition = {
    //   x: scene.player.x,
    //   y: scene.player.y,
    // };
  }

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION

  createPlayer(player, playerInfo) {
    this.player = new this.selectedCharacter(player, playerInfo.x, playerInfo.y)
    this.player.createTexture();
    return this.player;
  }

  createOtherPlayer(player, playerInfo) {
    console.log("createOtherPlayer -->", playerInfo);
    this.otherPlayer = new OtherPlayerSprite(
      player,
      playerInfo.x + 40,
      playerInfo.y + 40
    );
    this.otherPlayer.playerId = playerInfo.playerId;
    // playerGroup.add(this.otherPlayer)
  }

  setupFollowupCameraOn(player) {
    this.physics.world.setBounds(0, 0, config.width, config.height);

    this.cameras.main
      .setBounds(0, 0, config.width, config.height)
      .setZoom(config.zoomFactor + 0.5);
    this.cameras.main.startFollow(player);
  }

  getScore() {
    if (this.scene.settings.data.score) {
      return this.scene.settings.data.score;
    } else {
      0;
    }
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

  createZombie() {
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();
    // const randomizedPositionx = Math.random() * 800 + this.player.x;
    // const randomizedPositiony = Math.random() * 800 + this.player.y;
    return new Zombie(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.ZOMBIE_KEY,
      assets.ZOMBIE_URL,
      undefined,
      this.player
    );
  }

  createSkeleton() {
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();
    // const randomizedPositionx = Math.random() * 800 + this.player.x;
    // const randomizedPositiony = Math.random() * 800 + this.player.y;
    return new Skeleton(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.SKELETON_KEY,
      assets.SKELETON_URL,
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

  createGameEvents() {
    EventEmitter.on("PLAYER_LOSE", () => {
      this.scene.start("game-over", { gameStatus: "PLAYER_LOSE" });
    });
  }
  onPlayerCollision(player, monster) {
    //It should be the bullet's damage but we will just set a default value for now to test
    // monster.takesHit(player.damage);
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
