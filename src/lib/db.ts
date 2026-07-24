import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

/**
 * Singleton SQLite connection.
 *
 * The default engine is SQLite (zero-config, file based). To switch to
 * PostgreSQL you can replace the queries in `src/lib/store.ts` with an
 * equivalent `pg` implementation — the schema is identical.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH ?? path.join(DATA_DIR, "configs.db");

let db: Database.Database | null = null;

function initDb(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const instance = new Database(DB_PATH);
  instance.pragma("journal_mode = WAL");
  instance.pragma("foreign_keys = ON");

  instance.exec(`
    CREATE TABLE IF NOT EXISTS configs (
      id          TEXT    PRIMARY KEY,
      code        TEXT    NOT NULL,
      config      TEXT    NOT NULL,
      shareLink   TEXT    NOT NULL,
      createdAt   INTEGER NOT NULL,
      expiresAt   INTEGER NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'active'
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_configs_code ON configs(code);
    CREATE INDEX IF NOT EXISTS idx_configs_expiresAt ON configs(expiresAt);
  `);

  return instance;
}

export function getDb(): Database.Database {
  if (!db) {
    db = initDb();
  }
  return db;
}
