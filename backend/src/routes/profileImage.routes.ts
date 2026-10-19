import { Router } from "express";

import {
  uploadProfileImage,
  uploadProfileImageMiddleware,
} from "../controllers/profileImage.controller";

import { authenticate } from "../middleware/auth.middleware";
import multer from "multer";

const router = Router();

router.post(
  "/",
  authenticate,
  (req, res, next) => {
    uploadProfileImageMiddleware(req, res, (error: unknown) => {
      if (!error) return next();
      const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? "Profile image must not exceed 5 MB."
        : error instanceof multer.MulterError && error.code === "LIMIT_UNEXPECTED_FILE"
          ? "Only JPG, PNG, or WEBP profile images are supported."
          : "Unable to process profile image upload.";
      return res.status(400).json({ success: false, message });
    });
  },
  uploadProfileImage,
);

export default router;
