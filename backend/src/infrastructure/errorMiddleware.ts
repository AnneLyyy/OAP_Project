import type { Request, Response, NextFunction } from "express";

export default function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    status,
    code: err.code || "ERROR",
    message: err.message || "Server error",
    details: err.details || []
  });
}