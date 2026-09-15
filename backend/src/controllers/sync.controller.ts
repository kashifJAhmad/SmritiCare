import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as syncService from "../services/sync.service";

export async function pushSync(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Request body must contain an 'items' array",
      });
    }

    const results = await syncService.processSyncPush(req.userId, items);

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync push failed";
    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function pullSync(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const since = req.query.since ? new Date(String(req.query.since)) : undefined;
    const data = await syncService.processSyncPull(req.userId, since);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync pull failed";
    return res.status(500).json({
      success: false,
      message,
    });
  }
}
