import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { authenticate } from "../middleware/auth.middleware";
import { uploadMemoryMediaController } from "../controllers/memoryUpload.controller";

const router = Router();

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "memories"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}${extension || ".bin"}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const allowedAudioTypes = [
      "audio/m4a",
      "audio/mp4",
      "audio/aac",
      "audio/webm",
      "audio/mpeg",
      "audio/wav",
      "audio/x-m4a",
    ];

    const allowed =
      allowedImageTypes.includes(file.mimetype) ||
      allowedAudioTypes.includes(file.mimetype);

    if (!allowed) {
      cb(new Error("Unsupported file type."));
      return;
    }

    cb(null, true);
  },
});

router.use(authenticate);

router.post(
  "/",
  upload.single("file"),
  uploadMemoryMediaController
);

export default router;