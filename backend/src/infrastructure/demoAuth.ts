import type { Request, Response, NextFunction } from "express";
import { db } from "../db/db.ts";
import ApiError from "./apiError.ts";

export type DemoUser = {
  id: string;
  name: string;
};

export function getCurrentUser(req: Request): DemoUser {
  const user = (req as Request & { user?: DemoUser }).user;

  if (!user) {
    throw new ApiError("UNAUTHORIZED", "Demo user is required", 401, ["X-Demo-UserId header required"]);
  }

  return user;
}

export async function demoAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header("X-Demo-UserId")?.trim();

  if (!userId) {
    throw new ApiError("UNAUTHORIZED", "Unauthorized", 401, ["X-Demo-UserId header required"]);
  }

  const user = await (await db).get<{ id: string; name: string }>(
    "SELECT id, name FROM Users WHERE id = ?",
    [userId]
  );

  if (!user) {
    throw new ApiError("UNAUTHORIZED", "Unknown demo user", 401, ["Invalid X-Demo-UserId"]);
  }

  (req as Request & { user?: DemoUser }).user = user;
  next();
}
