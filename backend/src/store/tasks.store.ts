import { v4 as uuidv4 } from "uuid";
import type { Task } from "../types/task.ts";
const tasks: Task[] = [];

export const tasksStore = {
  getAll: (): Task[] => tasks,

  getById: (id: string): Task | undefined =>
    tasks.find((t) => t.id === id),

  create: (data: Omit<Task, "id">): Task => {
    const task: Task = { id: uuidv4(), ...data };
    tasks.push(task);
    return task;
  },

  update: (id: string, data: Partial<Task>): Task | null => {
    const i = tasks.findIndex((t) => t.id === id);
    if (i === -1) return null;
    tasks[i] = { ...tasks[i], ...data };
    return tasks[i];
  },

    replace: (id: string, data: Omit<Task, "id">): Task | null => {
      const i = tasks.findIndex((t) => t.id === id);
      if (i === -1) return null;
      const updated: Task = { id, ...data};
      tasks[i] = updated;
      return updated;
  },

  delete: (id: string): boolean => {
    const i = tasks.findIndex((t) => t.id === id);
    if (i === -1) return false;
    tasks.splice(i, 1);
    return true;
  },
};