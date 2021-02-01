
import Phaser from "phaser";

import GameScene from "./scenes/GameScene";

const MAP_WIDTH = 800;

const WIDTH = document.body.offsetWidth;
const HEIGHT = 800;

export const config = {
  type: Phaser.AUTO,
  mapOffset: MAP_WIDTH > WIDTH ? MAP_WIDTH - WIDTH : 0,
  width: WIDTH,
  height: HEIGHT,
  zoomFactor: 1.5,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [GameScene],
};

export default new Phaser.Game(config);
