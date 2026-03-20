import type { Request, Response, NextFunction, RequestHandler } from "express";

export default function wrap<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
>(
  fn: RequestHandler<P, ResBody, ReqBody, ReqQuery>
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}