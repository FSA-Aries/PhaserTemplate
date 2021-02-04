import BaseScene from "./BaseScene";

class MenuScene extends BaseScene {
  constructor() {
    super("menu-scene");

    this.menu = [
      { scene: "PlayScene", text: "Play" },
      { scene: "LevelScene", text: "Levels" },
      { scene: null, text: "Exit" },
    ];
  }

  preload() {
    this.load.image(
      "arrow-keys",
      "https://thumbs.dreamstime.com/t/arrow-keys-black-3784132.jpg"
    );
  }

  create() {
    super.create();

    this.createMenu(this.menu, this.setupMenuEvents.bind(this));

    this.add.image(100, 100, "arrow-keys");
  }

  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on("pointerover", () => {
      textGO.setStyle({ fill: "#ff0" });
    });

    textGO.on("pointerout", () => {
      textGO.setStyle({ fill: "#fff" });
    });

    textGO.on("pointerup", () => {
      menuItem.scene && this.scene.start("game-scene");

      if (menuItem.text === "Exit") {
        this.game.destroy(true);
      }
    });
  }
}

export default MenuScene;
