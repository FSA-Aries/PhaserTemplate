import Phaser from "phaser";

import GameScene from "./scenes/GameScene";
import WaitingRoom from "./scenes/WaitingRoom";
import MenuScene from "./scenes/MenuScene";
import LevelOne from "./scenes/LevelOne";
import FireLevel from "./scenes/FireLevel";
import DarknessLevel from "./scenes/DarknessLevel";
import GrassScene from "./scenes/GrassScene";
import MazeScene from "./scenes/MazeScene";
import Multiplayer from "./scenes/Multiplayer";
import GameOver from "./scenes/GameOver";
import CharacterSelect from "./scenes/CharacterSelect";
import PauseScene from "./scenes/PauseMenu";
import TitleScene from "./scenes/TitleScene";
import Endless from "./scenes/Endless";
import CharacterLibrary from "./scenes/CharacterLibrary";

const WIDTH = 800;

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
      debug: false,

      gravity: { y: 0 },
    },
  },

  parent: "mygame",
  dom: {
    createContainer: true,
  },

  scene: [
    TitleScene,
    MenuScene,
    WaitingRoom,
    GameScene,
    GameOver,
    MazeScene,
    GrassScene,
    FireLevel,
    DarknessLevel,
    LevelOne,
    CharacterSelect,
    PauseScene,
    Multiplayer,
    Endless,
    CharacterLibrary,
  ],
};

export default new Phaser.Game(config);
