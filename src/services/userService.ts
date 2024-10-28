import { User, UserServiceType } from "../types/types";

export const UserService: UserServiceType = {
  _users: [],

  getUsers: () => {
    return UserService._users;
  },

  setUser: (user: User) => {
    UserService._users.push(user);
  },
};
