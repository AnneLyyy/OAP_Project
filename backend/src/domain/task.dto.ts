import { Task } from "../types/task.ts";

export type CreateTaskRequestDto = Omit<Task, "id">;
export type UpdateTaskRequestDto = Partial<Omit<Task, "id">>;
export type TaskResponseDto = Task;