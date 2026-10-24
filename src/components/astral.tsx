import type { ReactNode } from "react";

/**
 * The "astral" treatment: a glowing core, a wide soft veil, orbital rings and a
 * masked star field. Purely decorative and always `aria-hidden`.
 *
 * `core` swaps the flat radial-gradient orb for a live element — the home page
 * passes the Glyph Orb there, so the planet sits inside the same haze, rings and
 * star field instead of replacing the whole treatment.
 */
export function Astral({
  className = "",
  rings = true,
  core,
}: {
  className?: string;
  rings?: boolean;
  core?: ReactNode;
}) {
  return (
    <div className={`astral ${className}`.trim()} aria-hidden="true">
      <div className="orb-veil" />
      {rings ? (
        <>
          <div className="orb-rings" />
          <div className="orb-eq-ring" />
          <div className="orb-pulse-ring" />
        </>
      ) : null}
      {core ?? <div className="orb" />}
      <div className="stars" />
    </div>
  );
}
