import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function signup(
  req: Request,
  res: Response,
) {
  try {
    const {
      fullName,
      email,
      password,
      age,
      language,
    } = req.body;

    const parsedAge =
      age === undefined ||
      age === null ||
      age === ""
        ? undefined
        : Number(age);

    if (
      parsedAge !== undefined &&
      (!Number.isInteger(parsedAge) || parsedAge < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Age must be a valid number",
      });
    }

    const result = await authService.signup({
      fullName,
      email,
      password,
      age: parsedAge,
      language,
    });

    return res.status(201).json({
      success: true,
      message: "Patient account created successfully",
      ...result,
    });
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

export async function login(
  req: Request,
  res: Response,
) {
  try {
    const {
      email,
      password,
    } = req.body;

    const result = await authService.login({
      email,
      password,
    });

    return res.status(200).json({
      success: true,
      message: "Patient login successful",
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to login";

    return res.status(401).json({
      success: false,
      message,
    });
  }
}

export async function me(
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

    const user =
      await authService.getCurrentUser(req.userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to get user";

    return res.status(404).json({
      success: false,
      message,
    });
  }
}

export async function updateMe(
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

    const {
      fullName,
      age,
      language,
      caregiverName,
      caregiverAccess,
      gpsSharing,
      textSize,

      // Advanced profile fields
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      bloodGroup,
      medicalNotes,
      profileImageUrl,
    } = req.body;

    // -----------------------------
    // Validate age
    // -----------------------------

    let parsedAge: number | null | undefined;

    if (age === undefined) {
      parsedAge = undefined;
    } else if (age === null || age === "") {
      parsedAge = null;
    } else {
      parsedAge = Number(age);
    }

    if (
      parsedAge !== undefined &&
      parsedAge !== null &&
      (!Number.isInteger(parsedAge) ||
        parsedAge < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Age must be a valid number",
      });
    }

    // -----------------------------
    // Validate boolean fields
    // -----------------------------

    if (
      caregiverAccess !== undefined &&
      typeof caregiverAccess !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "Caregiver access must be true or false",
      });
    }

    if (
      gpsSharing !== undefined &&
      typeof gpsSharing !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message: "GPS sharing must be true or false",
      });
    }

    // -----------------------------
    // Update profile
    // -----------------------------

    const user =
      await authService.updateCurrentUser(
        req.userId,
        {
          fullName,
          age: parsedAge,
          language,
          caregiverName,
          caregiverAccess,
          gpsSharing,
          textSize,

          // Advanced profile fields
          phone,
          dateOfBirth,
          gender,
          address,
          city,
          bloodGroup,
          medicalNotes,
          profileImageUrl,
        },
      );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
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