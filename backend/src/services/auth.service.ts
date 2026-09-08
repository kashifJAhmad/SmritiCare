import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { prisma } from "../config/database";



type SignupData = {
  fullName: string;
  email: string;
  password: string;
  age?: number;
  language?: string;
};

type LoginData = {
  email: string;
  password: string;
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

function createToken(userId: string): string {
  return jwt.sign(
    {
      userId,
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

export async function signup(data: SignupData) {
  const fullName = data.fullName.trim();
  const email = data.email.trim().toLowerCase();
  const password = data.password;
  const language = data.language?.trim() || "English";

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
    },
  });

  const token = createToken(user.id);

  return {
    token,
    user: sanitizeUser(user),
  };
}

export async function login(data: LoginData) {
  const email = data.email.trim().toLowerCase();

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

  const token = createToken(user.id);

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
  const existingUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

    const updateData: {
    fullName?: string;
    age?: number | null;
    phone?: string | null;
    dateOfBirth?: Date | null;
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
  } = {};
  // Full name
  if (data.fullName !== undefined) {
    const fullName = data.fullName.trim();

    if (!fullName) {
      throw new Error("Full name cannot be empty");
    }

    updateData.fullName = fullName;
  }

  // Age
  if (data.age !== undefined) {
    if (
      data.age !== null &&
      (!Number.isInteger(data.age) || data.age < 1)
    ) {
      throw new Error("Age must be a valid number");
    }

    updateData.age = data.age;
  }

  // Phone
  if (data.phone !== undefined) {
    const phone = data.phone?.trim();

    updateData.phone = phone || null;
  }

  // Date of birth
  if (data.dateOfBirth !== undefined) {
    if (data.dateOfBirth === null) {
      updateData.dateOfBirth = null;
    } else {
      const dateOfBirth = new Date(data.dateOfBirth);

      if (Number.isNaN(dateOfBirth.getTime())) {
        throw new Error("Date of birth must be a valid date");
      }

      updateData.dateOfBirth = dateOfBirth;
    }
  }

  // Gender
  if (data.gender !== undefined) {
    const gender = data.gender?.trim();

    updateData.gender = gender || null;
  }

  // Address
  if (data.address !== undefined) {
    const address = data.address?.trim();

    updateData.address = address || null;
  }

  // City
  if (data.city !== undefined) {
    const city = data.city?.trim();

    updateData.city = city || null;
  }

  // Blood group
  if (data.bloodGroup !== undefined) {
    const bloodGroup = data.bloodGroup?.trim();

    updateData.bloodGroup = bloodGroup || null;
  }

   // Medical notes
  if (data.medicalNotes !== undefined) {
    const medicalNotes = data.medicalNotes?.trim();

    updateData.medicalNotes = medicalNotes || null;
  }

  // Profile image
  if (data.profileImageUrl !== undefined) {
    const profileImageUrl = data.profileImageUrl?.trim();

    updateData.profileImageUrl = profileImageUrl || null;
  }

  // Language
  if (data.language !== undefined) {
    const language = data.language.trim();

    if (!language) {
      throw new Error("Language cannot be empty");
    }

    updateData.language = language;
  }

  // Caregiver name
  if (data.caregiverName !== undefined) {
    const caregiverName = data.caregiverName?.trim();

    updateData.caregiverName = caregiverName || null;
  }

  // Caregiver access
  if (data.caregiverAccess !== undefined) {
    updateData.caregiverAccess = data.caregiverAccess;
  }

  // GPS sharing
  if (data.gpsSharing !== undefined) {
    updateData.gpsSharing = data.gpsSharing;
  }

  // Text size
  if (data.textSize !== undefined) {
    if (!["Normal", "Large"].includes(data.textSize)) {
      throw new Error("Text size must be Normal or Large");
    }

    updateData.textSize = data.textSize;
  }

  // Update database
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
  });

  return sanitizeUser(user);
}