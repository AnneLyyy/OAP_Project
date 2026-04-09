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

    const page = Math.max(parseInt(query.page) || 1, 1);
    const pageSize = Math.max(parseInt(query.pageSize) || 10, 1);
    const start = (page - 1) * pageSize;

    return data.slice(start, start + pageSize);
  },

  getById: (id: string): Task | undefined => tasksStore.getById(id),
  create: (data: Omit<Task, "id">): Task => tasksStore.create(data),
  update: (id: string, data: Omit<Task, "id">): Task | null =>
      tasksStore.update(id, data),
  replace: (id: string, data: Omit<Task, "id">): Task | null =>
    tasksStore.replace(id, data),
  bulkReplace: (items: {id: string; data: Omit<Task, "id">}[]) => {
    const results: Task[] = [];
    for (const item of items) {
      const updated = tasksStore.replace(item.id, item.data);
      if (updated !== null) {
        results.push(updated);
      }
    }

    return results;
  },
  delete: (id: string): boolean => tasksStore.delete(id),
};