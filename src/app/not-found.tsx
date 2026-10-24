import Link from "next/link";

import { Astral } from "@/components/astral";
import { ArrowLeftIcon, MusicIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="page">
      <header className="page-head">
        <span className="mono eyebrow">Track not found</span>
      </header>

      <section className="astral-hero">
        <Astral className="astral-orb" />

        <span className="hero-badge mono-sm">
          <MusicIcon size={13} />
          Skips to the next track
        </span>

        <h1 className="giant-word" style={{ fontSize: "clamp(2.6rem, 10vw, 7rem)" }}>
          404.
        </h1>

        <p className="lede" style={{ marginTop: 24, maxWidth: "42ch" }}>
          That track isn&apos;t on this album. The discography is where everything actually lives.
        </p>

        <div className="hero-cta">
          <Link href="/projects" className="btn btn-primary">
            Browse the discography
          </Link>
          <Link href="/" className="btn btn-ghost">
            <ArrowLeftIcon size={15} />
            Back to the artist home
          </Link>
        </div>
      </section>
    </div>
  );
}
