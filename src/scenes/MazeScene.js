import Phaser from "phaser";
import assets from "../../public/assets";
import { config } from "../main";

export default class MazeScene extends Phaser.Scene {
  constructor() {
    super("maze-scene");
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    this.state = {};
    this.playerGroup = undefined;
    this.player = undefined;
  }

  preload() {
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();
    this.load.tilemapTiledJSON(assets.TILEMAZE_KEY, assets.TILEMAZE_URL);
    // this.load.audio()
  }
}
