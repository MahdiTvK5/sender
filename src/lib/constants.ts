/** Time-to-live for a share link: 24 hours in milliseconds. */
export const TTL_MS = 24 * 60 * 60 * 1000;

/** Maximum allowed size of a config payload (in characters). */
export const MAX_CONFIG_LENGTH = 20_000;

/** Length of the generated numeric code. */
export const CODE_LENGTH = 5;

/** Rate-limit window and max requests per window (per client IP). */
export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX = 20;
