import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createMemoryController,
  deleteMemoryController,
  getMemoriesController,
  getPatientMemoriesController,
  getMemoryController,
  updateMemoryController,
} from "../controllers/memory.controller";

const router = Router();

router.use(authenticate);

router.get("/patient/:patientId", getPatientMemoriesController);

router.post("/", createMemoryController);
router.get("/", getMemoriesController);
router.get("/:id", getMemoryController);
router.put("/:id", updateMemoryController);
router.delete("/:id", deleteMemoryController);

export default router;
