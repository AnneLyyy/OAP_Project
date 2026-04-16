import type { Request, Response } from "express";
import { tasksService } from "../services/tasks.service.ts";
import ApiError from "../infrastructure/apiError.ts";
import { validateTask, validatePartialTask } from "../infrastructure/validation.ts";

// типи
type TaskParams = { id: string };

type QueryParams = {
  from?: string;
  to?: string;
  search?: string;
  sortBy?: string;
  sortDir?: string;
  page?: string;
  pageSize?: string;
};

// ================= GET ALL =================
export const getTasks = async (
  req: Request<{}, {}, {}, QueryParams>,
  res: Response
) => {
  const data = await tasksService.getAll(req.query);
  res.json({ data, meta: { count: data.length } });
};

// ================= GET BY ID =================
export const getTask = async (
  req: Request<TaskParams>,
  res: Response
) => {
  const task = await tasksService.getById(req.params.id);

  if (!task) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.json(task);
};

// ================= CREATE =================
export const createTask = async (req: Request, res: Response) => {
  validateTask(req.body);

  const task = await tasksService.create(req.body);
  res.status(201).json(task);
};

// ================= UPDATE =================
export const updateTask = async (
  req: Request<TaskParams>,
  res: Response
) => {
  if (Object.keys(req.body).length === 0) {
    throw new ApiError("VALIDATION_ERROR", "Empty body", 400);
  }

  validatePartialTask(req.body);

  const task = await tasksService.update(req.params.id, req.body);

  if (!task) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.json(task);
};

// ================= DELETE =================
export const deleteTask = async (
  req: Request<TaskParams>,
  res: Response
) => {
  const ok = await tasksService.delete(req.params.id);

  if (!ok) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.status(204).send();
};

// ================= BY DATE =================
export const getTasksByDate = async (
  req: Request<{}, {}, {}, QueryParams>,
  res: Response
) => {
  const from = req.query.from;
  const to = req.query.to;

  if (!from || !to) {
    throw new ApiError("VALIDATION_ERROR", "from and to required", 400);
  }

  const data = await tasksService.getByDate(from, to);
  res.json({ data });
};

// ================= JOIN =================
export const getTasksWithUsers = async (
  req: Request,
  res: Response
) => {
  const data = await tasksService.getWithUsers();
  res.json({ data });
};

// ================= COUNT =================
export const getTasksCount = async (
  req: Request,
  res: Response
) => {
  const result = await tasksService.count();
  res.json(result);
};