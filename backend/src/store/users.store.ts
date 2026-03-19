import { v4 as uuidv4 } from "uuid";
import type { User } from "../types/user.ts";

const users: User[] = [];

export const usersStore = {
  getAll: (): User[] => users,
  getById: (id: string): User | undefined => users.find(u => u.id === id),
  create: (data: Omit<User, "id">): User => {
    const user: User = { id: uuidv4(), ...data };
    users.push(user);
    return user;
  },
  update: (id: string, data: Partial<User>): User | null => {
    const i = users.findIndex(u => u.id === id);
    if (i === -1) return null;
    users[i] = { ...users[i], ...data };
    return users[i];
  },
  delete: (id: string): boolean => {
    const i = users.findIndex(u => u.id === id);
    if (i === -1) return false;
    users.splice(i, 1);
    return true;
  }
};