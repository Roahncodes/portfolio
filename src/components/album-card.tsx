import Link from "next/link";
import type { CSSProperties } from "react";

import { PhotonKnot } from "@/components/fx/photon-knot";
import { ArrowUpRightIcon } from "@/components/icons";
import type { Album } from "@/content/albums";
import { hexToRgb, mixRgb, rgba } from "@/lib/color";

/**
 * Derives the cover's glow from the album's own knot colours, so the whole card
 * belongs to that record: the bottom bloom, the inner wash, the floating label
 * and the hover shadow all come from `--cover-*` instead of the site green.
 * Without a palette every rule falls back to the original accent.
 */
function coverVars([coreHex, highlightHex]: [string, string]): CSSProperties {
  const core = hexToRgb(coreHex);
  const highlight = hexToRgb(highlightHex);
  const deep = mixRgb(core, [0, 0, 0], 0.62);
  const base = mixRgb(core, [6, 10, 7], 0.8);

  return {
    "--cover-glow": rgba(core, 0.32),
    "--cover-label-glow": rgba(highlight, 0.8),
    "--cover-base": rgba(base, 1),
    "--cover-orb": `radial-gradient(circle at 50% 45%, ${rgba(highlight, 0.85)}, ${rgba(
      core,
      0.4,
    )} 26%, ${rgba(deep, 0.35)} 52%, transparent 70%)`,
  } as CSSProperties;
}

export function AlbumCover({
  code,
  label,
  palette,
}: {
  code: string;
  label?: string;
  palette?: [string, string];
}) {
  return (
    <div
      className="cover"
      role="img"
      aria-label={label ?? `Album artwork for ${code}`}
      style={palette ? coverVars(palette) : undefined}
    >
      <PhotonKnot variant="card" colors={palette} className="cover-knot" />
      <span className="cover-label">{code}</span>
    </div>
  );
}

export function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`/projects/${album.slug}`}
      className="album-card cover-wrap"
      aria-label={`${album.title} — open album`}
    >
      <AlbumCover
        code={album.code}
        label={`${album.title} album artwork`}
        palette={album.palette}
      />

      <div className="album-card-body">
        <span className="mono-sm" style={{ color: "var(--muted)" }}>
          {album.imprint}
        </span>
        <span className="album-card-title">{album.title}</span>
        <span className="album-card-sub">{album.subtitle}</span>
        <span className="link-accent" style={{ marginTop: 6 }}>
          Explore album <ArrowUpRightIcon size={14} />
        </span>
      </div>
    </Link>
  );
}
