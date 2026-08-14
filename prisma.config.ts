import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";
import { normalizeDatabaseUrl } from "./src/lib/database-url";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: normalizeDatabaseUrl(process.env.DATABASE_URL),
  },
});
