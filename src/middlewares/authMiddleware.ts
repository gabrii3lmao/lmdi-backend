import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../config/jwtService.js";

export default (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = verifyToken(token);

    req.user = decoded as { id: string };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
