import { Request, Response } from "express";

import {
  createInvite,
  connectPatient,
  connectCaregiverToPatient,
  getOrCreatePatientCode,
  getCaregiverPatients,
  getPatientCaregiver,
  removeConnection,
  CaregiverConnectionAuthorizationError,
  CaregiverConnectionNotFoundError,
  CaregiverConnectionValidationError,
} from "../services/caregiverConnection.service";
import { ProfileImageSerializationError, resolveProfileImage } from "../services/storage.service";

function caregiverErrorResponse(res: Response, error: unknown): Response {
  if (error instanceof CaregiverConnectionValidationError) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error instanceof CaregiverConnectionAuthorizationError) {
    return res.status(403).json({ success: false, message: error.message });
  }
  if (error instanceof CaregiverConnectionNotFoundError) {
    return res.status(404).json({ success: false, message: error.message });
  }
  if (error instanceof ProfileImageSerializationError) {
    return res.status(500).json({ success: false, message: "Unable to prepare profile image." });
  }
  return res.status(500).json({ success: false, message: "Unable to process caregiver request." });
}

async function serializeProfileRecord<T extends { id: string; profileImageUrl?: string | null }>(record: T): Promise<T> {
  return { ...record, profileImageUrl: await resolveProfileImage(record.profileImageUrl, record.id) };
}

async function serializeConnectionProfileImages<T extends { patient?: any; caregiver?: any }>(connection: T): Promise<T> {
  const [patient, caregiver] = await Promise.all([
    connection.patient?.id ? serializeProfileRecord(connection.patient) : connection.patient,
    connection.caregiver?.id ? serializeProfileRecord(connection.caregiver) : connection.caregiver,
  ]);
  return { ...connection, patient, caregiver };
}

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
    return caregiverErrorResponse(res, error);
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
    return caregiverErrorResponse(res, error);
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

    const code = req.body?.code;

    const connection = await connectPatient(
      userId,
      code,
    );

    return res.status(201).json({
      success: true,
      connection: await serializeConnectionProfileImages(connection),
    });
  } catch (error) {
    return caregiverErrorResponse(res, error);
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

    const patientCode = req.body?.patientCode;

    const connection =
      await connectCaregiverToPatient(
        userId,
        patientCode,
      );

    return res.status(201).json({
      success: true,
      connection: await serializeConnectionProfileImages(connection),
    });
  } catch (error) {
    return caregiverErrorResponse(res, error);
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
      patients: await Promise.all(patients.map(serializeConnectionProfileImages)),
    });
  } catch (error) {
    return caregiverErrorResponse(res, error);
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
      caregiver: caregiver?.caregiver
        ? { ...caregiver, caregiver: await serializeProfileRecord(caregiver.caregiver) }
        : caregiver,
    });
  } catch (error) {
    return caregiverErrorResponse(res, error);
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
    return caregiverErrorResponse(res, error);
  }
}
