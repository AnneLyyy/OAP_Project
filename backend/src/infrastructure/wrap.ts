import type { Request, Response, NextFunction } from "express";

export default function wrap(
  fn: (req: Request, res: Response, next: NextFunction) => any
) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}