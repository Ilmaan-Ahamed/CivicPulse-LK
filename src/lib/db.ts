import "server-only";
import { PrismaClient } from "@prisma/client";
<<<<<<< HEAD

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
=======
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeDatabaseUrl } from "./database-url";
>>>>>>> 3044950 (Auth Works)

export const db = globalForPrisma.prisma ?? new PrismaClient();

<<<<<<< HEAD
=======
const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

const adapter = new PrismaPg({ connectionString });

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

>>>>>>> 3044950 (Auth Works)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;