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
    let title = this.add.image(400, 400, "title-photo");
    // title.setDisplaySize(800, 800);
    title.setScale(0.55, 1);
    this.input.keyboard.once("keydown", this.handleContinue, this);
  }
  handleContinue() {
    this.scene.start("menu-scene");
  }
}

export default TitleScene;
