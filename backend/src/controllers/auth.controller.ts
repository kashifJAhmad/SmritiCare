import { Request, Response } from "express";
import {
  AuthUserNotFoundError,
  AuthValidationError,
  AuthenticationError,
  getCurrentUser,
  login as loginUser,
  signup as signupUser,
  updateCurrentUser,
} from "../services/auth.service";
import { ProfileImageSerializationError, serializeProfileImageUser } from "../services/storage.service";

function profileImageSerializationFailure(res: Response, error: unknown): Response | null {
  if (!(error instanceof ProfileImageSerializationError)) return null;
  return res.status(500).json({ success: false, message: "Unable to prepare profile image." });
}

export async function signup(req: Request, res: Response) {
  try {
    const result = await signupUser(req.body);

    return res.status(201).json({ ...result, user: await serializeProfileImageUser(result.user) });
  } catch (error) {
    const serializationFailure = profileImageSerializationFailure(res, error);
    if (serializationFailure) return serializationFailure;
    if (error instanceof AuthValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({ ...result, user: await serializeProfileImageUser(result.user) });
  } catch (error) {
    const serializationFailure = profileImageSerializationFailure(res, error);
    if (serializationFailure) return serializationFailure;
    if (error instanceof AuthValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to sign in.",
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

    const user = await serializeProfileImageUser(await getCurrentUser(userId));

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    const serializationFailure = profileImageSerializationFailure(res, error);
    if (serializationFailure) return serializationFailure;
    if (error instanceof AuthUserNotFoundError) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve user.",
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
      user: await serializeProfileImageUser(user),
    });
  } catch (error) {
    const serializationFailure = profileImageSerializationFailure(res, error);
    if (serializationFailure) return serializationFailure;
    if (error instanceof AuthValidationError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error instanceof AuthUserNotFoundError) {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
}
