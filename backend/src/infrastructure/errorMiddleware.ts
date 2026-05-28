import type { Request, Response, NextFunction } from "express";

export default function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  const isDev = process.env.NODE_ENV !== "production";
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    status,
    code: err.code || (isServerError ? "INTERNAL_SERVER_ERROR" : "ERROR"),
    message: isServerError && !isDev ? "Internal Server Error" : (err.message || "Server error"),
    details: isServerError && !isDev ? [] : (err.details || [])
  });
}
