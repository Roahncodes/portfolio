import { NextResponse } from "next/server";

import { getNowPlaying } from "@/lib/spotify";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Public, read-only snapshot of what is on repeat right now.
 * Cached for 30s at the edge so a room full of tabs can't exhaust the API.
 */
export async function GET() {
  const result = await getNowPlaying();

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=20",
    },
  });
}
