import { Request, Response } from "express";
import { tasksService } from "../services/tasks.service.ts";
import ApiError from "../infrastructure/apiError.ts";
import { validateTask } from "../infrastructure/validation.ts";

type TaskParams = {
  id: string;
};

export const getTasks = (req: Request, res: Response) => {
  const tasks = tasksService.getAll(req.query);
  res.json({ items: tasks });
};

export const getTask = (req: Request<TaskParams>, res: Response) => {
  const task = tasksService.getById(req.params.id);

  if (!task) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.json(task);
};

export const createTask = (req: Request, res: Response) => {
  // ✅ Валідація всього body
  validateTask(req.body);

  const task = tasksService.create(req.body);

  res.status(201).json(task);
};

export const updateTask = (req: Request<TaskParams>, res: Response) => {
  // ⚠️ (опціонально) можна додати часткову валідацію
  if (Object.keys(req.body).length === 0) {
    throw new ApiError("VALIDATION_ERROR", "Empty body", 400);
  }

  const task = tasksService.update(req.params.id, req.body);

  if (!task) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.json(task);
};

export const deleteTask = (req: Request<TaskParams>, res: Response) => {
  const ok = tasksService.delete(req.params.id);

  if (!ok) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.status(204).send();
};