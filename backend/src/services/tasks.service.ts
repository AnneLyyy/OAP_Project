import { tasksStore } from "../store/tasks.store.ts";
import type { Task } from "../types/task.ts";         

export const tasksService = {
  getAll: (query: any): Task[] => {
    let data = tasksStore.getAll();

    if (query.search) {
      data = data.filter(t =>
        t.title.toLowerCase().includes(query.search.toLowerCase())
      );
    }

    if (query.sortBy) {
      data = data.sort((a, b) => {
        let res = 0;
        if (query.sortBy === "date") res = a.date.localeCompare(b.date);
        if (query.sortBy === "title") res = a.title.localeCompare(b.title);
        if (query.sortBy === "capacity") res = a.capacity - b.capacity;
        return query.sortDir === "desc" ? -res : res;
      });
    }

    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 10;
    const start = (page - 1) * pageSize;

    return data.slice(start, start + pageSize);
  },

  getById: (id: string): Task | undefined => tasksStore.getById(id),
  create: (data: Omit<Task, "id">): Task => tasksStore.create(data),
  update: (id: string, data: Partial<Task>): Task | null =>
    tasksStore.update(id, data),
  delete: (id: string): boolean => tasksStore.delete(id),
};