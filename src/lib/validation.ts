import { CODE_LENGTH, MAX_CONFIG_LENGTH } from "./constants";

/** Escape HTML-sensitive characters to prevent stored XSS on render. */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** A 5-digit numeric code, e.g. "69168". */
export function isValidCode(code: unknown): code is string {
  return typeof code === "string" && new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code);
}

export interface ConfigValidationResult {
  ok: boolean;
  value?: string;
  error?: string;
}

/**
 * Validate and normalise an incoming config payload.
 * Empty configs are rejected; overly large payloads are rejected.
 * The stored value keeps the raw text (parameterised queries protect the DB);
 * HTML is escaped at render time.
 */
export function validateConfig(raw: unknown): ConfigValidationResult {
  if (typeof raw !== "string") {
    return { ok: false, error: "کانفیگ نامعتبر است." };
  }

  const value = raw.trim();

  if (value.length === 0) {
    return { ok: false, error: "کانفیگ نمی‌تواند خالی باشد." };
  }

  if (value.length > MAX_CONFIG_LENGTH) {
    return { ok: false, error: "کانفیگ بیش از حد بزرگ است." };
  }

  return { ok: true, value };
}
