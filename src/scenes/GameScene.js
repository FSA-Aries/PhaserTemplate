import Phaser from 'phaser';
import Bullet from '../classes/Bullet';
import assets from '../../public/assets';

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
  }

  ///// UPDATE /////
  update() {
    this.player.body.setVelocity(0);
    const prevVelocity = this.player.body.velocity.clone();

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(150);
    }
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-150);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(150);
    }

    if (this.cursors.left.isDown) {
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.anims.play('right', true);
    } else if (this.cursors.up.isDown) {
      this.player.anims.play('up', true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play('down', true);
    } else {
      this.player.anims.stop();

      if (prevVelocity.x < 0) this.player.setTexture(assets.PLAYER_KEY, 4);
      else if (prevVelocity.x > 0) this.player.setTexture(assets.PLAYER_KEY, 8);
      else if (prevVelocity.y < 0)
        this.player.setTexture(assets.PLAYER_KEY, 10);
      else if (prevVelocity.y > 0) this.player.setTexture(assets.PLAYER_KEY, 1);
    }

    this.input.on(
      'pointermove',
      function () {
        //console.log(this.input.mousePointer.x)

        this.reticle.x = this.input.mousePointer.x;
        this.reticle.y = this.input.mousePointer.y;
        //console.log('if')

        //console.log(this.reticle)

        //console.log(pointer.movementY)
        //this.player.rotation = angle;
      },
      this
    );
  }

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION
  createPlayer() {
    const player = this.physics.add.sprite(400, 375, assets.PLAYER_KEY);
    player.setCollideWorldBounds(true);
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
      //repeat: -1,
    });
    this.anims.create({
      key: 'turn',
      frames: [{ key: assets.PLAYER_KEY, frame: 1 }],
      frameRate: 10,
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 6,
        end: 8,
      }),
      frameRate: 10,
      //repeat: -1,
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
      //repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
      //repeat: -1
    });
    return player;
  }

  setupFollowupCameraOn(player) {
    this.physics.world.setBounds(0, 0, 800, 800);
    this.cameras.main.setBounds(0, 0, 800, 800).setZoom(1.5);
    this.cameras.main.startFollow(player);
  }
}
