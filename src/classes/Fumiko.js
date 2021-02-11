import Phaser from "phaser";
import assets from "../../public/assets";
import HealthBar from "../hud/healthbar";
import { config } from "../main";
import EventEmmiter from "../events/Emitter";

class Fumiko extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player");
        scene.add.existing(this);
        scene.physics.add.existing(this);
        scene.physics.world.enable(this);
        this.cursors = undefined;
        this.playerId = undefined;
        this.hidden = false;
        //this.timer = scene.time.addEvent(this.timer);

        this.damage = 200;
        this.x = x;
        this.y = y;

        this.init();
        this.initEvents();
        this.oldPosition = { x: this.x, y: this.y, rotation: this.rotation };


    }



    init() {



        this.hasBeenHit = false;
        this.bounceVelocity = 250;
        this.setCollideWorldBounds(true);
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.cursors = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
        });

        this.health = 175;

        this.hp = new HealthBar(
            this.scene,
            config.leftTopCorner.x + 5,
            config.leftTopCorner.y + 5,
            3,
            this.health
        );

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers(assets.FUMIKO_LEFT_KEY, {
                start: 1,
                end: 3,
            }),
            frameRate: 10,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers(assets.FUMIKO_RIGHT_KEY, {
                start: 1,
                end: 3,
            }),
            frameRate: 10,
        });
        this.anims.create({
            key: "up",
            frames: this.anims.generateFrameNumbers(assets.FUMIKO_UP_KEY, {
                start: 1,
                end: 3,
            }),
            frameRate: 10,
        });
        this.anims.create({
            key: "down",
            frames: this.anims.generateFrameNumbers(assets.FUMIKO_DOWN_KEY, {
                start: 1,
                end: 3,
            }),
            frameRate: 10,
        });



    }
    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update() {
        if (this.hasBeenHit || !this.body) {
            return;
        }
        this.setVelocity(0);
        let prevVelocity = this.body.velocity.clone();

        if (this.cursors.left.isDown) {
            this.setVelocityX(-300);
            prevVelocity = this.body.velocity.clone()


        } else if (this.cursors.right.isDown) {
            this.setVelocityX(300);
            prevVelocity = this.body.velocity.clone()

        }
        if (this.cursors.up.isDown) {
            this.setVelocityY(-300);
            prevVelocity = this.body.velocity.clone()

        } else if (this.cursors.down.isDown) {
            this.setVelocityY(300);
            prevVelocity = this.body.velocity.clone()

        }

        if (this.cursors.left.isDown) {
            this.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.anims.play("right", true);
        } else if (this.cursors.up.isDown) {
            this.anims.play("up", true);
        } else if (this.cursors.down.isDown) {
            this.anims.play("down", true);
        } else {
            this.anims.stop();
            console.log(this.anims.getName())

            if (this.anims.getName() === 'left') {
                this.setTexture(assets.FUMIKO_LEFT_KEY, 0)
            } else if (this.anims.getName() === 'right') {
                this.setTexture(assets.FUMIKO_RIGHT_KEY, 0)
            } else if (this.anims.getName() === 'up') {
                this.setTexture(assets.FUMIKO_UP_KEY, 0)
            } else if (this.anims.getName() === 'down') {
                this.setTexture(assets.FUMIKO_DOWN_KEY, 0)
            }

        }

        if (this.cursors.shift.JustDown) {

            this.ability()
            console.log(this.hidden)

        }
    }

    ability() {

        /* if (!this.hidden) {
            this.body.checkCollision.none = !this.body.checkCollision.none


        }
        if (this.body.checkCollision.none) {
            this.setAlpha(.5)
            setTimeout(function () {
                console.log(this)
                this.body.checkCollision.none = !this.body.checkCollision.none
                this.setAlpha(1)
            }, 3000)

        } */


    }



    playDamageTween() {
        return this.scene.tweens.add({
            targets: this,
            duration: 100,
            repeat: -1,
            tint: 0xffffff,
        });
    }

    bounceOff() {
        if (this.body.touching.right) {
            setTimeout(() => this.setVelocityX(-this.bounceVelocity), 0);
        }
        if (this.body.touching.left) {
            setTimeout(() => this.setVelocityX(this.bounceVelocity), 0);
        }
        if (this.body.touching.up) {
            setTimeout(() => this.setVelocityY(this.bounceVelocity), 0);
        }
        if (this.body.touching.down) {
            setTimeout(() => this.setVelocityY(-this.bounceVelocity), 0);
        }
    }

    takesHit(monster) {
        if (this.hasBeenHit) {
            return;
        }
        if (this.health - monster.damage <= 0) {
            EventEmmiter.emit("PLAYER_LOSE");
            return;
        }

        this.hasBeenHit = true;
        this.bounceOff();
        const hitAnim = this.playDamageTween();
        this.health -= monster.damage;
        this.hp.decrease(this.health);

        //controls how far and for how long the bounce happens
        this.scene.time.delayedCall(300, () => {
            this.hasBeenHit = false;
            hitAnim.stop();
            this.clearTint();
        });
    }

    createTexture() {
        this.setTexture(assets.FUMIKO_DOWN_KEY, 0);
    }

    static loadSprite(scene) {
        scene.load.spritesheet(assets.FUMIKO_LEFT_KEY, assets.FUMIKO_LEFT_URL, {
            frameWidth: 32.25,
            frameHeight: 46,
        });
        scene.load.spritesheet(assets.FUMIKO_RIGHT_KEY, assets.FUMIKO_RIGHT_URL, {
            frameWidth: 31.75,
            frameHeight: 44,
        });
        scene.load.spritesheet(assets.FUMIKO_UP_KEY, assets.FUMIKO_UP_URL, {
            frameWidth: 31.25,
            frameHeight: 45,
        });
        scene.load.spritesheet(assets.FUMIKO_DOWN_KEY, assets.FUMIKO_DOWN_URL, {
            frameWidth: 31.25,
            frameHeight: 45,
        });

        scene.load.spritesheet(assets.FUMIKO_DOWNPHASE_KEY, assets.FUMIKO_DOWNPHASE_URL, {
            frameWidth: 30,
            frameHeight: 45,
        });
        scene.load.spritesheet(assets.FUMIKO_LEFTPHASE_KEY, assets.FUMIKO_LEFTPHASE_URL, {
            frameWidth: 33,
            frameHeight: 42,
        });
        scene.load.spritesheet(assets.FUMIKO_RIGHTPHASE_KEY, assets.FUMIKO_RIGHTPHASE_URL, {
            frameWidth: 33,
            frameHeight: 42,
        });
        scene.load.spritesheet(assets.FUMIKO_UPPHASE_KEY, assets.FUMIKO_UPPHASE_URL, {
            frameWidth: 32,
            frameHeight: 53,
        });


    }
}

export default Fumiko;
