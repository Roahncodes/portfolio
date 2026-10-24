import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlbumCover } from "@/components/album-card";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  GithubIcon,
  PlayIcon,
} from "@/components/icons";
import { InteractiveTrackList } from "@/components/interactive-track-list";
import { PageFooter } from "@/components/page-footer";
import { ProjectPreviewModal } from "@/components/project-preview-modal";
import { Reveal } from "@/components/reveal";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { albums, getAlbum, getAlbumSlugs } from "@/content/albums";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAlbumSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = getAlbum(slug);

  if (!album) return { title: "Album not found" };

  return {
    title: album.title,
    description: album.notes,
    openGraph: { title: album.title, description: album.notes },
  };
}

export default async function AlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const album = getAlbum(slug);

  if (!album) notFound();

  const others = albums.filter((item) => item.slug !== album.slug);
  const liveTrack = album.tracks.find((track) => track.highlight) ?? album.tracks[0];

  return (
    <div className="page">
      <header className="page-head">
        <Link href="/projects" className="back-link">
          <ArrowLeftIcon size={15} />
          Back to the discography
        </Link>
        <span className="monogram">{album.shortCode.replace("/", "")}</span>
      </header>

      <section className="album-detail">
        <Reveal className="cover-wrap">
          <AlbumCover
            code={album.code}
            label={`${album.title} album artwork`}
            palette={album.palette}
          />
        </Reveal>

        <div>
          <Reveal delay={60}>
            <span className="mono eyebrow-accent" style={{ display: "block", marginBottom: 14 }}>
              {album.kicker}
            </span>

            <h1 className="display display-lg">{album.title}</h1>

            <p className="lede" style={{ marginTop: 16 }}>
              {album.subtitle}
            </p>

            <p className="mono-sm" style={{ color: "var(--dim)", marginTop: 12 }}>
              {album.credit}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              <ProjectPreviewModal album={album} />

              <a
                className="btn btn-ghost"
                href={album.repo}
                target="_blank"
                rel="noreferrer noopener"
              >
                <GithubIcon size={15} />
                Repository
              </a>

              <a
                className="btn btn-ghost"
                href={liveTrack.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                <PlayIcon size={12} />
                Highlight track {liveTrack.index}
              </a>
            </div>

            {album.status ? (
              <span className="chip-badge mono-sm" style={{ marginTop: 18, display: "inline-flex" }}>
                {album.status}
              </span>
            ) : null}
          </Reveal>

          <Reveal delay={120}>
            <div className="stat-row">
              {album.stats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Custom Album Palette Waveform Visualizer */}
            <div style={{ marginTop: 20, maxWidth: 480 }}>
              <WaveformVisualizer palette={album.palette} barsCount={34} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="label-row" style={{ marginBottom: 10 }}>
              <span className="ring-glyph" style={{ color: "var(--accent)" }} />
              <span className="mono-sm">TRACK SELECTION · MASTER TAPE LIST</span>
            </div>
            <h2 className="display display-md" style={{ fontSize: "1.6rem" }}>
              Track list
            </h2>
          </div>
          <p className="body-copy" style={{ margin: 0 }}>
            Click the play icon on any track to set active playback; click the row to inspect source notes.
          </p>
        </div>

        <InteractiveTrackList tracks={album.tracks} albumSlug={album.slug} />
      </section>

      <section className="section">
        <Reveal>
          <article className="panel panel-pad">
            <h2 className="display display-md" style={{ fontSize: "1.5rem", marginBottom: 16 }}>
              Behind this album
            </h2>
            <p className="body-copy measure" style={{ margin: 0 }}>
              {album.notes}
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginTop: 22,
                paddingTop: 20,
                borderTop: "1px solid var(--line)",
              }}
            >
              {album.stack.map((item) => (
                <span className="tag mono-sm" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        </Reveal>
      </section>

      {others.length > 0 ? (
        <section className="section">
          <div className="label-row" style={{ marginBottom: 20 }}>
            <span className="mono">Also in rotation</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {others.map((other) => (
              <Link key={other.slug} href={`/projects/${other.slug}`} className="track">
                <span className="track-play">
                  <PlayIcon size={11} />
                </span>
                <span className="mono-sm" style={{ color: "var(--accent)", flex: "none" }}>
                  {other.shortCode}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="track-title" style={{ display: "block" }}>
                    {other.title}
                  </span>
                  <span className="track-desc" style={{ display: "block" }}>
                    {other.subtitle}
                  </span>
                </span>
                <span className="track-arrow">
                  <ArrowRightIcon size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <PageFooter />
    </div>
  );
}
