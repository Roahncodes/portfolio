"use client";

import { useId, useState } from "react";

import { sound } from "@/lib/audio";

interface WaveformVisualizerProps {
  palette?: [string, string];
  barsCount?: number;
  interactive?: boolean;
}

export function WaveformVisualizer({
  palette = ["var(--accent)", "var(--accent-bright)"],
  barsCount = 42,
  interactive = true,
}: WaveformVisualizerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const id = useId();

  // Deterministic organic heights
  const bars = Array.from({ length: barsCount }, (_, i) => {
    const norm = i / barsCount;
    // Harmonic wave combination
    const h1 = Math.sin(norm * Math.PI * 3.2) * 0.45;
    const h2 = Math.cos(norm * Math.PI * 6.5) * 0.25;
    const h3 = Math.sin(norm * Math.PI * 1.8) * 0.3;
    const height = Math.max(15, Math.min(95, Math.round((h1 + h2 + h3 + 0.6) * 65)));
    return { id: i, height };
  });

  const handleBarHover = (idx: number) => {
    if (!interactive) return;
    setHoveredIndex(idx);
    sound.playClick(0.03, 300 + idx * 15);
  };

  return (
    <div
      className="waveform-wrapper"
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
        height: 52,
        padding: "10px 14px",
        borderRadius: 10,
        border: "1px solid var(--line)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: "100%", flex: 1 }}>
        {bars.map((bar, i) => {
          const isHovered = hoveredIndex === i;
          const color = isHovered ? palette[1] : palette[0];
          const opacity = isHovered ? 1 : 0.45 + (bar.height / 100) * 0.45;

          return (
            <div
              key={`${id}-bar-${bar.id}`}
              onMouseEnter={() => handleBarHover(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                flex: 1,
                height: `${bar.height}%`,
                background: color,
                opacity,
                borderRadius: 2,
                cursor: interactive ? "pointer" : "default",
                transition: "height 0.15s ease, opacity 0.15s ease, background 0.15s ease",
                transform: isHovered ? "scaleY(1.15)" : "none",
                transformOrigin: "bottom",
              }}
            />
          );
        })}
      </div>

      <span
        className="mono-sm"
        style={{
          marginLeft: 14,
          fontSize: "0.5625rem",
          color: "var(--dim)",
          letterSpacing: "0.14em",
          whiteSpace: "nowrap",
        }}
      >
        {hoveredIndex !== null ? `LVL ${bars[hoveredIndex].height}dB` : "STEREO / MASTER"}
      </span>
    </div>
  );
}
