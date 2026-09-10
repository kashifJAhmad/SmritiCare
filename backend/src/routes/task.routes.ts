import { Router } from "express";

import {
  completePatientTask,
  completeTask,
  createPatientTask,
  createTask,
  deletePatientTask,
  deleteTask,
  getPatientTasks,
  getTaskById,
  getTasks,
  updatePatientTask,
  updateTask,
} from "../controllers/task.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// ============================================================
// CAREGIVER → PATIENT TASKS
// These MUST come before /:id
// ============================================================

router.get(
  "/patient/:patientId",
  getPatientTasks,
);

router.post(
  "/patient/:patientId",
  createPatientTask,
);

router.put(
  "/patient/:patientId/:taskId",
  updatePatientTask,
);

router.patch(
  "/patient/:patientId/:taskId/complete",
  completePatientTask,
);

router.delete(
  "/patient/:patientId/:taskId",
  deletePatientTask,
);

// ============================================================
// PATIENT TASKS
// ============================================================

router.post("/", createTask);

router.get("/", getTasks);

router.get("/:id", getTaskById);

router.put("/:id", updateTask);

router.patch("/:id/complete", completeTask);

router.delete("/:id", deleteTask);

export default router;