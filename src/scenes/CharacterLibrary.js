import Phaser from "phaser";
import assets from "../../public/assets/index";
import Smol from "../classes/Smol";
import Tank from "../classes/Tank";
import Fumiko from "../classes/Fumiko";
import Fireman from "../classes/Fireman";
import BaseScene from "./BaseScene";

export default class CharacterLibrary extends BaseScene {
  constructor() {
    super("characterLibrary");
    this.selection = undefined;
    this.chosenCharacter = undefined;
    this.startInstructions = undefined;
    this.characterIntro = undefined;
    this.gameType = undefined;
    this.clicked = undefined;
    this.backButton = undefined;
    this.fumikoStory = undefined;
    this.tankStory = undefined;
    this.fireStory = undefined;
    this.smolStory = undefined;

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
    this.load.image(assets.FUMIKO_STORY, assets.FUMIKO_STORY_URL);
    this.load.image(assets.TANK_STORY, assets.TANK_STORY_URL);
    this.load.image(assets.SMOL_STORY, assets.SMOL_STORY_URL);
    this.load.image(assets.FIREMAN_STORY, assets.FIREMAN_STORY_URL);

    this.load.audio(assets.DMCMENU_KEY, assets.DMCMENU_URL);
    this.load.audio(assets.GUNCOCK_KEY, assets.GUNCOCK_URL);
  }

  create() {
    super.create();
    this.clicked = this.sound.add(assets.DMCMENU_KEY, {
      loop: false,
      volume: 0.53,
    });
    this.createCharacterLibrary(this.menu, this.setupMenuEvents.bind(this));

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

    this.add.text(52, 50, "Character Library", {
      fontSize: "40px",
      color: "#FFFFFF",
    });

    this.fumikoStory = this.add
      .image(500, 500, assets.FUMIKO_STORY)
      .setVisible(false);

    this.tankStory = this.add
      .image(500, 500, assets.TANK_STORY)
      .setVisible(false);

    this.smolStory = this.add
      .image(500, 500, assets.SMOL_STORY)
      .setVisible(false);
    this.fireStory = this.add
      .image(500, 500, assets.FIREMAN_STORY)
      .setVisible(false);

    this.characterIntro = this.add
      .text(52, 250, "", {
        fontSize: "40px",
        color: "#FFFFFF",
      })
      .setVisible(false);
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
      if (menuItem.key === "Smol") {
        this.fireStory.setVisible(false);
        this.fumikoStory.setVisible(false);
        this.tankStory.setVisible(false);
        this.smolStory.setVisible(true);
      }
      if (menuItem.key === "Tank") {
        this.fireStory.setVisible(false);
        this.fumikoStory.setVisible(false);
        this.tankStory.setVisible(true);
        this.smolStory.setVisible(false);
      }
      if (menuItem.key === "Fumiko") {
        this.fireStory.setVisible(false);
        this.fumikoStory.setVisible(true);
        this.tankStory.setVisible(false);
        this.smolStory.setVisible(false);
      }
      if (menuItem.key === "Fireman") {
        this.fireStory.setVisible(true);
        this.fumikoStory.setVisible(false);
        this.tankStory.setVisible(false);
        this.smolStory.setVisible(false);
      }
      this.startInstructions.setVisible(true);
    });
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
