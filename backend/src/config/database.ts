import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "smriticcare",

  // Aiven MySQL requires an encrypted connection.
  ssl: process.env.DATABASE_SSL === "true",

  connectionLimit: 5,
});

export const prisma = new PrismaClient({
  adapter,
});