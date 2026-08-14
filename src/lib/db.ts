import "server-only";
import { PrismaClient } from "@prisma/client";
<<<<<<< HEAD
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/civicpulse";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
=======
<<<<<<< HEAD

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
=======
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeDatabaseUrl } from "./database-url";
>>>>>>> 3044950 (Auth Works)
>>>>>>> a253dab1c1f8db182681f8148dd1ce1fe67cda92

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

<<<<<<< HEAD
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

=======
>>>>>>> 3044950 (Auth Works)
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
>>>>>>> a253dab1c1f8db182681f8148dd1ce1fe67cda92
