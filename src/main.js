import Phaser from "phaser";

import GameScene from "./scenes/GameScene";
import WaitingRoom from "./scenes/WaitingRoom";
import MenuScene from "./scenes/MenuScene";
import LevelOne from "./scenes/LevelOne";
import FireLevel from "./scenes/FireLevel";
import DarknessLevel from "./scenes/DarknessLevel";
import GrassScene from "./scenes/GrassScene";

import GameOver from "./scenes/GameOver";

const WIDTH = 800;

// const MAP_WIDTH = document.body.offsetWidth;
const MAP_WIDTH = document.body.offsetWidth;
const HEIGHT = 800;
const ZOOM_FACTOR = 1.5;
export const config = {
  type: Phaser.AUTO,
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 0,
  scale: {
    parent: "mygame",
  },
  width: WIDTH,
  height: HEIGHT,
  zoomFactor: ZOOM_FACTOR,
  leftTopCorner: {
    x: (WIDTH - WIDTH / ZOOM_FACTOR) / 2,
    y: (HEIGHT - HEIGHT / ZOOM_FACTOR) / 2,
  },
  rightTopCorner: {
    x: (WIDTH / ZOOM_FACTOR + (WIDTH - WIDTH / ZOOM_FACTOR)) / 2 + 45,
    y: (HEIGHT - HEIGHT / ZOOM_FACTOR) / 2,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,

      gravity: { y: 0 },
    },
  },

  parent: "mygame",
  dom: {
    createContainer: true,
  },

  scene: [
    MenuScene,
    WaitingRoom,
    GameScene,
    GameOver,
    GrassScene,
    FireLevel,
    DarknessLevel,
    LevelOne,
  ],
};

export default new Phaser.Game(config);
