import type { Metadata } from "next";

import { Astral } from "@/components/astral";
import { CuriositySkills } from "@/components/curiosity-skills";
import { CuriosityTimeline } from "@/components/curiosity-timeline";
import { GraduationIcon, RingDotIcon, SparkIcon } from "@/components/icons";
import { PageFooter } from "@/components/page-footer";
import { Reveal } from "@/components/reveal";
import {
  certifications,
  currentlyStudying,
  hackathons,
  profile,
  skillGroups,
} from "@/content/profile";

export const metadata: Metadata = {
  title: "Curiosity",
  description: `${profile.name} — introduction, skills in rotation and everything learned outside the classroom.`,
};

export default function CuriosityPage() {
  return (
    <div className="page astral-page">
      <header className="page-head">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span className="mono eyebrow">The liner notes / {profile.name}</span>
          <span className="mono-sm chip-badge" style={{ fontSize: "0.5625rem", letterSpacing: "0.14em" }}>
            TRACK 02 · SIDE A · EXPANDED
          </span>
        </div>
      </header>

      <section className="astral-hero">
        <Astral className="astral-orb" />

        <Reveal>
          <span className="hero-badge mono-sm">
            <RingDotIcon size={13} />
            Lyrics behind the person behind the code
          </span>
        </Reveal>

        <Reveal delay={70}>
          <h1 className="giant-word">Curiosity.</h1>
        </Reveal>

        <Reveal delay={140}>
          <p className="lede" style={{ marginTop: 26, maxWidth: "44ch" }}>
            On repeat, in progress, and interesting to think about.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <p className="mono-sm" style={{ color: "var(--dim)", marginTop: 18 }}>
            {profile.name} · Computer Science Student · Bangalore, India
          </p>
        </Reveal>
      </section>

      <section className="astral-columns">
        <Reveal>
          <div className="measure" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <p className="body-copy" style={{ margin: 0 }}>
              I&apos;m <strong>{profile.name}</strong>, a Computer Science student focused on
              Python, data science and machine learning. What I enjoy most is the part where a
              vague idea becomes something that runs — building applications with Python and
              working with people who ask good questions.
            </p>
            <p className="body-copy" style={{ margin: 0 }}>
              I learn by making. My way of learning is hands-on: I build something small,
              understand what is happening underneath it, then make it useful. That has meant
              backend systems and database logic in hackathons, a rule engine for fire-safety
              recommendations during my internship, and a two-stage deep-learning pipeline for
              calorimeter super-resolution on the open-source side.
            </p>
            <p className="body-copy" style={{ margin: 0 }}>
              Over time I&apos;ve worked with people who care about the details, and I&apos;d
              like to keep doing exactly that.
            </p>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="panel panel-pad" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="mono-sm eyebrow-accent">{currentlyStudying.eyebrow}</span>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  border: "1px solid var(--line-accent)",
                  background: "color-mix(in srgb, var(--accent) 7%, transparent)",
                  color: "var(--accent)",
                  flex: "none",
                }}
              >
                <GraduationIcon size={18} />
              </span>
              <span className="display-sm">{currentlyStudying.title}</span>
            </div>

            <p className="body-copy" style={{ margin: 0 }}>
              {currentlyStudying.meta}
            </p>

            <hr className="rule" />

            <span className="mono-sm" style={{ color: "var(--dim)" }}>
              {currentlyStudying.footnote}
            </span>

            <p className="body-copy" style={{ margin: 0 }}>
              {profile.summary}
            </p>

            <span className="chip-badge mono-sm" style={{ alignSelf: "flex-start" }}>
              <SparkIcon size={12} />
              {profile.availability}
            </span>
          </div>
        </Reveal>
      </section>

      {/* Interactive Skills Rotation Section */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="label-row" style={{ marginBottom: 10 }}>
              <span className="ring-glyph" style={{ color: "var(--accent)" }} />
              <span className="mono-sm">CRATE SELECTION · INTERACTIVE FILTER</span>
            </div>
            <h2 className="display display-lg">Skills in rotation</h2>
          </div>
          <p className="body-copy measure" style={{ margin: 0, maxWidth: "38ch" }}>
            The languages and tools I work with, plus the ones I&apos;m still exploring. Click any
            skill to inspect its track notes and project footprint.
          </p>
        </div>

        <CuriositySkills skillGroups={skillGroups} />
      </section>

      {/* Chapter-style Timeline Section */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="label-row" style={{ marginBottom: 10 }}>
              <span className="ring-glyph" style={{ color: "var(--accent)" }} />
              <span className="mono-sm">CHAPTER TIMELINE · 2024 - 2026</span>
            </div>
            <h2 className="display display-lg">Learning outside the classroom</h2>
          </div>
          <p className="body-copy measure" style={{ margin: 0, maxWidth: "38ch" }}>
            Internships, open source contributions and production-grade prototypes built under
            pressure. Click any chapter to expand metrics and liner notes.
          </p>
        </div>

        <CuriosityTimeline />
      </section>

      {/* Side Stage & Creds */}
      <section className="section">
        <div className="grid-2">
          <Reveal>
            <article className="panel panel-pad panel-hover skill-card">
              <span className="mono-sm eyebrow-accent">{hackathons.kicker}</span>
              <h3 className="display-md" style={{ fontSize: "1.2rem" }}>
                {hackathons.title}
              </h3>
              <p className="body-copy" style={{ margin: 0 }}>
                {hackathons.summary}
              </p>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="panel panel-pad panel-hover skill-card">
              <span className="mono-sm eyebrow-accent">Certifications</span>
              <h3 className="display-md" style={{ fontSize: "1.2rem" }}>
                Job simulations
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {certifications.map((certification) => (
                  <div key={certification.title}>
                    <div className="track-title">{certification.title}</div>
                    <div className="mono-sm" style={{ color: "var(--accent)", margin: "4px 0 6px" }}>
                      {certification.issuer}
                    </div>
                    <p className="body-copy" style={{ margin: 0, fontSize: "0.8125rem" }}>
                      {certification.summary}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
