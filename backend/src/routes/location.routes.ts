import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import {
  deleteLocation,
  getPatientLocation,
  updateLocation,
} from "../controllers/location.controller";

const router = Router();

router.use(authenticate);

router.put("/", updateLocation);

router.delete("/", deleteLocation);

router.get(
  "/patient/:patientId",
  getPatientLocation
);

export default router;