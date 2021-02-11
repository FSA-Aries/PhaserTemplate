import Phaser from "phaser";
import Zombie from "../classes/Enemies/Zombie.js";
import Skeleton from "../classes/Enemies/Skeleton.js";

import Player from "../classes/Player";
import OtherPlayerSprite from "../classes/OtherPlayers";
import Bullet from "../classes/Bullet";
import assets from "../../public/assets";
import socket from "../socket/index.js";
import Score from "../hud/score";

import EventEmitter from "../events/Emitter";
import { config } from "../main";

export default class Multiplayer extends Phaser.Scene {
    constructor() {
        super("Multiplayer");
        this.cursors = undefined;
        this.game = undefined;
        this.reticle = undefined;
        this.score = undefined;
        this.socket = socket;
        this.state = {};
        this.playerGroup = undefined;
        this.player = undefined;
        this.otherPlayer = undefined;
        this.secondScore = undefined;
        this.zombieGroup = undefined;
    }

    ///// PRELOAD /////
    preload() {


        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.refresh();

        this.load.image(assets.BULLET_KEY, assets.BULLET_URL);
        this.load.image(assets.RETICLE_KEY, assets.RETICLE_URL);
        this.load.image(assets.TILESET_KEY, assets.TILESET_URL);
        this.load.tilemapTiledJSON(assets.TILEMAP_KEY, assets.TILEMAP_URL);
        this.load.spritesheet(assets.PLAYER_KEY, assets.PLAYER_URL, {
            frameWidth: 50,
            frameHeight: 69,
        });

        this.load.audio(
            "zombie-attack",
            "assets/audio/Zombie-Aggressive-Attack-A6-www.fesliyanstudios.com-[AudioTrimmer.com].mp3"
        );

        //Enemies
        this.load.spritesheet(assets.ZOMBIE_KEY, assets.ZOMBIE_URL, {
            frameWidth: 30,
            frameHeight: 60,
        });
        this.load.spritesheet(assets.SKELETON_KEY, assets.SKELETON_URL, {
            frameWidth: 30,
            frameHeight: 64,
        });


    }

    ///// CREATE /////
    create({ input, gameStatus }) {
        const scene = this;
        this.playerGroup = this.add.group();
        let map = this.make.tilemap({ key: assets.TILEMAP_KEY });


        let tileSet = map.addTilesetImage("TiledSet", assets.TILESET_KEY);
        map.createLayer("Ground", tileSet, 0, 0);
        let walls = map.createLayer("Walls", tileSet, 0, 0);
        walls.setCollisionByExclusion([-1]);

        //Sockets
        socket.on("setState", function (state) {
            const { roomKey, players, numPlayers } = state;

            scene.state.roomKey = roomKey;
            scene.state.players = players;
            scene.state.numPlayers = numPlayers;
        });

        socket.on("currentPlayers", function (playerInfo) {
            console.log("Playerinfo ->", playerInfo);
            const { player, numPlayers } = playerInfo;
            scene.state.numPlayers = numPlayers;
            console.log("keys ->", Object.keys(player));
            Object.keys(player).forEach(function (id) {
                if (player[id].playerId === socket.id) {
                    scene.player.roomKey = scene.state.roomKey;
                } else {
                    scene.createOtherPlayer(scene, player[id]);
                }
            });
        });

        socket.on("newPlayer", function (arg) {
            const { playerInfo, numPlayers } = arg;
            scene.createOtherPlayer(scene, playerInfo);
            scene.state.numPlayers = numPlayers;
        });

        socket.on("playerMoved", function (playerInfo) {
            //Grab all members of the group
            if (scene.playerGroup.getChildren().length > 1) {
                scene.playerGroup.getChildren().forEach(function () {
                    if (playerInfo.playerId === scene.otherPlayer.playerId) {
                        scene.otherPlayer.setPosition(playerInfo.x, playerInfo.y);
                    }
                });
            }
        });

        socket.on("bulletFired", function (playerInfo) {
            scene.playerGroup.getChildren().forEach(function () {

                if (playerInfo.playerId === scene.otherPlayer.playerId) {
                    let bullet = playerBullets.get().setActive(true).setVisible(true);
                    bullet.fire(scene.otherPlayer, scene.reticle);
                }
            });
        });

        socket.on("scoreChanges", function ({ playerInfo, score }) {
            scene.playerGroup.getChildren().forEach(function () {
                if (playerInfo.playerId === scene.otherPlayer.playerId) {
                    if (scene.secondScore === undefined) {
                        scene.secondScore = scene.createScoreLabel(
                            config.rightTopCorner.x + 5,
                            config.rightTopCorner.y + 50,
                            score
                        );
                    } else {
                        scene.secondScore.setScore(score);
                    }
                }
            });
        });

        socket.on("disconnected", function (arg) {
            const { playerId, numPlayers } = arg;
            scene.state.numPlayers = numPlayers;
            scene.playerGroup.getChildren().forEach(function () {
                if (playerId === scene.otherPlayer.playerId) {
                    scene.otherPlayer.destroy();
                }
            });
        });

        socket.emit("joinRoom", input);
        //Create player and playerGroup
        this.player = this.createPlayer(this, { x: 200, y: 300 });
        this.playerGroup.add(this.player);
        //CREATE OTHER PLAYERS GROUP
        this.player.setTexture(assets.PLAYER_KEY, 1);

        this.score = this.createScoreLabel(
            config.rightTopCorner.x + 5,
            config.rightTopCorner.y,
            0
        );


        //Zombie and Skeleton Groups
        let zombieGroup = this.physics.add.group();
        let skeletonGroup = this.physics.add.group();
        this.zombieGroup = zombieGroup;

        for (let i = 0; i < 4; i++) {
            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    zombieGroup.add(this.createZombie(this.playerGroup));
                },
                repeat: 25,
            });

        }

        for (let i = 0; i < 2; i++) {
            this.time.addEvent({
                delay: 5000,
                callback: () => {
                    skeletonGroup.add(this.createSkeleton());
                },
                repeat: 3,
            });
        }

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
            skeletonGroup,
            this.onBulletCollision,
            null,
            this
        );

        this.physics.add.collider(this.playerGroup, this.playerGroup);

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
                    socket.emit("bulletFire", {
                        roomKey: this.state.roomKey,
                    });

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

            // socket.emit("playerDied", { roomKey: scene.state.roomKey });

            return;
        }

        this.createGameEvents();
    }
    update() {
        const scene = this;
        var x = scene.player.x;
        var y = scene.player.y;
        if (x !== scene.player.oldPosition.x || y !== scene.player.oldPosition.y) {
            scene.player.moving = true;
            socket.emit("playerMovement", {
                x: scene.player.x,
                y: scene.player.y,
                roomKey: scene.state.roomKey,
            });
        }
        scene.player.oldPosition = {
            x: scene.player.x,
            y: scene.player.y,
        };
    }

    ///// HELPER FUNCTIONS /////

    // PLAYER ANIMATION

    createPlayer(player, playerInfo) {

        this.player = new Player(player, playerInfo.x, playerInfo.y);
        this.player.setTexture(assets.PLAYER_KEY, 1);
        return this.player;
    }

    createOtherPlayer(player, playerInfo) {

        this.otherPlayer = new OtherPlayerSprite(
            player,
            playerInfo.x + 40,
            playerInfo.y + 40
        );
        this.otherPlayer.playerId = playerInfo.playerId;
        this.playerGroup.add(this.otherPlayer);
        return this.otherPlayer;
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

    createZombie(playerGroup) {
        const randomizedPositionx = this.enemyXSpawn();
        const randomizedPositiony = this.enemyYSpawn();

        return new Zombie(
            this,
            randomizedPositionx,
            randomizedPositiony,
            assets.ZOMBIE_KEY,
            assets.ZOMBIE_URL,
            this.playerGroup,
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

    }

    onBulletCollision(bullet, monster) {
        if (monster.health - bullet.damage <= 0) {
            this.score.addPoints(1);
            socket.emit("scoreChanged", {
                roomKey: this.state.roomKey,
                score: this.score.score,
            });
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
