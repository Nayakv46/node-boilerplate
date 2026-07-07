import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../prismaClient";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id?: string };
    if (!payload.id) {
      return res.status(401).json({ detail: "Not authenticated" });
    }

    req.userId = payload.id;
    return next();
  } catch {
    return res.status(401).json({ detail: "Not authenticated" });
  }
};

export const authenticateUserAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  const userData = await PrismaClient.users.findUnique({
    where: { id: req.userId },
    select: { is_admin: true },
  });

  if (!userData?.is_admin) {
    return res.status(403).json({ detail: "Forbidden - A" });
  }

  return next();
};
