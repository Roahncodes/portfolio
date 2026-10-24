import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { AmbientGlow } from "@/components/ambient-glow";
import { PlayerDock } from "@/components/player-dock";
import { SideRail } from "@/components/side-rail";
import { profile } from "@/content/profile";
import { THEME_BOOTSTRAP, THEME_COLORS, DEFAULT_THEME } from "@/lib/theme";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — on repeat.`,
    template: `%s · ${profile.name}`,
  },
  description: profile.summary,
  applicationName: "on repeat.",
  authors: [{ name: profile.name, url: profile.github }],
  keywords: [
    "Rohan Dabhade",
    "portfolio",
    "Python developer",
    "machine learning",
    "JetNet",
    "GSoC ML4SCI",
    "Jain University",
    "Bangalore",
  ],
  openGraph: {
    type: "website",
    title: `${profile.name} — on repeat.`,
    description: profile.summary,
    siteName: "on repeat.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — on repeat.`,
    description: profile.summary,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: THEME_COLORS.dark,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // both are supported and the visitor picks; `color-scheme` in the stylesheet
  // is what actually follows the choice (scrollbars, form controls)
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      // the pre-paint script below may have replaced data-theme before React
      // hydrates; that is the whole point, so React must not "fix" it back
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        {/*
         * Runs before the first paint: reads the saved theme, writes it onto
         * <html> and tints the theme-color meta. Inline and synchronous on
         * purpose — a deferred script would let the dark room show through.
         */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />

        {/* with JavaScript unavailable nothing would ever trigger the reveal sweep */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body>
        <AmbientGlow />
        <div className="shell">
          <SideRail />
          <main className="main">{children}</main>
        </div>
        <PlayerDock />
      </body>
    </html>
  );
}
