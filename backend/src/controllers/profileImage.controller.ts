import { Request, Response } from "express";
import multer from "multer";
import { prisma } from "../config/database";
import {
  createProfileImageObjectKey,
  deleteProfileImageObject,
  resolveProfileImage,
  uploadProfileImageObject,
} from "../services/storage.service";
import { PROFILE_IMAGE_MAX_BYTES, validateProfileImageContent } from "../services/profileImage.validation";

const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
export const PROFILE_IMAGE_SAVED_SIGNING_FAILED = "PROFILE_IMAGE_SAVED_SIGNING_FAILED";

export const uploadProfileImageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: PROFILE_IMAGE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedTypes.has(file.mimetype.toLowerCase())) {
      callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
      return;
    }
    callback(null, true);
  },
}).single("image");

type ProfileImageUploadDependencies = {
  createKey: typeof createProfileImageObjectKey;
  upload: typeof uploadProfileImageObject;
  remove: typeof deleteProfileImageObject;
  persist: (userId: string, objectKey: string) => Promise<void>;
  isReferenced: (userId: string, objectKey: string) => Promise<boolean>;
  resolve: typeof resolveProfileImage;
};

export function createProfileImageUploadHandler(dependencies: ProfileImageUploadDependencies) {
  return async function uploadProfileImage(req: Request & { userId?: string }, res: Response) {
    const userId = req.userId;
    const file = req.file;
    if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
    if (!file || !file.buffer || file.size <= 0) {
      return res.status(400).json({ success: false, message: "No profile image was uploaded." });
    }
    if (file.size > PROFILE_IMAGE_MAX_BYTES || file.buffer.length > PROFILE_IMAGE_MAX_BYTES) {
      return res.status(400).json({ success: false, message: "Profile image must not exceed 5 MB." });
    }

    const contentType = validateProfileImageContent(file.mimetype, file.buffer);
    if (!contentType) {
      return res.status(400).json({ success: false, message: "The uploaded file is not a supported JPG, PNG, or WEBP image." });
    }

    let objectKey: string;
    try {
      objectKey = dependencies.createKey(userId, contentType);
      await dependencies.upload(objectKey, file.buffer, contentType, userId);
    } catch {
      return res.status(500).json({ success: false, message: "Unable to upload profile image." });
    }

    try {
      await dependencies.persist(userId, objectKey);
    } catch {
      let isReferenced: boolean;
      try {
        isReferenced = await dependencies.isReferenced(userId, objectKey);
      } catch {
        // Retain the object when commit state is unknown to avoid breaking a row that may reference it.
        console.error("Profile image persistence outcome could not be verified");
        return res.status(500).json({ success: false, message: "Unable to save profile image." });
      }
      if (isReferenced) {
        console.error("Profile image remains referenced after persistence error");
        return res.status(500).json({ success: false, message: "Unable to save profile image." });
      }
      try {
        await dependencies.remove(objectKey, userId);
      } catch {
        // Keep the response safe while leaving an operational breadcrumb for orphan cleanup.
        console.error("Profile image compensating cleanup failed");
      }
      return res.status(500).json({ success: false, message: "Unable to save profile image." });
    }

    try {
      const profileImageUrl = await dependencies.resolve(objectKey, userId);
      return res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        data: { profileImageUrl },
      });
    } catch {
      return res.status(500).json({
        success: false,
        code: PROFILE_IMAGE_SAVED_SIGNING_FAILED,
        message: "Profile image was saved but could not be prepared for display.",
      });
    }
  };
}

export const uploadProfileImage = createProfileImageUploadHandler({
  createKey: createProfileImageObjectKey,
  upload: uploadProfileImageObject,
  remove: deleteProfileImageObject,
  async persist(userId, objectKey) {
    await prisma.user.update({ where: { id: userId }, data: { profileImageUrl: objectKey } });
  },
  async isReferenced(userId, objectKey) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { profileImageUrl: true } });
    return user?.profileImageUrl === objectKey;
  },
  resolve: resolveProfileImage,
});
