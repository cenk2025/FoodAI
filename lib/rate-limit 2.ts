const BUCKET = new Map<string, number[]>();
const WINDOW_MS = 60_000; // 1 min
const LIMIT = 10;

export function allowIp(ip: string) {
  const now = Date.now();
  const arr = BUCKET.get(ip) ?? [];
  const recent = arr.filter(t => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) return false;
  recent.push(now);
  BUCKET.set(ip, recent);
  return true;
}