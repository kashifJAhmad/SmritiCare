import { Router } from "express";
import multer from "multer";

import { authenticate } from "../middleware/auth.middleware";
import { uploadMemoryMediaController } from "../controllers/memoryUpload.controller";

const router = Router();
const allowedTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "audio/m4a", "audio/mp4",
  "audio/aac", "audio/webm", "audio/mpeg", "audio/wav", "audio/x-m4a",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file"));
      return;
    }
    callback(null, true);
  },
}).single("file");

router.use(authenticate);

router.post("/", (req, res, next) => {
  upload(req, res, (error: unknown) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE"
        ? "File size must not exceed 25 MB."
        : "Unsupported file type or upload field.";
      res.status(400).json({ success: false, message });
      return;
    }
    next();
  });
}, uploadMemoryMediaController);

export default router;
