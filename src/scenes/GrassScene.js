import Phaser from "phaser";
import Zombie from "../classes/Enemies/Zombie.js";
import Skeleton from "../classes/Enemies/Skeleton.js";
import Bullet from "../classes/Bullet";
import assets from "../../public/assets";
import socket from "../socket/index.js";
import Score from "../hud/score";
import EventEmitter from "../events/Emitter";
import { config } from "../main";
import Flame from "../classes/Flame"

export default class GrassScene extends Phaser.Scene {
  constructor() {
    super("grassScene");
    this.selectedCharacter = undefined;
    this.player = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    this.socket = socket;
    this.state = {};
    this.name = "grassScene";
  }

  ///// INIT /////

  init(data) {
    this.selectedCharacter = data.character;
  }

  ///// PRELOAD /////
  preload() {
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();

    // this.load.image("static", "red-static.jpg");
    this.load.image("hell", "assets/backgrounds/hell-image.jpg");

    this.load.image(assets.SOUND_OFF_KEY, assets.SOUND_OFF_URL);
    this.load.image(assets.SOUND_OFF_KEY, assets.SOUND_OFF_URL);
    this.load.image(assets.SOUND_ON_KEY, assets.SOUND_ON_URL);

    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
    this.load.image(assets.SCALEDSPSET_KEY, assets.SCALEDSPSET_URL);
    this.load.tilemapTiledJSON(assets.SCALEDSPMAP_KEY, assets.SCALEDSPMAP_URL);

    this.selectedCharacter.loadSprite(this);

    this.load.audio(assets.FUMIKOSKILL_KEY, assets.FUMIKOSKILL_URL)
    this.load.audio(assets.TANKSKILL_KEY, assets.TANKSKILL_URL)
    this.load.audio(assets.FIREMANSKILL_KEY, assets.FIREMANSKILL_URL)

    this.load.audio(
      "zombie-attack",
      "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
    );
    this.load.audio("skeleton-attack", "assets/audio/skeleton-attack.wav");

    this.load.audio("ending-audio", "assets/audio/ending-audio.mp3");

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
    this.cameras.main.fadeIn(1000, 0, 0, 0)
    this.playerGroup = this.add.group();
    let map = this.make.tilemap({ key: assets.SCALEDSPMAP_KEY });
    let tileSet = map.addTilesetImage("Terrain", assets.SCALEDSPSET_KEY);
    map.createLayer("Floor", tileSet, 0, 0);
    map.createLayer("Between 2", tileSet, 0, 0);
    let collisionLayer = map.createLayer("Collision 1", tileSet, 0, 0);
    map.createLayer("Between", tileSet, 0, 0);
    let collisionLayer2 = map.createLayer("Collision 2", tileSet, 0, 0);

    this.player = this.createPlayer(this, { x: 200, y: 300 });

    collisionLayer.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, collisionLayer);
    collisionLayer2.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, collisionLayer2);

    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      this.getScore()
    );

    this.createSoundButton(
      config.rightTopCorner.x - 20,
      config.rightTopCorner.y + 20
    ).setScale(0.07, 0.07);

    this.time.addEvent({ delay: 5000, callback: () => { } });
    this.time.addEvent({ delay: 5000, callback: () => { } });
    this.time.addEvent({ delay: 5000, callback: () => { } });

    // this.time.addEvent({
    //   delay: 5000,
    //   callback: () => {
    //     this.add.image(0, 0, "static").setScale(2.5, 2.5);
    //   },
    // });

    //Zombie and Skeleton Groups
    let zombieGroup = this.physics.add.group();
    let skeletonGroup = this.physics.add.group();

    // Enemy Creation

    this.endingText();

    this.time.addEvent({
      delay: 45500,
      callback: () => {
        for (let i = 0; i < 6; i++) {
          this.time.addEvent({
            delay: 2000,
            callback: () => {
              zombieGroup.add(this.createZombie().setTint(0x3fbf3f));
            },
            loop: true,
          });
        }
        for (let i = 0; i < 4; i++) {
          this.time.addEvent({
            delay: 5000,
            callback: () => {
              skeletonGroup.add(this.createSkeleton().setTint(0x3fbf3f));
            },

            loop: true,
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

    this.cursors = this.input.keyboard.createCursorKeys();
    this.cursors = this.input.keyboard.addKeys({
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });
    let playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    if (this.player.flame) {
      let playerFlame = this.physics.add.group({
        classType: Flame,
        runChildUpdate: true,
      });

      this.player.flameAttack = playerFlame.get().setVisible(false).setScale(.6, .4);

      this.physics.add.overlap(this.player.flameAttack, skeletonGroup, this.onBulletCollision, null, this);
      this.physics.add.overlap(this.player.flameAttack, zombieGroup, this.onBulletCollision, null, this);
    }

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

    this.physics.add.collider(
      playerBullets,
      collisionLayer2,
      this.bulletWallCollision,
      null,
      this
    );
    this.physics.add.collider(
      playerBullets,
      collisionLayer,
      this.bulletWallCollision,
      null,
      this
    );

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
          this.player.setAlpha(1);
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

    //Tank ability check
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
    this.player = new this.selectedCharacter(player, 400, 400);
    this.player.createTexture();
    return this.player;
  }

  endingText() {
    this.time.addEvent({
      delay: 500,
      callback: () => {
        this.sound
          .add("ending-audio", {
            volume: 1.4,
          })
          .play();
        let text1 = this.add.text(210, 365, "Congratulations!", {
          fontSize: "47px",
          color: "red",
        });
        this.time.addEvent({
          delay: 1500,
          callback: () => {
            text1.destroy();
            let text2 = this.add.text(190, 370, "You Won The Game :D", {
              fontSize: "47px",
              color: "red",
            });
            this.time.addEvent({
              delay: 1000,
              callback: () => {
                text2.destroy();
                let createdBy = this.add.text(310, 370, "Created By", {
                  fontSize: "60px",
                  color: "red",
                });
                let morgan = this.add.text(40, 40, "Morgan Hu", {
                  fontSize: "45px",
                  color: "red",
                });
                let juan = this.add.text(40, 600, "Juan Velazquez", {
                  fontSize: "45px",
                  color: "red",
                });
                let kelvin = this.add.text(500, 40, "Kelvin Lin", {
                  fontSize: "45px",
                  color: "red",
                });
                let brandon = this.add.text(500, 600, "Brandon Fox", {
                  fontSize: "45px",
                  color: "red",
                });

                this.time.addEvent({
                  delay: 7000,
                  callback: () => {
                    createdBy.destroy();
                    kelvin.destroy();
                    juan.destroy();
                    brandon.destroy();
                    morgan.destroy();

                    this.time.addEvent({
                      delay: 1000,
                      callback: () => {
                        let redStatic = this.add
                          .image(400, 400, "hell")
                          .setScale(3, 3);
                        this.physics.pause();
                        this.time.addEvent({
                          delay: 32000,
                          callback: () => {
                            redStatic.destroy();
                            this.physics.resume();
                          },
                        });
                      },
                    });
                  },
                });
              },
            });
          },
        });
      },
    });
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

  createGameEvents() {
    EventEmitter.on("PLAYER_LOSE", () => {
      this.scene.start("game-over", { gameStatus: "PLAYER_LOSE" });
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
    }
    if (bullet.texture.key === 'bullet') {
      bullet.hitsEnemy(monster);
    } else if (bullet.texture.key === 'fireKey') {
      bullet.flameHit(monster);
    }
  }



  getScore() {
    if (this.scene.settings.data.score) {
      return this.scene.settings.data.score;
    } else {
      0;
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
}
