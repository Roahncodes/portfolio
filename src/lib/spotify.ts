/**
 * Minimal, dependency-free Spotify Web API client.
 *
 * Flow: a refresh token (obtained once through /api/spotify/login) is exchanged
 * for a short-lived access token, cached in module scope until it expires.
 * Nothing here ever reaches the client bundle — see the `server-only` import
 * guard below at the call sites.
 */

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-state",
] as const;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

export type NowPlaying = {
  connected: true;
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string | null;
  url: string | null;
  progressMs: number;
  durationMs: number;
  /** ISO timestamp of when this was last true, used for the "last played" line */
  fetchedAt: string;
};

export type NotConnected = {
  connected: false;
  reason: "unconfigured" | "error";
};

export type NowPlayingResult = NowPlaying | NotConnected;

export function spotifyConfigured(): boolean {
  return Boolean(
    process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_REFRESH_TOKEN
  );
}

export function redirectUri(): string {
  return (
    process.env.SPOTIFY_REDIRECT_URI ?? "http://127.0.0.1:3000/api/spotify/callback"
  );
}

export function authorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID ?? "",
    response_type: "code",
    redirect_uri: redirectUri(),
    scope: SPOTIFY_SCOPES.join(" "),
    state,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

type CachedToken = { value: string; expiresAt: number };
let cachedToken: CachedToken | null = null;

async function basicAuthHeader(): Promise<string> {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

async function postToken(body: URLSearchParams): Promise<Response> {
  return fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: await basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
}

/** Exchange the stored refresh token for an access token, memoised per isolate. */
export async function getAccessToken(): Promise<string | null> {
  if (!spotifyConfigured()) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5_000) {
    return cachedToken.value;
  }

  const response = await postToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN as string,
    })
  );

  if (!response.ok) return null;

  const json = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) return null;

  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };

  return cachedToken.value;
}

/** Used once, by the OAuth callback, to turn a code into a long-lived refresh token. */
export async function exchangeCodeForTokens(code: string) {
  const response = await postToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
    })
  );

  if (!response.ok) {
    const detail = await response.text();
    return { ok: false as const, detail };
  }

  const json = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  };

  return { ok: true as const, ...json };
}

type SpotifyTrackObject = {
  name?: string;
  duration_ms?: number;
  artists?: { name: string }[];
  album?: { name?: string; images?: { url: string; width?: number }[] };
  external_urls?: { spotify?: string };
};

function largestImage(track: SpotifyTrackObject): string | null {
  const images = track.album?.images ?? [];
  if (images.length === 0) return null;
  return [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url ?? null;
}

function toNowPlaying(
  track: SpotifyTrackObject,
  isPlaying: boolean,
  progressMs: number
): NowPlaying | null {
  if (!track?.name) return null;

  return {
    connected: true,
    isPlaying,
    title: track.name,
    artist: (track.artists ?? []).map((a) => a.name).join(", ") || "Unknown artist",
    album: track.album?.name ?? "",
    albumArt: largestImage(track),
    url: track.external_urls?.spotify ?? null,
    progressMs,
    durationMs: track.duration_ms ?? 0,
    fetchedAt: new Date().toISOString(),
  };
}

async function getJson(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 204 || response.status === 202) return null;
  if (!response.ok) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Currently playing if there is something, otherwise the most recent track.
 * Never throws — a broken token degrades to `{ connected: false }`.
 */
export async function getNowPlaying(): Promise<NowPlayingResult> {
  if (!spotifyConfigured()) return { connected: false, reason: "unconfigured" };

  try {
    const token = await getAccessToken();
    if (!token) return { connected: false, reason: "error" };

    const current = (await getJson(NOW_PLAYING_ENDPOINT, token)) as
      | { is_playing?: boolean; progress_ms?: number; item?: SpotifyTrackObject }
      | null;

    if (current?.item) {
      const result = toNowPlaying(
        current.item,
        Boolean(current.is_playing),
        current.progress_ms ?? 0
      );
      if (result) return result;
    }

    const recent = (await getJson(RECENTLY_PLAYED_ENDPOINT, token)) as
      | { items?: { track?: SpotifyTrackObject; played_at?: string }[] }
      | null;

    const last = recent?.items?.[0];
    if (last?.track) {
      const result = toNowPlaying(last.track, false, 0);
      if (result) {
        return { ...result, fetchedAt: last.played_at ?? result.fetchedAt };
      }
    }

    return { connected: false, reason: "error" };
  } catch {
    return { connected: false, reason: "error" };
  }
}
