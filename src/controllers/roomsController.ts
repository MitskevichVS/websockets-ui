import {
  calculateSidePoints,
  generateShipCoordinates,
  getAttackResult,
} from "../helpers/shipHelpers";
import { RoomsService } from "../services/roomsService";
import { UserService } from "../services/userService";
import {
  Commands,
  ExtWebSocket,
  Room,
  RoomUser,
  Ship,
  ShipResource,
  User,
} from "../types/types";

let roomsCount = 0;
let gameCount = 0;

export const updateRooms = () => {
  const users = UserService.getUsers();

  users.forEach((user) => {
    user.socket.send(
      JSON.stringify({
        type: Commands.UPDATE_ROOM,
        data: JSON.stringify(RoomsService.getFreeRooms()),
        id: 0,
      })
    );
  });
};

export const createRoom = (ws: ExtWebSocket) => {
  const roomId = (roomsCount += 1);
  RoomsService.setRoom(roomId, ws);

  updateRooms();
};

export const addUserToRoom = (roomId: number, ws: ExtWebSocket) => {
  const room = RoomsService.getRoom(roomId);

  if (!room || !room.isFree || room.roomUsers[0].name === ws.name) {
    return;
  }

  RoomsService.addUserToRoom(roomId, { name: ws.name, index: ws.id, ws });

  updateRooms();

  const gameId = (gameCount += 1);

  room.game = {
    id: gameId,
    firstShips: [],
    secondShips: [],
    firstShots: [],
    secondShots: [],
    currentPlayerIndex: 0,
    isFinished: false,
  };

  console.log(room.roomUsers);

  room.roomUsers.forEach((user: RoomUser) =>
    user.ws.send(
      JSON.stringify({
        type: Commands.CREATE_GAME,
        data: JSON.stringify({
          idGame: gameId,
          idPlayer: user.index,
        }),
        id: 0,
      })
    )
  );
};

export const addShips = (
  gameId: number,
  ships: ShipResource[],
  userId: number
) => {
  const room = RoomsService.getRoomByGameId(gameId);

  if (!room || !room.game) {
    return;
  }

  const userIndex: number = room.roomUsers.findIndex(
    (user) => user.index === userId
  );
  const refactoredShips: Ship[] = ships.map((ship: ShipResource) => ({
    ...ship,
    points: generateShipCoordinates(ship),
    isKilled: false,
  }));

  if (userIndex) {
    room.game.secondShips = refactoredShips;
  } else {
    room.game.firstShips = refactoredShips;
  }

  if (room.game.firstShips?.length && room.game.secondShips?.length) {
    room.roomUsers.forEach((user: RoomUser, index: number) => {
      user.ws.send(
        JSON.stringify({
          type: Commands.START_GAME,
          data: JSON.stringify({
            ships: index ? room.game?.secondShips : room.game?.firstShips,
            currentPlayerIndex: room.game?.currentPlayerIndex,
          }),
          id: 0,
        })
      );
    });
  }
};

export const handleAttack = (
  gameId: number,
  indexPlayer: number,
  x: number,
  y: number
) => {
  const room = RoomsService.getRoomByGameId(gameId);

  if (!room || !room.game) {
    return;
  }

  const enemyIndex: number = room.roomUsers.findIndex(
    (user) => user.index !== room.game?.currentPlayerIndex
  );
  const enemyId = room?.roomUsers[enemyIndex]?.index;

  if (enemyId === indexPlayer) {
    return;
  }

  const enemyField =
    enemyIndex !== 0 ? room.game?.secondShips : room.game?.firstShips;

  const { hittedShip, ...attackResult } = getAttackResult(
    enemyField,
    x,
    y,
    indexPlayer
  );

  room.roomUsers.forEach((user: RoomUser) => {
    user.ws.send(
      JSON.stringify({
        type: Commands.ATTACK,
        data: JSON.stringify(attackResult),
        id: 0,
      })
    );
  });

  if (attackResult.status === "killed" && hittedShip) {
    const points = calculateSidePoints(enemyField, hittedShip);

    markAllSidePoints(points, room, indexPlayer);

    checkIsFinish(room, enemyField, indexPlayer);
  }

  if (attackResult.status === "miss") {
    room.game.currentPlayerIndex = room.game.currentPlayerIndex === 0 ? 1 : 0;

    room.roomUsers.forEach((user: RoomUser) =>
      user.ws.send(
        JSON.stringify({
          type: Commands.TURN,
          data: JSON.stringify({
            currentPlayer: room.game?.currentPlayerIndex,
          }),
          id: 0,
        })
      )
    );
  }
};

const markAllSidePoints = (
  points: { x: number; y: number }[],
  room: Room,
  indexPlayer: number
) => {
  points.forEach((point) => {
    room.roomUsers.forEach((user: RoomUser) => {
      user.ws.send(
        JSON.stringify({
          type: Commands.ATTACK,
          data: JSON.stringify({
            position: point,
            indexPlayer,
            status: "miss",
          }),
          id: 0,
        })
      );
    });
  });
};

const checkIsFinish = (room: Room, enemyField: Ship[], userId: number) => {
  if (
    enemyField.every((ship) => ship.points.every((point) => point.isAttacked))
  ) {
    room.roomUsers.forEach((user: RoomUser) => {
      user.ws.send(
        JSON.stringify({
          type: Commands.FINISH,
          data: JSON.stringify({
            winPlayer: userId,
          }),
          id: 0,
        })
      );
    });
  }
};
