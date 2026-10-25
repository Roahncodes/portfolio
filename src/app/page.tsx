import Link from "next/link";

import { Astral } from "@/components/astral";
import { GlyphOrb } from "@/components/fx/glyph-orb";
import { StippleType } from "@/components/fx/stipple-type";
import { MailIcon, MapPinIcon, PlayIcon, RingDotIcon } from "@/components/icons";
import { LastSongCard } from "@/components/last-song-card";
import { PageFooter } from "@/components/page-footer";
import { SocialButtons } from "@/components/social-links";
import { Strip } from "@/components/strip";
import { profile } from "@/content/profile";
import { getNowPlaying } from "@/lib/spotify";

export const revalidate = 30;

export default async function ArtistHome() {
  const nowPlaying = await getNowPlaying();

  return (
    <div className="page">
      <header className="page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="mono eyebrow">The personal collection / Vol. 01</span>
          <span className="mono-sm chip-badge" style={{ fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
            MASTER TAPE · 24-BIT / 96kHz
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="rec-indicator mono-sm" title="Live audio engine ready">
            <span className="rec-dot" /> REC
          </span>
        </div>
      </header>

      <section className="hero">
        <Astral className="hero-orb" core={<GlyphOrb />} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="hero-badge mono-sm">
            <RingDotIcon size={13} />
            {profile.badge}
          </span>
          <span className="mono-sm" style={{ color: "var(--dim)", letterSpacing: "0.16em" }}>
            [SIDE A · 03 TRACKS]
          </span>
        </div>

        <StippleType
          as="h1"
          className="display display-xl hero-name"
          text={`${profile.firstName} ${profile.lastName}`}
        />

        <p className="hero-sub">{profile.tagline}</p>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", margin: "14px 0" }}>
          <p className="hero-meta mono-sm" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <MapPinIcon size={13} style={{ color: "var(--dim)" }} />
            {profile.metaLine}
          </p>

          <span className="status-pill mono-sm">
            <span className="status-dot" />
            {profile.availability}
          </span>
        </div>

        <div className="hero-cta">
          <Link href="/projects" className="btn btn-primary">
            <PlayIcon size={13} />
            Explore my work
          </Link>
          <SocialButtons />
          <Link href="/connect" className="btn btn-ghost">
            <MailIcon size={15} />
            Say hello
          </Link>
        </div>
      </section>

      <Strip />

      <section className="hero-grid" style={{ marginTop: "clamp(40px, 6vw, 74px)" }}>
        <div>
          <div className="label-row" style={{ marginBottom: 10 }}>
            <span className="ring-glyph" style={{ color: "var(--accent)" }} />
            <span className="mono-sm" style={{ letterSpacing: "0.15em" }}>
              TRACK 01 · 00:00 - 02:45 · ARTIST BIO
            </span>
          </div>

          <h2 className="display-md" style={{ marginBottom: 18 }}>
            Behind the tracks
          </h2>

          <div className="measure" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {profile.bio.map((paragraph) => (
              <p className="body-copy" key={paragraph.slice(0, 24)} style={{ margin: 0 }}>
                {paragraph}
              </p>
            ))}
          </div>

          <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/curiosity" className="btn btn-ghost">
              Read the linear notes
            </Link>
            <Link href="/projects" className="btn btn-ghost">
              Browse the discography
            </Link>
          </div>
        </div>

        <LastSongCard initial={nowPlaying} />
      </section>

      <PageFooter />
    </div>
  );
}
