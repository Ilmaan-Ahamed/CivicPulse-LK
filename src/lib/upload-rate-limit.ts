import "server-only";
import { db } from "@/lib/db";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 20;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
let lastCleanupAt = 0;
let warnedAboutLocalFallback = false;
const localBuckets = new Map<string, { count: number; resetAt: number }>();

function consumeLocalUploadLimit(userId: string, now: Date) {
  const nowMs = now.getTime();
  const windowStart = Math.floor(nowMs / WINDOW_MS) * WINDOW_MS;
  const bucketKey = `${userId}:${windowStart}`;
  const bucket = localBuckets.get(bucketKey);
  const count = (bucket?.count ?? 0) + 1;
  const resetAt = windowStart + WINDOW_MS;

  localBuckets.set(bucketKey, { count, resetAt });
  for (const [key, entry] of localBuckets) {
    if (entry.resetAt <= nowMs) localBuckets.delete(key);
  }

  return {
    allowed: count <= MAX_UPLOADS_PER_WINDOW,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - nowMs) / 1000)),
  };
}

export async function consumeUploadLimit(userId: string) {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
  const bucketKey = `${userId}:${windowStart.toISOString()}`;
  let bucket: { count: number };
  try {
    bucket = await db.uploadRateLimit.upsert({
      where: { bucketKey },
      create: { bucketKey, count: 1, windowStart },
      update: { count: { increment: 1 } },
    });
  } catch (error) {
    const errorCode = typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;
    if (process.env.NODE_ENV === "production" || errorCode !== "P2021") throw error;

    if (!warnedAboutLocalFallback) {
      warnedAboutLocalFallback = true;
      console.warn("[UPLOAD RATE LIMIT] UploadRateLimit table is missing; using a process-local development limit.");
    }
    return consumeLocalUploadLimit(userId, now);
  }

  if (now.getTime() - lastCleanupAt >= CLEANUP_INTERVAL_MS) {
    lastCleanupAt = now.getTime();
    await db.uploadRateLimit.deleteMany({
      where: { windowStart: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
    });
  }

  return {
    allowed: bucket.count <= MAX_UPLOADS_PER_WINDOW,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((windowStart.getTime() + WINDOW_MS - now.getTime()) / 1000)
    ),
  };
}