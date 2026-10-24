"use client";

import { useState } from "react";

import { ArrowUpRightIcon, ChevronDownIcon, DiscIcon, SparkIcon } from "@/components/icons";
import { sound } from "@/lib/audio";

interface TimelineItem {
  id: string;
  timecode: string;
  role: string;
  org: string;
  period: string;
  kind: "internship" | "open-source" | "hackathon" | "education";
  badge: string;
  summary: string;
  bullets: string[];
  metrics?: { label: string; value: string }[];
  link?: { label: string; href: string };
}

const CHAPTERS: TimelineItem[] = [
  {
    id: "gsoc-ml4sci",
    timecode: "01:00",
    role: "ML4SCI Contributor — JetNet-SR-PFlow",
    org: "Google Summer of Code (GSoC 2026)",
    period: "2026 · Current",
    kind: "open-source",
    badge: "OPEN SOURCE",
    summary:
      "A fast-simulation alternative for LHC calorimeter simulations. Implemented a 2-stage generative flow matching and set transformer architecture.",
    bullets: [
      "Generative Flow Matching for sparse energy deposit super-resolution.",
      "Set-to-Set Transformer with Hungarian matching for particle reconstruction.",
      "Achieved 100% 1:1 particle matching (30/30) on the JetNet test set.",
      "Benchmarked and trained on NVIDIA GPU infrastructure.",
    ],
    metrics: [
      { label: "Test Match Rate", value: "30 / 30" },
      { label: "Best Val Loss", value: "0.0524" },
      { label: "Epochs Trained", value: "50" },
    ],
    link: {
      label: "Open Project Album [J/01]",
      href: "/projects/jetnet-super-resolution",
    },
  },
  {
    id: "shivohini-intern",
    timecode: "02:15",
    role: "AI / ML Intern",
    org: "Shivohini",
    period: "May 2026 — Aug 2026",
    kind: "internship",
    badge: "WORK EXPERIENCE",
    summary:
      "Built a production-ready rule engine for industrial fire-safety tool recommendation models.",
    bullets: [
      "Engineered structured rule pipelines translating complex safety codes into automated logic.",
      "Collaborated with engineering leads to validate model recommendations against building specs.",
      "Delivered clean, maintainable Python backend modules integrated into the client workflow.",
    ],
    metrics: [
      { label: "Tenure", value: "3 Months" },
      { label: "Domain", value: "Safety AI" },
    ],
    link: {
      label: "LinkedIn Experience",
      href: "https://www.linkedin.com/in/rohan-dabhade",
    },
  },
  {
    id: "hackathons",
    timecode: "03:30",
    role: "Backend & Systems Lead",
    org: "3+ Competitive Hackathons",
    period: "2025 — 2026",
    kind: "hackathon",
    badge: "PROTOTYPES",
    summary:
      "Built working software prototypes under high pressure within 24 to 48 hour sprint deadlines.",
    bullets: [
      "Designed database architectures using MongoDB and Supabase.",
      "Built RESTful API endpoints and authentication services.",
      "Integrated third-party APIs and speech processing models.",
    ],
    metrics: [
      { label: "Hackathons", value: "3+ Built" },
      { label: "Focus", value: "Backend / Logic" },
    ],
  },
  {
    id: "university",
    timecode: "04:45",
    role: "Computer Science Undergraduate",
    org: "Jain University · Bangalore",
    period: "2024 — 2028",
    kind: "education",
    badge: "ACADEMICS",
    summary:
      "Second-year Computer Science student pursuing deep technical grounding in algorithms, data structures, and AI.",
    bullets: [
      "Core coursework: Data Structures, Object-Oriented Programming, Discrete Math.",
      "Independent technical research and project development alongside coursework.",
      "Expected Graduation: September 2028.",
    ],
    metrics: [
      { label: "Year", value: "2nd Year" },
      { label: "Class of", value: "2028" },
    ],
  },
];

export function CuriosityTimeline() {
  const [expandedId, setExpandedId] = useState<string | null>("gsoc-ml4sci");

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      sound.playClick(0.04, 380);
    } else {
      setExpandedId(id);
      sound.playClick(0.06, 480);
    }
  };

  return (
    <div className="timeline-container" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {CHAPTERS.map((chapter) => {
        const isExpanded = expandedId === chapter.id;

        return (
          <article
            key={chapter.id}
            className={`panel panel-pad panel-hover timeline-card ${isExpanded ? "timeline-card-active" : ""}`}
            style={{
              transition: "border-color 0.2s ease, background 0.2s ease",
            }}
          >
            {/* Header Clickable Row */}
            <div
              onClick={() => toggleExpand(chapter.id)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span className="timeline-timecode mono-sm">
                  <DiscIcon size={12} />
                  [{chapter.timecode}]
                </span>

                <div>
                  <span
                    className="mono-sm"
                    style={{
                      display: "block",
                      marginBottom: 6,
                      color: chapter.kind === "open-source" ? "var(--accent)" : "var(--dim)",
                    }}
                  >
                    {chapter.badge}
                  </span>
                  <h3 className="display-sm" style={{ margin: 0, fontSize: "1.15rem" }}>
                    {chapter.role}
                  </h3>
                  <p className="body-copy" style={{ margin: "4px 0 0", color: "var(--text-soft)", fontSize: "0.875rem" }}>
                    {chapter.org}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <span className="tag mono-sm" style={{ fontSize: "0.625rem" }}>
                  {chapter.period}
                </span>

                <span
                  style={{
                    color: "var(--dim)",
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    display: "grid",
                    placeItems: "center",
                  }}
                  aria-hidden="true"
                >
                  <ChevronDownIcon size={14} />
                </span>
              </div>
            </div>

            {/* Collapsible Details */}
            {isExpanded ? (
              <div
                className="timeline-content"
                style={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px dashed var(--line)",
                  animation: "fade-in 0.2s ease-out",
                }}
              >
                <p className="body-copy" style={{ margin: "0 0 14px", fontSize: "0.875rem" }}>
                  {chapter.summary}
                </p>

                <ul className="skill-list" style={{ marginBottom: chapter.metrics || chapter.link ? 16 : 0 }}>
                  {chapter.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                {/* Metrics Badges */}
                {chapter.metrics ? (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: chapter.link ? 14 : 0 }}>
                    {chapter.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="mono-sm"
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid var(--line)",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span style={{ color: "var(--dim)" }}>{m.label}:</span>
                        <span style={{ color: "var(--accent-bright)", fontWeight: 600 }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Optional Action Link */}
                {chapter.link ? (
                  <div style={{ marginTop: 12 }}>
                    <a
                      className="link-accent mono-sm"
                      href={chapter.link.href}
                      target={chapter.link.href.startsWith("http") ? "_blank" : undefined}
                      rel={chapter.link.href.startsWith("http") ? "noreferrer noopener" : undefined}
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <SparkIcon size={12} />
                      {chapter.link.label}
                      <ArrowUpRightIcon size={12} />
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
