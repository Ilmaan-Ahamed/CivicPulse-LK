import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";
import { normalizeDatabaseUrl } from "@/lib/database-url";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: normalizeDatabaseUrl(env("DATABASE_URL")),
  },
});