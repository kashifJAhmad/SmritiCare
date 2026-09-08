import { Router } from "express";

import {
  completeTask,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from "../controllers/task.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", createTask);

router.get("/", getTasks);

router.get("/:id", getTaskById);

router.put("/:id", updateTask);

router.patch("/:id/complete", completeTask);

router.delete("/:id", deleteTask);

export default router;