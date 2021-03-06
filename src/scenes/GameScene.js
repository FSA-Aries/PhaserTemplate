import Phaser from "phaser";
import Zombie from "../classes/Enemies/Zombie.js";
import Skeleton from "../classes/Enemies/Skeleton.js";
import Player from "../classes/Player";
import Bullet from "../classes/Bullet";
import Flame from "../classes/Flame"
import assets from "../../public/assets";
import Score from "../hud/score";
import EventEmitter from "../events/Emitter";
import { config } from "../main";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.selectedCharacter = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    this.state = {};
    this.playerGroup = undefined;
    this.player = undefined;
    this.secondScore = undefined;
    this.zombieGroup = undefined;
    this.name = "game-scene";
  }

  init(data) {
    this.selectedCharacter = data.character;
  }

  ///// PRELOAD /////
  preload() {
    this.load.audio("intro", "assets/audio/Intro.mp3");

    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();

    this.load.image(assets.SOUND_OFF_KEY, assets.SOUND_OFF_URL);
    this.load.image(assets.SOUND_ON_KEY, assets.SOUND_ON_URL);

    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
    this.load.image(assets.TILESET_KEY, assets.TILESET_URL);
    this.load.tilemapTiledJSON(assets.TILEMAP_KEY, assets.TILEMAP_URL);

    this.selectedCharacter.loadSprite(this);

    this.load.audio(assets.FUMIKOSKILL_KEY, assets.FUMIKOSKILL_URL)
    this.load.audio(assets.TANKSKILL_KEY, assets.TANKSKILL_URL)
    this.load.audio(assets.FIREMANSKILL_KEY, assets.FIREMANSKILL_URL)

    this.load.audio(
      "zombie-attack",
      "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
    );
    this.load.audio("skeleton-attack", "assets/audio/skeleton-attack.wav");

    //Enemies
    this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
      frameWidth: 30,
      frameHeight: 62.5,
    });
    this.load.spritesheet(assets.SKELETON_KEY, assets.SKELETON_URL, {
      frameWidth: 30,
      frameHeight: 64,
    });
  }

  ///// CREATE /////
  create({ gameStatus }) {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.playerGroup = this.add.group();
    let map = this.make.tilemap({ key: assets.TILEMAP_KEY });

    let tileSet = map.addTilesetImage("TiledSet", assets.TILESET_KEY);
    map.createLayer("Ground", tileSet, 0, 0);
    let walls = map.createLayer("Walls", tileSet, 0, 0);
    walls.setCollisionByExclusion([-1]);

    //Create player and playerGroup
    this.player = this.createPlayer(this, { x: 200, y: 300 });

    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      0
    );
    this.createSoundButton(
      config.rightTopCorner.x - 20,
      config.rightTopCorner.y + 20
    ).setScale(0.07, 0.07);

    //Zombie and Skeleton Groups
    let zombieGroup = this.physics.add.group();
    let skeletonGroup = this.physics.add.group();
    this.zombieGroup = zombieGroup;

    this.time.addEvent({
      delay: 21000,
      callback: () => {
        for (let i = 0; i < 3; i++) {
          this.time.addEvent({
            delay: 3000,
            callback: () => {
              zombieGroup.add(this.createZombie());
            },
            repeat: 24,
          });
        }
        for (let i = 0; i < 1; i++) {
          this.time.addEvent({
            delay: 3000,
            callback: () => {
              skeletonGroup.add(this.createSkeleton());
            },

            repeat: 24,
          });
        }
      },
    });

    this.physics.add.collider(
      this.playerGroup,
      zombieGroup,
      this.onPlayerCollision
    );
    this.physics.add.collider(
      this.playerGroup,
      skeletonGroup,
      this.onPlayerCollision
    );

    this.physics.add.collider(this.player, zombieGroup, this.onPlayerCollision);

    this.physics.add.collider(
      this.player,
      skeletonGroup,
      this.onPlayerCollision
    );

    this.physics.add.collider(zombieGroup, skeletonGroup, null);
    this.physics.add.collider(zombieGroup, zombieGroup, null);
    this.physics.add.collider(skeletonGroup, skeletonGroup, null);

    if (this.player.flame) {
      let playerFlame = this.physics.add.group({
        classType: Flame,
        runChildUpdate: true,
      });

      this.player.flameAttack = playerFlame.get().setVisible(false).setScale(.6, .4);

      this.physics.add.overlap(this.player.flameAttack, skeletonGroup, this.onBulletCollision, null, this);
      this.physics.add.overlap(this.player.flameAttack, zombieGroup, this.onBulletCollision, null, this);
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    //PAUSE MENU
    this.cursors = this.input.keyboard.addKeys({
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });
    let playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.physics.add.collider(playerBullets, walls, this.bulletWallCollision, null, this);

    this.physics.add.collider(
      playerBullets,
      zombieGroup,
      this.onBulletCollision,
      null,
      this
    );
    this.physics.add.collider(
      playerBullets,
      skeletonGroup,
      this.onBulletCollision,
      null,
      this
    );

    this.physics.add.collider(this.playerGroup, this.playerGroup);
    this.physics.add.collider(this.player, walls);

    this.reticle = this.physics.add.sprite(0, 0, assets.RETICLE_KEY);
    this.reticle.setDisplaySize(25, 25).setCollideWorldBounds(true);

    this.input.on(
      "pointerdown",
      function () {
        if (this.player.active === false) return;

        // Get bullet from bullets group
        let bullet = playerBullets.get().setActive(true).setVisible(true);
        bullet.setDamage(this.player.damage);

        if (bullet) {
          bullet.fire(this.player, this.reticle);
        }
        if (this.player.hidden === true) {
          this.player.hidden = false;
          this.player.body.checkCollision.none = false;
          this.player.setAlpha(1)
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

    this.introText();



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

    //Tank Heal ability check
    if (this.cursors.shift.isDown && this.player.abilityCounter <= 3) {
      this.player.usingAbility = true;

      if (this.player.usingAbility === true) {
        this.player.ability();
        this.player.usingAbility = false;
      }

    } else if (this.cursors.shift.isDown && this.player.abilityCounter >= 4) {
      let cantHeal = this.add
        .text(310, 370, "Out of heals", {
          fontSize: "13px",
          color: "white",
        })
        .setScrollFactor(0);
      this.time.addEvent({
        delay: 3000,
        callback: () => {
          cantHeal.destroy();
        }
      })
    }

    //Fireman Ability check
    if (this.player.flame) {

      this.player.flameAttack.setX(this.player.x)
      this.player.flameAttack.setY(this.player.y)

      if (this.player.flameAttack.visible) {
        this.player.flameAttack.body.checkCollision.none = false;
      } else if (this.player.flameAttack.visible !== true) {
        this.player.flameAttack.body.checkCollision.none = true;
      }

    }

  }

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION

  createPlayer(player, playerInfo) {
    this.sound.add("intro", { loop: false, volume: 0.53 }).play();

    this.sound.add("intro", { loop: false, volume: 0.53 }).play();
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

  createSkeleton() {
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();

    return new Skeleton(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.SKELETON_KEY,
      assets.SKELETON_URL,
      this.player
    );
  }

  introText() {
    this.time.addEvent({
      delay: 4000,
      callback: () => {
        let text1 = this.add.text(328, 365, "Welcome To", {
          fontSize: "25px",
          color: "red",
        });
        this.time.addEvent({
          delay: 3000,
          callback: () => {
            text1.destroy();
            let text2 = this.add.text(310, 370, "Senior Phaser", {
              fontSize: "25px",
              color: "red",
            });
            this.time.addEvent({
              delay: 7000,
              callback: () => {
                text2.destroy();
                // this.zombieGroup.add(this.createZombie());

                let createdBy = this.add.text(310, 370, "Created By", {
                  fontSize: "40px",
                  color: "red",
                });
                let morgan = this.add.text(40, 40, "Morgan Hu", {
                  fontSize: "35px",
                  color: "red",
                });
                let juan = this.add.text(40, 600, "Juan Velazquez", {
                  fontSize: "35px",
                  color: "red",
                });
                let kelvin = this.add.text(520, 40, "Kelvin Lin", {
                  fontSize: "35px",
                  color: "red",
                });
                let brandon = this.add.text(520, 600, "Brandon Fox", {
                  fontSize: "35px",
                  color: "red",
                });

                this.time.addEvent({
                  delay: 10000,
                  callback: () => {
                    createdBy.destroy();
                    kelvin.destroy();
                    juan.destroy();
                    brandon.destroy();
                    morgan.destroy();
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  createGameEvents() {
    EventEmitter.on("PLAYER_LOSE", () => {
      this.scene.start("game-over", {
        gameStatus: "PLAYER_LOSE",
        character: this.selectedCharacter,
      });
    });
  }

  onPlayerCollision(player, monster) {
    player.takesHit(monster);
    if (monster.zombieAttackSound) monster.zombieAttackSound.play();
    if (monster.skeletonAttackSound) monster.skeletonAttackSound.play();
  }


  onBulletCollision(bullet, monster) {
    let score = this.score.score;
    if (monster.health - bullet.damage <= 0) {
      this.score.addPoints(1);
      if (score >= 99) {
        this.gameSceneNext();
        this.time.addEvent({
          delay: 9000,
          callback: () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(
              Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
              (cam, effect) => {
                this.scene.start("LevelOne", {
                  score: score,
                  character: this.selectedCharacter,
                });
              }
            );
          },
        });
      }
    }
    if (bullet.texture.key === 'bullet') {
      bullet.hitsEnemy(monster);
    } else if (bullet.texture.key === 'fireKey') {
      bullet.flameHit(monster);
    }
  }

  bulletWallCollision(bullet, map) {
    bullet.destroy();
  }

  createScoreLabel(x, y, score) {
    const style = {
      fontSize: "32px",
      fill: "#ffffff",
      fontStyle: "bold",
    };
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

  gameSceneNext() {
    let text1 = this.add
      .text(310, 370, "Guess this world's been overrun by monsters", {
        fontSize: "10px",
        color: "white",
      })
      .setScrollFactor(0);

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        text1.setText("That voice on the radio mentioned a safe place...");

        this.time.addEvent({
          delay: 3000,
          callback: () => {
            text1.setText("Guess I'd better head over and check it out.");
          },
        });
      },
    });
  }
}
