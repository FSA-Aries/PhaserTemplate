import BaseScene from "./BaseScene";

class MenuScene extends BaseScene {
  constructor() {
    super("pause-scene");

    this.menu = [
      { scene: "PlayScene", text: "Continue" },
      { scene: "MenuScene", text: "End Game" },
    ];
  }

  // preload() {
  //   this.load.image(
  //     "arrow-keys",
  //     "https://thumbs.dreamstime.com/t/arrow-keys-black-3784132.jpg"
  //   );
  // }

  create() {
    super.create();

    this.createMenu(this.menu, this.setupMenuEvents.bind(this));

    this.add.text(190, 50, "Game Paused", {
      fontSize: "40px",
    });
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
      if (menuItem.text === "Continue") {
        this.scene.resume("");
        this.scene.stop("pause-scene");
      }
      if (menuItem.text === "End Game") {
        this.scene.start("menu-scene");
      }
    });
  }
}

export default MenuScene;
