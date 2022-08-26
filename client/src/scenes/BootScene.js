import {Scene} from 'phaser';
import {Client} from 'colyseus.js';

class BootScene extends Scene {
  constructor() {
    super("scene-boot");
  }

  preload() {
    // Load any assets here from your assets directory
    this.load.image('cat-like', 'assets/cat-like-creature.png');
  }

  create() {
    this.add.text(10, 10, "Click to join.", {
      color: '#FFF',
      fontFamily: 'monospace',
      fontSize: 18
    }).setOrigin(0, 0);

    this.registry.gameClient = new Client('ws://localhost:2567');

    this.input.on('pointerdown', async () => {
      const room = await this.registry.gameClient.joinOrCreate("my_room");
      this.registry.gameRoom = room;

      this.scene.start('scene-game');
    });
  }
}

export default BootScene;
