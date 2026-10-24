import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

import { authorizeUrl, redirectUri, spotifyConfigured } from "@/lib/spotify";

export const dynamic = "force-dynamic";

/**
 * Step 1 of the one-time Spotify connection.
 * Visit this route, approve the scopes, and the callback prints the refresh
 * token to paste into `.env.local`.
 */
export async function GET() {
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    return NextResponse.json(
      {
        ok: false,
        error: "Spotify is not configured.",
        hint: "Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local first.",
        callbackToRegister: redirectUri(),
      },
      { status: 400 }
    );
  }

  if (!spotifyConfigured()) {
    return NextResponse.json(
      {
        ok: true,
        step: "authorize",
        message:
          "Client credentials found. Authorising now — the callback will print the refresh token.",
        callbackToRegister: redirectUri(),
      },
      { status: 200 }
    );
  }

  const state = randomBytes(12).toString("hex");
  const response = NextResponse.redirect(authorizeUrl(state));
  response.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
