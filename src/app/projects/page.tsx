import type { Metadata } from "next";

import { AlbumCard } from "@/components/album-card";
import { PhotonKnot } from "@/components/fx/photon-knot";
import { ArrowUpRightIcon, GithubIcon, MusicIcon } from "@/components/icons";
import { InteractiveTrackList } from "@/components/interactive-track-list";
import { PageFooter } from "@/components/page-footer";
import { Reveal } from "@/components/reveal";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { allTracks, albums } from "@/content/albums";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "GitHub projects",
  description:
    "Two repositories, opened up as albums — machine learning research and practical Python experiments, track by track.",
};

export default function ProjectsPage() {
  const tracks = allTracks();
  const totalTracks = tracks.length;

  return (
    <div className="page">
      <header className="page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="mono eyebrow">The discography / {profile.name}</span>
          <span className="mono-sm chip-badge" style={{ fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
            DISCOGRAPHY · COMPLETE WORKS
          </span>
        </div>
      </header>

      <section className="projects-hero">
        <PhotonKnot variant="hero" className="projects-knot" />

        <div style={{ maxWidth: "60ch" }}>
          <Reveal>
            <span className="hero-badge mono-sm">
              <MusicIcon size={13} />
              {albums.length} albums · {totalTracks} tracks · all original
            </span>
          </Reveal>

          <Reveal delay={70}>
            <h1 className="display display-lg">Built. Not shuffled.</h1>
          </Reveal>

          <Reveal delay={130}>
            <p className="lede" style={{ marginTop: 20 }}>
              Two repositories. A collection of experiments, practical tools and machine learning.
              Pick an album, then explore the tracks behind it.
            </p>
          </Reveal>

          {/* Interactive Waveform Audio Visualizer */}
          <Reveal delay={160}>
            <div style={{ marginTop: 20, maxWidth: 520 }}>
              <WaveformVisualizer barsCount={38} />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", marginTop: 22 }}>
              <a
                className="link-accent"
                href={profile.github}
                target="_blank"
                rel="noreferrer noopener"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <GithubIcon size={15} />
                Everything on GitHub ({profile.handle})
                <ArrowUpRightIcon size={13} />
              </a>
              <span className="mono-sm" style={{ color: "var(--dim)" }}>
                · 2 Repositories in Rotation
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="label-row" style={{ marginBottom: 26, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="mono">Albums in rotation</span>
          <span className="mono-sm" style={{ color: "var(--dim)" }}>
            CLICK COVER TO OPEN ALBUM
          </span>
        </div>

        <div className="albums-grid">
          {albums.map((album, index) => (
            <Reveal key={album.slug} delay={index * 90}>
              <AlbumCard album={album} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="label-row" style={{ marginBottom: 10 }}>
              <span className="ring-glyph" style={{ color: "var(--accent)" }} />
              <span className="mono-sm">PLAYLIST VIEW · DIRECT SOURCE REPOSITORY</span>
            </div>
            <h2 className="display display-lg">Every track, one place</h2>
          </div>
          <p className="body-copy" style={{ margin: 0, maxWidth: "36ch" }}>
            Grouped by album. Click the play button to activate live track equalizer; click a row to inspect file details.
          </p>
        </div>

        {albums.map((album, albumIndex) => (
          <div key={album.slug} style={{ marginTop: albumIndex === 0 ? 0 : "clamp(34px, 5vw, 56px)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono-sm" style={{ color: "var(--accent)", fontWeight: 700 }}>
                  {album.shortCode}
                </span>
                <span className="mono" style={{ color: "var(--text)" }}>
                  {album.title}
                </span>
              </div>
              <span className="mono-sm" style={{ color: "var(--dim)" }}>
                {album.language} · {album.year}
              </span>
            </div>

            <InteractiveTrackList tracks={album.tracks} albumSlug={album.slug} />
          </div>
        ))}

        <p className="mono-sm" style={{ color: "var(--dim)", marginTop: 28 }}>
          Original code, open for exploration. Album covers open project notes; tracks open their
          source files.
        </p>
      </section>

      <PageFooter />
    </div>
  );
}
