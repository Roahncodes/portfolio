import type { Metadata } from "next";
import Link from "next/link";
import { statSync } from "node:fs";
import { join } from "node:path";

import { DocumentIcon, DownloadIcon, MailIcon, MusicIcon, SparkIcon } from "@/components/icons";
import { PageFooter } from "@/components/page-footer";
import { Reveal } from "@/components/reveal";
import { ResumeViewer } from "@/components/resume-viewer";
import { profile } from "@/content/profile";
import { resume, resumeSections } from "@/content/resume";

export const metadata: Metadata = {
  title: "Resume",
  description: `Download or preview the one-page resume of ${profile.name} — education, the AI/ML internship, projects, hackathons and certifications.`,
};

/**
 * File facts are read from the actual asset at build time, so the numbers on the
 * page can never drift from the file the button hands over.
 */
function assetFacts() {
  try {
    const stats = statSync(join(process.cwd(), "public", resume.pdf.replace(/^\//, "")));

    return {
      size: `${Math.max(1, Math.round(stats.size / 1024))} KB`,
      updated: new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
        stats.mtime,
      ),
    };
  } catch {
    return { size: "PDF", updated: "Available on request" };
  }
}

export default function ResumePage() {
  const facts = assetFacts();

  return (
    <div className="page">
      <header className="page-head">
        <span className="mono eyebrow">The paperwork / {profile.name}</span>
      </header>

      <section className="resume-hero">
        <Reveal>
          <span className="hero-badge mono-sm">
            <DocumentIcon size={13} />
            {resume.kicker}
          </span>
        </Reveal>

        <Reveal delay={70}>
          <h1 className="display display-lg">One page. Everything on it.</h1>
        </Reveal>

        <Reveal delay={130}>
          <p className="lede measure" style={{ marginTop: 20 }}>
            {profile.summary}
          </p>
        </Reveal>

        <Reveal delay={180}>
          <ResumeViewer />
        </Reveal>
      </section>

      <section className="section">
        <div className="stat-row">
          <div className="stat">
            <div className="stat-value">01</div>
            <div className="stat-label">Page</div>
          </div>
          <div className="stat">
            <div className="stat-value">A4</div>
            <div className="stat-label">Format</div>
          </div>
          <div className="stat">
            <div className="stat-value">{facts.size}</div>
            <div className="stat-label">File size</div>
          </div>
          <div className="stat">
            <div className="stat-value">{facts.updated}</div>
            <div className="stat-label">Last updated</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="display display-lg">What&apos;s on it</h2>
          </div>
          <p className="body-copy" style={{ margin: 0, maxWidth: "34ch" }}>
            The same facts as the rest of this site, condensed onto one sheet.
          </p>
        </div>

        <div className="resume-grid">
          {resumeSections.map((section, index) => (
            <Reveal key={section.title} delay={index * 70}>
              <article className="resume-card">
                <span className="mono-sm" style={{ color: "var(--accent)" }}>
                  {section.kicker}
                </span>
                <h3 className="resume-card-title">{section.title}</h3>
                <ul className="resume-card-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {section.note ? <p className="resume-card-note">{section.note}</p> : null}
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="cta-panel">
          <div>
            <span className="mono-sm" style={{ color: "var(--accent)" }}>
              NEXT
            </span>
            <h2 className="display-md" style={{ marginTop: 10 }}>
              Prefer the long version?
            </h2>
            <p className="body-copy" style={{ marginTop: 10, maxWidth: "44ch" }}>
              The discography has the code behind every line on that page, and the contact page has
              every way to reach me.
            </p>
          </div>

          <div className="cta-panel-actions">
            <a className="btn btn-primary" href={resume.pdf} download={resume.downloadName}>
              <DownloadIcon size={15} />
              Download PDF
            </a>
            <Link className="btn btn-ghost" href="/projects">
              <MusicIcon size={13} />
              Browse the work
            </Link>
            <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
              <MailIcon size={15} />
              Email me
            </a>
          </div>
        </div>

        <p className="mono-sm" style={{ color: "var(--dim)", marginTop: 18 }}>
          <SparkIcon size={13} style={{ verticalAlign: "-2px", marginRight: 8 }} />
          {profile.availability} · {profile.location}
        </p>
      </section>

      <PageFooter />
    </div>
  );
}
