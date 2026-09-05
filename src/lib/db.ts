import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeDatabaseUrl } from "./database-url";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = normalizeDatabaseUrl(
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/civicpulse"
);

const adapter = new PrismaPg({ connectionString });

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export default db;
