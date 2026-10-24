import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // the floating Next.js badge is development-only chrome, not part of the
  // design; the site is meant to be shown as it will ship
  devIndicators: false,
  // Security-patch upgrades of Next.js are handled by an agent session, not a
  // codemod, so a published advisory can be cleared without a manual rethink.
  experimental: {
    agentUpgrade: "security",
  },
  // this project lives inside the user's home directory tree; pin the workspace
  // root so Turbopack never walks up into C:\Users\rohan
  turbopack: { root: __dirname },
  // the MongoDB driver is a native-ish server dependency with optional modules;
  // keep it out of the server bundle so the route runs it at runtime
  serverExternalPackages: ["mongodb"],
  // Next 16 treats `127.0.0.1` and `localhost` as different origins and blocks
  // its own dev resources for the unlisted one — which silently kills hydration
  // (no HMR, no client state) when the site is opened at 127.0.0.1. That address
  // is the one the Spotify redirect URI uses, so allow both spellings.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      { protocol: "https", hostname: "image-cdn-ak.spotifycdn.com" },
      { protocol: "https", hostname: "image-cdn-fa.spotifycdn.com" },
    ],
  },
};

export default nextConfig;
