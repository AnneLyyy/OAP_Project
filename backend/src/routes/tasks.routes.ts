import { Router } from "express";
import type { Request, Response } from "express";
import { tasksService } from "../services/tasks.service.ts";
import ApiError from "../infrastructure/apiError.ts";
import { validateTask } from "../infrastructure/validation.ts";

const router = Router();

const getTasks = (req: Request, res: Response) => {
  const tasks = tasksService.getAll(req.query);
  res.json({ items: tasks });
};

const getTask = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const task = tasksService.getById(id);

  if (!task) throw new ApiError("NOT_FOUND", "Task not found", 404);
  res.json(task);
};

const createTask = (req: Request, res: Response) => {
  validateTask(req.body);

  const task = tasksService.create(req.body);
  res.status(201).json(task);
};

const updateTask = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const task = tasksService.update(id, req.body);

  if (!task) throw new ApiError("NOT_FOUND", "Task not found", 404);
  res.json(task);
};

const deleteTask = (req: Request, res: Response) => {
  const id = req.params.id as string;
  const ok = tasksService.delete(id);

  if (!ok) throw new ApiError("NOT_FOUND", "Task not found", 404);
  res.status(204).send();
};

router.get("/", getTasks);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;