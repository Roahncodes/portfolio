"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
} from "react";

import { getTheme, THEME_EVENT } from "@/lib/theme";
import { clamp, mixRgb, rgba, useScene, type Rgb, type SceneDraw } from "./scene";

/**
 * Stipple Type — a marbled-ink headline that swirls and breaks into stipple as
 * you stir it.
 *
 * Hand-built: the headline is rasterised offscreen with the *identical* computed
 * font, then sampled into particles that each remember where they belong. At
 * rest they sit on their home pixels with a hair of jitter, which is what makes
 * the fill read as stippled ink rather than flat type; a pointer passing over
 * kicks them tangentially, and a spring pulls them back into the letterform.
 *
 * The real `<h1>` never leaves the DOM. It defines the layout box, it is what
 * screen readers and search engines see, and it stays visible until a canvas
 * frame has actually painted — so if sampling fails on this browser the page
 * degrades to perfectly ordinary text.
 */

type Build = {
  count: number;
  hx: Float32Array;
  hy: Float32Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  size: Float32Array;
  tone: Uint8Array;
  styles: string[];
};

/** The veining of the ink: darkest at one end, pale at the other. */
const MARBLE: Record<"dark" | "light", Rgb[]> = {
  dark: [
    [22, 84, 52],
    [74, 222, 128],
    [214, 255, 232],
  ],
  // On paper the same three stops become ink: near-black violet, violet, then
  // the room's persimmon — a sunset rather than a green light. The range has to
  // stay dark end-to-end: a pale tone that reads as a highlight on black is
  // invisible on #fff3e2.
  light: [
    [24, 18, 52],
    [70, 38, 170],
    [168, 52, 12],
  ],
};

const TONE_STEPS = 6;
const LIGHT_STEPS = 4;
const MAX_PARTICLES = 7000;

function buildStyles(marble: Rgb[]) {
  const styles: string[] = [];
  for (let tone = 0; tone < TONE_STEPS; tone++) {
    const position = (tone / (TONE_STEPS - 1)) * (marble.length - 1);
    const from = Math.min(marble.length - 2, Math.floor(position));
    const colour = mixRgb(marble[from], marble[from + 1], position - from);
    for (let light = 0; light < LIGHT_STEPS; light++) {
      styles.push(rgba(colour, 0.4 + 0.6 * (light / (LIGHT_STEPS - 1))));
    }
  }
  return styles;
}

/**
 * Rasterise `text` with the element's real computed typography and turn the ink
 * into particles. Returns `null` whenever the reproduction can't be trusted —
 * a failed sample is far better than a headline in the wrong place.
 */
function sampleInk(
  host: HTMLElement,
  element: HTMLElement,
  text: string,
  marble: Rgb[],
): Build | null {
  const hostRect = host.getBoundingClientRect();
  const box = element.getBoundingClientRect();
  if (box.width < 24 || box.height < 8) return null;

  const styles = window.getComputedStyle(element);
  const fontSize = Number.parseFloat(styles.fontSize);
  const lineHeight = Number.parseFloat(styles.lineHeight) || fontSize * 1.1;

  const range = document.createRange();
  range.selectNodeContents(element);
  const lineRects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
  if (lineRects.length === 0 || lineRects.length > 4) return null;

  const width = Math.ceil(box.width);
  const height = Math.ceil(box.height);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const offscreen = document.createElement("canvas");
  offscreen.width = Math.max(1, Math.round(width * dpr));
  offscreen.height = Math.max(1, Math.round(height * dpr));

  const octx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!octx) return null;

  octx.scale(dpr, dpr);
  octx.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
  octx.textAlign = "left";
  octx.textBaseline = "alphabetic";
  octx.fillStyle = "#ffffff";

  const spacing = octx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in spacing) spacing.letterSpacing = styles.letterSpacing;

  const probe = octx.measureText("Hg");
  const ascent = probe.fontBoundingBoxAscent || fontSize * 0.8;
  const descent = probe.fontBoundingBoxDescent || fontSize * 0.2;

  // Reproduce the browser's word wrap, then refuse the sample if it disagrees.
  const words = text.split(/\s+/).filter(Boolean);
  const available = box.width + 0.5;
  const lines: { text: string; width: number }[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && octx.measureText(candidate).width > available) {
      lines.push({ text: current, width: octx.measureText(current).width });
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push({ text: current, width: octx.measureText(current).width });

  if (lines.length !== lineRects.length) return null;

  for (let i = 0; i < lines.length; i++) {
    const domWidth = lineRects[i].width;
    if (!domWidth) return null;

    const tolerance = Math.max(2.5, domWidth * 0.04);
    if (Math.abs(lines[i].width - domWidth) > tolerance) return null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lineRects[i];
    const top = line.top - box.top;
    const baseline = top + (lineHeight - (ascent + descent)) / 2 + ascent;
    octx.fillText(lines[i].text, 0, baseline);
  }

  // ── sample the ink ────────────────────────────────────────────────────────
  const image = octx.getImageData(0, 0, offscreen.width, offscreen.height).data;
  const step = Math.max(3, Math.round(Math.sqrt((width * height) / 16000)));

  const offsetX = box.left - hostRect.left;
  const offsetY = box.top - hostRect.top;
  const tones = buildStyles(marble);

  const homeX: number[] = [];
  const homeY: number[] = [];
  const sizes: number[] = [];
  const toneIndex: number[] = [];

  for (let py = 0; py < offscreen.height; py += step) {
    for (let px = 0; px < offscreen.width; px += step) {
      const alpha = image[(py * offscreen.width + px) * 4 + 3];
      if (alpha < 96) continue;

      const x = px / dpr + offsetX + (Math.random() - 0.5) * 0.9;
      const y = py / dpr + offsetY + (Math.random() - 0.5) * 0.9;
      const light = alpha / 255;

      // two out-of-phase sine fields: slow, marbled veining through the ink
      const marble = clamp(
        Math.sin(x * 0.017 + Math.sin(y * 0.023) * 2.1) * 0.5 +
          Math.sin(x * 0.0055 - y * 0.011 + 0.7) * 0.3 +
          0.2,
        0,
        1,
      );

      homeX.push(x);
      homeY.push(y);
      sizes.push(1.5 + light * 1.7);
      toneIndex.push(
        clamp(Math.round(marble * (TONE_STEPS - 1)), 0, TONE_STEPS - 1) * LIGHT_STEPS +
          clamp(Math.round(light * (LIGHT_STEPS - 1)), 0, LIGHT_STEPS - 1),
      );
    }
  }

  const found = homeX.length;
  if (found < 40) return null;

  let stride = 1;
  while (found / stride > MAX_PARTICLES) stride++;

  const count = Math.floor(found / stride);
  const build: Build = {
    count,
    hx: new Float32Array(count),
    hy: new Float32Array(count),
    x: new Float32Array(count),
    y: new Float32Array(count),
    vx: new Float32Array(count),
    vy: new Float32Array(count),
    size: new Float32Array(count),
    tone: new Uint8Array(count),
    styles: tones,
  };

  for (let i = 0; i < count; i++) {
    const source = i * stride;
    build.hx[i] = homeX[source];
    build.hy[i] = homeY[source];
    build.x[i] = homeX[source];
    build.y[i] = homeY[source];
    build.size[i] = sizes[source];
    build.tone[i] = toneIndex[source];
  }

  return build;
}

export function StippleType({
  text,
  className = "",
  as,
}: {
  text: string;
  className?: string;
  as?: ElementType;
}) {
  const Tag = (as ?? "h1") as ElementType;

  const hostRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLElement | null>(null);
  const buildRef = useRef<Build | null>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const reduceRef = useRef(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const draw = useCallback<SceneDraw>(
    (ctx, { w, h }, t) => {
      const build = buildRef.current;
      if (!build) return;

      const count = build.count;
      const reduce = reduceRef.current;
      const pointer = pointerRef.current;
      const radius = Math.max(70, Math.min(w, h) * 0.85);
      const radius2 = radius * radius;

      let lastStyle = "";

      for (let i = 0; i < count; i++) {
        let x = build.x[i];
        let y = build.y[i];
        const homeX = build.hx[i];
        const homeY = build.hy[i];

        if (!reduce) {
          if (pointer.active) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const distance2 = dx * dx + dy * dy;

            if (distance2 < radius2) {
              const distance = Math.sqrt(distance2) || 0.0001;
              const falloff = 1 - distance / radius;
              const force = falloff * falloff;
              const nx = dx / distance;
              const ny = dy / distance;

              // stir: a tangential kick plus a little outward spill
              build.vx[i] += -ny * 2.6 * force + nx * 0.95 * force;
              build.vy[i] += nx * 2.6 * force + ny * 0.95 * force;
            }
          }

          // spring back into the letterform, damped so the ink settles
          build.vx[i] = (build.vx[i] + (homeX - x) * 0.055) * 0.9;
          build.vy[i] = (build.vy[i] + (homeY - y) * 0.055) * 0.9;
          x += build.vx[i];
          y += build.vy[i];

          build.x[i] = x;
          build.y[i] = y;
        }

        // a slow curl so the ink breathes even when nobody is touching it
        const phase = t * 0.45 + homeY * 0.03 + homeX * 0.012;
        const driftX = Math.sin(phase) * 0.85;
        const driftY = Math.cos(phase * 0.83) * 0.85;

        const style = build.styles[build.tone[i]];
        if (style !== lastStyle) {
          ctx.fillStyle = style;
          lastStyle = style;
        }

        const size = build.size[i];
        ctx.fillRect(x + driftX - size / 2, y + driftY - size / 2, size, size);
      }
    },
    [],
  );

  const { ref, paint } = useScene(draw);

  // Re-sample whenever the box changes or the real font finally lands.
  useEffect(() => {
    const host = hostRef.current;
    const element = textRef.current;
    if (!host || !element) return;

    let cancelled = false;
    let pending = 0;

    const rebuild = () => {
      if (cancelled) return;

      const build = sampleInk(host, element, text, MARBLE[getTheme()]);
      buildRef.current = build;

      if (!build) {
        // Sampling failed on this browser: hand the pixels back to the real text.
        Promise.resolve().then(() => {
          if (!cancelled) setOn(false);
        });
        return;
      }

      // Repaint before revealing, so the heading is never momentarily blank.
      paint();
      Promise.resolve().then(() => {
        if (!cancelled) setOn(true);
      });
    };

    rebuild();

    const schedule = () => {
      if (pending) return;
      pending = window.requestAnimationFrame(() => {
        pending = 0;
        rebuild();
      });
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(host);

    if (document.fonts) document.fonts.ready.then(rebuild).catch(() => undefined);

    // The marble is baked into the sampled styles, so a theme change has to
    // re-sample rather than just repaint. Called directly rather than through
    // `schedule`, because the toggle may happen where rAF is suspended.
    window.addEventListener(THEME_EVENT, rebuild);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener(THEME_EVENT, rebuild);
      if (pending) window.cancelAnimationFrame(pending);
    };
  }, [text, paint]);

  // Stir only where stirring is welcome.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
    };

    const release = () => {
      pointerRef.current = { ...pointerRef.current, active: false };
    };

    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", release);
    host.addEventListener("pointercancel", release);

    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", release);
      host.removeEventListener("pointercancel", release);
    };
  }, []);

  return (
    <div className="stipple" ref={hostRef} data-ink={on ? "on" : "off"}>
      <Tag ref={textRef} className={`stipple-text ${className}`.trim()}>
        {text}
      </Tag>
      <div className="fx-host stipple-canvas" data-fx={on ? "on" : "off"}>
        <canvas ref={ref} className="fx-canvas" aria-hidden="true" />
      </div>
    </div>
  );
}
