import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.header("authorization") || req.header("Authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  const token = header.slice(7).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: "JWT secret not configured" });
  }
  try {
    const payload = jwt.verify(token, secret) as { sub?: string };
    if (!payload.sub) {
      return res.status(401).json({ error: "Invalid token" });
    }
    (req as AuthenticatedRequest).userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
