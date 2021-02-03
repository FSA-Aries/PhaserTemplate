import Phaser from "phaser";
import { config } from "../main";

class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
    this.screenCenter = [config.width / 2, config.height / 2];
    this.fontSize = 34;
    this.lineHeight = 42;
    this.fontOptions = { fontSize: `${this.fontSize}px`, fill: "#fff" };
  }

  preload() {
    this.load.image(
      "menu-bg",
      "public/assets/backgrounds/Hello_World_Menu_Background.jpg"
    );
  }

  create() {
    this.add.image(0, 0, "menu-bg").setOrigin(0);

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
}

export default BaseScene;
