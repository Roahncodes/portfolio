/**
 * The one place the public origin is decided.
 *
 * Order matters: an explicit `NEXT_PUBLIC_SITE_URL` always wins, then the
 * domain Vercel injects for the project's production deployment, and only then
 * the local dev origin. Without the Vercel fallback a project with no env vars
 * would publish `http://127.0.0.1:3000` inside its sitemap, robots.txt and
 * Open Graph metadata.
 */

const DEV_ORIGIN = "http://127.0.0.1:3000";

function fromVercel(): string | null {
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? "";
  const trimmed = host.trim().replace(/\/$/, "");
  if (!trimmed) return null;
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export const siteUrl: string = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  fromVercel() ||
  DEV_ORIGIN
).replace(/\/$/, "");
