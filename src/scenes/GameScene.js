import Phaser from "phaser";
import Enemy from "./Enemy.js";

// PLAYER
const PLAYER = "assets/characters/Player.png";
const PLAYER_KEY = "player";
//ENEMY
const ENEMY = "assets/characters/Enemy/zombies.png";
const ENEMY_KEY = "enemy";
// TILESET
const TILESET = "assets/tilesets/TileSet.png";
const TILESET_KEY = "tileSet";
// TILEMAP
const TILEMAP = "assets/tilesets/TiledMap.json";
const TILEMAP_KEY = "main";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.player = undefined;
    this.enemy = undefined;
    this.cursors = undefined;
    this.game = undefined;
  }

  ///// PRELOAD /////
  preload() {
    this.load.image(TILESET_KEY, TILESET);
    this.load.tilemapTiledJSON(TILEMAP_KEY, TILEMAP);

    this.load.spritesheet(ENEMY_KEY, ENEMY, {
      frameWidth: 30,
      frameHeight: 62,
    });

    this.load.spritesheet(PLAYER_KEY, PLAYER, {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  ///// CREATE /////
  create() {
    let map = this.make.tilemap({ key: TILEMAP_KEY });
    let tileSet = map.addTilesetImage("TiledSet", TILESET_KEY);
    const belowLayer = map.createLayer("Ground", tileSet, 0, 0);
    const worldLayer = map.createLayer("Walls", tileSet, 0, 0);

    this.player = this.createPlayer();
    this.enemy = this.createEnemy();

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  ///// UPDATE /////
  update() {
    //PLAYER
    this.player.body.setVelocity(0);
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-150);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(150);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-150);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(150);
    }

    // if (Phaser.Math.Distance.BetweenPoints(this.player, this.enemy) < 400) {
    //   if (this.player.x < this.enemy.x && this.enemy.body.velocity.x >= 0) {
    //     this.enemy.body.velocity;
    //   }
    // }
  }

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION
  createPlayer() {
    const player = this.physics.add.sprite(400, 375, PLAYER_KEY);
    player.setCollideWorldBounds(true);
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: PLAYER_KEY, frame: 4 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(PLAYER_KEY, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    return player;
  }
  createEnemy() {
    const randomizedPosition = Math.random() * 450;
    return new Enemy(
      this,
      randomizedPosition,
      randomizedPosition,
      ENEMY_KEY,
      ENEMY
    );
  }
}
