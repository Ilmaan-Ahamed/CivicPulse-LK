import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";
import { normalizeDatabaseUrl } from "./src/lib/database-url";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: normalizeDatabaseUrl(env("DATABASE_URL")),
  },
});