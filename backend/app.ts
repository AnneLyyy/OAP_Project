import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

import healthRoutes from "./src/routes/health.routes.ts";
import tasksRoutes from "./src/routes/tasks.routes.ts";
import usersRoutes from "./src/routes/user.routes.ts";

import errorMiddleware from "./src/infrastructure/errorMiddleware.ts";
import { requestLogger } from "./src/infrastructure/logMiddleware.ts";

const app = express();

// ================= MIDDLEWARES =================
app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ================= ROOT ROUTE =================
app.get("/", (req: Request, res: Response) => {
  res.send("Сервер працює!");
});

// ================= ROUTES =================
app.use("/api/users", usersRoutes);
app.use("/health", healthRoutes);
app.use("/api/tasks", tasksRoutes);

// ================= 404 =================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
      details: [],
    },
  });
});

// ================= ERROR HANDLER =================
app.use(errorMiddleware);

export default app;