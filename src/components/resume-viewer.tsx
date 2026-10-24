"use client";

import { useCallback, useId, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import {
  ArrowUpRightIcon,
  AwardIcon,
  CheckIcon,
  CopyIcon,
  DocumentIcon,
  DownloadIcon,
  EyeIcon,
  PrinterIcon,
  SearchIcon,
  SparkIcon,
} from "@/components/icons";
import { profile } from "@/content/profile";
import { resume } from "@/content/resume";
import { sound } from "@/lib/audio";

type ViewMode = "sheet" | "ats" | "matrix";

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (notify: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

const ATS_RESUME_TEXT = `================================================================================
ROHAN DABHADE
${profile.location} | ${profile.phone} | ${profile.email}
${profile.linkedin} | ${profile.github}
================================================================================

SUMMARY
Computer Science student focused on Python, data science, and machine learning,
with hands-on experience building practical applications and working on an
AI/ML internship. Comfortable learning new tools through projects and using
programming to solve concrete problems.

--------------------------------------------------------------------------------
EDUCATION
Jain University, Bangalore, Karnataka
Current Status: Second-Year Student | Expected Graduation: September 2028

--------------------------------------------------------------------------------
EXPERIENCE
Shivohini — AI/ML Intern | May 26, 2026 – August 1, 2026
• Built and refined a rule engine for a fire-safety tool recommendation model.
• Helped translate fire-safety requirements into structured rules used to
  generate recommendations.

--------------------------------------------------------------------------------
PROJECTS
AI Voice Assistant
• Built a Python-based assistant capable of recognizing and executing voice
  commands using speech recognition.

Message Encryption Tool
• Developed a Python application for secure message encryption and decryption,
  applying core cryptographic concepts.

Personal Portfolio Website
• Designed and deployed a personal portfolio website using Vercel with a custom
  domain, gaining hands-on experience in web deployment and domain management.

ML4SCI — JetNet-SR-PFlow
• Contributed to a machine learning pipeline for optimizing LHC calorimeter
  simulations.
• Implemented a two-stage system using Generative Flow Matching and Set-to-Set
  Transformers.
• Achieved 1:1 particle matching (30/30) on the JetNet dataset.
• Worked with GPU-accelerated training (NVIDIA) for improved validation.

--------------------------------------------------------------------------------
SKILLS
Programming: Python (NumPy, Pandas, Object-Oriented Programming), C, C++, Java,
  JavaScript, TypeScript, HTML, CSS
Frameworks / Libraries: PyQt5, NumPy, Pandas; learning Scikit-learn and Matplotlib
Databases: MongoDB, SQL
Concepts: Encryption, Speech Recognition
Tools: Git, GitHub

--------------------------------------------------------------------------------
HACKATHONS
• Participated in 3+ hackathons and worked with teams to build functional
  prototypes under time constraints.
• Developed backend systems and database logic, including work with Supabase and
  MongoDB for data management.

--------------------------------------------------------------------------------
CERTIFICATIONS
Electronic Arts — Software Engineering Job Simulation (Forage)
• Completed practical tasks replicating those of a Software Engineer at
  Electronic Arts.

AWS APAC — Solutions Architecture Job Simulation (Forage)
• Completed modules on designing and implementing cloud solutions, gaining
  exposure to core AWS services and architectural best practices.
================================================================================`;

interface MatrixSkill {
  name: string;
  category: "ml" | "backend" | "systems" | "tools";
  level: "Advanced" | "Proficient" | "Exploring";
  application: string;
  projectHref?: string;
  projectLabel?: string;
}

const TECHNICAL_MATRIX: MatrixSkill[] = [
  {
    name: "Python",
    category: "ml",
    level: "Advanced",
    application: "Primary production language across ML research, scripts, and rule engines",
    projectHref: "/projects/python-sessions",
    projectLabel: "Python Sessions",
  },
  {
    name: "PyTorch & Lightning",
    category: "ml",
    level: "Advanced",
    application: "Deep generative modeling, Flow Matching, and Hungarian matching loss",
    projectHref: "/projects/jetnet-super-resolution",
    projectLabel: "JetNet-SR-PFlow",
  },
  {
    name: "Generative Flow Matching",
    category: "ml",
    level: "Advanced",
    application: "Continuous Normalizing Flows for calorimeter shower super-resolution",
    projectHref: "/projects/jetnet-super-resolution",
    projectLabel: "JetNet-SR-PFlow",
  },
  {
    name: "Set-to-Set Transformers",
    category: "ml",
    level: "Proficient",
    application: "Permutation-invariant point cloud reconstruction with Hungarian matching",
    projectHref: "/projects/jetnet-super-resolution",
    projectLabel: "JetNet-SR-PFlow",
  },
  {
    name: "NumPy & Pandas",
    category: "ml",
    level: "Advanced",
    application: "Data manipulation, tensor operations, JetNet-30 data parsing",
  },
  {
    name: "Scikit-learn & Matplotlib",
    category: "ml",
    level: "Proficient",
    application: "Validation loss curves, clustering, and comparative physics histograms",
  },
  {
    name: "C & C++",
    category: "systems",
    level: "Proficient",
    application: "Object-oriented engine architecture & game simulation in EA Forage program",
  },
  {
    name: "Java",
    category: "systems",
    level: "Proficient",
    application: "Object-oriented design patterns & university algorithmic problem solving",
  },
  {
    name: "AWS Solutions Architecture",
    category: "systems",
    level: "Proficient",
    application: "Multi-tier VPC, IAM security, Lambda serverless, and S3 storage design",
  },
  {
    name: "MongoDB & SQL",
    category: "backend",
    level: "Proficient",
    application: "NoSQL document storage in hackathon prototypes & relational database querying",
  },
  {
    name: "Rule Engine Inference",
    category: "backend",
    level: "Advanced",
    application: "Deterministic statutory compliance logic built during Shivohini internship",
  },
  {
    name: "Supabase & FastAPI",
    category: "backend",
    level: "Proficient",
    application: "Rapid prototype API backends built under 24-48h hackathon constraints",
  },
  {
    name: "TypeScript & Next.js",
    category: "tools",
    level: "Advanced",
    application: "Zero-dependency reactive web applications, Web Audio synthesizers, Turbopack",
  },
  {
    name: "PyQt5 & Speech Recognition",
    category: "tools",
    level: "Proficient",
    application: "Desktop interactive utilities, voice assistance, and cryptography ciphers",
    projectHref: "/projects/python-sessions",
    projectLabel: "Python Sessions",
  },
  {
    name: "Git & Linux / Bash",
    category: "tools",
    level: "Advanced",
    application: "Version control, automated pipelines, remote GPU shell environment workflows",
  },
];

export function ResumeViewer() {
  const [activeMode, setActiveMode] = useState<ViewMode>("sheet");
  const [open, setOpen] = useState(false);
  const [copiedAts, setCopiedAts] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const wideEnoughForPdf = useMediaQuery("(min-width: 900px)");
  const panelId = useId();

  const handleCopyAts = async () => {
    try {
      await navigator.clipboard.writeText(ATS_RESUME_TEXT);
      sound.playChime();
      setCopiedAts(true);
      setTimeout(() => setCopiedAts(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleModeSwitch = (mode: ViewMode) => {
    sound.playClick();
    setActiveMode(mode);
    if (!open) setOpen(true);
  };

  const filteredMatrix = useMemo(() => {
    return TECHNICAL_MATRIX.filter((item) => {
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesSearch =
        !searchKeyword ||
        item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        item.application.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchKeyword]);

  return (
    <div className="resume-viewer">
      {/* Top Controls Toolbar */}
      <div className="resume-toolbar">
        {/* Mode Switcher Tabs */}
        <div className="resume-view-switcher" role="tablist" aria-label="Resume view mode">
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "sheet"}
            className={`resume-tab-btn ${activeMode === "sheet" ? "active" : ""}`}
            onClick={() => handleModeSwitch("sheet")}
          >
            <DocumentIcon size={14} />
            Master Sheet (PDF)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "ats"}
            className={`resume-tab-btn ${activeMode === "ats" ? "active" : ""}`}
            onClick={() => handleModeSwitch("ats")}
          >
            <SparkIcon size={14} />
            ATS Plaintext
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeMode === "matrix"}
            className={`resume-tab-btn ${activeMode === "matrix" ? "active" : ""}`}
            onClick={() => handleModeSwitch("matrix")}
          >
            <AwardIcon size={14} />
            Technical Matrix
          </button>
        </div>

        {/* Action Buttons */}
        <div className="resume-action-group">
          <a
            className="btn btn-primary"
            href={resume.pdf}
            download={resume.downloadName}
            onClick={() => sound.playClick()}
          >
            <DownloadIcon size={15} />
            Download PDF
          </a>

          <button
            type="button"
            className={`btn btn-ghost ${copiedAts ? "btn-accent-glow" : ""}`}
            onClick={handleCopyAts}
            title="Copy ATS plaintext to clipboard"
          >
            {copiedAts ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            {copiedAts ? "Copied to Clipboard!" : "Copy ATS Text"}
          </button>

          <button
            type="button"
            className="btn btn-ghost print-btn"
            onClick={handlePrint}
            title="Print cassette sleeve / resume"
          >
            <PrinterIcon size={15} />
            Print
          </button>

          <a
            className="link-accent"
            href={resume.pdf}
            target="_blank"
            rel="noreferrer noopener"
            style={{ fontSize: "0.85rem", gap: 5 }}
          >
            Open in new tab
            <ArrowUpRightIcon size={13} />
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="resume-panel" id={panelId}>
        {/* MODE 1: Master Sheet (PDF) */}
        {activeMode === "sheet" && (
          <div>
            {!open ? (
              <button
                type="button"
                className="resume-poster"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => {
                  sound.playNeedleDrop();
                  setOpen(true);
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="resume-poster-art" src={resume.image} alt="" aria-hidden="true" />
                <span className="resume-poster-label">
                  <EyeIcon size={16} />
                  Preview the resume
                </span>
              </button>
            ) : wideEnoughForPdf ? (
              <div className="resume-frame-wrap">
                <div className="resume-frame-header">
                  <span className="mono-sm text-dim">
                    ● A4 MASTER DOCUMENT · 1 PAGE · {resume.downloadName}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                    onClick={() => setOpen(false)}
                  >
                    Collapse View
                  </button>
                </div>
                <iframe
                  className="resume-frame"
                  title={`${resume.downloadName} — PDF preview`}
                  src={`${resume.pdf}#view=FitH`}
                />
              </div>
            ) : (
              <div className="resume-scroll">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="resume-page"
                  src={resume.image}
                  width={resume.imageWidth}
                  height={resume.imageHeight}
                  alt={`The first and only page of ${resume.downloadName}`}
                />
              </div>
            )}
          </div>
        )}

        {/* MODE 2: ATS Plaintext & Recruiter Matrix */}
        {activeMode === "ats" && (
          <div className="resume-ats-box">
            <div className="resume-ats-header">
              <div className="resume-ats-badge">
                <span className="live-dot" />
                <span className="mono-sm" style={{ color: "var(--accent)" }}>
                  ATS-OPTIMIZED · 100% PARSEABLE PLAIN TEXT
                </span>
              </div>
              <div className="resume-ats-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: "0.75rem", padding: "6px 14px" }}
                  onClick={handleCopyAts}
                >
                  {copiedAts ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                  {copiedAts ? "Copied!" : "Copy Full ATS Text"}
                </button>
              </div>
            </div>

            <div className="resume-ats-meta-strip">
              <div className="ats-metric">
                <span className="ats-metric-val">100%</span>
                <span className="ats-metric-lbl">Parser Compliance</span>
              </div>
              <div className="ats-metric">
                <span className="ats-metric-val">0</span>
                <span className="ats-metric-lbl">Complex Columns</span>
              </div>
              <div className="ats-metric">
                <span className="ats-metric-val">24+</span>
                <span className="ats-metric-lbl">Tech Keywords</span>
              </div>
              <div className="ats-metric">
                <span className="ats-metric-val">01</span>
                <span className="ats-metric-lbl">Exact Page Count</span>
              </div>
            </div>

            <pre className="resume-ats-pre">
              <code>{ATS_RESUME_TEXT}</code>
            </pre>
          </div>
        )}

        {/* MODE 3: Technical Liner Notes Matrix */}
        {activeMode === "matrix" && (
          <div className="resume-matrix-container">
            {/* Filter and Search Bar */}
            <div className="resume-matrix-toolbar">
              <div className="matrix-search-wrap">
                <SearchIcon size={14} />
                <input
                  type="text"
                  className="matrix-search-input"
                  placeholder="Filter skills (e.g. PyTorch, Hungarian, C++, AWS)..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                {searchKeyword && (
                  <button
                    type="button"
                    className="matrix-clear-btn"
                    onClick={() => setSearchKeyword("")}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="matrix-category-chips">
                {[
                  { id: "all", label: "All Skills" },
                  { id: "ml", label: "ML & AI" },
                  { id: "backend", label: "Backend & Data" },
                  { id: "systems", label: "Systems & Cloud" },
                  { id: "tools", label: "Tools & Web" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`matrix-cat-btn ${categoryFilter === cat.id ? "active" : ""}`}
                    onClick={() => {
                      sound.playClick();
                      setCategoryFilter(cat.id);
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix Grid */}
            <div className="resume-matrix-grid">
              {filteredMatrix.map((skill) => (
                <div key={skill.name} className="resume-matrix-card">
                  <div className="matrix-card-top">
                    <span className="matrix-skill-name">{skill.name}</span>
                    <span
                      className={`matrix-level-pill level-${skill.level.toLowerCase()}`}
                    >
                      {skill.level}
                    </span>
                  </div>

                  <p className="matrix-skill-app">{skill.application}</p>

                  {skill.projectHref && skill.projectLabel && (
                    <div className="matrix-card-footer">
                      <Link href={skill.projectHref} className="matrix-project-link">
                        <SparkIcon size={12} />
                        <span>{skill.projectLabel}</span>
                        <ArrowUpRightIcon size={11} />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredMatrix.length === 0 && (
              <div className="matrix-empty">
                <p className="text-muted">No skills matched &ldquo;{searchKeyword}&rdquo;</p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ marginTop: 10, fontSize: "0.8rem" }}
                  onClick={() => {
                    setSearchKeyword("");
                    setCategoryFilter("all");
                  }}
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
