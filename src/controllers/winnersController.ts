import { UserService } from "../services/userService";
import { Commands, Winners, WinnersResource } from "../types/types";

const winners: Winners = {};

export const getWinnersArray = (): WinnersResource =>
  Object.keys(winners).reduce(
    (acc: WinnersResource, winnerName: string) => [
      ...acc,
      { name: winnerName, wins: winners[winnerName] },
    ],
    []
  );

export const updateWinners = () => {
  const users = UserService.getUsers();

  users.forEach((user) => {
    user.socket.send(
      JSON.stringify({
        type: Commands.UPDATE_WINNERS,
        data: JSON.stringify(getWinnersArray()),
        id: 0,
      })
    );
  });
};
