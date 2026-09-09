import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import * as taskService from "../services/task.service";

export async function createTask(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      description,
      category,
      scheduledAt,
      reminderEnabled,
      repeatType,
    } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date and time are required",
      });
    }

    const task = await taskService.createTask(req.userId, {
      title,
      description,
      category,
      scheduledAt,
      reminderEnabled,
      repeatType,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create task";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function getTasks(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const tasks = await taskService.getTasks(req.userId);

    return res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to get tasks";

    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function getTaskById(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const taskId = String(req.params.id);

    const task = await taskService.getTaskById(
      req.userId,
      taskId,
    );

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to get task";

    return res.status(404).json({
      success: false,
      message,
    });
  }
}

export async function updateTask(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const taskId = String(req.params.id);

    const {
      title,
      description,
      category,
      scheduledAt,
      completed,
      reminderEnabled,
      repeatType,
    } = req.body;

    const task = await taskService.updateTask(
      req.userId,
      taskId,
      {
        title,
        description,
        category,
        scheduledAt,
        completed,
        reminderEnabled,
        repeatType,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update task";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function completeTask(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const taskId = String(req.params.id);

    const task = await taskService.completeTask(
      req.userId,
      taskId,
    );

    return res.status(200).json({
      success: true,
      message: "Task marked as completed",
      task,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to complete task";

    return res.status(404).json({
      success: false,
      message,
    });
  }
}

export async function deleteTask(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const taskId = String(req.params.id);

    const result = await taskService.deleteTask(
      req.userId,
      taskId,
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to delete task";

    return res.status(404).json({
      success: false,
      message,
    });
  }
}