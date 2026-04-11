import type { Request, Response } from "express";
import { tasksService } from "../services/tasks.service.ts";
import ApiError from "../infrastructure/apiError.ts";
import { validateTask, validatePartialTask } from "../infrastructure/validation.ts";

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
  validateTask(req.body);

  const task = tasksService.create(req.body);
  res.status(201).json(task);
};

export const replaceTask = (req: Request<TaskParams>, res: Response) => {
  validateTask(req.body);

  const task = tasksService.replace(req.params.id, req.body);

  if (!task) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.json(task);
};

export const updateTask = (req: Request<TaskParams>, res: Response) => {
  if (Object.keys(req.body).length === 0) {
    throw new ApiError("VALIDATION_ERROR", "Empty body", 400);
  }

  validatePartialTask(req.body);

  const task = tasksService.update(req.params.id, req.body);

  if (!task) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.json(task);
};

export const bulkReplaceTasks = (req: Request, res: Response) => {
  const items = req.body;

  if (!Array.isArray(items)) {
    throw new ApiError("VALIDATION_ERROR", "Body must be an array", 400);
  }

  for (const item of items) {
    if (!item.id || !item.data) {
      throw new ApiError("VALIDATION_ERROR", "Each item must have id and data", 400);
    }

    validateTask(item.data);
  }

  const updated = tasksService.bulkReplace(items);

  res.json({ items: updated });
};

export const getTasksbyDate = (req: Request, res: Response) => {
  const {from, to} = req.query;
  console.log('inside method')

  if (!from || !to) {
    throw new ApiError("VALIDATION_ERROR", "from and to, pupupu", 400);
  }

  if (isNaN(Date.parse(from as string)) || isNaN(Date.parse(to as string))) {
    throw new ApiError("VALIDATION_ERROR", "Invalid", 400);
  }
  
  const tasks = tasksService.getByDate(from as string, to as string);
  console.log(tasks)
  res.json({items: tasks});
};

export const deleteTask = (req: Request<TaskParams>, res: Response) => {
  const ok = tasksService.delete(req.params.id);

  if (!ok) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.status(204).send();
};