import WebSocket from "ws";

export enum Commands {
  REG = "reg",
  CREATE_ROOM = "create_room",
  SINGLE_PLAY = "single_play",

  CREATE_GAME = "create_game",
  ADD_SHIP = "add_ships",
  UPDATE_ROOM = "update_room",
  ADD_PLAYER = "add_user_to_room",
  START_GAME = "start_game",
  ATTACK = "attack",
  TURN = "turn",
  RANDOM_ATTACK = "randomAttack",
  FINISH = "finish",
  UPDATE_WINNERS = "update_winners",
}

export interface ExtWebSocket extends WebSocket {
  id: number;
  name: string;
  password: string;
}

export type WsEvent = {
  type: Commands;
  data: string;
  id: number;
};

export type WsService = {
  [key: string]: (event: WsEvent, ws: ExtWebSocket) => void;
};

export type User = {
  name: string;
  password: string;
  socket: ExtWebSocket;
  inGame: boolean;
};

export type Winners = {
  [key: string]: number;
};

export type WinnersResource = {
  name: string;
  wins: number;
}[];

export type ShipResource = {
  position: { x: number; y: number };
  direction: boolean;
  type: "small" | "medium" | "large" | "huge";
  length: number;
};

export type Ship = ShipResource & {
  isKilled: boolean;
  points: { x: number; y: number; isAttacked: boolean }[];
};

export type RoomUser = { name: string; index: number; ws: ExtWebSocket };

export type Game = {
  id: number;
  firstShips: Ship[];
  secondShips: Ship[];
  firstShots: any[];
  secondShots: any[];
  currentPlayerIndex: number;
  isFinished: boolean;
};

export type Room = {
  roomId: number;
  roomUsers: RoomUser[];
  game: Game | null;
  isFree: boolean;
};

export type RoomResource = Room[];

export type RoomsServiceType = {
  _rooms: { [key: string]: Room };
  getRooms: () => Room[];
  getRoom: (roomId: number) => Room;
  getRoomByGameId: (gameId: number) => Room | undefined;
  getFreeRooms: () => Room[];
  addUserToRoom: (roomId: number, user: RoomUser) => void;
  setRoom: (roomId: number, ws: ExtWebSocket) => void;
};

export type UserServiceType = {
  _users: User[];
  getUsers: () => User[];
  setUser: (user: User) => void;
};
