/** Derive the public base URL of the current request (protocol + host). */
export function getBaseUrlFromRequest(headers: Headers): string {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");

  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!host) return "";

  const proto = headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}
