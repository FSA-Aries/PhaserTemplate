import Phaser from 'phaser';

// PLAYER
const PLAYER = 'assets/characters/pokemonDude.png';
const PLAYER_KEY = 'player';
// TILESET
const TILESET = 'assets/tilesets/TileSet.png';
const TILESET_KEY = 'tileSet';
// TILEMAP
const TILEMAP = 'assets/tilesets/TiledMap.json';
const TILEMAP_KEY = 'main';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('game-scene');
    this.player = undefined;
    this.cursors = undefined;
  }

  ///// PRELOAD /////
  preload() {
    this.load.image(TILESET_KEY, TILESET);
    this.load.tilemapTiledJSON(TILEMAP_KEY, TILEMAP);

    this.load.spritesheet(PLAYER_KEY, PLAYER, {
      frameWidth: 50,
      frameHeight: 69,
    });
  }

  ///// CREATE /////
  create() {
    let map = this.make.tilemap({ key: TILEMAP_KEY });
    let tileSet = map.addTilesetImage('TiledSet', TILESET_KEY);
    const belowLayer = map.createLayer('Ground', tileSet, 0, 0);
    const worldLayer = map.createLayer('Walls', tileSet, 0, 0);

    this.player = this.createPlayer();
    this.player.setTexture(PLAYER_KEY, 1);


    this.cursors = this.input.keyboard.createCursorKeys();
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
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.anims.play("right", true);
    } else if (this.cursors.up.isDown) {
      this.player.anims.play("up", true);
    } else if (this.cursors.down.isDown) {
      this.player.anims.play("down", true);
    } else {
      this.player.anims.stop();

      if (prevVelocity.x < 0) this.player.setTexture(PLAYER_KEY, 4);
      else if (prevVelocity.x > 0) this.player.setTexture(PLAYER_KEY, 8);
      else if (prevVelocity.y < 0) this.player.setTexture(PLAYER_KEY, 10);
      else if (prevVelocity.y > 0) this.player.setTexture(PLAYER_KEY, 1);
    }




    /*     if (this.cursors.left.isDown && this.cursors.up.isDown) {
          this.player.setVelocityX(-150);
          this.player.setVelocityY(-150);
          this.player.anims.play('left', true);
        }
        if (this.cursors.left.isDown && this.cursors.down.isDown) {
          this.player.setVelocityX(-150);
          this.player.setVelocityY(150);
          this.player.anims.play('left', true);
        }
        if (this.cursors.right.isDown && this.cursors.up.isDown) {
          this.player.setVelocityX(150);
          this.player.setVelocityY(-150);
          this.player.anims.play('right', true);
        }
        if (this.cursors.right.isDown && this.cursors.down.isDown) {
          this.player.setVelocityX(150);
          this.player.setVelocityY(150);
          this.player.anims.play('right', true);
        } */

    /* if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    } */


  }

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION
  createPlayer() {
    const player = this.physics.add.sprite(400, 375, PLAYER_KEY);
    player.setCollideWorldBounds(true);
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 3, end: 5 }),
      frameRate: 10,
      //repeat: -1,
    });
    this.anims.create({
      key: 'turn',
      frames: [{ key: PLAYER_KEY, frame: 1 }],
      frameRate: 10,
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 6, end: 8 }),
      frameRate: 10,
      //repeat: -1,
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 9, end: 11 }),
      frameRate: 10,
      //repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 2 }),
      frameRate: 10,
      //repeat: -1
    });
    return player;
  }
}
