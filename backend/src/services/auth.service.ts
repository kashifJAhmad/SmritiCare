import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "../config/database";
import { normalizeProfileImageReference } from "./storage.service";

export class AuthValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthUserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "AuthUserNotFoundError";
  }
}

type SignupData = {
  fullName: string;
  email: string;
  password: string;
  age?: number;
  language?: string;
  role?: UserRole;
};

type LoginData = {
  email: string;
  password: string;
  role?: UserRole;
};

export type UpdateProfileData = {
  fullName?: string;
  age?: number | null;
  phone?: string | null;
  dateOfBirth?: Date | string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  bloodGroup?: string | null;
  medicalNotes?: string | null;
  profileImageUrl?: string | null;
  language?: string;
  caregiverName?: string | null;
  caregiverAccess?: boolean;
  gpsSharing?: boolean;
  textSize?: string;
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

function createToken(userId: string, role: UserRole): string {
  return jwt.sign(
    {
      userId,
      role,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    },
  );
}

function sanitizeUser(user: {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  age: number | null;
  language: string;
  caregiverName: string | null;
  caregiverAccess: boolean;
  gpsSharing: boolean;
  textSize: string;
  createdAt: Date;
  updatedAt: Date;
  phone?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  bloodGroup?: string | null;
  medicalNotes?: string | null;
  profileImageUrl?: string | null;
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    age: user.age,
    phone: user.phone ?? null,
    dateOfBirth: user.dateOfBirth ?? null,
    gender: user.gender ?? null,
    address: user.address ?? null,
    city: user.city ?? null,
    bloodGroup: user.bloodGroup ?? null,
    medicalNotes: user.medicalNotes ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    language: user.language,
    caregiverName: user.caregiverName,
    caregiverAccess: user.caregiverAccess,
    gpsSharing: user.gpsSharing,
    textSize: user.textSize,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function normalizeRole(role?: UserRole): UserRole {
  return role === UserRole.CAREGIVER
    ? UserRole.CAREGIVER
    : UserRole.PATIENT;
}

export async function signup(data: SignupData) {
  const fullName = typeof data?.fullName === "string" ? data.fullName.trim() : "";
  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data?.password === "string" ? data.password : "";
  const language = typeof data?.language === "string" ? data.language.trim() || "English" : "English";
  const role = normalizeRole(data?.role);

  if (!fullName) {
    throw new AuthValidationError("Full name is required");
  }

  if (!email) {
    throw new AuthValidationError("Email is required");
  }

  if (!password) {
    throw new AuthValidationError("Password is required");
  }

  if (password.length < 6) {
    throw new AuthValidationError("Password must be at least 6 characters");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AuthValidationError("An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      age: data.age,
      language,
      role,
    },
  });

  const token = createToken(user.id, user.role);

  return {
    token,
    user: sanitizeUser(user),
  };
}

export async function login(data: LoginData) {
  const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data?.password === "string" ? data.password : "";
  const requestedRole = normalizeRole(data?.role);

  if (!email) {
    throw new AuthValidationError("Email is required");
  }

  if (!password) {
    throw new AuthValidationError("Password is required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password,
  );

  if (!passwordMatches) {
    throw new AuthenticationError("Invalid email or password");
  }

  if (user.role !== requestedRole) {
    if (requestedRole === UserRole.CAREGIVER) {
      throw new AuthenticationError("This account is not registered as a caregiver");
    }

    throw new AuthenticationError("This account is not registered as a patient");
  }

  const token = createToken(user.id, user.role);

  return {
    token,
    user: sanitizeUser(user),
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AuthUserNotFoundError();
  }

  return sanitizeUser(user);
}

export async function updateCurrentUser(
  userId: string,
  data: UpdateProfileData,
) {
  const updateData: Record<string, unknown> = {};

  if (data.fullName !== undefined) {
    const fullName = typeof data.fullName === "string" ? data.fullName.trim() : "";

    if (!fullName) {
      throw new AuthValidationError("Full name cannot be empty");
    }

    updateData.fullName = fullName;
  }

  if (data.age !== undefined) {
    updateData.age = data.age;
  }

  if (data.phone !== undefined) {
    updateData.phone = data.phone;
  }

  if (data.dateOfBirth !== undefined) {
    updateData.dateOfBirth = data.dateOfBirth
      ? new Date(data.dateOfBirth)
      : null;
  }

  if (data.gender !== undefined) {
    updateData.gender = data.gender;
  }

  if (data.address !== undefined) {
    updateData.address = data.address;
  }

  if (data.city !== undefined) {
    updateData.city = data.city;
  }

  if (data.bloodGroup !== undefined) {
    updateData.bloodGroup = data.bloodGroup;
  }

  if (data.medicalNotes !== undefined) {
    updateData.medicalNotes = data.medicalNotes;
  }

  if (data.profileImageUrl !== undefined) {
    let normalizedProfileImage: string | null;
    try {
      normalizedProfileImage = normalizeProfileImageReference(data.profileImageUrl, userId);
    } catch {
      throw new AuthValidationError("Invalid profile image reference.");
    }
    if (data.profileImageUrl === null || normalizedProfileImage !== null) {
      updateData.profileImageUrl = normalizedProfileImage;
    }
  }

  if (data.language !== undefined) {
    updateData.language = data.language.trim() || "English";
  }

  if (data.caregiverName !== undefined) {
    updateData.caregiverName = data.caregiverName;
  }

  if (data.caregiverAccess !== undefined) {
    updateData.caregiverAccess = data.caregiverAccess;
  }

  if (data.gpsSharing !== undefined) {
    updateData.gpsSharing = data.gpsSharing;
  }

  if (data.textSize !== undefined) {
    updateData.textSize = data.textSize;
  }

  let user;
  try {
    user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new AuthUserNotFoundError();
    }
    throw error;
  }

  return sanitizeUser(user);
}
