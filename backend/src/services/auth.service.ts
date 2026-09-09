import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { prisma } from "../config/database";

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
  const fullName = data.fullName.trim();
  const email = data.email.trim().toLowerCase();
  const password = data.password;
  const language = data.language?.trim() || "English";
  const role = normalizeRole(data.role);

  if (!fullName) {
    throw new Error("Full name is required");
  }

  if (!email) {
    throw new Error("Email is required");
  }

  if (!password) {
    throw new Error("Password is required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists");
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
  const email = data.email.trim().toLowerCase();
  const requestedRole = normalizeRole(data.role);

  if (!email) {
    throw new Error("Email is required");
  }

  if (!data.password) {
    throw new Error("Password is required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.password,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  if (user.role !== requestedRole) {
    if (requestedRole === UserRole.CAREGIVER) {
      throw new Error("This account is not registered as a caregiver");
    }

    throw new Error("This account is not registered as a patient");
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
    throw new Error("User not found");
  }

  return sanitizeUser(user);
}

export async function updateCurrentUser(
  userId: string,
  data: UpdateProfileData,
) {
  const updateData: Record<string, unknown> = {};

  if (data.fullName !== undefined) {
    const fullName = data.fullName.trim();

    if (!fullName) {
      throw new Error("Full name cannot be empty");
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
    updateData.profileImageUrl = data.profileImageUrl;
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

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
  });

  return sanitizeUser(user);
}