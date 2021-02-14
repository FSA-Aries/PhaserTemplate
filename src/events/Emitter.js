import Phaser from "phaser";

//Emitter needed to allow a Game Over Event in Game Scenes
class EventEmitter extends Phaser.Events.EventEmitter {
  constructor() {
    super();
  }
}

export default new EventEmitter();
