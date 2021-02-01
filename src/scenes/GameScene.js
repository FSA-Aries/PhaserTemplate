import Phaser from "phaser";
import Player from "../entities/Player";

import { config } from "../main";

// PLAYER
const PLAYER = "assets/characters/Player.png";
const PLAYER_KEY = "player";
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
    this.cursors = undefined;
  }

  ///// PRELOAD /////
  preload() {
    this.load.image(TILESET_KEY, TILESET);
    this.load.tilemapTiledJSON(TILEMAP_KEY, TILEMAP);

    this.load.spritesheet(PLAYER_KEY, PLAYER, {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  ///// CREATE /////
  create() {
    let map = this.make.tilemap({ key: TILEMAP_KEY });
    let tileSet = map.addTilesetImage("TiledSet", TILESET_KEY);
    map.createLayer("Ground", tileSet, 0, 0);
    map.createLayer("Walls", tileSet, 0, 0);

    this.player = this.createPlayer();

    this.setupFollowupCameraOn(this.player);
  }

  ///// UPDATE /////
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
      .setZoom(1.5);
    this.cameras.main.startFollow(player);
  }
}
