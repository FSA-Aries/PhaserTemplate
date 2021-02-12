import BaseScene from "./BaseScene";
class PauseScene extends BaseScene {
  constructor() {
    super("pause-scene");
    this.menu = [
      { scene: "PlayScene", text: "Continue" },
      { scene: "PauseScene", text: "End Game" },
    ];
    this.name = undefined;
  }
  init(data) {
    this.name = data.key;
  }
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
        this.scene.resume(this.name);
        this.scene.stop("pause-scene");
      }
      if (menuItem.text === "End Game") {
        // this.registry.destroy();
        // this.events.off();
        // this.scene.restart();
        // this.scene.start("menu-scene");
        this.scene.stop("pause-scene");
        this.scene.stop(this.name);
        this.scene.start("menu-scene");
      }
    });
  }
}
export default PauseScene;
