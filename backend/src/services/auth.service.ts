import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
}) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    age: user.age,
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