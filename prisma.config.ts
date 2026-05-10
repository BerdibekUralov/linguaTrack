// Prisma v7 config — migrate uchun DIRECT_URL, runtime uchun DATABASE_URL
import "dotenv/config";
import { defineConfig } from "prisma/config";

// DATABASE_URL dan pgbouncer parametrlarini olib tashlaymiz (migrate uchun kerak emas)
const rawUrl = process.env["DATABASE_URL"] ?? "";
const migrateUrl = process.env["DIRECT_URL"] ??
  rawUrl
    .replace(/[&?]pgbouncer=true/g, "")
    .replace(/[&?]connection_limit=\d+/g, "")
    .replace(/-pooler(\.[^/]+)/, "$1"); // -pooler hostdan olib tashlash

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: migrateUrl,
  },
});
