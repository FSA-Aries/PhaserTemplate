import Phaser from "phaser";
import Zombie from "../classes/Enemies/Zombie.js";
import Skeleton from "../classes/Enemies/Skeleton.js";
import Player from "../classes/Player";
import Bullet from "../classes/Bullet";
import assets from "../../public/assets";
// import addCollider from "../mixins/collidable";

import { config } from "../main";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.player = undefined;
    this.zombie = undefined;
    this.skeleton = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
  }

  ///// PRELOAD /////
  preload() {
    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
    this.load.image(assets.TILESET_KEY, assets.TILESET_URL);
    this.load.tilemapTiledJSON(assets.TILEMAP_KEY, assets.TILEMAP_URL);
    this.load.spritesheet(assets.PLAYER_KEY, assets.PLAYER_URL, {
      frameWidth: 50,
      frameHeight: 69,
    });

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
  create() {
    let map = this.make.tilemap({ key: assets.TILEMAP_KEY });
    let tileSet = map.addTilesetImage("TiledSet", assets.TILESET_KEY);
    map.createLayer("Ground", tileSet, 0, 0);
    map.createLayer("Walls", tileSet, 0, 0);

    this.player = this.createPlayer();
    this.player.setTexture(assets.PLAYER_KEY, 1);

    //Enemy Creation
    for (let i = 0; i < 2; i++) {
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          this.createZombie();
        },
        loop: true,
      });
    }
    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          this.createSkeleton();
        },
        loop: true,
      });
    }

    // const player = this.player;
    // const enemy = this.enemy;

    this.createPlayerColliders(this.player, {
      colliders: {
        enemy: this.enemy,
      },
    });

    this.createEnemyColliders(this.enemy, {
      colliders: {
        player: this.player,
      },
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    let playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });
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
  // onPlayerCollision(enemy, player) {
  //   player.takesHit();
  // }

  onEnemyCollision(player) {
    player.takesHit();
  }

  createPlayerColliders(player, { colliders }) {
    console.log(colliders.enemy);
    // player.addCollider(colliders.enemy.enemy, this.onEnemyCollision);
  }

  createEnemyColliders(enemy, { colliders }) {
    console.log(colliders.player);
    enemy.addCollider(
      colliders.player

      // this.onPlayerCollision
    );
  }
}
