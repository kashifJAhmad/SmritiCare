import fs from "node:fs";
import path from "node:path";

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || "smriticcare",

    // Verify the Aiven database server using its CA certificate.
  ssl:
    process.env.DATABASE_SSL === "true"
      ? {
          ca: fs.readFileSync(
            path.resolve(process.cwd(), "certs", "ca.pem"),
            "utf8"
          ),
          rejectUnauthorized: true,
        }
      : undefined,

  connectionLimit: 5,
  acquireTimeout: 30000,
  connectTimeout: 10000,
});

export const prisma = new PrismaClient({
  adapter,
});
