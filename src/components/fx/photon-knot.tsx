"use client";

import { useCallback, useEffect, useMemo } from "react";

import { getTheme, THEME_EVENT } from "@/lib/theme";
import { clamp, deepenRgb, hexToRgb, mixRgb, rgba, useScene, type SceneDraw } from "./scene";

/**
 * Photon Knot — a translucent ribbon of light tied into a slowly turning knot.
 *
 * Hand-built (no registry, no dependency): a trefoil curve is sampled in 3D,
 * swept with a Frenet-style frame to give it a flat ribbon cross-section, then
 * projected with a perspective divide. The ribbon is drawn as depth-sorted
 * quads under additive blending, so crossings brighten and the whole thing
 * reads as translucent glass rather than a painted tube.
 *
 * `variant="hero"`  → backdrop scale, wider ribbon
 * `variant="card"`  → album-cover scale, capped frame rate
 * `colors`          → `[core, highlight]` hex pair, so every album gets its own
 *                     light. Defaults to the site's green.
 * `tone`            → `"page"` follows the colour theme; `"cover"` is always the
 *                     dark additive version, because a record sleeve is dark
 *                     whatever colour the wall is. Defaults from the variant.
 */

type Variant = "hero" | "card";
type Tone = "page" | "cover";

type Preset = {
  /** diameter of the knot as a fraction of the box's short side */
  span: number;
  /** ribbon half-thickness, as a fraction of the box's short side */
  ribbon: number;
  /** radians per second around the vertical axis */
  spin: number;
  /** resting tilt of the knot's axis */
  tilt: number;
  samples: number;
  fps: number;
  /** [haze, mid-glow] stroke alphas */
  glow: [number, number];
  /** ribbon translucency range, far → near */
  alpha: [number, number];
  halo: number;
};

const PRESETS: Record<Variant, Preset> = {
  hero: {
    span: 0.76,
    ribbon: 0.017,
    spin: 0.052,
    tilt: 0.42,
    samples: 280,
    fps: 0,
    glow: [0.05, 0.085],
    alpha: [0.05, 0.17],
    halo: 0,
  },
  card: {
    span: 0.62,
    ribbon: 0.016,
    spin: 0.085,
    tilt: 0.34,
    samples: 208,
    fps: 40,
    glow: [0.045, 0.075],
    alpha: [0.055, 0.16],
    halo: 0.1,
  },
};

/** The default pair: the site's own accent, used for the discography backdrop. */
const DEFAULT_COLORS: [string, string] = ["#4ade80", "#d6ffe8"];

/** Perspective focal distance in knot-space units. */
const FOCAL = 2.9;

export function PhotonKnot({
  variant = "hero",
  colors = DEFAULT_COLORS,
  className = "",
  tone,
}: {
  variant?: Variant;
  colors?: [string, string];
  className?: string;
  tone?: Tone;
}) {
  const [coreHex, highlightHex] = colors;
  const followsPage = (tone ?? (variant === "hero" ? "page" : "cover")) === "page";

  const core = useMemo(() => hexToRgb(coreHex), [coreHex]);
  const highlight = useMemo(() => hexToRgb(highlightHex), [highlightHex]);

  const draw = useCallback<SceneDraw>(
    (ctx, { w, h }, t) => {
      const preset = PRESETS[variant];

      // Ink on paper or light on black. On the page the theme decides (read from
      // the document, so a frame is never painted with the previous palette);
      // inside a cover the additive version is the artwork's own contract.
      const light = followsPage && getTheme() === "light";
      const inkCore = light ? deepenRgb(core, 0.42) : core;
      const inkHighlight = light ? deepenRgb(highlight, 0.34) : highlight;
      // translucent ribbon reads as a stain on white, so it needs more of it
      const strength = light ? 2.6 : 1;

      const short = Math.min(w, h);
      const cx = w / 2;
      const cy = h / 2;
      const radius = (short / 2) * preset.span;

      const spin = t * preset.spin;
      const tilt = preset.tilt + Math.sin(t * 0.11) * 0.1;
      const cosA = Math.cos(spin);
      const sinA = Math.sin(spin);
      const cosB = Math.cos(tilt);
      const sinB = Math.sin(tilt);

      const count = preset.samples;

      /* ── 1. sweep the trefoil into rotated, projected points ───────────── */

      const px = new Float64Array(count);
      const py = new Float64Array(count);
      const pz = new Float64Array(count);
      const sx = new Float64Array(count);
      const sy = new Float64Array(count);
      const depth = new Float64Array(count);

      for (let i = 0; i < count; i++) {
        const u = (i / count) * Math.PI * 2;

        // the classic trefoil parametrisation
        const bx = (Math.sin(u) + 2 * Math.sin(2 * u)) / 3;
        const by = (Math.cos(u) - 2 * Math.cos(2 * u)) / 3;
        const bz = -Math.sin(3 * u) * 0.55;

        // rotate about Y, then about X
        const ry1 = bx * cosA + bz * sinA;
        const rz1 = -bx * sinA + bz * cosA;
        const ry2 = by * cosB - rz1 * sinB;
        const rz2 = by * sinB + rz1 * cosB;

        const k = FOCAL / (FOCAL - rz2);

        px[i] = ry1;
        py[i] = ry2;
        pz[i] = rz2;
        sx[i] = cx + ry1 * k * radius;
        sy[i] = cy - ry2 * k * radius;
        depth[i] = k;
      }

      /* ── 2. ribbon edges, via a Frenet-ish frame ───────────────────────── */

      const hw = preset.ribbon / preset.span;
      const leftX = new Float64Array(count);
      const leftY = new Float64Array(count);
      const rightX = new Float64Array(count);
      const rightY = new Float64Array(count);

      for (let i = 0; i < count; i++) {
        const prev = (i - 1 + count) % count;
        const next = (i + 1) % count;

        let tx = px[next] - px[prev];
        let ty = py[next] - py[prev];
        let tz = pz[next] - pz[prev];
        const tl = Math.hypot(tx, ty, tz) || 1;
        tx /= tl;
        ty /= tl;
        tz /= tl;

        // binormal = tangent × up
        let bx3 = -tz;
        let bz3 = tx;
        const bl = Math.hypot(bx3, bz3) || 1;
        bx3 /= bl;
        bz3 /= bl;

        // normal = binormal × tangent
        let nx3 = -bz3 * ty;
        let ny3 = bz3 * tx - bx3 * tz;
        let nz3 = bx3 * ty;
        const nl = Math.hypot(nx3, ny3, nz3) || 1;
        nx3 = (nx3 / nl) * hw;
        ny3 = (ny3 / nl) * hw;
        nz3 = (nz3 / nl) * hw;

        const kL = FOCAL / (FOCAL - (pz[i] + nz3));
        const kR = FOCAL / (FOCAL - (pz[i] - nz3));

        leftX[i] = cx + (px[i] + nx3) * kL * radius;
        leftY[i] = cy - (py[i] + ny3) * kL * radius;
        rightX[i] = cx + (px[i] - nx3) * kR * radius;
        rightY[i] = cy - (py[i] - ny3) * kR * radius;
      }

      let minDepth = Infinity;
      let maxDepth = -Infinity;
      for (let i = 0; i < count; i++) {
        if (depth[i] < minDepth) minDepth = depth[i];
        if (depth[i] > maxDepth) maxDepth = depth[i];
      }
      const depthRange = maxDepth - minDepth || 1;

      ctx.globalCompositeOperation = light ? "source-over" : "lighter";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      /* ── 3. ambient halo (card variant only — the hero sits on a veil) ─── */

      if (preset.halo > 0) {
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.15);
        halo.addColorStop(0, rgba(inkCore, Math.min(1, preset.halo * strength)));
        halo.addColorStop(1, rgba(inkCore, 0));
        ctx.fillStyle = halo;
        ctx.fillRect(0, 0, w, h);
      }

      /* ── 4. soft haze, one stroked pass over the centreline ────────────── */

      const path = new Path2D();
      path.moveTo(sx[0], sy[0]);
      for (let i = 1; i < count; i++) path.lineTo(sx[i], sy[i]);
      path.closePath();

      ctx.strokeStyle = rgba(inkCore, Math.min(1, preset.glow[0] * strength));
      ctx.lineWidth = short * 0.085;
      ctx.stroke(path);

      ctx.strokeStyle = rgba(mixRgb(inkCore, inkHighlight, 0.35), Math.min(1, preset.glow[1] * strength));
      ctx.lineWidth = short * 0.036;
      ctx.stroke(path);

      /* ── 5. the ribbon itself: depth-sorted translucent quads ──────────── */

      const order: number[] = [];
      for (let i = 0; i < count; i++) {
        order.push(i);
      }
      order.sort((a, b) => depth[a] - depth[b]);

      const [alphaFar, alphaNear] = preset.alpha;

      for (const i of order) {
        const next = (i + 1) % count;

        const near = clamp((depth[i] - minDepth) / depthRange, 0, 1);

        // light travelling along the ribbon, so the glass reads as moving
        const phase = t * 0.22 + i / count;
        const mix = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);

        const a = Math.min(
          1,
          (alphaFar + (alphaNear - alphaFar) * near * (0.55 + 0.45 * mix)) * strength,
        );

        ctx.fillStyle = rgba(mixRgb(inkCore, inkHighlight, mix * 0.9), a);
        ctx.beginPath();
        ctx.moveTo(leftX[i], leftY[i]);
        ctx.lineTo(rightX[i], rightY[i]);
        ctx.lineTo(rightX[next], rightY[next]);
        ctx.lineTo(leftX[next], leftY[next]);
        ctx.closePath();
        ctx.fill();
      }

      /* ── 6. hot core, so the ribbon reads as light, not as paint ───────── */

      ctx.strokeStyle = rgba(inkHighlight, Math.min(1, 0.4 * strength));
      ctx.lineWidth = Math.max(1, short * 0.0055);
      ctx.stroke(path);

      ctx.globalCompositeOperation = "source-over";
    },
    [variant, core, highlight, followsPage],
  );

  const { ref, ready, paint } = useScene(draw, { fps: PRESETS[variant].fps });

  // The palette is part of the drawing and the frame loop is not guaranteed to
  // be running (hidden tab, reduced motion, a suspended webview), so a theme
  // change repaints once directly.
  useEffect(() => {
    const onTheme = () => paint();
    window.addEventListener(THEME_EVENT, onTheme);
    return () => window.removeEventListener(THEME_EVENT, onTheme);
  }, [paint]);

  return (
    <div
      className={`fx-host photon-knot ${className}`.trim()}
      data-fx={ready ? "on" : "off"}
    >
      <canvas ref={ref} className="fx-canvas" aria-hidden="true" />
    </div>
  );
}
