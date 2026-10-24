"use client";

import { useMemo, useState } from "react";

import { DiscIcon, MusicIcon, SparkIcon } from "@/components/icons";
import type { SkillGroup } from "@/content/profile";
import { sound } from "@/lib/audio";

interface CuriositySkillsProps {
  skillGroups: SkillGroup[];
}

const CRATE_META: Record<string, { label: string; side: string; bpm: string }> = {
  "The building blocks": { label: "Foundations", side: "A-SIDE", bpm: "128 BPM" },
  "Working with data": { label: "Data & Storage", side: "B-SIDE", bpm: "116 BPM" },
  "Ideas into applications": { label: "Applications", side: "C-SIDE", bpm: "140 BPM" },
  "Still exploring": { label: "Machine Learning", side: "DEEP CUT", bpm: "95 BPM" },
};

const SKILL_INSIGHTS: Record<string, string> = {
  "Python · NumPy · Pandas": "Core workhorse language across ML pipelines, data cleaning, and automation.",
  "Python": "Primary language — built ML models, rule engines, and multi-tier apps.",
  "PyTorch": "Used for Flow Matching and Set-to-Set Transformer training on NVIDIA GPUs.",
  "PyTorch Lightning": "Modular training harness for the JetNet fast simulation repository.",
  "NumPy · Pandas": "Data cleaning, event tensor transformations, and feature matrices.",
  "C · C++ · Java": "Academic foundation in systems programming, memory models, and OOP.",
  "JavaScript · TypeScript": "Modern web development with Next.js 16, React 19, and full-stack API routes.",
  "HTML · CSS": "Semantic UI architecture and responsive design systems.",
  "MongoDB": "NoSQL document storage used in backend hackathon prototypes.",
  "SQL": "Relational schema design, query optimization, and data extraction.",
  "Scikit-learn": "Classical ML models, classification baselines, and evaluation metrics.",
  "Matplotlib": "Residual plots, event visualizations, and validation curve charting.",
  "PyQt5": "Desktop graphical utilities with speech recognition interfaces.",
  "Speech recognition": "Practical voice-input experiments and speech-to-text processing.",
  "Encryption": "Cryptographic utilities and secure key transmission experiments.",
  "Git · GitHub": "Version control, branching workflows, PRs, and open source collaboration.",
  "Vercel": "Edge deployment and production hosting with zero downtime.",
  "Set-to-set transformers": "Permutation-invariant transformer mapping sparse energy deposits to particles.",
  "Flow matching": "Generative continuous normalizing flows for calorimeter super-resolution.",
  "GPU training on NVIDIA": "CUDA acceleration on high-performance accelerators for deep learning.",
};

export function CuriositySkills({ skillGroups }: CuriositySkillsProps) {
  const [activeCrate, setActiveCrate] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const filteredGroups = useMemo(() => {
    if (activeCrate === "all") return skillGroups;
    return skillGroups.filter((g) => g.title === activeCrate);
  }, [activeCrate, skillGroups]);

  const handleCrateChange = (crateTitle: string) => {
    setActiveCrate(crateTitle);
    sound.playClick(0.05, 420);
  };

  const handleSkillClick = (skillName: string) => {
    if (selectedSkill === skillName) {
      setSelectedSkill(null);
    } else {
      setSelectedSkill(skillName);
      sound.playNeedleDrop();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Crate Filter Switcher */}
      <div
        className="crate-tabs-bar"
        role="tablist"
        aria-label="Skill Crates Filter"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          paddingBottom: 4,
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCrate === "all"}
          className={`crate-tab mono-sm ${activeCrate === "all" ? "active" : ""}`}
          onClick={() => handleCrateChange("all")}
        >
          <DiscIcon size={13} />
          All Crates ({skillGroups.reduce((acc, g) => acc + g.items.length, 0)})
        </button>

        {skillGroups.map((g) => {
          const meta = CRATE_META[g.title] || { label: g.title, side: "CRATE" };
          const active = activeCrate === g.title;

          return (
            <button
              key={g.title}
              type="button"
              role="tab"
              aria-selected={active}
              className={`crate-tab mono-sm ${active ? "active" : ""}`}
              onClick={() => handleCrateChange(g.title)}
            >
              <span className="crate-tab-side">{meta.side}</span>
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Selected Skill Audio Cue Inspector */}
      {selectedSkill ? (
        <div
          className="panel panel-pad skill-inspector-banner"
          style={{
            borderColor: "var(--line-accent)",
            background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, transparent), var(--surface))",
            animation: "fade-in 0.25s ease-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="ring-glyph" style={{ color: "var(--accent)" }} />
              <span className="mono-sm" style={{ color: "var(--accent-bright)", letterSpacing: "0.14em" }}>
                INSPECTOR · TRACK INSIGHT
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSkill(null)}
              className="mono-sm"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--dim)",
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              [Dismiss]
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <h4 className="display-sm" style={{ margin: "0 0 6px", color: "var(--text)" }}>
              {selectedSkill}
            </h4>
            <p className="body-copy" style={{ margin: 0, fontSize: "0.875rem" }}>
              {SKILL_INSIGHTS[selectedSkill] ||
                "In rotation across Rohan's practical code experiments and software projects."}
            </p>
          </div>
        </div>
      ) : null}

      {/* Crates Grid */}
      <div className="grid-2">
        {filteredGroups.map((group) => {
          const meta = CRATE_META[group.title] || { side: "ROTATION", bpm: "STUDIO" };

          return (
            <article key={group.title} className="panel panel-pad panel-hover skill-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span className="mono-sm eyebrow-accent">{group.kicker}</span>
                <span className="tag mono-sm" style={{ fontSize: "0.5625rem", padding: "1px 6px" }}>
                  {meta.side}
                </span>
              </div>

              <h3 className="display-md" style={{ fontSize: "1.2rem", marginBottom: 14 }}>
                {group.title}
              </h3>

              <div className="skill-crate-items" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                {group.items.map((item) => {
                  const isSelected = selectedSkill === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      className={`skill-pill mono-sm ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSkillClick(item)}
                      title="Click to view rotation notes"
                    >
                      <MusicIcon size={11} />
                      {item}
                      {isSelected ? <SparkIcon size={10} style={{ color: "var(--accent)" }} /> : null}
                    </button>
                  );
                })}
              </div>

              {group.note ? (
                <p className="body-copy" style={{ margin: 0, fontSize: "0.8125rem", opacity: 0.85 }}>
                  {group.note}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
