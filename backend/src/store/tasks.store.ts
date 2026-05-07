import { v4 as uuidv4 } from "uuid";
import type { TaskDto } from "../types/task.ts";
const tasks: TaskDto[] = [];

export const tasksStore = {
  getAll: (): TaskDto[] => tasks,

  getById: (id: string): TaskDto | undefined =>
    tasks.find((t) => t.id === id),

  create: (data: Omit<TaskDto, "id">): TaskDto => {
    const task: TaskDto = { id: uuidv4(), ...data };
    tasks.push(task);
    return task;
  },

  update: (id: string, data: Partial<TaskDto>): TaskDto | null => {
    const i = tasks.findIndex((t) => t.id === id);
    if (i === -1) return null;
    tasks[i] = { ...tasks[i], ...data };
    return tasks[i];
  },

    replace: (id: string, data: Omit<TaskDto, "id">): TaskDto | null => {
      const i = tasks.findIndex((t) => t.id === id);
      if (i === -1) return null;
      const updated: TaskDto = { id, ...data};
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