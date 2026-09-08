import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
  userId?: string;
};

type JwtPayload = {
  userId: string;
};

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication format",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const decoded = jwt.verify(
      token,
      secret,
    ) as JwtPayload;

    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}