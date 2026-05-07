import express from "express";
import cors, { type CorsOptions } from "cors";
import path from "path";

import healthRoutes from "./src/routes/health.routes.ts";
import tasksRoutes from "./src/routes/tasks.routes.ts";
import usersRoutes from "./src/routes/user.routes.ts";

import errorMiddleware from "./src/infrastructure/errorMiddleware.ts";
import { requestLogger } from "./src/infrastructure/logMiddleware.ts";

import { initDb } from "./src/db/initDb.ts";
import { migrate } from "./src/db/migrate.ts";

const app = express();

// ===== INIT DB =====
await initDb();
await migrate();

const allowedOrigins = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
]);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.has(cleanOrigin)) {
      return callback(null, true);
    }

    console.log("BLOCKED CORS:", origin);
    return callback(new Error("CORS blocked"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

// CORS має бути до роутів і з whitelist, не з "*".
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(requestLogger);
app.use(express.json());

// ROOT
app.get("/", (_, res) => {
  res.json({
    success: true,
    message: "Server running"
  });
});

// OpenAPI опис контракту API
app.get("/openapi.yaml", (_, res) => {
  res.type("yaml").sendFile(path.resolve(process.cwd(), "docs/openapi.yaml"));
});

// API v1
app.use("/api/v1/tasks", tasksRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/health", healthRoutes);

// 404
app.use((_, res) => {
  res.status(404).json({
    success: false,
    status: 404,
    code: "NOT_FOUND",
    message: "Route not found",
    details: []
  });
});

// ERROR
app.use(errorMiddleware);

export default app;
