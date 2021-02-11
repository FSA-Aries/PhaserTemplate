import BaseScene from "./BaseScene";

class MenuScene extends BaseScene {
  constructor() {
    super("menu-scene");

    this.menu = [
      { scene: "PlayScene", text: "Play" },
      { scene: "LevelOne", text: "Level One" },
      { scene: "LevelTwo", text: "Fire Level" },
      { scene: "LevelThree", text: "Darkness Level" },
      { scene: "WaitingRoom", text: "Multiplayer" },
      { scene: "grassScene", text: "Grass Level" },
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

    this.add.text(52, 50, "Move", {
      fontSize: "40px",
    });
    this.add.image(100, 150, "arrow-keys").setDisplaySize(100, 100);

    this.add.text(190, 50, "Shoot", {
      fontSize: "40px",
    });
    this.add.image(250, 150, "left-mouse-click").setDisplaySize(100, 100);
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
      if (menuItem.text === "Multiplayer") {
        this.scene.start("WaitingRoom");
      }

      if (menuItem.text === "Darkness Level") {
        menuItem.scene && this.scene.start("darkness-level");
      }
      if (menuItem.text === "Fire Level") {
        menuItem.scene && this.scene.start("fire-level");
      }
      if (menuItem.text === "Grass Level") {

        menuItem.scene && this.scene.start("characterSelect");

      }
      if (menuItem.text === "Level One") {
        this.scene.start("LevelOne");
      }
    });
  }
}

export default MenuScene;
