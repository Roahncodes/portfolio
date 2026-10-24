import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowUpRightIcon,
  AwardIcon,
  CheckIcon,
  DiscIcon,
  RepeatIcon,
  SparkIcon,
} from "@/components/icons";
import { PageFooter } from "@/components/page-footer";
import { Reveal } from "@/components/reveal";
import { certifications, hackathons, profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "Linear notes",
  description:
    "Short notes from the sleeve: certifications, hackathons, and the things that didn't fit anywhere else.",
};

/** Small, honest notes that hang off the resume without padding it. */
const notes = [
  {
    n: "01",
    title: "On learning in public",
    body: "Repositories here are part of a routine: take something I only half understand, build the smallest version of it, and write it down once it works. Some of the earliest ones — dice, slots, guessing games — exist purely because that's how the concepts stuck.",
  },
  {
    n: "02",
    title: "On the internship",
    body: "At Shivohini the work was less glamorous than the title suggests, which was the point: turning loosely-written fire-safety requirements into structured rules that a recommendation engine could actually evaluate. It taught me how much of applied machine learning is really careful translation.",
  },
  {
    n: "03",
    title: "On the open-source pipeline",
    body: "The JetNet contribution asked a question I liked immediately — can you make a slow physics simulation fast and still land on real particles? Stage one upsamples sparse calorimeter deposits with Generative Flow Matching; stage two reconstructs particles with a Set-to-Set Transformer and Hungarian Matching. Getting to 30/30 matched particles took more iterations than the README shows.",
  },
  {
    n: "04",
    title: "On what's next",
    body: "More machine learning, done properly: better experiments, cleaner evaluation, and projects that a person who isn't me can run. If you're building something in that direction — or you want a second pair of hands on a backend — say hello.",
  },
];

const credentialDetails: Record<
  string,
  {
    tag: string;
    skills: string[];
    role: string;
    verifiedYear: string;
    badgeColor: string;
  }
> = {
  "Software Engineering Job Simulation": {
    tag: "FORAGE / EA-2026",
    skills: ["C++ Object Oriented Design", "Pacman Game Loops", "Memory Leak Profiling", "Class Architecture"],
    role: "Simulated Software Engineer · Electronic Arts",
    verifiedYear: "2026",
    badgeColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
  },
  "Solutions Architecture Job Simulation": {
    tag: "FORAGE / AWS-2026",
    skills: ["Multi-tier Cloud Architecture", "AWS IAM & Security", "Lambda Serverless", "S3 & CloudFront CDN", "RDS Multi-AZ"],
    role: "Simulated Solutions Architect · AWS APAC",
    verifiedYear: "2026",
    badgeColor: "rgba(56, 189, 248, 0.15)",
  },
};

export default function NotesPage() {
  return (
    <div className="page">
      <header className="page-head">
        <span className="mono eyebrow">Linear notes / {profile.name}</span>
      </header>

      <section style={{ maxWidth: "58ch" }}>
        <Reveal>
          <span className="hero-badge mono-sm">
            <RepeatIcon size={13} />
            Short notes from the sleeve
          </span>
        </Reveal>

        <Reveal delay={70}>
          <h1 className="display display-lg">
            The part that
            <br />
            doesn&apos;t fit in a list.
          </h1>
        </Reveal>

        <Reveal delay={130}>
          <p className="lede" style={{ marginTop: 20 }}>
            Certifications, hackathons, and the reasoning behind the tracks. Written the way I
            would tell it to someone over coffee.
          </p>
        </Reveal>
      </section>

      {/* Cassette Tape Sleeve Metadata Banner */}
      <Reveal delay={160}>
        <div className="cassette-meta-banner">
          <div className="cassette-banner-left">
            <span className="cassette-tape-code">RD-2026-TAPE-02</span>
            <span className="mono-sm text-dim">SIDE B · 33⅓ RPM · STEREO / DOLBY NR</span>
          </div>
          <div className="cassette-banner-right">
            <span className="mono-sm" style={{ color: "var(--accent)" }}>
              ● MASTER AUDIO RECORDING
            </span>
            <div className="cassette-barcode" aria-hidden="true">
              <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      </Reveal>

      {/* 4 Core Liner Notes */}
      <section className="section" style={{ marginTop: "clamp(30px, 4vw, 50px)" }}>
        <div className="grid-2">
          {notes.map((note, index) => (
            <Reveal key={note.n} delay={index * 70}>
              <article className="panel note-card panel-hover" style={{ height: "100%" }}>
                <span className="mono-sm" style={{ color: "var(--accent)" }}>
                  {note.n}
                </span>
                <h2 className="display-md" style={{ fontSize: "1.25rem" }}>
                  {note.title}
                </h2>
                <p className="body-copy" style={{ margin: 0 }}>
                  {note.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sleeve Credits: Enhanced Credentials & Hackathon Cards */}
      <section className="section">
        <div className="label-row" style={{ marginBottom: 22 }}>
          <span className="mono">Sleeve credits &amp; verified simulations</span>
        </div>

        <div className="grid-2">
          {certifications.map((certification, index) => {
            const details = credentialDetails[certification.title];
            return (
              <Reveal key={certification.title} delay={index * 80}>
                <article className="panel panel-pad panel-hover cert-card-enhanced">
                  <div className="cert-card-header">
                    <span className="mono-sm eyebrow-accent">
                      <AwardIcon size={12} />
                      {details?.tag || "Certification"}
                    </span>
                    <div className="cert-verified-pill">
                      <CheckIcon size={12} />
                      <span>Verified {details?.verifiedYear || "2026"}</span>
                    </div>
                  </div>

                  <h3 className="display-sm" style={{ marginTop: 12 }}>
                    {certification.title}
                  </h3>

                  <p className="mono-sm" style={{ color: "var(--muted)", margin: "4px 0 0" }}>
                    {certification.issuer}
                  </p>

                  <p className="body-copy" style={{ margin: "10px 0 0" }}>
                    {certification.summary}
                  </p>

                  {details?.skills && (
                    <div className="cert-skills-group">
                      <span className="mono-sm text-dim" style={{ fontSize: "0.6875rem" }}>
                        SKILLS DEMONSTRATED:
                      </span>
                      <div className="cert-skills-chips">
                        {details.skills.map((skill) => (
                          <span key={skill} className="cert-skill-chip">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              </Reveal>
            );
          })}

          {/* Hackathons Card */}
          <Reveal delay={160}>
            <article className="panel panel-pad panel-hover cert-card-enhanced">
              <div className="cert-card-header">
                <span className="mono-sm eyebrow-accent">
                  <DiscIcon size={12} />
                  {hackathons.kicker}
                </span>
                <div className="cert-verified-pill" style={{ color: "var(--accent)" }}>
                  <SparkIcon size={12} />
                  <span>3+ Sprints Completed</span>
                </div>
              </div>

              <h3 className="display-sm" style={{ marginTop: 12 }}>
                {hackathons.title}
              </h3>

              <p className="body-copy" style={{ margin: "10px 0 0" }}>
                {hackathons.summary}
              </p>

              <div className="cert-skills-group">
                <span className="mono-sm text-dim" style={{ fontSize: "0.6875rem" }}>
                  CORE STACK UNDER SPRINT CONSTRAINTS:
                </span>
                <div className="cert-skills-chips">
                  {["Supabase", "MongoDB", "FastAPI", "Python", "Rapid Prototyping"].map((tech) => (
                    <span key={tech} className="cert-skill-chip">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>

          {/* Current Academic Standing Card */}
          <Reveal delay={220}>
            <article className="panel panel-pad panel-hover cert-card-enhanced">
              <div className="cert-card-header">
                <span className="mono-sm eyebrow-accent">Currently Active</span>
                <div className="cert-verified-pill" style={{ color: "var(--accent-bright)" }}>
                  <span className="live-dot" style={{ width: 6, height: 6 }} />
                  <span>In Rotation</span>
                </div>
              </div>

              <h3 className="display-sm" style={{ marginTop: 12 }}>
                {profile.availability}
              </h3>

              <p className="body-copy" style={{ margin: "10px 0 0" }}>
                {profile.university} · {profile.degree} · Class of {profile.classOf}
              </p>

              <p className="mono-sm text-dim" style={{ marginTop: 8 }}>
                Expected graduation: September 2028 · Bangalore, India
              </p>

              <Link
                href="/projects"
                className="link-accent"
                style={{ marginTop: "auto", paddingTop: 16 }}
              >
                <SparkIcon size={13} />
                Explore the project discography
                <ArrowUpRightIcon size={13} />
              </Link>
            </article>
          </Reveal>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
