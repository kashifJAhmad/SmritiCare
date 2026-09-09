import { Request, Response } from "express";

import {
  createInvite,
  connectPatient,
  connectCaregiverToPatient,
  getOrCreatePatientCode,
  getCaregiverPatients,
  getPatientCaregiver,
  removeConnection,
} from "../services/caregiverConnection.service";

// ============================================================
// GET / CREATE PATIENT CODE
// GET /api/caregiver-connections/patient-code
// ============================================================

export async function getPatientCode(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getOrCreatePatientCode(userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to get patient code";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// ============================================================
// CREATE INVITE
// POST /api/caregiver-connections/invite
//
// Kept for Phase 2.
// ============================================================

export async function createCaregiverInvite(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const invite = await createInvite(userId);

    return res.status(201).json({
      success: true,
      invite,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create caregiver invite";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// ============================================================
// CONNECT PATIENT USING CAREGIVER INVITE
// POST /api/caregiver-connections/connect
//
// Kept for Phase 2.
// ============================================================

export async function connectToCaregiver(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { code } = req.body;

    const connection = await connectPatient(
      userId,
      code,
    );

    return res.status(201).json({
      success: true,
      connection,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to connect to caregiver";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// ============================================================
// CONNECT CAREGIVER TO PATIENT
// POST /api/caregiver-connections/connect-patient
//
// Phase 1:
// Caregiver enters patient code.
// ============================================================

export async function connectToPatient(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { patientCode } = req.body;

    const connection =
      await connectCaregiverToPatient(
        userId,
        patientCode,
      );

    return res.status(201).json({
      success: true,
      connection,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to connect to patient";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// ============================================================
// GET CAREGIVER PATIENTS
// GET /api/caregiver-connections/patients
// ============================================================

export async function getPatients(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const patients =
      await getCaregiverPatients(userId);

    return res.status(200).json({
      success: true,
      patients,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve patients";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// ============================================================
// GET PATIENT CAREGIVER
// GET /api/caregiver-connections/caregiver
// ============================================================

export async function getCaregiver(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const caregiver =
      await getPatientCaregiver(userId);

    return res.status(200).json({
      success: true,
      caregiver,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve caregiver";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// ============================================================
// DELETE CONNECTION
// DELETE /api/caregiver-connections/:id
// ============================================================

export async function deleteConnection(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Connection ID is required",
      });
    }

    const result = await removeConnection(
      userId,
      id,
    );

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to remove connection";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}