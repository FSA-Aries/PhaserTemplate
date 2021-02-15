import Phaser from "phaser";
import assets from "../../public/assets/index";
import Smol from "../classes/Smol";
import Tank from "../classes/Tank";
import Fumiko from "../classes/Fumiko";
import Player from "../classes/Player";
import Fireman from "../classes/Fireman";
import BaseScene from "./BaseScene";

export default class CharacterSelect extends BaseScene {
  constructor() {
    super("characterSelect");
    this.selection = undefined;
    this.chosenCharacter = undefined;
    this.startInstructions = undefined;
    this.characterIntro = undefined;
    this.gameType = undefined;
    this.clicked = undefined;
    this.backButton = undefined;

    this.menu = [
      { key: assets.TANK_SELECT_KEY, character: Tank },
      { key: assets.FUMIKO_SELECT_KEY, character: Fumiko },
      { key: assets.SMOL_SELECT_KEY, character: Smol },
      { key: assets.FIREMAN_SELECT_KEY, character: Fireman },
    ];
  }

  init(data) {
    this.gameType = data.gameType;
  }

  preload() {
    this.load.image(assets.FUMIKO_SELECT_KEY, assets.FUMIKO_SELECT_URL);
    this.load.image(assets.TANK_SELECT_KEY, assets.TANK_SELECT_URL);
    this.load.image(assets.SMOL_SELECT_KEY, assets.SMOL_SELECT_URL);
    this.load.image(assets.FIREMAN_SELECT_KEY, assets.FIREMAN_SELECT_URL);
    this.load.image(assets.BACKBUTTON_KEY, assets.BACKBUTTON_URL);

    this.load.audio(assets.DMCMENU_KEY, assets.DMCMENU_URL);
    this.load.audio(assets.GUNCOCK_KEY, assets.GUNCOCK_URL);
  }

  create() {
    super.create();
    this.clicked = this.sound.add(assets.DMCMENU_KEY, {
      loop: false,
      volume: 0.53,
    });
    this.createCharacterMenu(this.menu, this.setupMenuEvents.bind(this));

    this.backButton = this.add
      .image(700, 72, assets.BACKBUTTON_KEY)
      .setScale(0.05, 0.05);
    this.backButton.setInteractive();
    this.backButton.on("pointerover", () => {
      this.backButton.setScale(0.07, 0.07);
    });
    this.backButton.on("pointerout", () => {
      this.backButton.setScale(0.05, 0.05);
    });
    this.backButton.on("pointerdown", this.handleClick, this);

    this.add.text(52, 50, "Select your character", {
      fontSize: "40px",
      color: "#FFFFFF",
    });

    this.chosenCharacter = this.add
      .text(52, 195, "Selected", {
        fontSize: "40px",
        color: "#FFFFFF",
      })
      .setVisible(false);

    this.characterIntro = this.add
      .text(52, 250, "", {
        fontSize: "40px",
        color: "#FFFFFF",
      })
      .setVisible(false);

    this.startInstructions = this.add
      .text(52, 750, "Press Space to Start", {
        fontSize: "40px",
        color: "#FFFFFF",
      })
      .setVisible(false);

    this.input.keyboard.once("keydown-SPACE", this.handleContinue, this);
  }

  setupMenuEvents(menuItem) {
    const imageGO = menuItem.imageGO;
    imageGO.setInteractive();
    imageGO.setAlpha(0.8);

    imageGO.on("pointerover", () => {
      imageGO.setAlpha(1);
    });

    imageGO.on("pointerout", () => {
      imageGO.setAlpha(0.8);
    });

    imageGO.on("pointerdown", () => {
      this.clicked.play();
      this.selection = menuItem.character;

      this.chosenCharacter.setText(`${menuItem.key} Selected`).setVisible(true);
      if (menuItem.key === "Smol") {
        this.characterIntro
          .setText(
            "Smol is great, Smol is tough, Smol is probably already dead"
          )
          .setVisible(true)
          .setScale(0.5);
      }
      if (menuItem.key === "Tank") {
        this.characterIntro
          .setText("Tank will go where he pleases!")
          .setVisible(true)
          .setScale(1);
      }
      if (menuItem.key === "Fumiko") {
        this.characterIntro
          .setText("Out of sight, out of mind... (SHIFT key available)")
          .setVisible(true)
          .setScale(0.6);
      }
      if (menuItem.key === "Fireman") {
        this.characterIntro
          .setText("He's pretty hot")
          .setVisible(true)
          .setScale(1);
      }
      this.startInstructions.setVisible(true);
    });
  }

  handleContinue() {
    this.sound.add(assets.GUNCOCK_KEY, { loop: false, volume: 0.53 }).play();
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      (cam, effect) => {
        if (this.gameType === "endless") {
          this.scene.start("endless", { character: this.selection });
        }

        if (this.gameType === "single") {
          this.scene.start("game-scene", { character: this.selection });
          //   this.scene.start("darkness-level", { character: this.selection });
        }
      }
    );
  }

  handleClick() {
    this.clicked.play();

    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      (cam, effect) => {
        this.scene.start("menu-scene");
      }
    );
  }
}
