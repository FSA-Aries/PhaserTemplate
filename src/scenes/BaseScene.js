import Phaser from "phaser";
import { config } from "../main";
import assets from "../../public/assets";

class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.screenCenter = [config.width / 2, config.height / 2];
    this.fontSize = 34;
    this.lineHeight = 42;
    this.fontOptions = { fontSize: `${this.fontSize}px`, fill: "#fff" };
  }

  preload() {
    this.load.image("menu-bg", assets.MENU_URL);

    this.load.image(assets.SOUND_OFF_KEY, assets.SOUND_OFF_URL);
    this.load.image(assets.SOUND_ON_KEY, assets.SOUND_ON_URL);

    this.load.audio("theme", "assets/audio/City-of-the-Disturbed_Looping.mp3");

    this.load.image("arrow-keys", assets.WASD_URL);
    this.load.image("left-mouse-click", "https://i.imgur.com/OGWM7Jm.png");

    this.load.audio(assets.MENUMOUSE_KEY, assets.MENUMOUSE_URL);
  }

  create() {
    this.playBgMusic();

    this.background = this.add.image(0, 0, "menu-bg").setOrigin(0, 0);
    // Based on your game size, it may "stretch" and distort.
    this.background.displayWidth = this.sys.canvas.width;
    this.background.displayHeight = this.sys.canvas.height;

    if (config.canGoBack) {
      const backButton = this.add
        .image(config.width - 10, config.height - 10, "back")
        .setOrigin(1)
        .setScale(2)
        .setInteractive();

      backButton.on("pointerup", () => {
        this.scene.start("MenuScene");
      });
    }
  }

  playBgMusic() {
    if (this.sound.get("theme")) {
      return;
    }
    this.sound.add("theme", { loop: true, volume: 0.13 }).play();
  }

  createMenu(menu, setupMenuEvents) {
    let lastMenuPositionY = 0;

    menu.forEach((menuItem) => {
      const menuPosition = [
        this.screenCenter[0],
        this.screenCenter[1] + lastMenuPositionY,
      ];
      menuItem.textGO = this.add
        .text(...menuPosition, menuItem.text, this.fontOptions)
        .setOrigin(0.5, 1);
      lastMenuPositionY += this.lineHeight;
      setupMenuEvents(menuItem);
    });
  }

  createCharacterMenu(menu, setupMenuEvents) {
    let lastMenuPositionX = -300;

    menu.forEach((menuItem) => {
      const menuPosition = [
        this.screenCenter[0] + lastMenuPositionX,
        this.screenCenter[1],
      ];

      menuItem.imageGO = this.add.image(
        menuPosition[0],
        menuPosition[1],
        menuItem.key
      );

      lastMenuPositionX += this.lineHeight + 150;
      setupMenuEvents(menuItem);
    });
  }
}

export default BaseScene;
