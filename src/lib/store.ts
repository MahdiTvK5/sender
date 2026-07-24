import crypto from "node:crypto";
import { getDb } from "./db";
import { CODE_LENGTH, TTL_MS } from "./constants";
import type { ConfigRecord, ConfigStatus } from "./types";

/** Generate a cryptographically-random N-digit numeric code (e.g. "69168"). */
function generateCode(): string {
  const max = 10 ** CODE_LENGTH;
  const n = crypto.randomInt(0, max);
  return n.toString().padStart(CODE_LENGTH, "0");
}

/** Compute the live status of a record based on the current time. */
export function resolveStatus(record: ConfigRecord, now = Date.now()): ConfigStatus {
  return now >= record.expiresAt ? "expired" : record.status === "expired" ? "expired" : "active";
}

function buildShareLink(code: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}/s/${code}`;
}

export interface CreatedConfig {
  record: ConfigRecord;
}

/**
 * Persist a new config, generating a guaranteed-unique 5-digit code.
 * Retries on the (rare) collision until it finds a free code.
 */
export function createConfig(config: string, baseUrlFromRequest?: string): ConfigRecord {
  const db = getDb();
  const insert = db.prepare(
    `INSERT INTO configs (id, code, config, shareLink, createdAt, expiresAt, status)
     VALUES (@id, @code, @config, @shareLink, @createdAt, @expiresAt, @status)`
  );

  const now = Date.now();
  const expiresAt = now + TTL_MS;

  // Try until a unique code is inserted. The UNIQUE index guarantees
  // correctness even under concurrency.
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const code = generateCode();
    const base = (baseUrlFromRequest ?? process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
    const shareLink = base ? `${base}/s/${code}` : buildShareLink(code);

    const record: ConfigRecord = {
      id: crypto.randomUUID(),
      code,
      config,
      shareLink,
      createdAt: now,
      expiresAt,
      status: "active",
    };

    try {
      insert.run(record);
      return record;
    } catch (err) {
      // SQLITE_CONSTRAINT_UNIQUE -> duplicate code, retry.
      if (err instanceof Error && /UNIQUE/i.test(err.message)) {
        continue;
      }
      throw err;
    }
  }

  throw new Error("عدم امکان تولید کد یکتا. لطفاً دوباره تلاش کنید.");
}

/** Fetch a record by its code, refreshing its status if it has expired. */
export function getConfigByCode(code: string): ConfigRecord | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM configs WHERE code = ?").get(code) as
    | ConfigRecord
    | undefined;

  if (!row) return null;

  const status = resolveStatus(row);
  if (status !== row.status) {
    db.prepare("UPDATE configs SET status = ? WHERE code = ?").run(status, code);
    row.status = status;
  }

  return row;
}

/** Delete a record. Returns true when a row was actually removed. */
export function deleteConfigByCode(code: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM configs WHERE code = ?").run(code);
  return result.changes > 0;
}

/** Housekeeping: mark all past-due records as expired. */
export function expireStaleConfigs(): void {
  const db = getDb();
  db.prepare("UPDATE configs SET status = 'expired' WHERE expiresAt <= ? AND status != 'expired'").run(
    Date.now()
  );
}
