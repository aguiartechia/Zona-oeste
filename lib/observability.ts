/**
 * Lightweight observability — structured console logs without emails/PII.
 */
export type LogMeta = Record<string, string | number | boolean | null | undefined>;

export function logEvent(name: string, meta: LogMeta = {}): void {
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(meta)) {
    const lower = key.toLowerCase();
    if (
      lower.includes("email") ||
      lower.includes("password") ||
      lower.includes("token") ||
      lower.includes("phone") ||
      lower === "locality" ||
      lower === "bio" ||
      lower === "display_name" ||
      lower === "name"
    ) {
      continue;
    }
    if (value === undefined) continue;
    safe[key] = value;
  }
  console.info(JSON.stringify({ event: name, ...safe, ts: new Date().toISOString() }));
}
