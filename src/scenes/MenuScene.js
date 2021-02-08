import BaseScene from './BaseScene';

class MenuScene extends BaseScene {
  constructor() {
    super('menu-scene');

    this.menu = [
      { scene: 'PlayScene', text: 'Play' },
      { scene: 'WaitingRoom', text: 'Multiplayer' },
      { scene: null, text: 'Exit' },
    ];
  }

  // preload() {
  //   this.load.image(
  //     "arrow-keys",
  //     "https://thumbs.dreamstime.com/t/arrow-keys-black-3784132.jpg"
  //   );
  // }

  create() {
    super.create();

    this.createMenu(this.menu, this.setupMenuEvents.bind(this));

    this.add.text(52, 50, 'Move', {
      fontSize: '40px',
    });
    this.add.image(100, 150, 'arrow-keys').setDisplaySize(100, 100);

    this.add.text(190, 50, 'Shoot', {
      fontSize: '40px',
    });
    this.add.image(250, 150, 'left-mouse-click').setDisplaySize(100, 100);
  }

  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on('pointerover', () => {
      textGO.setStyle({ fill: '#ff0' });
    });

    textGO.on('pointerout', () => {
      textGO.setStyle({ fill: '#fff' });
    });


    textGO.on('pointerup', () => {
      if (menuItem.text === 'Play') {
        this.scene.start('game-scene');
      }
      if (menuItem.text === 'Multiplayer') {
        this.scene.start('WaitingRoom');
      }
      if (menuItem.text === 'Exit') {

        this.game.destroy(true);
      }
    });
  }
}

export default MenuScene;
