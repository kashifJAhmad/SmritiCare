import { Request, Response } from "express";
import {
  getCurrentUser,
  login as loginUser,
  signup as signupUser,
  updateCurrentUser,
} from "../services/auth.service";

export async function signup(req: Request, res: Response) {
  try {
    const result = await signupUser(req.body);

    return res.status(201).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to create account";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to sign in";

    return res.status(401).json({
      success: false,
      message,
    });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await getCurrentUser(userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve user";

    return res.status(404).json({
      success: false,
      message,
    });
  }
}

export async function updateMe(req: Request, res: Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await updateCurrentUser(
      userId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update profile";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}