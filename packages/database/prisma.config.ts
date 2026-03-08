import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env from the monorepo root (two levels up from packages/database)
config({ path: path.resolve(import.meta.dirname, "../../.env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
