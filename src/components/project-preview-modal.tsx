"use client";

import { useState } from "react";

import {
  ArrowUpRightIcon,
  CheckIcon,
  CloseIcon,
  DiscIcon,
  GithubIcon,
  SparkIcon,
} from "@/components/icons";
import type { Album } from "@/content/albums";
import { sound } from "@/lib/audio";

interface ProjectPreviewModalProps {
  album: Album;
}

export function ProjectPreviewModal({ album }: ProjectPreviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedClone, setCopiedClone] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const isJetNet = album.slug === "jetnet-super-resolution";

  const handleOpen = () => {
    setIsOpen(true);
    sound.playNeedleDrop();
  };

  const handleClose = () => {
    setIsOpen(false);
    sound.playClick(0.04, 340);
  };

  // Touch gesture support: swipe down to dismiss modal/bottom sheet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (deltaY > 55) {
      // Swiped down
      handleClose();
    }
    setTouchStartY(null);
  };

  const handleCopyClone = () => {
    navigator.clipboard.writeText(`git clone ${album.repo}.git`);
    setCopiedClone(true);
    sound.playChime();
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleOpen}
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        <SparkIcon size={14} />
        System architecture & demo
      </button>

      {isOpen ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={handleClose}
        >
          <div
            className="panel panel-pad modal-window"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Grab handle indicator for mobile sheet gestures */}
            <div className="sheet-grab-bar" aria-hidden="true" />

            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 16,
                paddingBottom: 16,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <span className="mono-sm" style={{ color: "var(--accent)" }}>
                    {album.code}
                  </span>
                  <span className="mono-sm" style={{ color: "var(--dim)" }}>
                    · TECHNICAL LINER NOTES & SCHEMATIC
                  </span>
                </div>
                <h3 id="modal-title" className="display-sm" style={{ fontSize: "1.45rem", margin: 0 }}>
                  {album.title}
                </h3>
              </div>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleClose}
                aria-label="Close modal"
                style={{ padding: "8px", minWidth: 40, minHeight: 40 }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
              {isJetNet ? (
                /* JetNet Architecture Diagram */
                <div>
                  <span className="mono-sm eyebrow-accent" style={{ display: "block", marginBottom: 12 }}>
                    2-STAGE MACHINE LEARNING PIPELINE ARCHITECTURE
                  </span>

                  <div className="modal-pipeline-box">
                    {/* Stage 1 */}
                    <div className="modal-stage-1">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="mono-sm modal-stage-badge-1">
                          STAGE 01
                        </span>
                        <span className="font-semibold" style={{ fontSize: "0.9375rem" }}>
                          Generative Flow Matching
                        </span>
                      </div>
                      <p className="body-copy" style={{ margin: 0, fontSize: "0.8125rem" }}>
                        Upsamples sparse low-resolution calorimeter event deposits into continuous high-fidelity energy fields using ordinary differential equation (ODE) vector integration.
                      </p>
                    </div>

                    <div style={{ textAlign: "center", color: "var(--dim)", fontSize: "0.75rem" }}>
                      ↓ Continuous Energy Field Vector Output
                    </div>

                    {/* Stage 2 */}
                    <div className="modal-stage-2">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="mono-sm modal-stage-badge-2">
                          STAGE 02
                        </span>
                        <span className="font-semibold" style={{ fontSize: "0.9375rem" }}>
                          Set-to-Set Transformer & Hungarian Loss
                        </span>
                      </div>
                      <p className="body-copy" style={{ margin: 0, fontSize: "0.8125rem" }}>
                        Maps super-resolved deposits onto individual physical particle coordinates. Permutation-invariant attention resolves candidate particles with 1:1 bipartite matching.
                      </p>
                    </div>

                    <div style={{ textAlign: "center", color: "var(--dim)", fontSize: "0.75rem" }}>
                      ↓ Final Evaluation & Validation Checkpoints
                    </div>

                    {/* Results Banner */}
                    <div className="modal-results-strip">
                      <div style={{ textAlign: "center" }}>
                        <div className="mono-sm" style={{ color: "var(--dim)" }}>Matched Particles</div>
                        <div style={{ color: "var(--accent-bright)", fontWeight: 700, fontSize: "1.1rem" }}>
                          30 / 30 (100%)
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div className="mono-sm" style={{ color: "var(--dim)" }}>Best Validation Loss</div>
                        <div style={{ color: "var(--accent-bright)", fontWeight: 700, fontSize: "1.1rem" }}>
                          0.0524
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div className="mono-sm" style={{ color: "var(--dim)" }}>Training Epochs</div>
                        <div style={{ color: "var(--accent-bright)", fontWeight: 700, fontSize: "1.1rem" }}>
                          50 Epochs
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Python Sessions Interactive Module Inspector */
                <div>
                  <span className="mono-sm eyebrow-accent" style={{ display: "block", marginBottom: 12 }}>
                    7 PRACTICAL PYTHON EXPERIMENTS IN ROTATION
                  </span>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                    {album.tracks.map((track, i) => (
                      <button
                        key={track.title}
                        type="button"
                        className={`curated-tab mono-sm ${i === activeTab ? "active" : ""}`}
                        onClick={() => {
                          setActiveTab(i);
                          sound.playClick(0.04, 380 + i * 20);
                        }}
                      >
                        <DiscIcon size={11} />
                        {track.title}
                      </button>
                    ))}
                  </div>

                  <div className="modal-pipeline-box">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                      <span className="mono-sm" style={{ color: "var(--accent)" }}>
                        TRACK {album.tracks[activeTab].index} · {album.tracks[activeTab].kind ?? "SOURCE"}
                      </span>
                      <a
                        className="mono-sm link-accent"
                        href={album.tracks[activeTab].href}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        GitHub File <ArrowUpRightIcon size={12} />
                      </a>
                    </div>
                    <h4 className="display-sm" style={{ margin: "0 0 6px" }}>
                      {album.tracks[activeTab].title}
                    </h4>
                    <p className="body-copy" style={{ margin: 0, fontSize: "0.875rem" }}>
                      {album.tracks[activeTab].description}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Terminal Clone Action */}
              <div className="modal-clone-strip">
                <div className="mono-sm" style={{ color: "var(--dim)", fontSize: "0.6875rem" }}>
                  $ git clone {album.repo}.git
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleCopyClone}
                    style={{ padding: "6px 12px", fontSize: "0.6875rem" }}
                  >
                    {copiedClone ? <CheckIcon size={12} /> : <DiscIcon size={12} />}
                    {copiedClone ? "Cloned to clipboard" : "Copy clone command"}
                  </button>
                  <a
                    className="btn btn-primary"
                    href={album.repo}
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ padding: "6px 12px", fontSize: "0.6875rem" }}
                  >
                    <GithubIcon size={13} />
                    View repository
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
