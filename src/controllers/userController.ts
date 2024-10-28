import { UserService } from "../services/userService";
import { Commands, ExtWebSocket } from "../types/types";
import { updateRooms } from "./roomsController";
import { updateWinners } from "./winnersController";

let indexCount = 0;

export const createUser = (
  name: string,
  password: string,
  socket: ExtWebSocket
): void => {
  const index: number = (indexCount += 1);

  socket.name = name;
  socket.id = index;

  UserService.setUser({ name, password, socket, inGame: false });

  socket.send(
    JSON.stringify({
      type: Commands.REG,
      data: JSON.stringify({
        name,
        index,
        error: false,
        errorText: "",
      }),
      id: 0,
    })
  );

  updateRooms();
  updateWinners();
};
