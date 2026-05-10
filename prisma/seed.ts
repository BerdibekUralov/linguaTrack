import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL not found");
const dbUrl = rawUrl
  .replace(/[&?]pgbouncer=true/g, "")
  .replace(/[&?]connection_limit=\d+/g, "");

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  // ── Clear all existing data ────────────────────────────────────
  await db.grade.deleteMany({});
  await db.submission.deleteMany({});
  await db.notification.deleteMany({});
  await db.message.deleteMany({});
  await db.assignment.deleteMany({});
  await db.enrollment.deleteMany({});
  await db.user.deleteMany({});

  const teacherHash = await bcrypt.hash("teacher123", 10);
  const adminHash   = await bcrypt.hash("Admin123!", 10);

  // ── Teacher ────────────────────────────────────────────────────
  const teacher = await db.user.create({
    data: {
      name: "Aziz Karimov",
      email: "teacher@linguatrack.uz",
      password: teacherHash,
      role: "TEACHER",
    },
  });

  // ── Admin ──────────────────────────────────────────────────────
  const admin = await db.user.create({
    data: {
      name: "Admin",
      email: "admin@linguatrack.uz",
      password: adminHash,
      role: "ADMIN",
    },
  });

  console.log("\n✅ Seed complete!\n");
  console.log("┌────────────────────────────────────────────────────┐");
  console.log("│  TEACHER CREDENTIALS                               │");
  console.log("├──────────────────────┬─────────────────────────────┤");
  console.log("│  Email               │  teacher@linguatrack.uz     │");
  console.log("│  Password            │  teacher123                 │");
  console.log("│  Role                │  TEACHER                    │");
  console.log("└──────────────────────┴─────────────────────────────┘");
  console.log("┌────────────────────────────────────────────────────┐");
  console.log("│  ADMIN CREDENTIALS                                 │");
  console.log("├──────────────────────┬─────────────────────────────┤");
  console.log("│  Email               │  admin@linguatrack.uz       │");
  console.log("│  Password            │  Admin123!                  │");
  console.log("│  Role                │  ADMIN                      │");
  console.log("│  ID                  │  " + admin.id.slice(0, 22) + "... │");
  console.log("└──────────────────────┴─────────────────────────────┘\n");
  void teacher;
}

main()
  .catch(console.error)
  .finally(() => pool.end());
