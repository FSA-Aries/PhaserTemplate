import BaseScene from "./BaseScene";

class MenuScene extends BaseScene {
  constructor() {
    super("menu-scene");

    this.menu = [
      { scene: "PlayScene", text: "Play" },
      { scene: "LevelScene", text: "Level Two" },
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

    this.add.text(570, 605, "Move", {
      fontSize: "22px",
    });
    this.add.image(600, 685, "arrow-keys").setScale(0.6);

    this.add.text(170, 610, "Shoot", {
      fontSize: "22px",
    });

    this.add.image(200, 700, "left-mouse-click").setScale(0.4);
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
      if (menuItem.text === "Play") {
        menuItem.scene && this.scene.start("game-scene");
      }

      if (menuItem.text === "Level Two") {
        menuItem.scene && this.scene.start("level-two");
      }
    });
  }
}

export default MenuScene;
