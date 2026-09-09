import { Router } from "express";

import {
  createCaregiverInvite,
  connectToCaregiver,
  connectToPatient,
  getPatientCode,
  getPatients,
  getCaregiver,
  deleteConnection,
} from "../controllers/caregiverConnection.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// ============================================================
// PHASE 1 — PATIENT CODE
// ============================================================

// Patient gets their permanent patient code
router.get("/patient-code", getPatientCode);

// Caregiver enters a patient's code
router.post("/connect-patient", connectToPatient);

// ============================================================
// PHASE 2 — CAREGIVER CODE
// ============================================================

// Caregiver creates an invitation for a patient
router.post("/invite", createCaregiverInvite);

// Patient uses caregiver invitation code
router.post("/connect", connectToCaregiver);

// ============================================================
// CONNECTIONS
// ============================================================

// Caregiver's connected patients
router.get("/patients", getPatients);

// Patient's connected caregiver
router.get("/caregiver", getCaregiver);

// Remove connection
router.delete("/:id", deleteConnection);

export default router;