import { Router } from "express";

import {
  login,
  me,
  signup,
  updateMe,
} from "../controllers/auth.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.get(
  "/me",
  authenticate,
  me,
);

router.put(
  "/me",
  authenticate,
  updateMe,
);

export default router;