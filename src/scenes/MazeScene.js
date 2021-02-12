import Phaser from "phaser";
import assets from "../../public/assets";
import { config } from "../main";
import Zombie from "../classes/Enemies/Zombie.js";
import Vampire from "../classes/Enemies/Vampire.js";
import Score from "../hud/score";
import EventEmitter from "../events/Emitter";
import Bullet from "../classes/Bullet";

export default class MazeScene extends Phaser.Scene {
  constructor() {
    super("maze-scene");
    this.selectedCharacter = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    this.state = {};
    this.playerGroup = undefined;
    this.player = undefined;
    this.name = "maze-scene";
  }

  init(data) {
    this.selectedCharacter = data.character;
  }

  preload() {
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();
    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);

    this.load.image(assets.SOUND_OFF_KEY, assets.SOUND_OFF_URL);
    this.load.image(assets.SOUND_ON_KEY, assets.SOUND_ON_URL);

    this.load.image(assets.TILEMAZESET_KEY, assets.TILEMAZESET_URL);
    this.load.tilemapTiledJSON(assets.TILEMAZEMAP_KEY, assets.TILEMAZEMAP_URL);
    //LOAD AUDIO
    this.load.audio(
      "zombie-attack",
      "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
    );

    //LOAD SPRITE
    this.selectedCharacter.loadSprite(this);

    //LOAD ENEMIES
    this.load.spritesheet(assets.VAMPIRE_KEY, assets.VAMPIRE_URL, {
      frameWidth: 53.7,
      frameHeight: 80,
    });
    this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
      frameWidth: 30,
      frameHeight: 62.5,
    });
  }

  create({ gameStatus }) {
    this.playerGroup = this.add.group();
    //CREATE TILEMAP
    let map = this.make.tilemap({ key: assets.TILEMAZEMAP_KEY });
    let tileMaze = map.addTilesetImage("Tilemaze", assets.TILEMAZESET_KEY);
    map.createLayer("Base", tileMaze, 0, 0);
    let collisionLayer = map.createLayer("Colliders", tileMaze, 0, 0);
    let collisionLayer2 = map.createLayer("Colliders 2", tileMaze, 0, 0);

    this.player = this.createPlayer(this, { x: 240, y: 50 });

    collisionLayer.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, collisionLayer);
    collisionLayer2.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, collisionLayer2);

    //CREATE SCORE LABEL
    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      this.getScore()
    );

    this.createSoundButton(
      config.rightTopCorner.x - 20,
      config.rightTopCorner.y + 20
    ).setScale(0.07, 0.07);

    //Zombie and Skeleton Groups
    let zombieGroup = this.physics.add.group();
    let vampireGroup = this.physics.add.group();

    // Enemy Creation

    for (let i = 0; i < 4; i++) {
      this.time.addEvent({
        delay: 2000,
        callback: () => {
          zombieGroup.add(this.createZombie());
        },
        repeat: 25,
      });
    }
    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 5000,
        callback: () => {
          vampireGroup.add(this.createVampire());
        },

        loop: true,
      });
    }

    this.physics.add.collider(
      this.playerGroup,
      zombieGroup,
      this.onPlayerCollision
    );
    this.physics.add.collider(
      this.playerGroup,
      vampireGroup,
      this.onPlayerCollision
    );

    this.physics.add.collider(this.player, zombieGroup, this.onPlayerCollision);
    this.physics.add.collider(
      this.player,
      vampireGroup,
      this.onPlayerCollision
    );

    this.physics.add.collider(zombieGroup, vampireGroup, null);
    this.physics.add.collider(zombieGroup, zombieGroup, null);
    this.physics.add.collider(vampireGroup, vampireGroup, null);

    //ADD WEAPON
    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors = this.input.keyboard.addKeys({
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
    });

    let playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.physics.add.collider(
      playerBullets,
      zombieGroup,
      this.onBulletCollision,
      null,
      this
    );
    this.physics.add.collider(
      playerBullets,
      vampireGroup,
      this.onBulletCollision,
      null,
      this
    );

    this.reticle = this.physics.add.sprite(0, 0, assets.RETICLE_KEY);
    this.reticle.setDisplaySize(25, 25).setCollideWorldBounds(true);

    this.input.on(
      "pointerdown",
      function () {
        if (this.player.active === false) return;
        let bullet = playerBullets.get().setActive(true).setVisible(true);
        bullet.setDamage(this.player.damage);

        if (bullet) {
          bullet.fire(this.player, this.reticle);
        }
      },
      this
    );
    this.setupFollowupCameraOn(this.player);

    this.input.on(
      "pointermove",
      function (pointer) {
        const transformedPoint = this.cameras.main.getWorldPoint(
          pointer.x,
          pointer.y
        );

        this.reticle.x = transformedPoint.x;
        this.reticle.y = transformedPoint.y;
      },
      this
    );

    if (gameStatus === "PLAYER_LOSE") {
      return;
    }
    this.createGameEvents();
  }
  update() {
    if (this.cursors.esc.isDown) {
      this.scene.pause();
      this.scene.launch("pause-scene", { key: this.name });
    }
  }

  createPlayer(player, playerInfo) {
    this.player = new this.selectedCharacter(
      player,
      playerInfo.x,
      playerInfo.y
    );
    this.player.createTexture();
    return this.player;
  }
  setupFollowupCameraOn(player) {
    this.physics.world.setBounds(0, 0, config.width, config.height);

    this.cameras.main
      .setBounds(0, 0, config.width, config.height)
      .setZoom(config.zoomFactor);
    this.cameras.main.startFollow(player);
  }

  enemyXSpawn() {
    if (this.player.x > 400) {
      if (this.player.x > 700) {
        return this.player.x / 2 - Math.floor(Math.random() * 301 + 200);
      }
      return this.player.x / 2 - Math.floor(Math.random() * 201 + 100);
    }

    if (this.player.x < 400) {
      if (this.player.x < 100)
        return this.player.x * 2 + Math.floor(Math.random() * 301 + 200);
    }
    return this.player.x * 2 + Math.floor(Math.random() * 201 + 100);
  }

  enemyYSpawn() {
    if (this.player.y > 375) {
      if (this.player.y > 700) {
        return this.player.y / 2 - Math.floor(Math.random() * 301 + 200);
      }
      return this.player.y / 2 - Math.floor(Math.random() * 201 + 100);
    }

    if (this.player.y < 375) {
      if (this.player.y < 100)
        return this.player.y * 2 + Math.floor(Math.random() * 301 + 200);
    }
    return this.player.y * 2 + Math.floor(Math.random() * 201 + 100);
  }

  createZombie() {
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();
    return new Zombie(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.ZOMBIE_KEY,
      assets.ZOMBIE_URL,
      undefined,
      this.player
    );
  }

  createVampire() {
    return new Vampire(
      this,
      700,
      30,
      assets.VAMPIRE_KEY,
      assets.VAMPIRE_URL,
      this.player
    );
  }
  getScore() {
    if (this.scene.settings.data.score) {
      return this.scene.settings.data.score;
    } else {
      0;
    }
  }

  createGameEvents() {
    EventEmitter.on("PLAYER_LOSE", () => {
      this.scene.start("game-over", { gameStatus: "PLAYER_LOSE" });
    });
  }
  onPlayerCollision(player, monster) {
    player.takesHit(monster);
    if (monster.zombieAttackSound) monster.zombieAttackSound.play();
  }

  onBulletCollision(bullet, monster) {
    let score = this.score.score;
    if (monster.health - bullet.damage <= 0) {
      this.score.addPoints(1);
      if (this.score.score >= 75) {
        this.scene.start("LevelOne", {
          score: score,
          character: this.selectedCharacter,
        });
      }
    }

    bullet.hitsEnemy(monster);
  }

  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#ff0000", fontStyle: "bold" };

    const label = new Score(this, x, y, score, style);
    label.setScrollFactor(0, 0).setScale(1);
    this.add.existing(label);
    return label;
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
