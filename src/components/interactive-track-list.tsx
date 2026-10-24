"use client";

import { useState } from "react";

import { ArrowUpRightIcon, PlayIcon, SparkIcon } from "@/components/icons";
import type { Track } from "@/content/albums";
import { sound } from "@/lib/audio";

interface InteractiveTrackListProps {
  tracks: Track[];
  albumSlug?: string;
}

export function InteractiveTrackList({ tracks }: InteractiveTrackListProps) {
  const [activeTrackIndex, setActiveTrackIndex] = useState<string>(
    tracks.find((t) => t.highlight)?.index || tracks[0]?.index || "01"
  );
  const [inspectedTrack, setInspectedTrack] = useState<Track | null>(null);

  const handleTrackPlay = (track: Track) => {
    setActiveTrackIndex(track.index);
    sound.playNeedleDrop();
  };

  const handleInspect = (track: Track) => {
    if (inspectedTrack?.index === track.index) {
      setInspectedTrack(null);
      sound.playClick(0.04, 380);
    } else {
      setInspectedTrack(track);
      sound.playClick(0.05, 480);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Inspected Track Detail Banner */}
      {inspectedTrack ? (
        <div
          className="panel panel-pad track-inspector-drawer"
          style={{
            marginBottom: 10,
            borderColor: "var(--line-accent)",
            background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 6%, transparent), var(--surface))",
            animation: "fade-in 0.2s ease-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span className="mono-sm" style={{ color: "var(--accent)" }}>
              TRACK {inspectedTrack.index} · {inspectedTrack.kind ?? "CODE"} · LINER NOTES
            </span>
            <button
              type="button"
              onClick={() => setInspectedTrack(null)}
              className="mono-sm"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--dim)",
                cursor: "pointer",
              }}
            >
              [Close]
            </button>
          </div>

          <h4 className="display-sm" style={{ margin: "0 0 6px" }}>
            {inspectedTrack.title}
          </h4>
          <p className="body-copy" style={{ margin: "0 0 12px", fontSize: "0.875rem" }}>
            {inspectedTrack.description}
          </p>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a
              className="link-accent mono-sm"
              href={inspectedTrack.href}
              target="_blank"
              rel="noreferrer noopener"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <ArrowUpRightIcon size={13} />
              Open source file on GitHub
            </a>
          </div>
        </div>
      ) : null}

      {/* Track rows */}
      {tracks.map((track) => {
        const isLive = activeTrackIndex === track.index;
        const isInspected = inspectedTrack?.index === track.index;

        return (
          <div
            key={track.index}
            className={`track ${isLive ? "is-live" : ""} ${isInspected ? "is-inspected" : ""}`}
            style={{ position: "relative" }}
          >
            <button
              type="button"
              className="track-play"
              onClick={() => handleTrackPlay(track)}
              title={isLive ? "Track is currently playing" : `Play track ${track.index}`}
              aria-label={`Play track ${track.index}`}
              style={{ border: "none", cursor: "pointer" }}
            >
              {isLive ? (
                <span className="eq-live" aria-hidden="true" style={{ height: 10 }}>
                  <span /><span /><span /><span />
                </span>
              ) : (
                <PlayIcon size={11} />
              )}
            </button>

            <span
              className="mono-sm"
              style={{
                color: isLive ? "var(--accent)" : undefined,
                letterSpacing: "0.08em",
                flex: "none",
              }}
            >
              {track.index}
              <span style={{ opacity: 0.4 }}>—</span>
            </span>

            <div
              style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
              onClick={() => handleInspect(track)}
              title="Click to view file notes"
            >
              <span className="track-title" style={{ display: "block" }}>
                {track.title}
              </span>
              <span className="track-desc" style={{ display: "block" }}>
                {track.description}
              </span>
            </div>

            {track.kind ? (
              <span className="tag mono-sm" style={{ flex: "none" }}>
                {track.kind}
              </span>
            ) : null}

            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
              <button
                type="button"
                className="mono-sm track-inspect-btn"
                onClick={() => handleInspect(track)}
                title="Inspect track liner notes"
                style={{
                  background: "transparent",
                  border: "none",
                  color: isInspected ? "var(--accent)" : "var(--dim)",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                <SparkIcon size={13} />
              </button>

              <a
                href={track.href}
                target="_blank"
                rel="noreferrer noopener"
                className="track-arrow"
                title="Open file in GitHub"
                style={{ display: "grid", placeItems: "center" }}
              >
                <ArrowUpRightIcon size={16} />
                <span className="sr-only">Open source file on GitHub</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
