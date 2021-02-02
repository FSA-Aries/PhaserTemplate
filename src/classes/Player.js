import Phaser from "phaser";
import assets from "../../public/assets";
import HealthBar from "../hud/healthbar";

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    // scene.physics.add.existing(this);
    scene.physics.world.enable(this);
    this.cursors = undefined;

    //Mixins
    this.health = 100;
    this.damage = 50;

    this.init();
    this.initEvents();
  }

  init() {
    this.hasBeenHit = false;
    this.bounceVelocity = 250;
    this.setCollideWorldBounds(true);
    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.hp = new HealthBar(this.scene, 200, 200, this.health);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 3,
        end: 5,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: assets.PLAYER_KEY, frame: 1 }],
      frameRate: 10,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 6,
        end: 8,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 9,
        end: 11,
      }),
      frameRate: 10,
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers(assets.PLAYER_KEY, {
        start: 0,
        end: 2,
      }),
      frameRate: 10,
    });
  }
  initEvents() {
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update() {
    //const { left, right, up, down } = this.cursors;
    if (this.hasBeenHit) {
      return;
    }
    this.setVelocity(0);
    const prevVelocity = this.body.velocity.clone();

    if (this.cursors.left.isDown) {
      this.setVelocityX(-150);
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(150);
    }
    if (this.cursors.up.isDown) {
      this.setVelocityY(-150);
    } else if (this.cursors.down.isDown) {
      this.setVelocityY(150);
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

      if (prevVelocity.x < 0) this.setTexture(assets.PLAYER_KEY, 4);
      else if (prevVelocity.x > 0) this.setTexture(assets.PLAYER_KEY, 8);
      else if (prevVelocity.y < 0) this.setTexture(assets.PLAYER_KEY, 10);
      else if (prevVelocity.y > 0) this.setTexture(assets.PLAYER_KEY, 1);
    }
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
    if (this.health > 0) {
      console.log(this.health);
      if (this.hasBeenHit) {
        return;
      }
      this.health -= monster.damage;
      // this.body.checkCollision.none = true; ????
      this.hasBeenHit = true;
      this.bounceOff();
      const hitAnim = this.playDamageTween();

      //controls how far and for how long the bounce happens
      this.scene.time.delayedCall(300, () => {
        this.hasBeenHit = false;
        hitAnim.stop();
        this.clearTint();
      });

      // this.scene.time.addEvent({
      //   //controls how far and for how long the bounce happens
      //   delay: 250,
      //   callback: () => {
      //     this.hasBeenHit = false;
      //   },
      //   loop: false,
      // });
    }
  }
  // bounceBack(monster) {
  //   // 1) Animation that we play
  //   // 2) The velocity that moves
  //   let direction;
  //   if (this.body.touching.right) {
  //     direction = "right";
  //   } else if (this.body.touching.left) {
  //     direction = "left";
  //   } else if (this.body.touching.up) {
  //     direction = "up";
  //   } else if (this.body.touching.down) {
  //     direction = "down";
  //   }

  //   console.log("DIRECTION ->", direction);
  //   console.log("VELOCITY ->", this.body.velocity);
  //   if (direction === "left") {
  //     // this.anims.play("right", true);
  //     this.setVelocityX(-600);
  //   } else if (direction === "right") {
  //     // this.anims.play("left", true);
  //     this.setVelocityX(600);
  //   } else if (direction === "up") {
  //     // this.anims.play("down", true);
  //     this.setVelocityY(-600);
  //   } else if (direction === "down") {
  //     // this.anims.play("up", true);
  //     this.setVelocityY(600);
  //   }
  // }

  // hasHit(player) {
  //   console.log("I have hit,", player);
  // }
}

export default Player;
