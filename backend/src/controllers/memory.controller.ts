import { Request, Response } from "express";
import {
  createMemory,
  deleteMemory,
  getMemories,
  getPatientMemoriesForCaregiver,
  getMemoryById,
  updateMemory,
} from "../services/memory.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function getPatientMemoriesController(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId || !req.params.patientId || Array.isArray(req.params.patientId)) return res.status(401).json({ success: false, message: "Authentication and patient ID are required." });
    return res.json({ success: true, memories: await getPatientMemoriesForCaregiver(req.userId, req.params.patientId) });
  } catch (error) { return res.status(403).json({ success: false, message: error instanceof Error ? error.message : "Unable to load patient memories." }); }
}

function getMemoryId(req: Request): string | null {
  const id = req.params.id;

  return typeof id === "string" ? id : null;
}

export async function createMemoryController(
  req: Request,
  res: Response
) {
  try {
    const memory = await createMemory(req.userId!, {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
    });

    res.status(201).json({
      success: true,
      message: "Memory saved successfully.",
      memory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to save memory.",
    });
  }
}

export async function getMemoriesController(
  req: Request,
  res: Response
) {
  try {
    const memories = await getMemories(req.userId!);

    res.json({
      success: true,
      memories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load memories.",
    });
  }
}

export async function getMemoryController(
  req: Request,
  res: Response
) {
  try {
    const memoryId = getMemoryId(req);

    if (!memoryId) {
      res.status(400).json({
        success: false,
        message: "Invalid memory ID.",
      });
      return;
    }

    const memory = await getMemoryById(
      req.userId!,
      memoryId
    );

    if (!memory) {
      res.status(404).json({
        success: false,
        message: "Memory not found.",
      });
      return;
    }

    res.json({
      success: true,
      memory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to load memory.",
    });
  }
}

export async function updateMemoryController(
  req: Request,
  res: Response
) {
  try {
    const memoryId = getMemoryId(req);

    if (!memoryId) {
      res.status(400).json({
        success: false,
        message: "Invalid memory ID.",
      });
      return;
    }

    const memory = await updateMemory(
      req.userId!,
      memoryId,
      {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      }
    );

    res.json({
      success: true,
      message: "Memory updated successfully.",
      memory,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update memory.";

    res.status(
      message === "Memory not found." ? 404 : 400
    ).json({
      success: false,
      message,
    });
  }
}

export async function deleteMemoryController(
  req: Request,
  res: Response
) {
  try {
    const memoryId = getMemoryId(req);

    if (!memoryId) {
      res.status(400).json({
        success: false,
        message: "Invalid memory ID.",
      });
      return;
    }

    await deleteMemory(req.userId!, memoryId);

    res.json({
      success: true,
      message: "Memory deleted successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete memory.";

    res.status(
      message === "Memory not found." ? 404 : 400
    ).json({
      success: false,
      message,
    });
  }
}
