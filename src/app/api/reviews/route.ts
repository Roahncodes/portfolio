import { NextResponse } from "next/server";

import {
  createPendingReview,
  isReviewsConfigured,
  listApprovedReviews,
  ReviewValidationError,
} from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 6_000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

type RateLimitRecord = { count: number; resetAt: number };

const globalForRateLimit = globalThis as typeof globalThis & {
  __portfolioReviewRateLimit?: Map<string, RateLimitRecord>;
};

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "local"
  );
}

/**
 * A best-effort guard, not a security boundary: serverless instances each keep
 * their own map. It stops a simple refresh-loop from filling the free cluster.
 */
function checkRateLimit(request: Request): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  const buckets =
    globalForRateLimit.__portfolioReviewRateLimit ??
    (globalForRateLimit.__portfolioReviewRateLimit = new Map());

  for (const [key, record] of buckets) {
    if (record.resetAt <= now) buckets.delete(key);
  }

  const key = clientKey(request);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return {
      limited: true,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { limited: false, retryAfter: 0 };
}

function noStore(body: unknown, status = 200, extraHeaders?: HeadersInit) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });
}

export async function GET() {
  if (!isReviewsConfigured()) {
    return noStore(
      {
        error: "not-configured",
        message: "The guestbook database is not connected yet.",
      },
      503
    );
  }

  try {
    const reviews = await listApprovedReviews();
    return noStore({ reviews });
  } catch (error) {
    console.error(
      "[reviews] could not list approved reviews:",
      error instanceof Error ? error.message : "unknown error"
    );
    return noStore(
      {
        error: "unavailable",
        message: "The guestbook is temporarily unavailable.",
      },
      503
    );
  }
}

export async function POST(request: Request) {
  if (!isReviewsConfigured()) {
    return noStore(
      {
        error: "not-configured",
        message: "The guestbook database is not connected yet.",
      },
      503
    );
  }

  const rate = checkRateLimit(request);
  if (rate.limited) {
    return noStore(
      {
        error: "rate-limited",
        message: "Too many reviews from this connection. Try again in a few minutes.",
      },
      429,
      { "Retry-After": String(rate.retryAfter) }
    );
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return noStore(
      { error: "too-large", message: "That review is too long." },
      413
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return noStore(
      { error: "invalid-json", message: "Send the review as valid JSON." },
      400
    );
  }

  try {
    const id = await createPendingReview(body);
    return noStore(
      {
        id,
        status: "pending",
        message: "Review received. It appears here after it is approved.",
      },
      201
    );
  } catch (error) {
    if (error instanceof ReviewValidationError) {
      return noStore({ error: "invalid", message: error.message }, 400);
    }

    console.error(
      "[reviews] could not save a submission:",
      error instanceof Error ? error.message : "unknown error"
    );
    return noStore(
      {
        error: "unavailable",
        message: "The review could not be saved right now. Try again shortly.",
      },
      503
    );
  }
}
