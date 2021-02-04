import BaseScene from "./BaseScene";

class GameOver extends BaseScene {
  constructor() {
    super("game-over");

    this.menu = [
      { scene: null, text: "GAME OVER" },
      { scene: "MenuScene", text: "Restart" },
    ];
  }

  create() {
    super.create();

    this.createMenu(this.menu, this.setupMenuEvents.bind(this));
  }

  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    if (menuItem.text === "Restart") {
      textGO.on("pointerover", () => {
        textGO.setStyle({ fill: "#880808" });
      });

      textGO.on("pointerout", () => {
        textGO.setStyle({ fill: "#fff" });
      });
    }

    textGO.on("pointerup", () => {
      menuItem.scene && this.scene.start("menu-scene");

      if (menuItem.text === "Exit") {
        this.game.destroy(true);
      }
    });
  }
}

export default GameOver;
