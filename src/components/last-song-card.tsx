"use client";

import { useEffect, useState } from "react";

import {
  DiscIcon,
  HeadphonesIcon,
  MusicIcon,
  PlayIcon,
  SparkIcon,
  SpotifyIcon,
} from "@/components/icons";
import { sound } from "@/lib/audio";
import type { NowPlayingResult } from "@/lib/spotify";

const POLL_MS = 30_000;

interface CuratedTrack {
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  genre: string;
  year: string;
  note: string;
}

const CURATED_TRACKS: CuratedTrack[] = [
  {
    title: "Awake",
    artist: "Tycho",
    album: "Awake",
    durationMs: 283000,
    genre: "Ambient / Electronic",
    year: "2014",
    note: "Focus soundtrack for deep learning & model training",
  },
  {
    title: "Giorgio by Moroder",
    artist: "Daft Punk",
    album: "Random Access Memories",
    durationMs: 544000,
    genre: "Modular Synth",
    year: "2013",
    note: "The timeless blueprint of electronic synthesis",
  },
  {
    title: "Can You Hear the Music",
    artist: "Ludwig Göransson",
    album: "Oppenheimer OST",
    durationMs: 110000,
    genre: "Orchestral / Physics",
    year: "2023",
    note: "High-tempo math & JetNet pipeline visualization",
  },
  {
    title: "Resonance",
    artist: "HOME",
    album: "Odyssey",
    durationMs: 212000,
    genre: "Chillwave / Synth",
    year: "2014",
    note: "Late-night terminal debugging session",
  },
];

function relative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function clock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function LastSongCard({ initial }: { initial: NowPlayingResult }) {
  const [data, setData] = useState<NowPlayingResult>(initial);
  const [tick, setTick] = useState(0);
  const [curatedIndex, setCuratedIndex] = useState(0);
  const [isSimulatedPlaying, setIsSimulatedPlaying] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/spotify/now-playing", { cache: "no-store" });
        if (!response.ok) return;
        const json = (await response.json()) as NowPlayingResult;
        if (!cancelled) setData(json);
      } catch {
        /* offline — keep showing the last known state */
      }
    }

    const interval = window.setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  // Re-render tick to keep timer alive
  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const connected = data.connected;
  const activeCurated = CURATED_TRACKS[curatedIndex];

  // Calculate live or simulated progress
  const simulatedProgressMs = isSimulatedPlaying
    ? ((tick * 1000 + 45000) % activeCurated.durationMs)
    : 45000;
  const progressRatio = connected
    ? data.durationMs > 0
      ? Math.min(1, (data.progressMs + (data.isPlaying ? tick * 1000 : 0)) / data.durationMs)
      : 0
    : simulatedProgressMs / activeCurated.durationMs;

  const handleSelectCurated = (idx: number) => {
    setCuratedIndex(idx);
    sound.playNeedleDrop();
  };

  return (
    <section className="panel panel-pad song-card" aria-live="polite">
      <div className="label-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="ring-glyph" style={{ color: "var(--accent)" }} />
          <span className="mono-sm">
            {connected ? "Last song listened" : "Curated in heavy rotation"}
          </span>
        </div>

        <span className="chip-badge mono-sm" style={{ fontSize: "0.5625rem" }}>
          {connected && data.isPlaying ? (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span className="eq-live" aria-hidden="true">
                <span /><span /><span /><span />
              </span>
              LIVE ON SPOTIFY
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <SparkIcon size={11} />
              STUDIO ROTATION
            </span>
          )}
        </span>
      </div>

      {connected ? (
        <>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div className="song-art">
              {data.albumArt ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.albumArt} alt="" width={74} height={74} loading="lazy" />
              ) : (
                <HeadphonesIcon size={26} />
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="song-title">{data.title}</div>
              <div className="song-artist">{data.artist}</div>

              {data.isPlaying ? (
                <span className="chip-badge mono-sm" style={{ marginTop: 10 }}>
                  <span className="eq-live" aria-hidden="true">
                    <span /><span /><span /><span />
                  </span>
                  Now playing
                </span>
              ) : (
                <span className="tag mono-sm" style={{ marginTop: 10, display: "inline-block" }}>
                  Last played · {relative(data.fetchedAt)}
                </span>
              )}
            </div>
          </div>

          {data.durationMs > 0 ? (
            <div style={{ marginTop: 14 }}>
              <div className="progress" role="presentation">
                <span
                  className="progress-fill"
                  style={{ width: `${(progressRatio * 100).toFixed(2)}%` }}
                />
              </div>
              <div
                className="mono-sm"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  color: "var(--dim)",
                }}
              >
                <span>{clock(data.progressMs + (data.isPlaying ? tick * 1000 : 0))}</span>
                <span>{clock(data.durationMs)}</span>
              </div>
            </div>
          ) : null}

          {data.url ? (
            <a className="song-link" href={data.url} target="_blank" rel="noreferrer noopener">
              <SpotifyIcon size={14} />
              Open in Spotify
            </a>
          ) : null}
        </>
      ) : (
        /* Fallback Curated Music Player for Offline / Unconnected State */
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              className={`song-art ${isSimulatedPlaying ? "song-art-active" : ""}`}
              onClick={() => {
                setIsSimulatedPlaying(!isSimulatedPlaying);
                sound.playClick(0.06, 450);
              }}
              style={{ cursor: "pointer", position: "relative" }}
              title="Click to toggle playback simulation"
            >
              <DiscIcon size={34} />
              <div className="song-art-play-hint" aria-hidden="true">
                <PlayIcon size={16} filled />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="song-title">{activeCurated.title}</div>
              <div className="song-artist">
                {activeCurated.artist} · <span style={{ opacity: 0.7 }}>{activeCurated.album}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span className="chip-badge mono-sm">
                  {isSimulatedPlaying ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span className="eq-live" aria-hidden="true">
                        <span /><span /><span /><span />
                      </span>
                      {activeCurated.genre}
                    </span>
                  ) : (
                    activeCurated.genre
                  )}
                </span>
                <span className="mono-sm" style={{ color: "var(--dim)" }}>
                  {activeCurated.year}
                </span>
              </div>
            </div>
          </div>

          <p className="body-copy" style={{ margin: 0, fontSize: "0.8125rem", fontStyle: "italic", opacity: 0.85 }}>
            &ldquo;{activeCurated.note}&rdquo;
          </p>

          {/* Progress bar */}
          <div>
            <div className="progress" role="presentation">
              <span
                className="progress-fill"
                style={{ width: `${(progressRatio * 100).toFixed(2)}%` }}
              />
            </div>
            <div
              className="mono-sm"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 6,
                color: "var(--dim)",
                fontSize: "0.625rem",
              }}
            >
              <span>{clock(simulatedProgressMs)}</span>
              <span>{clock(activeCurated.durationMs)}</span>
            </div>
          </div>

          {/* Curated Crate Switcher */}
          <div style={{ marginTop: 2 }}>
            <span className="mono-sm" style={{ color: "var(--dim)", display: "block", marginBottom: 6, fontSize: "0.625rem" }}>
              SWITCH TRACK IN CRATE:
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CURATED_TRACKS.map((track, i) => (
                <button
                  key={track.title}
                  type="button"
                  className={`curated-tab mono-sm ${i === curatedIndex ? "active" : ""}`}
                  onClick={() => handleSelectCurated(i)}
                >
                  <MusicIcon size={11} />
                  {track.title}
                </button>
              ))}
            </div>
          </div>

          {/* Connect link for site owner */}
          {data.reason === "unconfigured" ? (
            <div style={{ marginTop: 4, paddingTop: 10, borderTop: "1px dashed var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="mono-sm" style={{ color: "var(--dim)", fontSize: "0.5625rem" }}>
                SPOTIFY OAUTH READY
              </span>
              <a
                className="song-link"
                href="/api/spotify/login"
                style={{ padding: "4px 10px", fontSize: "0.6875rem" }}
                title="Only the site owner can authorize this"
              >
                <SpotifyIcon size={12} />
                Connect Live API
              </a>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
