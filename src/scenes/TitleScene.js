import Phaser from "phaser";
import assets from "../../public/assets/index";
import { config } from "../main";
class TitleScene extends Phaser.Scene {
  constructor() {
    super("title-scene");
  }
  preload() {
    this.load.image("title-photo", "assets/backgrounds/SPTitleScreen.png");
  }
  create() {
    this.add.image(400, 400, "title-photo");
    this.input.keyboard.once("keydown", this.handleContinue, this);
  }
  handleContinue() {
    this.scene.start("menu-scene");
  }
}

export default TitleScene;
