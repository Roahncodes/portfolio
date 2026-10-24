"use client";

import { useState } from "react";

import {
  ArrowUpRightIcon,
  CheckIcon,
  CopyIcon,
  MailIcon,
  SparkIcon,
} from "@/components/icons";
import { profile } from "@/content/profile";
import { sound } from "@/lib/audio";

const INTENT_PRESETS = [
  {
    id: "internship",
    icon: "💼",
    label: "Internship Opportunity",
    defaultSubject: "Internship Opportunity / Rohan Dabhade",
    prompt:
      "Hi Rohan,\n\nI came across your portfolio and wanted to reach out regarding an internship opportunity in ML / Backend Engineering. We'd love to chat about...",
  },
  {
    id: "research",
    icon: "🔬",
    label: "ML Research Collaboration",
    defaultSubject: "ML Research / JetNet Collaboration",
    prompt:
      "Hi Rohan,\n\nI saw your work on JetNet super-resolution and flow matching. I'm currently working on physics simulation / generative models and wanted to discuss...",
  },
  {
    id: "opensource",
    icon: "🛠️",
    label: "Open-Source / Engineering",
    defaultSubject: "Project Collaboration / Open-Source",
    prompt:
      "Hi Rohan,\n\nI really liked your approach to building practical Python tools and reproducible experiments. I'm building...",
  },
  {
    id: "chat",
    icon: "☕",
    label: "Coffee / General Chat",
    defaultSubject: "Hello from Bangalore / Remote",
    prompt:
      "Hi Rohan,\n\nLoved the portfolio design and record-label concept. Would love to connect and talk tech...",
  },
];

export function ContactConsole() {
  const [activeIntent, setActiveIntent] = useState(INTENT_PRESETS[0]);
  const [senderName, setSenderName] = useState("");
  const [senderContact, setSenderContact] = useState("");
  const [message, setMessage] = useState(INTENT_PRESETS[0].prompt);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const handleIntentChange = (preset: (typeof INTENT_PRESETS)[0]) => {
    sound.playClick();
    setActiveIntent(preset);
    setMessage(preset.prompt);
  };

  const formattedFullMessage = `From: ${senderName || "Visitor"} (${senderContact || "Contact provided in mail"})\nSubject: ${activeIntent.defaultSubject}\n\n${message}\n\n---\nSent via "on repeat." portfolio console`;

  const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(
    activeIntent.defaultSubject,
  )}&body=${encodeURIComponent(
    `${message}\n\n---\nFrom: ${senderName || "Colleague / Recruiter"}\nContact: ${senderContact || "Direct reply"}`,
  )}`;

  const handleCopyPitch = async () => {
    try {
      await navigator.clipboard.writeText(formattedFullMessage);
      sound.playChime();
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2500);
    } catch {}
  };

  const handleDispatch = () => {
    sound.playNeedleDrop();
    window.location.href = mailtoUrl;
  };

  return (
    <section className="section contact-console-section">
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <span className="mono-sm eyebrow-accent">
            <SparkIcon size={13} />
            DIRECT DEMO DISPATCH · MESSAGE CONSOLE
          </span>
          <h2 className="display display-lg" style={{ marginTop: 8 }}>
            Send a track request.
          </h2>
        </div>
        <p className="body-copy" style={{ margin: 0, maxWidth: "42ch" }}>
          Select your inquiry intent below to generate a pre-structured
          pitch. Dispatches straight to {profile.email}.
        </p>
      </div>

      <div className="contact-console-card">
        {/* Intent Selector Buttons */}
        <div className="console-intents-bar">
          <span className="mono-sm text-dim console-intent-label">
            INQUIRY TRACK:
          </span>
          <div className="console-intent-chips">
            {INTENT_PRESETS.map((preset) => {
              const isSelected = activeIntent.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`console-intent-chip ${isSelected ? "selected" : ""}`}
                  onClick={() => handleIntentChange(preset)}
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sender Inputs */}
        <div className="console-inputs-grid">
          <div className="form-group">
            <label className="mono-sm form-label" htmlFor="cc-name">
              Your Name / Organization
            </label>
            <input
              id="cc-name"
              type="text"
              placeholder="e.g. Maya Lin (Tech Recruiter) or Alex"
              className="form-input"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="mono-sm form-label" htmlFor="cc-contact">
              Your Email or LinkedIn
            </label>
            <input
              id="cc-contact"
              type="text"
              placeholder="e.g. maya@company.com or linkedin.com/in/..."
              className="form-input"
              value={senderContact}
              onChange={(e) => setSenderContact(e.target.value)}
            />
          </div>
        </div>

        {/* Message Editor */}
        <div className="form-group" style={{ marginTop: 14 }}>
          <div className="console-message-header">
            <label className="mono-sm form-label" htmlFor="cc-message">
              Message / Pitch Brief
            </label>
            <span className="mono-sm text-dim" style={{ fontSize: "0.6875rem" }}>
              {message.length} characters
            </span>
          </div>
          <textarea
            id="cc-message"
            rows={5}
            className="form-input form-textarea console-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Bottom Actions & Status */}
        <div className="console-card-footer">
          <div className="console-status-pill">
            <span className="live-dot" />
            <span className="mono-sm" style={{ color: "var(--accent-bright)" }}>
              TYPICAL RESPONSE &lt; 24 HOURS
            </span>
          </div>

          <div className="console-action-btns">
            <button
              type="button"
              className={`btn btn-ghost ${copiedPitch ? "btn-accent-glow" : ""}`}
              onClick={handleCopyPitch}
              title="Copy message to clipboard"
            >
              {copiedPitch ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              {copiedPitch ? "Pitch Copied!" : "Copy Pitch"}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDispatch}
              title="Open your email client with this pre-filled message"
            >
              <MailIcon size={14} />
              Open in Mail Client
              <ArrowUpRightIcon size={12} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
