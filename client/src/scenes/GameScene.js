import {Scene} from 'phaser';

class GameScene extends Scene {
  constructor() {
    super("scene-game");
  }

  create() {
    this.players = {}; // A map of all players in room
    this.player = null; // A ref to this client's player
    this.playerID = this.registry.gameRoom.sessionId; // This client's playerID (sessionId)

    this.keys = this.input.keyboard.addKeys({
      up: 'W',
      down: 'S',
      left: 'A',
      right: 'D'
    });

    this.registry.gameRoom.onStateChange((state) => {
      state.players.forEach((player, sessionId) => {
        const playerSpawned = (typeof this.players[sessionId] !== 'undefined');

        // Update existing player
        if (playerSpawned) {
          const {x, y} = player;

          this.players[sessionId].setPosition(x, y);
        }
        // Initial player spawn
        else {
          const {x, y} = player;
          this.players[sessionId] = this.add.sprite(x, y, 'cat-like');

          if (sessionId === this.playerID) {
            this.player = this.players[sessionId];
            this.cameras.main.startFollow(this.player);
          }
        }
      });

      // Remove any players who have left
      Object.keys(this.players).forEach((key) => {
        if (typeof state.players.get(key) === 'undefined') {
          this.players[key].destroy();
          delete this.players[key];
        }
      });
    });

    // Zoom the camera out
    this.cameras.main.setZoom(0.5);
  }

  update() {
    const {up, left, down, right} = this.keys;
    this.registry.gameRoom.send('player_movement', {
      up: up.isDown,
      left: left.isDown,
      down: down.isDown,
      right: right.isDown
    });
  }
}

export default GameScene;
