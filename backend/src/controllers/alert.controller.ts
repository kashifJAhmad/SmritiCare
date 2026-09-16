import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as alertService from "../services/alert.service";

export async function getAlerts(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const alerts = await alertService.getAlertsForUser(req.userId);
    return res.status(200).json({ success: true, alerts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch alerts";
    return res.status(500).json({ success: false, message });
  }
}

export async function createAlert(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const {
      id,
      patientId,
      caregiverId,
      category,
      typeLabel,
      title,
      description,
      badge,
      sourceType,
      sourceId,
      status,
    } = req.body;

    if (!patientId || !title) {
      return res.status(400).json({
        success: false,
        message: "patientId and title are required",
      });
    }

    const alert = await alertService.upsertAlert(req.userId, {
      id,
      patientId,
      caregiverId: caregiverId || req.userId,
      category: category || "general",
      typeLabel: typeLabel || "Alert",
      title,
      description: description || "",
      badge: badge || "Alert",
      sourceType,
      sourceId,
      status,
    });

    return res.status(201).json({ success: true, alert });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create alert";
    return res.status(400).json({ success: false, message });
  }
}

function getRequiredId(value: string | string[] | undefined, message: string): string {
  if (!value || Array.isArray(value)) {
    throw new Error(message);
  }
  return value;
}

export async function acknowledgeAlert(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const alertId = getRequiredId(req.params.id, "Alert ID required");

    const alert = await alertService.acknowledgeAlert(req.userId, alertId);
    return res.status(200).json({ success: true, alert });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to acknowledge alert";
    return res.status(400).json({ success: false, message });
  }
}

export async function resolveAlert(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const alertId = getRequiredId(req.params.id, "Alert ID required");

    const alert = await alertService.resolveAlert(req.userId, alertId);
    return res.status(200).json({ success: true, alert });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resolve alert";
    return res.status(400).json({ success: false, message });
  }
}
