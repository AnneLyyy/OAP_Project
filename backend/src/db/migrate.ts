import fs from "fs";
import path from "path";
import { db } from "./db.ts";

const migrationsPath = path.resolve(process.cwd(), "backend/src/migrations");

export async function migrate() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY
    );
  `);

  const files = fs.readdirSync(migrationsPath);

  for (const file of files) {
    const exists = await db.get(
      "SELECT id FROM migrations WHERE id = ?",
      [file]
    );

    if (!exists) {
      const sql = fs.readFileSync(
        path.join(migrationsPath, file),
        "utf-8"
      );

      await db.exec(sql);
      await db.run("INSERT INTO migrations VALUES (?)", [file]);
    }
  }
}