import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { ArcadePhysics } from "arcade-physics";
import { Body } from 'arcade-physics/lib/physics/arcade/Body';

const FPS = 60;
const CAT_WIDTH = 100;
const CAT_HEIGHT = 200;
const CAT_SPEED = 350;

export class MyRoom extends Room<MyRoomState> {

  physics: ArcadePhysics = null;
  tick: number = 0;
  bodies: Record<string, Body> = {};

  onCreate(options: any) {
    this.setState(new MyRoomState());

    this.onMessage("player_movement", (client, { up, left, down, right }) => {
      const body = this.bodies[client.sessionId];

      if (up) {
        body.setVelocityY(-CAT_SPEED);
      }
      else if (down) {
        body.setVelocityY(CAT_SPEED);
      }
      else {
        body.setVelocityY(0);
      }

      if (left) {
        body.setVelocityX(-CAT_SPEED);
      }
      else if (right) {
        body.setVelocityX(CAT_SPEED);
      }
      else {
        body.setVelocityX(0);
      }
    });

    // Initialize the room's physics
    const config = {
      sys: {
        game: {
          config: {}
        },
        settings: {
          physics: {
            debug: true,
            gravity: {
              x: 0,
              y: 0
            }
          }
        },
        scale: {
          width: 2400 * 2,
          height: 1200
        },
        queueDepthSort: () => {}
      }
    };

    this.physics = new ArcadePhysics(config);

    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  update(deltaTime: number) {
    this.physics.world.update(this.tick * 1000, 1000 / FPS);
    this.tick++;

    this.syncState();
  }

  syncState() {
    // Loop over all the players in the room, and sync their X/Ys with that of their physics body
    this.state.players.forEach((player, sessionId) => {
      const body = this.bodies[sessionId];

      player.x = body.x;
      player.y = body.y;
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    // When a player joins the room, assign them both a state representation and a physics body
    this.state.players.set(client.sessionId, new Player(0, 0));
    this.bodies[client.sessionId] = this.physics.add.body(0, 0, CAT_WIDTH, CAT_HEIGHT);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    // When a player leaves the room, delete their state representation and physics body
    this.state.players.delete(client.sessionId);
    this.bodies[client.sessionId].destroy();
    delete this.bodies[client.sessionId];
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
