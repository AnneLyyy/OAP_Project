import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";

import healthRoutes from "./src/routes/health.routes.ts";
import tasksRoutes from "./src/routes/tasks.routes.ts";
import usersRoutes from "./src/routes/user.routes.ts";

import errorMiddleware from "./src/infrastructure/errorMiddleware.ts";
import { requestLogger } from "./src/infrastructure/logMiddleware.ts";

const app = express();

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ================= Логування =================
app.use(requestLogger);

// ================= ROOT ROUTE =================
app.get("/", (req: Request, res: Response) => {
  res.send("Сервер працює!");
});

// ================= ROUTES =================
app.use("/api/users", usersRoutes);
app.use("/health", healthRoutes);
app.use("/api/tasks", tasksRoutes);

// ================= ERROR HANDLER =================
app.use(errorMiddleware);

export default app;