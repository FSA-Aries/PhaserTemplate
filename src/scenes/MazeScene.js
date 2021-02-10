import Phaser from "phaser";
import assets from "../../public/assets";
import { config } from "../main";
import Zombie from "../classes/Enemies/Zombie.js";
import Vampire from "../classes/Enemies/Vampire.js";
import Tank from "../classes/Tank";
import Score from "../hud/score";
import TankAtk from "../classes/TankAtk";

export default class MazeScene extends Phaser.Scene {
  constructor() {
    super("maze-scene");
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    this.score = undefined;
    this.state = {};
    this.playerGroup = undefined;
    this.player = undefined;
  }

  preload() {
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.refresh();
    this.load.image(assets.TANKATK_KEY, assets.TANKATK_URL);
    this.load.image(assets.TANK_RETICLE_KEY, assets.TANK_RETICLE_URL);
    this.load.image(assets.TILEMAZESET_KEY, assets.TILEMAZESET_URL);

    this.load.tilemapTiledJSON(assets.TILEMAZEMAP_KEY, assets.TILEMAZEMAP_URL);
    //LOAD AUDIO
    this.load.audio(
      "zombie-attack",
      "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
    );

    //LOAD SPRITE
    this.load.spritesheet(assets.TANK_KEY, assets.TANK_URL, {
      frameWidth: 75,
      frameHeight: 109,
    });
    //LOAD ENEMIES
    this.load.spritesheet(assets.VAMPIRE_KEY, assets.VAMPIRE_URL, {
      frameWidth: 72,
      frameHeight: 107,
    });
    this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
      frameWidth: 30,
      frameHeight: 60,
    });
  }

  create({ gameStatus }) {
    this.playerGroup = this.add.group();
    //CREATE TILEMAP
    let map = this.make.tilemap({ key: assets.TILEMAZEMAP_KEY });
    let tileMaze = map.addTilesetImage("main", assets.TILEMAZESET_KEY);
    this.tileMaze = map.createLayer("Base", tileMaze, 0, 0);
    let collisionLayer = map.createLayer("Colliders", tileMaze, 0, 0);
    let collisionLayer2 = map.createLayer("Colliders 2", tileMaze, 0, 0);

    collisionLayer.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, collisionLayer);
    collisionLayer2.setCollisionByExclusion([-1]);
    this.physics.add.collider(this.player, collisionLayer2);
    //CREATE PLAYER
    this.player = this.createPlayer(this, { x: 200, y: 300 });

    this.player.setTexture(assets.TANK_KEY, 0);

    //CREATE SCORE LABEL
    this.score = this.createScoreLabel(
      config.rightTopCorner.x + 5,
      config.rightTopCorner.y,
      0
    );
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

    this.physics.add.collider(zombieGroup, vampireGroup, null);
    this.physics.add.collider(zombieGroup, zombieGroup, null);
    this.physics.add.collider(vampireGroup, vampireGroup, null);

    //ADD WEAPON
    this.cursors = this.input.keyboard.createCursorKeys();
    let playerBullets = this.physics.add.group({
      classType: TankAtk,
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

    this.reticle = this.physics.add.sprite(0, 0, assets.TANK_RETICLE_KEY);
    this.reticle.setDisplaySize(25, 25).setCollideWorldBounds(true);

    this.input.on(
      "pointerdown",
      function () {
        if (this.player.active === false) return;

        // Get bullet from bullets group
        let bullet = playerBullets.get().setActive(true).setVisible(true);

        if (bullet) {
          bullet.fire(this.player, this.reticle);
          //this.physics.add.collider(enemy, bullet, enemyHitCallback);
        }
      },
      this
    );
    this.setupFollowupCameraOn(this.player);

    this.input.on(
      "pointermove",
      function (pointer) {
        //console.log(this.input.mousePointer.x)
        const transformedPoint = this.cameras.main.getWorldPoint(
          pointer.x,
          pointer.y
        );

        this.reticle.x = transformedPoint.x;
        this.reticle.y = transformedPoint.y;

        //this.player.rotation = angle;
      },
      this
    );

    if (gameStatus === "PLAYER_LOSE") {
      return;
    }
    this.createGameEvents();
  }
  update() {}
  createPlayer(player, playerInfo) {
    this.player = new Tank(player, playerInfo.x, playerInfo.y);
    this.player.setTexture(assets.TANK_KEY, 0);

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
    // const randomizedPositionx = Math.random() * 800 + this.player.x;
    // const randomizedPositiony = Math.random() * 800 + this.player.y;
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
    // const randomizedPositionx = Math.random() * 800 + this.player.x;
    // const randomizedPositiony = Math.random() * 800 + this.player.y;
    return new Vampire(
      this,
      randomizedPositionx,
      randomizedPositiony,
      assets.VAMPIRE_KEY,
      assets.VAMPIRE_URL,
      undefined,
      this.player
    );
  }

  createGameEvents() {
    EventEmitter.on("PLAYER_LOSE", () => {
      this.scene.start("game-over", { gameStatus: "PLAYER_LOSE" });
    });
  }
  onPlayerCollision(player, monster) {
    //It should be the bullet's damage but we will just set a default value for now to test
    // monster.takesHit(player.damage);
    //console.log(monster);
    player.takesHit(monster);
    if (monster.zombieAttackSound) monster.zombieAttackSound.play();
    // player.setBounce(0.5, 0.5);
  }

  onBulletCollision(bullet, monster) {
    if (monster.health - bullet.damage <= 0) {
      console.log(this.score);
      this.score.addPoints(1);
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
}
