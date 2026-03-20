import type { Request, Response, NextFunction } from "express";

interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: any[];
}

export default function errorMiddleware(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Server error",
      details: err.details || [],
    },
  });
}