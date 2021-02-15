import Phaser from "phaser";
import assets from "../../public/assets";
import { config } from "../main";
import Zombie from "../classes/Enemies/Zombie.js";
import Vampire from "../classes/Enemies/Vampire.js";
import Score from "../hud/score";
import EventEmitter from "../events/Emitter";
import Bullet from "../classes/Bullet";
import Flame from "../classes/Flame"

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
    this.load.audio("skeleton-attack", "assets/audio/skeleton-attack.wav");
    this.load.audio(
      "vampire-attack",
      "assets/audio/008681096-vampire-hiss-05.m4a"
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
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.playerGroup = this.add.group();
    //CREATE TILEMAP
    let map = this.make.tilemap({ key: assets.TILEMAZEMAP_KEY });
    let tileMaze = map.addTilesetImage(
      "fantasy_tileset",
      assets.TILEMAZESET_KEY
    );
    map.createLayer("Base", tileMaze, 0, 0);
    map.createLayer("Shadows", tileMaze, 0, 0);
    let collisionLayer = map.createLayer("Walls", tileMaze, 0, 0);
    let collisionLayer2 = map.createLayer("Doors", tileMaze, 0, 0);

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
    zombieGroup.add(this.createZombie());
    for (let i = 0; i < 4; i++) {
      this.time.addEvent({
        delay: 3000,
        callback: () => {
          zombieGroup.add(this.createZombie());
        },
        repeat: 24,
      });
    }

    //////Fix Enemy Class then replace one zombie per for loop with Vampire///
    vampireGroup.add(this.createVampire());
    vampireGroup.add(this.createVampire());

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
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });

    let playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.physics.add.collider(
      playerBullets,
      collisionLayer,
      this.bulletWallCollision,
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

    if (this.player.flame) {
      let playerFlame = this.physics.add.group({
        classType: Flame,
        runChildUpdate: true,
      });

      this.player.flameAttack = playerFlame.get().setVisible(false).setScale(.6, .4);

      this.physics.add.overlap(this.player.flameAttack, vampireGroup, this.onBulletCollision, null, this);
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
    const randomizedPositionx = this.enemyXSpawn();
    const randomizedPositiony = this.enemyYSpawn();
    return new Vampire(
      this,
      randomizedPositionx,
      randomizedPositiony,
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
    if (monster.skeletonAttackSound) monster.skeletonAttackSound.play();
    if (monster.vampireAttackSound) monster.vampireAttackSound.play();
  }

  onBulletCollision(bullet, monster) {
    let score = this.score.score;
    if (monster.health - bullet.damage <= 0) {
      this.score.addPoints(1);
      if (this.score.score >= 299) {
        this.gameSceneNext();

        this.time.addEvent({
          delay: 9000,
          callback: () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once(
              Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
              (cam, effect) => {
                this.scene.start("fire-level", {
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
      .text(310, 370, "Vampires?! Really?!", {
        fontSize: "10px",
        color: "white",
      })
      .setScrollFactor(0);

    this.time.addEvent({
      delay: 3000,
      callback: () => {
        text1.setText("I'm starting to get tired.");

        this.time.addEvent({
          delay: 3000,
          callback: () => {
            text1.setText("If I don't get to safety soon.....");
          },
        });
      },
    });
  }
}
