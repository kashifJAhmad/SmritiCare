import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../config/database";

export async function uploadMemoryMediaController(
  req: Request,
  res: Response
) {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "No photo or audio file was uploaded.",
      });
      return;
    }

    const title =
      typeof req.body.title === "string"
        ? req.body.title.trim()
        : "";

    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";

    const category =
      typeof req.body.category === "string"
        ? req.body.category.trim()
        : "";

    const type =
      typeof req.body.type === "string"
        ? req.body.type.trim()
        : "";

    if (!title) {
      fs.unlinkSync(file.path);

      res.status(400).json({
        success: false,
        message: "Memory title is required.",
      });
      return;
    }

    if (!["photo", "voice"].includes(type)) {
      fs.unlinkSync(file.path);

      res.status(400).json({
        success: false,
        message: "Memory type must be photo or voice.",
      });
      return;
    }

    const baseUrl =
      process.env.BACKEND_PUBLIC_URL ||
      "http://10.103.66.53:5000";

    const relativePath = path
      .relative(process.cwd(), file.path)
      .replace(/\\/g, "/");

    const fileUrl = `${baseUrl}/${relativePath}`;

    const memory = await prisma.memory.create({
      data: {
        userId: req.userId!,
        title,
        description: description || null,
        category: category || null,
        type,
        imageUrl: type === "photo" ? fileUrl : null,
        audioUrl: type === "voice" ? fileUrl : null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Memory saved successfully.",
      memory,
    });
  } catch (error) {
    console.error("Memory upload error:", error);

    const file = req.file;

    if (file) {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch {
        // Ignore cleanup errors.
      }
    }

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to upload memory.",
    });
  }
}