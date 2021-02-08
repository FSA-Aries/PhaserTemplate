import Phaser from "phaser";
import { ENEMY_TYPES } from "../types";

class Enemies extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);
  }
  getTypes() {
    return ENEMY_TYPES;
  }
}

export default Enemies;
