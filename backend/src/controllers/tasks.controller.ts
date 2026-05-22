import type { Request, Response } from "express";
import { tasksService } from "../services/tasks.service.ts";
import ApiError from "../infrastructure/apiError.ts";
import { validateTask, validatePartialTask } from "../infrastructure/validation.ts";

// ===== DTO TYPES =====
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

// ===== UNIFIED RESPONSE HELPER =====
const ok = (data: any, meta?: any) => ({
  success: true,
  data,
  meta
});

// ================= GET ALL =================
export const getTasks = async (
  req: Request<{}, {}, {}, QueryParams>,
  res: Response
) => {
  const data = await tasksService.getAll(req.query);

  res.json(
    ok(data, {
      count: data.length
    })
  );
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

  res.json(ok(task));
};

// ================= CREATE =================
export const createTask = async (req: Request, res: Response) => {
  validateTask(req.body);

  const duplicate = await tasksService.findDuplicate(req.body.title, req.body.date);

  if (duplicate) {
    throw new ApiError(
      "CONFLICT",
      "Task with this title and date already exists",
      409,
      ["title/date duplicate"]
    );
  }

  const task = await tasksService.create(req.body);

  res.status(201).json(ok(task));
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

  const existing = await tasksService.getById(req.params.id);

  if (!existing) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  const nextTitle = req.body.title ?? existing.title;
  const nextDate = req.body.date ?? existing.date;
  const duplicate = await tasksService.findDuplicate(nextTitle, nextDate, req.params.id);

  if (duplicate) {
    throw new ApiError(
      "CONFLICT",
      "Task with this title and date already exists",
      409,
      ["title/date duplicate"]
    );
  }

  const task = await tasksService.update(req.params.id, req.body);

  if (!task) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  res.json(ok(task));
};


// ================= REPLACE =================
export const replaceTask = async (
  req: Request<TaskParams>,
  res: Response
) => {
  validateTask(req.body);

  const existing = await tasksService.getById(req.params.id);

  if (!existing) {
    throw new ApiError("NOT_FOUND", "Task not found", 404);
  }

  const duplicate = await tasksService.findDuplicate(req.body.title, req.body.date, req.params.id);

  if (duplicate) {
    throw new ApiError(
      "CONFLICT",
      "Task with this title and date already exists",
      409,
      ["title/date duplicate"]
    );
  }

  const task = await tasksService.replace(req.params.id, req.body);

  res.json(ok(task));
};

// ================= DELETE =================
export const deleteTask = async (
  req: Request<TaskParams>,
  res: Response
) => {
  const okResult = await tasksService.delete(req.params.id);

  if (!okResult) {
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

  res.json(ok(data));
};

// ================= TOP TASKS =================
export const getTopTasks = async (
  req: Request,
  res: Response
) => {
  const data = await tasksService.getTopCapacity(3);

  res.json(ok(data));
};

// ================= JOIN USERS =================
export const getTasksWithUsers = async (
  req: Request,
  res: Response
) => {
  const data = await tasksService.getWithUsers();

  res.json(ok(data));
};

// ================= COUNT =================
export const getTasksCount = async (
  req: Request,
  res: Response
) => {
  const result = await tasksService.count();

  res.json(ok(result));
};

// ================= STATS =================
export const getTasksStats = async (
  req: Request,
  res: Response
) => {
  const data = await tasksService.getStats();

  res.json(ok(data));
};
