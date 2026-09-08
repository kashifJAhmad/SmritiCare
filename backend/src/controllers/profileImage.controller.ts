import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../config/database";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "profiles",
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const filename =
      `profile-${Date.now()}-` +
      `${Math.round(Math.random() * 1_000_000)}` +
      extension;

    cb(null, filename);
  },
});

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, and WEBP images are allowed.",
      ),
    );
    return;
  }

  cb(null, true);
};

export const uploadProfileImageMiddleware =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  }).single("image");

export async function uploadProfileImage(
  req: Request & { userId?: string },
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No profile image was uploaded.",
      });
    }

    const baseUrl =
      process.env.BACKEND_PUBLIC_URL ||
      "http://localhost:5000";

    const imageUrl =
      `${baseUrl}/uploads/profiles/${req.file.filename}`;

    await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        profileImageUrl: imageUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      data: {
        profileImageUrl: imageUrl,
      },
    });
  } catch (error) {
    console.error(
      "Profile image upload error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to upload profile image",
    });
  }
}