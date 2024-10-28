import {
  ExtWebSocket,
  Room,
  RoomResource,
  RoomsServiceType,
  RoomUser,
} from "../types/types";

export const RoomsService: RoomsServiceType = {
  _rooms: {},

  getRooms: () => {
    return Object.keys(RoomsService._rooms).reduce(
      (acc: RoomResource, roomId: string) => {
        return [...acc, RoomsService._rooms[roomId]];
      },
      []
    );
  },

  getFreeRooms: () => {
    return RoomsService.getRooms().filter((room) => room.isFree);
  },

  getRoom: (roomId: number) => {
    return RoomsService._rooms[roomId];
  },

  getRoomByGameId: (gameId: number) => {
    const roomsIds = Object.keys(RoomsService._rooms);
    const roomId = roomsIds.find(
      (id) => RoomsService._rooms[id]?.game?.id === gameId
    );

    if (roomId) {
      return RoomsService._rooms[roomId];
    }
  },

  addUserToRoom: (roomId: number, user: RoomUser) => {
    RoomsService._rooms[roomId].roomUsers = [
      ...RoomsService._rooms[roomId].roomUsers,
      user,
    ];
    RoomsService._rooms[roomId].isFree = false;
  },

  setRoom: (roomId: number, ws: ExtWebSocket) => {
    RoomsService._rooms[roomId] = {
      roomId,
      roomUsers: [
        {
          name: ws.name,
          index: ws.id,
          ws,
        },
      ],
      game: null,
      isFree: true,
    };
  },
};
