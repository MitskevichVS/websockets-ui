import {
  addShips,
  addUserToRoom,
  createRoom,
  handleAttack,
} from "../controllers/roomsController";
import { createUser } from "../controllers/userController";
import { Commands, ExtWebSocket, WsEvent, WsService } from "../types/types";

export const wsService: WsService = {
  [Commands.REG]: (event: WsEvent, ws: ExtWebSocket) => {
    const { name, password } = JSON.parse(event.data);

    createUser(name, password, ws);
  },
  [Commands.CREATE_ROOM]: (event: WsEvent, ws: ExtWebSocket) => {
    createRoom(ws);
  },
  [Commands.SINGLE_PLAY]: (event: WsEvent, ws: ExtWebSocket) => {
    console.log(event);
  },
  [Commands.ADD_PLAYER]: (event: WsEvent, ws: ExtWebSocket) => {
    const { indexRoom } = JSON.parse(event.data);

    addUserToRoom(indexRoom, ws);
  },
  [Commands.ADD_SHIP]: (event: WsEvent, ws: ExtWebSocket) => {
    const { gameId, ships, indexPlayer } = JSON.parse(event.data);

    addShips(gameId, ships, indexPlayer);
  },
  [Commands.ATTACK]: (event: WsEvent, ws: ExtWebSocket) => {
    const { gameId, indexPlayer, x, y } = JSON.parse(event.data);

    handleAttack(gameId, indexPlayer, x, y);
  },
};
