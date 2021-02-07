import Phaser from 'phaser';
import Zombie from '../classes/Enemies/Zombie.js';
import Skeleton from '../classes/Enemies/Skeleton.js';
import Player from '../classes/Player';
import Bullet from '../classes/Bullet';
import assets from '../../public/assets';
import socket from '../socket/index.js';
import Score from '../hud/score';

import EventEmitter from '../events/Emitter';
import { config } from '../main';

// import { getEnemyTypes } from "../types";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');
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
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();

    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
    this.load.image(assets.TILESET_KEY, assets.TILESET_URL);
    this.load.tilemapTiledJSON(assets.TILEMAP_KEY, assets.TILEMAP_URL);
    this.load.spritesheet(assets.PLAYER_KEY, assets.PLAYER_URL, {
      frameWidth: 50,
      frameHeight: 69,
    });

    this.load.audio(
      'zombie-attack',
      'assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3'
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
    let map = this.make.tilemap({ key: assets.TILEMAP_KEY });
    let tileSet = map.addTilesetImage('TiledSet', assets.TILESET_KEY);
    map.createLayer('Ground', tileSet, 0, 0);
    map.createLayer('Walls', tileSet, 0, 0);

    this.player = this.createPlayer();
    this.player.setTexture(assets.PLAYER_KEY, 1);

    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      0
    );
    //this.score = new Score(this, config.leftTopCorner.x + 5, config.rightTopCorner.y, 0)

    //Zombie and Skeleton Groups
    let zombieGroup = this.physics.add.group();
    let skeletonGroup = this.physics.add.group();

    // Enemy Creation

    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 1000,
        callback: () => {
          zombieGroup.add(this.createZombie());
        },
        repeat: 15,
      });
    }
    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 10000,
        callback: () => {
          skeletonGroup.add(this.createSkeleton());
        },
        loop: true,
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
      'pointerdown',
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
      'pointermove',
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

    if (gameStatus === 'PLAYER_LOSE') {
      return;
    }
    this.createGameEvents();
  }

  //       this
  //     );
  //   }
  update() {}

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION
  createPlayer() {
    return new Player(this, 400, 375);
  }

  setupFollowupCameraOn(player) {
    this.physics.world.setBounds(0, 0, config.width, config.height);

    this.cameras.main
      .setBounds(0, 0, config.width, config.height)
      .setZoom(config.zoomFactor);
    this.cameras.main.startFollow(player);
  }
  createZombie() {
    const randomizedPosition = Math.random() * 800;
    return new Zombie(
      this,
      randomizedPosition,
      randomizedPosition,
      assets.ZOMBIE_KEY,
      assets.ZOMBIE_URL,
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
  createSkeleton() {
    const randomizedPosition = Math.random() * 800;
    return new Skeleton(
      this,
      randomizedPosition,
      randomizedPosition,
      assets.SKELETON_KEY,
      assets.SKELETON_URL,
      this.player
    );
  }

  createGameEvents() {
    EventEmitter.on('PLAYER_LOSE', () => {
      this.scene.start('game-over', { gameStatus: 'PLAYER_LOSE' });
    });
  }
  onPlayerCollision(player, monster) {
    console.log('HEALTH ->', player.health);
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
    const style = { fontSize: '32px', fill: '#ff0000', fontStyle: 'bold' };
    const label = new Score(this, x, y, score, style);
    label.setScrollFactor(0, 0).setScale(1);
    this.add.existing(label);
    return label;
  }
}
