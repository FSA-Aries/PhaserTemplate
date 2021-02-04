import Phaser from "phaser";

import GameScene from "./scenes/GameScene";
import WaitingRoom from "./scenes/WaitingRoom";
import MenuScene from "./scenes/MenuScene";

const WIDTH = 800;

// const MAP_WIDTH = document.body.offsetWidth;
const MAP_WIDTH = document.body.offsetWidth;
const HEIGHT = 800;
const ZOOM_FACTOR = 1.5;

export const config = {
  type: Phaser.AUTO,
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 0,
  width: WIDTH,
  height: HEIGHT,
  zoomFactor: ZOOM_FACTOR,
  leftTopCorner: {
    x: (WIDTH - WIDTH / ZOOM_FACTOR) / 2,
    y: (HEIGHT - HEIGHT / ZOOM_FACTOR) / 2,
  },
  rightTopCorner: {
    x: WIDTH / ZOOM_FACTOR + (WIDTH - WIDTH / ZOOM_FACTOR) / 2,
    y: (HEIGHT - HEIGHT / ZOOM_FACTOR) / 2,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,

      gravity: { y: 0 },
    },
  },
  dom: {
    createContainer: true,
  },
  scene: [WaitingRoom, MenuScene, GameScene],
};

export default new Phaser.Game(config);
