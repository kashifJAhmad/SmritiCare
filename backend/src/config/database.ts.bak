import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "smriticcare",

  // Aiven requires TLS. The Aiven certificate is not in the
  // local/Render Node.js trusted CA store, so explicitly allow
  // the encrypted connection without certificate verification.
  ssl:
  process.env.DATABASE_SSL === "true"
    ? {
        rejectUnauthorized: false,
      }
    : undefined,

  connectionLimit: 5,
  acquireTimeout: 30000,
  connectTimeout: 10000,
});

export const prisma = new PrismaClient({
  adapter,
});