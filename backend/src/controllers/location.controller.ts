import { Request, Response } from "express";

import {
  getPatientLocationForCaregiver,
  removePatientLocation,
  updatePatientLocation,
} from "../services/location.service";

function getAuthenticatedUserId(
  req: Request
): string {
  const userId =
    (req as any).userId ||
    (req as any).user?.id;

  if (!userId) {
    throw new Error("Authentication required.");
  }

  return userId;
}

export async function updateLocation(
  req: Request,
  res: Response
) {
  try {
    const patientId =
      getAuthenticatedUserId(req);

    const {
      latitude,
      longitude,
      accuracy,
    } = req.body;

    const location =
      await updatePatientLocation(
        patientId,
        {
          latitude,
          longitude,
          accuracy,
        }
      );

    return res.status(200).json({
      success: true,
      message: "Patient location updated.",
      location,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update patient location.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function deleteLocation(
  req: Request,
  res: Response
) {
  try {
    const patientId =
      getAuthenticatedUserId(req);

    await removePatientLocation(patientId);

    return res.status(200).json({
      success: true,
      message: "Patient location removed.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to remove patient location.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function getPatientLocation(
  req: Request,
  res: Response
) {
  try {
    const caregiverId =
      getAuthenticatedUserId(req);

    const patientId =
      String(req.params.patientId || "").trim();

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required.",
      });
    }

    const result =
      await getPatientLocationForCaregiver(
        caregiverId,
        patientId
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to get patient location.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}