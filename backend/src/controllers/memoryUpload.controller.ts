import { Request, Response } from "express";
import { prisma } from "../config/database";
import {
  createMemoryObjectKey,
  deleteMemoryObject,
  serializeMemoryMedia,
  uploadMemoryObject,
} from "../services/storage.service";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const audioTypes = new Set(["audio/m4a", "audio/mp4", "audio/aac", "audio/webm", "audio/mpeg", "audio/wav", "audio/x-m4a"]);

export async function uploadMemoryMediaController(req: Request, res: Response) {
  const file = req.file;
  const userId = req.userId;
  if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
  if (!file || !file.buffer || file.size <= 0) return res.status(400).json({ success: false, message: "No photo or audio file was uploaded." });
  if (file.size > 25 * 1024 * 1024) return res.status(400).json({ success: false, message: "File size must not exceed 25 MB." });

  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
  const category = typeof req.body.category === "string" ? req.body.category.trim() : "";
  const type = typeof req.body.type === "string" ? req.body.type.trim() : "";
  if (!title) return res.status(400).json({ success: false, message: "Memory title is required." });
  if (type !== "photo" && type !== "voice") return res.status(400).json({ success: false, message: "Memory type must be photo or voice." });
  if ((type === "photo" && !imageTypes.has(file.mimetype)) || (type === "voice" && !audioTypes.has(file.mimetype))) {
    return res.status(400).json({ success: false, message: "The selected file type does not match the memory type." });
  }

  let objectKey: string | undefined;
  let persisted = false;
  try {
    objectKey = createMemoryObjectKey(userId, file.mimetype);
    await uploadMemoryObject(objectKey, file.buffer, file.mimetype);
    const memory = await prisma.memory.create({
      data: {
        userId,
        title,
        description: description || null,
        category: category || null,
        type,
        imageUrl: type === "photo" ? objectKey : null,
        audioUrl: type === "voice" ? objectKey : null,
      },
    });
    persisted = true;
    return res.status(201).json({ success: true, message: "Memory saved successfully.", memory: await serializeMemoryMedia(memory) });
  } catch {
    if (objectKey && !persisted) {
      try { await deleteMemoryObject(objectKey, userId); } catch { /* Best-effort cleanup; do not expose storage details. */ }
    }
    return res.status(500).json({ success: false, message: "Unable to upload memory." });
  }
}
