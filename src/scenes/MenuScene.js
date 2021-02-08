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

  // preload() {
  //   this.load.image(
  //     "arrow-keys",
  //     "https://thumbs.dreamstime.com/t/arrow-keys-black-3784132.jpg"
  //   );
  // }

  create() {
    super.create();

    this.createMenu(this.menu, this.setupMenuEvents.bind(this));

    this.add.text(570, 579, "Move", {
      fontSize: "37px",
    });
    this.add.image(600, 700, "arrow-keys");

    this.add.text(150, 500, "Shoot", {
      fontSize: "37px",
    });
    this.add.image(200, 700, "left-mouse-click");
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
      menuItem.scene && this.scene.start("WaitingRoom");

      if (menuItem.text === "Exit") {
        this.game.destroy(true);
      }
    });
  }
}

export default MenuScene;
