import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });
import pg from "pg";

async function main() {
  const url = (process.env.DATABASE_URL ?? "")
    .replace(/[&?]pgbouncer=true/g, "")
    .replace(/[&?]connection_limit=\d+/g, "");
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  const r = await pool.query(
    "SELECT id, title, \"skillType\", status FROM assignments WHERE \"skillType\" != 'WRITING' AND status = 'ACTIVE' ORDER BY \"createdAt\" DESC"
  );
  r.rows.forEach((x) =>
    console.log(x.skillType.padEnd(12), "| /assignments/" + x.id + " | " + x.title)
  );
  await pool.end();
}
main().catch(console.error);
