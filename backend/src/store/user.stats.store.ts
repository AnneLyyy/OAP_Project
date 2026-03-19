import { v4 as uuidv4 } from "uuid";
import type { UserStats } from "../types/user.stats.ts";

const stats: UserStats[] = [];

export const usersStore = {
  getAll: (): UserStats[] => stats,

  getById: (id: string): UserStats | undefined =>
    stats.find(s => s.id === id),

  createSnapshot: (totalUsers: number): UserStats => {
    const snapshot: UserStats = {
      id: uuidv4(),
      date: new Date().toISOString(),
      totalUsers
    };

    stats.push(snapshot);
    return snapshot;
  }
};