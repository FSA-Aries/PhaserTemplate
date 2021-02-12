import Phaser from "phaser";
import assets from "../../public/assets/index";
import { config } from "../main";
class TitleScene extends Phaser.Scene {
  constructor() {
    super("title-scene");
  }
  preload() {
    this.load.image("title-photo", "assets/backgrounds/SPTitleScreen.png");
    this.load.audio(assets.SHOT_KEY, assets.SHOT_URL);
  }
  create() {
    this.add.image(400, 400, "title-photo");
    this.input.keyboard.once("keydown", this.handleContinue, this);
  }
  handleContinue() {
    this.sound.add(assets.SHOT_KEY, { loop: false, volume: 0.53 }).play();
    this.cameras.main.fadeOut(1000, 0, 0, 0)

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
      this.scene.start("menu-scene");

    })
  }
}

export default TitleScene;
