import Phaser from "phaser";
import Zombie from "../classes/Enemies/Zombie.js";
import Skeleton from "../classes/Enemies/Skeleton.js";
import Bullet from "../classes/Bullet";
import assets from "../../public/assets";
import socket from "../socket/index.js";
import Score from "../hud/score";
import Imp from "../classes/Enemies/Imp";
import Flame from "../classes/Flame"

import EventEmitter from "../events/Emitter";
import { config } from "../main";

export default class FireLevel extends Phaser.Scene {
  constructor() {
    super("fire-level");
    this.selectedCharacter = undefined;
    this.player = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;

    //Setup Sockets
    this.socket = socket;
    this.name = "fire-level";
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
    this.load.image(assets.FIRESET_KEY, assets.FIRESET_URL);
    this.load.tilemapTiledJSON(assets.FIREMAP_KEY, assets.FIREMAP_URL);
    this.selectedCharacter.loadSprite(this);

    this.load.audio(assets.FUMIKOSKILL_KEY, assets.FUMIKOSKILL_URL)
    this.load.audio(assets.TANKSKILL_KEY, assets.TANKSKILL_URL)
    this.load.audio(assets.FIREMANSKILL_KEY, assets.FIREMANSKILL_URL)

    this.load.audio(
      "zombie-attack",
      "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
    );
    this.load.audio("skeleton-attack", "assets/audio/skeleton-attack.wav");
    this.load.audio("imp-attack", "assets/audio/Imp Sound.mp3");

    //Enemies
    this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
      frameWidth: 30,
      frameHeight: 62.5,
    });

    this.load.spritesheet(assets.IMP_KEY, assets.IMP_URL, {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.spritesheet(assets.SKELETON_KEY, assets.SKELETON_URL, {
      frameWidth: 30,
      frameHeight: 64,
    });
  }

  ///// CREATE /////
  create({ gameStatus }) {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    let map = this.make.tilemap({ key: assets.FIREMAP_KEY });
    let tileSet = map.addTilesetImage("Fireset", assets.FIRESET_KEY);
    map.createLayer("Floor", tileSet, 0, 0);
    let lava = map.createLayer("Collision", tileSet, 0, 0);
    lava.setCollisionByExclusion([-1]);

    this.player = this.createPlayer(this, { x: 200, y: 300 });

    this.physics.add.collider(this.player, lava);

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
    let skeletonGroup = this.physics.add.group();
    let impGroup = this.physics.add.group();

    // Enemy Creation
    zombieGroup.add(this.createZombie());
    for (let i = 0; i < 2; i++) {
      this.time.addEvent({
        delay: 3000,
        callback: () => {
          zombieGroup.add(this.createZombie().setTint(0xff0000));
        },
        repeat: 24,
      });
    }
    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 3000,
        callback: () => {
          impGroup.add(this.createImp());
        },
        repeat: 24,
      });
    }
    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 3000,
        callback: () => {
          skeletonGroup.add(this.createSkeleton().setTint(0xff0000));
        },
        repeat: 24,
      });
    }

    this.physics.add.collider(this.player, zombieGroup, this.onPlayerCollision);

    this.physics.add.collider(
      this.player,
      skeletonGroup,
      this.onPlayerCollision
    );
    this.physics.add.collider(this.player, impGroup, this.onPlayerCollision);

    this.physics.add.collider(zombieGroup, skeletonGroup);
    this.physics.add.collider(zombieGroup, zombieGroup);
    this.physics.add.collider(skeletonGroup, skeletonGroup);
    this.physics.add.collider(impGroup, skeletonGroup);
    this.physics.add.collider(impGroup, impGroup);
    this.physics.add.collider(impGroup, zombieGroup);

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
      this.physics.add.overlap(this.player.flameAttack, impGroup, this.onBulletCollision, null, this);
    }

    this.physics.add.collider(playerBullets, lava, this.bulletWallCollision, null, this);

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
      impGroup,
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

  // PLAYER ANIMATION
  createPlayer(player, playerInfo) {
    this.player = new this.selectedCharacter(player, 400, 400);
    this.player.createTexture();
    return this.player;
  }

  getScore() {
    if (this.scene.settings.data.score) {
      return this.scene.settings.data.score;
    } else {
      0;
    }
  }

  setupFollowupCameraOn(player) {
    this.physics.world.setBounds(
      0,
      0,
      config.width + config.mapOffset,
      config.height
    );

    this.cameras.main
      .setBounds(0, 0, config.width + config.mapOffset, config.height)
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
  createImp() {
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();

    return new Imp(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.IMP_KEY,
      assets.IMP_URL,
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
    if (monster.impAttackSound) monster.impAttackSound.play();
  }

  onBulletCollision(bullet, monster) {
    let score = this.score.score;

    if (monster.health - bullet.damage <= 0) {
      this.score.addPoints(1);

      if (this.score.score >= 399) {
        this.gameSceneNext();

        this.time.addEvent({
          delay: 9000,
          callback: () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(
              Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
              (cam, effect) => {
                this.scene.start("darkness-level", {
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
      .text(310, 370, "I'm definitely in hell....", {
        fontSize: "10px",
        color: "white",
      })
      .setScrollFactor(0);

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        text1.setText("I shouldn't have listened to the voice on the radio.");

        this.time.addEvent({
          delay: 3000,
          callback: () => {
            text1.setText("I have a bad feeling about this next room....");
          },
        });
      },
    });
  }
}
