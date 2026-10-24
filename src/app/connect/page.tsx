import type { Metadata } from "next";
import Link from "next/link";

import { ContactConsole } from "@/components/contact-console";
import { CopyButton } from "@/components/copy-button";
import { GuestbookSection } from "@/components/guestbook";
import { ArrowUpRightIcon, MailIcon, PlayIcon } from "@/components/icons";
import { PageFooter } from "@/components/page-footer";
import { Reveal } from "@/components/reveal";
import { SocialIcon } from "@/components/social-links";
import { profile, socials } from "@/content/profile";
import { formatTrackTime, license, soundtrack } from "@/content/soundtrack";

export const metadata: Metadata = {
  title: "Say hello",
  description: `Get in touch with ${profile.name} — email, LinkedIn and GitHub.`,
};

// Same four channels as everywhere else on the site, read from the one list.
const channels = [...socials].sort((a, b) => Number(b.hero) - Number(a.hero));

export default function ConnectPage() {
  return (
    <div className="page">
      <header className="page-head">
        <span className="mono eyebrow">Say hello / {profile.name}</span>
      </header>

      <section style={{ maxWidth: "56ch" }}>
        <Reveal>
          <span className="hero-badge mono-sm">
            <MailIcon size={13} />
            {profile.availability}
          </span>
        </Reveal>

        <Reveal delay={70}>
          <h1 className="display display-lg">Let&apos;s put something on repeat.</h1>
        </Reveal>

        <Reveal delay={130}>
          <p className="lede" style={{ marginTop: 20 }}>
            I&apos;m looking for internships and projects where machine learning and backend work
            meet something real. Fastest route is email — I read all of it.
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              <MailIcon size={15} />
              Email me
            </a>
            <CopyButton value={profile.email} label="Copy email" className="btn btn-ghost" />
            <Link className="btn btn-ghost" href="/projects">
              <PlayIcon size={12} />
              See the work first
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="section">
        <div className="label-row" style={{ marginBottom: 22 }}>
          <span className="mono">Channels</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {channels.map((channel, index) => (
            <Reveal key={channel.key} delay={index * 60}>
              <a
                className="contact-row"
                href={channel.href}
                {...(channel.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                  <span
                    style={{
                      display: "grid",
                      placeItems: "center",
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      border: "1px solid var(--line-accent)",
                      background: "color-mix(in srgb, var(--accent) 6%, transparent)",
                      color: "var(--accent)",
                      flex: "none",
                    }}
                  >
                    <SocialIcon name={channel.icon} size={17} />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className="mono-sm contact-key" style={{ display: "block" }}>
                      {channel.key}
                    </span>
                    <span className="contact-value">{channel.value}</span>
                    <span className="track-desc" style={{ display: "block" }}>
                      {channel.note}
                    </span>
                  </span>
                </span>
                <span className="track-arrow">
                  <ArrowUpRightIcon size={16} />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Direct Pitch / Message Console */}
      <ContactConsole />

      {/* "I Was Here" Visitor Reviews & Guestbook */}
      <GuestbookSection />

      {/* Soundtrack credits — CC BY 4.0 requires a visible attribution. */}
      <section className="section" id="soundtrack" style={{ scrollMarginTop: 90 }}>
        <div className="section-head">
          <div>
            <div className="label-row" style={{ marginBottom: 10 }}>
              <span className="ring-glyph" style={{ color: "var(--accent)" }} />
              <span className="mono-sm">SOUNDTRACK · {license.name}</span>
            </div>
            <h2 className="display display-md">The music behind the scroll</h2>
          </div>
          <p className="body-copy measure" style={{ margin: 0, maxWidth: "40ch" }}>
            Five instrumental pieces score the pages in order. Press play in the dock and the
            record runs with the auto-scroll; each title links to the artist&apos;s page, where
            the licence is stated.
          </p>
        </div>

        <div className="soundtrack-list">
          {soundtrack.map((track, index) => (
            <div className="soundtrack-row" key={track.title}>
              <span className="soundtrack-index mono-sm">
                {String(index + 1).padStart(2, "0")}
              </span>

              <span className="soundtrack-meta">
                <span className="soundtrack-title">
                  <a
                    href={track.artistUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={`${license.attribution} — ${track.sourceUrl}`}
                  >
                    {track.title}
                  </a>
                </span>
                <span className="track-desc">
                  {track.mood} · {track.year}
                </span>
                <span className="soundtrack-page mono-sm">{track.pageLabel}</span>
              </span>

              <span className="soundtrack-side mono-sm">
                {formatTrackTime(track.durationSeconds)}
              </span>

              <Link href={track.page} className="soundtrack-link mono-sm">
                Hear it <ArrowUpRightIcon size={12} />
              </Link>
            </div>
          ))}
        </div>

        <p className="mono-sm soundtrack-credit">
          Music by Scott Buckley — released under{" "}
          <a href={license.url} target="_blank" rel="noreferrer noopener">
            {license.name}
          </a>
          . {license.attribution}. {license.changes}
        </p>
      </section>

      <PageFooter />
    </div>
  );
}
