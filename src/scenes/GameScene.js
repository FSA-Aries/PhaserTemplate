import Phaser, { Scene } from "phaser";
import Zombie from "../classes/Enemies/Zombie.js";
import Skeleton from "../classes/Enemies/Skeleton.js";
import Player from "../classes/Player";
import Bullet from "../classes/Bullet";
import assets from "../../public/assets";
import socket from "../socket/index.js";

import EventEmitter from "../events/Emitter";
import { config } from "../main";

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");
    this.player = undefined;
    this.cursors = undefined;
    this.game = undefined;
    this.reticle = undefined;
    //Setup Sockets
    this.socket = socket;
    this.state = {};
    //maybe we don't need to do line 23
    this.otherPlayers = undefined;
  }

  ///// PRELOAD /////
  preload() {
    this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
    this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
    this.load.image(assets.TILESET_KEY, assets.TILESET_URL);
    this.load.tilemapTiledJSON(assets.TILEMAP_KEY, assets.TILEMAP_URL);
    this.load.spritesheet(assets.PLAYER_KEY, assets.PLAYER_URL, {
      frameWidth: 50,
      frameHeight: 69,
    });

    //Enemies
    this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
      frameWidth: 30,
      frameHeight: 60,
    });
    this.load.spritesheet(assets.SKELETON_KEY, assets.SKELETON_URL, {
      frameWidth: 30,
      frameHeight: 64,
    });
    // this.physics.add.sprite(400, 375, assets.PLAYER_KEY);
  }

  ///// CREATE /////
  create({ input, gameStatus }) {
    const scene = this;
    let map = this.make.tilemap({ key: assets.TILEMAP_KEY });
    let tileSet = map.addTilesetImage("TiledSet", assets.TILESET_KEY);
    map.createLayer("Ground", tileSet, 0, 0);
    map.createLayer("Walls", tileSet, 0, 0);
    // Set invisible
    this.player = this.createPlayer(this, { x: 200, y: 300 });

    //Problem: Sockets loading after we set colliders/create mobs
    //Solution A: Create player before setting colliders and set visible to false
    //Problem with Solution A: Assigns colliders/creates mobs around placeholder player ignores our new player with socket id
    //Solution B: Move sockets to the top
    //Problem SB: This doesn't work
    //Solution C: async await
    //Solution D:

    //Sockets
    this.socket.on("setState", function (state) {
      const { roomKey, players, numPlayers } = state;
      scene.physics.resume();
      console.log("STATE ->", state);
      scene.state.roomKey = roomKey;
      scene.state.players = players;
      scene.state.numPlayers = numPlayers;
    });

    this.socket.on("currentPlayers", function (playerInfo) {
      console.log("Playerinfo ->", playerInfo);
      const { player, numPlayers } = playerInfo;
      scene.state.numPlayers = numPlayers;
      console.log("keys ->", Object.keys(player));
      Object.keys(player).forEach(function (id) {
        // if (player[id].playerId === socket.id) {
        //   console.log("PLAYER -->", player);
        //   scene.createPlayer(scene, player[id]);
        // }
        if (player[id].playerId !== socket.id) {
          scene.createOtherPlayer(scene, player[id]);
        }
      });
    });

    this.socket.on("newPlayer", function (arg) {
      const { playerInfo, numPlayers } = arg;
      scene.createOtherPlayer(scene, playerInfo);
      scene.state.numPlayers = numPlayers;
    });

    // this.socket.on("playerMoved", function (playerInfo) {
    //   //Grab all members of the group
    //   scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
    //     if (playerInfo.playerId === otherPlayer.playerId) {
    //       const oldX = this.otherPlayer.x;
    //       const oldY = this.otherPlayer.y;
    //       otherPlayer.setPosition(playerInfo.x, playerInfo.y);
    //     }
    //   });
    // });

    // this.socket.on("disconnected", function (arg) {
    //   const { playerId, numPlayers } = arg;
    //   scene.state.numPlayers = numPlayers;
    //   scene.otherPlayers.getChildren().forEach(function (otherPlayer) {
    //     if (playerId === otherPlayer.playerId) {
    //       otherPlayer.destroy();
    //     }
    //   });
    // });

    this.socket.emit("joinRoom", input);
    //CREATE OTHER PLAYERS GROUP
    this.otherPlayers = this.physics.add.group();

    //Zombie and Skeleton Groups
    let zombieGroup = this.add.group();
    let skeletonGroup = this.add.group();

    // Enemy Creation
    for (let i = 0; i < 2; i++) {
      this.time.addEvent({
        delay: 5000,
        callback: () => {
          zombieGroup.add(this.createZombie());
        },
        loop: true,
      });
    }
    for (let i = 0; i < 1; i++) {
      this.time.addEvent({
        delay: 10000,
        callback: () => {
          skeletonGroup.add(this.createSkeleton());
        },

        loop: true,
      });
    }

    console.log(this.player);

    //1) We need to create a player group and add it to colliders
    //2) We need to refactor how we create the enemy classes (specify which player zombie follows)
    ////Can add a method that takes in array of zombies and all of the players and for each monster --> checks distance and points towards player
    //Add method to each monster and velocity updates

    this.physics.add.collider(this.player, zombieGroup, this.onPlayerCollision);
    this.physics.add.collider(
      this.player,
      skeletonGroup,
      this.onPlayerCollision
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    let playerBullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });
    this.physics.add.collider(
      playerBullets,
      zombieGroup,
      this.onBulletCollision
    );
    this.physics.add.collider(
      playerBullets,
      skeletonGroup,
      this.onBulletCollision
    );
    this.reticle = this.physics.add.sprite(0, 0, assets.RETICLE_KEY);
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

  //       this
  //     );
  //   }
  update() {}

  ///// HELPER FUNCTIONS /////

  // PLAYER ANIMATION
  // createDefaultPlayer(player, playerInfo){
  //   this.player = new Player(player, playerInfo.x, playerInfo.y);
  //   this.player.setTexture(assets.PLAYER_KEY, 1);
  //   return this.player;
  // }

  createPlayer(player, playerInfo) {
    //maybe we can change player to this
    console.log("createPlayer -->", playerInfo);
    this.player = new Player(player, playerInfo.x, playerInfo.y);
    this.player.setTexture(assets.PLAYER_KEY, 1);
    // this.player.setVisible(false);
    console.log(this.player);
    return this.player;
  }

  createOtherPlayer(player, playerInfo) {
    console.log("createOtherPlayer -->", playerInfo);
    this.otherPlayer = new Player(player, playerInfo.x + 40, playerInfo.y + 40);
    this.otherPlayer.playerId = playerInfo.playerId;
    this.otherPlayers.add(this.otherPlayer);
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
  createZombie() {
    const randomizedPosition = Math.random() * 800;
    return new Zombie(
      this,
      randomizedPosition,
      randomizedPosition,
      assets.ZOMBIE_KEY,
      assets.ZOMBIE_URL,
      this.player
    );
  }
  createSkeleton() {
    const randomizedPosition = Math.random() * 800;
    return new Skeleton(
      this,
      randomizedPosition,
      randomizedPosition,
      assets.SKELETON_KEY,
      assets.SKELETON_URL,
      this.player
    );
  }

  createGameEvents() {
    EventEmitter.on("PLAYER_LOSE", () => {
      this.scene.restart({ gameStatus: "PLAYER_LOSE" });
    });
  }
  onPlayerCollision(player, monster) {
    console.log("HEALTH ->", player.health);
    //It should be the bullet's damage but we will just set a default value for now to test
    // monster.takesHit(player.damage);
    player.takesHit(monster);
    // player.setBounce(0.5, 0.5);
  }

  onBulletCollision(monster, bullet) {
    //console.log('bullet hit')
    //console.log(bullet)
    bullet.hitsEnemy(monster);
  }
}
