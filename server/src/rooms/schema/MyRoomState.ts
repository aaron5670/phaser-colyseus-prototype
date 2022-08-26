import { Schema, MapSchema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type('number')
  x: number = 0;

  @type('number')
  y: number = 0;

  constructor(x: number, y: number) {
    super();

    this.x = x;
    this.y = y;
  }
}

export class MyRoomState extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>();
}
