import { NextResponse, type NextRequest } from "next/server";

import { exchangeCodeForTokens, redirectUri } from "@/lib/spotify";

export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; min-height:100dvh; display:grid; place-items:center; padding:32px;
    background:#050706; color:#e9f2eb;
    font:400 15px/1.7 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; }
  .card { width:min(680px,100%); background:#0c110d; border:1px solid rgba(255,255,255,.08);
    border-radius:20px; padding:30px; }
  h1 { margin:0 0 14px; font-size:1.5rem; letter-spacing:-.03em; }
  p { margin:0 0 14px; color:#7e8f84; }
  code { display:block; word-break:break-all; padding:14px; border-radius:12px;
    background:#050706; border:1px solid rgba(74,222,128,.2); color:#4ade80;
    font-family:ui-monospace,Menlo,monospace; font-size:13px; }
  .label { text-transform:uppercase; letter-spacing:.18em; font-size:11px; color:#4a574f;
    margin-bottom:8px; font-family:ui-monospace,Menlo,monospace; }
  ol { color:#7e8f84; padding-left:20px; }
  a { color:#4ade80; }
</style></head><body><div class="card">${body}</div></body></html>`;

  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/**
 * Step 2 of the one-time Spotify connection: swap the code for a refresh token
 * and print it so it can be stored as a server-side environment variable.
 * The token is never written to disk or to the client bundle.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const error = params.get("error");
  const code = params.get("code");
  const state = params.get("state");
  const expectedState = request.cookies.get("spotify_oauth_state")?.value;

  if (error) {
    return page(
      "Spotify connection cancelled",
      `<h1>Connection cancelled</h1><p>Spotify returned <code>${error}</code>. You can close this tab and try <a href="/api/spotify/login">/api/spotify/login</a> again.</p>`,
      400
    );
  }

  if (!code) {
    return page(
      "Missing code",
      `<h1>Missing authorisation code</h1><p>Start again from <a href="/api/spotify/login">/api/spotify/login</a>.</p>`,
      400
    );
  }

  if (expectedState && state !== expectedState) {
    return page(
      "State mismatch",
      `<h1>State mismatch</h1><p>The <code>state</code> value did not match the cookie set at the start of the flow. Start again from <a href="/api/spotify/login">/api/spotify/login</a>.</p>`,
      400
    );
  }

  const result = await exchangeCodeForTokens(code);

  if (!result.ok) {
    return page(
      "Token exchange failed",
      `<h1>Token exchange failed</h1><p>Spotify said:</p><code>${result.detail}</code><p style="margin-top:16px">Check that this exact redirect URI is registered on your Spotify app:</p><code>${redirectUri()}</code>`,
      502
    );
  }

  if (!result.refresh_token) {
    return page(
      "No refresh token returned",
      `<h1>No refresh token returned</h1><p>Remove the app's access from your Spotify account settings and try again, so Spotify issues a fresh refresh token.</p>`,
      400
    );
  }

  return page(
    "Spotify connected",
    `<h1>You're connected.</h1>
     <p class="label">SPOTIFY_REFRESH_TOKEN</p>
     <code>${result.refresh_token}</code>
     <p style="margin-top:18px">Copy that value into <code style="display:inline;padding:2px 6px">.env.local</code> as <code style="display:inline;padding:2px 6px">SPOTIFY_REFRESH_TOKEN=…</code>, then restart the dev server. This page is the only place the token is ever shown — it is not logged and not stored.</p>
     <p class="label" style="margin-top:22px">Granted scopes</p>
     <ol>${(result.scope ?? "").split(" ").filter(Boolean).map((s) => `<li>${s}</li>`).join("")}</ol>`
  );
}
