import { Router } from "express";

import {
  uploadProfileImage,
  uploadProfileImageMiddleware,
} from "../controllers/profileImage.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  uploadProfileImageMiddleware,
  uploadProfileImage,
);

export default router;