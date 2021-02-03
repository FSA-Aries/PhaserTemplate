import Phaser from "phaser";

import GameScene from "./scenes/GameScene";
import WaitingRoom from "./scenes/WaitingRoom";

const WIDTH = 800;

// const MAP_WIDTH = document.body.offsetWidth;
const MAP_WIDTH = document.body.offsetWidth;
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
      debug: true,
      gravity: { y: 0 },
    },
  },
  scene: [WaitingRoom, GameScene],
};

export default new Phaser.Game(config);
