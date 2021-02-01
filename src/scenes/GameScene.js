import Phaser from 'phaser';
import Player from '../classes/Player';
import Bullet from '../classes/Bullet';
import assets from '../../public/assets';

import { config } from '../main';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');
    this.player = undefined;
    this.cursors = undefined;
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
    // const player = this.physics.add.sprite(400, 375, assets.PLAYER_KEY);
  }

  ///// CREATE /////
  create() {
    let map = this.make.tilemap({ key: assets.TILEMAP_KEY });
    let tileSet = map.addTilesetImage('TiledSet', assets.TILESET_KEY);
    map.createLayer('Ground', tileSet, 0, 0);
    map.createLayer('Walls', tileSet, 0, 0);

    this.player = this.createPlayer();
    this.player.setTexture(assets.PLAYER_KEY, 1);

    this.cursors = this.input.keyboard.createCursorKeys();

    let playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });
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

    this.input.on('pointermove', function () {
      //console.log(this.input.mousePointer.x)

      this.reticle.x = this.input.x;
      this.reticle.y = this.input.y;
      //console.log('if')

      //console.log(this.reticle)

      //console.log(pointer.movementY)
      //this.player.rotation = angle;
    });
  }

  //       this
  //     );
  //   }

  update() {}

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION
  createPlayer() {
    //const player = this.physics.add.sprite(400, 375, assets.PLAYER_KEY);

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
      .setZoom(1.5);
    this.cameras.main.startFollow(player);
  }
}
