import type { Request, Response } from "express";
import { usersStore } from "../store/user.stats.store.ts";
import ApiError from "../infrastructure/apiError.ts";

export const getStats = (req: Request, res: Response) => {
  const stats = usersStore.getAll();
  res.json({ items: stats });
};

export const getStatById = (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  const stat = usersStore.getById(id);

  if (!stat) {
    throw new ApiError("NOT_FOUND", "Stat not found", 404);
  }

  res.json(stat);
};

export const createSnapshot = (req: Request, res: Response) => {
  const totalUsers = usersStore.getAll().length;

  const snapshot = usersStore.createSnapshot(totalUsers);

  res.status(201).json(snapshot);
};