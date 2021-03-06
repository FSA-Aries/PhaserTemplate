import BaseScene from "./BaseScene";
import assets from "../../public/assets/index";
import { config } from "../main";

class MenuScene extends BaseScene {
  constructor() {
    super("menu-scene");

    this.menu = [
      { scene: "PlayScene", text: "Campaign" },
      { scene: "WaitingRoom", text: "Two-Player" },
      { scene: "endless", text: "Endless" },
      { scene: "characterLibrary", text: "Character Guide" },
    ];
  }

  create() {
    super.create();
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.createSoundButton(config.rightTopCorner.x - 50, 700).setScale(
      0.25,
      0.25
    );

    this.createMenu(this.menu, this.setupMenuEvents.bind(this));

    this.add.text(52, 600, "Move", {
      fontSize: "40px",
    });
    this.add.image(100, 700, "arrow-keys").setDisplaySize(100, 100);

    this.add.text(190, 600, "Shoot", {
      fontSize: "40px",
    });
    this.add.image(250, 700, "left-mouse-click").setDisplaySize(100, 100);

    this.add.text(500, 600, "Skill", {
      fontSize: "40px",
    });
    this.add.image(550, 700, "shift-button").setDisplaySize(100, 100);
    this.add.text(650, 600, "Pause", {
      fontSize: "40px",
    });
    this.add.image(700, 700, "esc-button").setDisplaySize(100, 100);
  }

  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on("pointerover", () => {
      this.sound
        .add(assets.MENUMOUSE_KEY, { loop: false, volume: 0.53 })
        .play();
      textGO.setStyle({ fill: "#ff0" });
    });

    textGO.on("pointerout", () => {
      textGO.setStyle({ fill: "#fff" });
    });

    textGO.on("pointerup", () => {
      if (menuItem.text === "Campaign") {
        menuItem.scene &&
          this.scene.start("characterSelect", { gameType: "single" });
      }

      if (menuItem.text === "Two-Player") {
        this.scene.start("WaitingRoom");
      }
      if (menuItem.text === "Endless") {
        this.scene.start("characterSelect", { gameType: "endless" });
      }
      if (menuItem.text === "Character Guide") {
        this.scene.start("characterLibrary", { gametype: "wiki" });
      }
    });
  }
  createSoundButton(x, y) {
    const button = this.add.image(x, y, assets.SOUND_ON_KEY);
    button.setInteractive();

    button.setScrollFactor(0, 0).setScale(1);

    button.on("pointerdown", () => {
      if (button.texture.key === assets.SOUND_ON_KEY) {
        button.setTexture(assets.SOUND_OFF_KEY);
        this.sound.mute = true;
      } else {
        button.setTexture(assets.SOUND_ON_KEY);
        this.sound.mute = false;
      }
    });
    this.add.existing(button);
    return button;
  }
}

export default MenuScene;
