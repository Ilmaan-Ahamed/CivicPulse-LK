import { config } from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });
config();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/civicpulse",
  },
});