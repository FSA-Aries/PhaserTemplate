import BaseScene from './BaseScene';
import assets from '../../public/assets/index';
import { config } from '../main';

class MenuScene extends BaseScene {
  constructor() {
    super('menu-scene');

    this.menu = [
      { scene: 'PlayScene', text: 'Campaign' },
      { scene: 'WaitingRoom', text: 'Two-Player' },
      { scene: 'endless', text: 'Endless' },
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

    this.createSoundButton(
      config.rightTopCorner.x - 50,
      config.rightTopCorner.y + 20
    ).setScale(0.25, 0.25);

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
      if (menuItem.text === 'Campaign') {
        menuItem.scene && this.scene.start('characterSelect');
      }
      if (menuItem.text === 'Two-Player') {
        this.scene.start('WaitingRoom');
      }
      if (menuItem.text === 'Endless') {
        this.scene.start('characterSelect', { gameType: 'endless' });
      }
    });
  }
  createSoundButton(x, y) {
    const button = this.add.image(x, y, assets.SOUND_ON_KEY);
    button.setInteractive();

    button.setScrollFactor(0, 0).setScale(1);

    button.on('pointerdown', () => {
      console.log('clicked');
      if (button.texture.key === assets.SOUND_ON_KEY) {
        console.log('sound off');
        button.setTexture(assets.SOUND_OFF_KEY);
        this.sound.mute = true;
      } else {
        console.log('sound on');

        button.setTexture(assets.SOUND_ON_KEY);
        this.sound.mute = false;
      }
    });
    this.add.existing(button);
    return button;
  }
}

export default MenuScene;
