"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { getTheme, THEME_EVENT, type Theme } from "@/lib/theme";
import { clamp, hexToRgb, mixRgb, rgba, useScene, type Rgb, type SceneDraw } from "./scene";

/**
 * Glyph Orb — a banded ASCII planet turning slowly in the light of a distant sun.
 *
 * Hand-built: for every character cell inside the disc we reconstruct a point on
 * the unit sphere, shade it from a fixed sun direction, wrap latitude bands
 * around it (the bands undulate with longitude, which is what makes the rotation
 * legible), light the limb with a rim term and then quantise the result onto a
 * glyph ramp. Cells below the ramp's floor draw nothing, so the dark half of the
 * planet dissolves into the page instead of sitting there as a grey disc.
 *
 * It is also the one thing on the site you can pick up. A drag is accumulated as
 * a *trackball* rotation — yaw and pitch, in radians, held in refs — and applied
 * in reverse to each cell's surface normal, so the bands and the day/night
 * terminator stay correctly related to each other while the sun itself never
 * moves. The astral stage the orb sits in slides with the pointer and springs
 * home on release, and a flick keeps spinning on decaying velocity, which is
 * what makes the sphere feel like it has mass.
 */

/**
 * Light punctuation only. The heavy text glyphs (`@ # 8 X x +`) are gone, and
 * `*` is the single dense character at the bright end — so the lit limb reads as
 * a band of stars instead of as type.
 */
const RAMP = " .·:-=*";

/**
 * Direction of the distant sun: up and to the left, fairly frontal. Fixed in
 * view space — dragging turns the planet *under* the light, which is the only
 * way the terminator keeps meaning anything.
 */
const SUN_DIR: [number, number, number] = [-0.5, 0.55, 0.67];

/**
 * The planet's ink, per theme.
 *
 * On black the canvas is additive (`lighter`): light is added to the void and
 * the violet/pink pair reads as glow. On paper that inverts — additive light on
 * a white ground is invisible — so the light theme draws *ink* instead: darker,
 * translucent, overlaid source-over, with a pale unlit side that lets the disc
 * dissolve into the page exactly the way the dark one does.
 */
type Ink = {
  /** unlit body */
  deep: Rgb;
  /** the mid tone */
  core: Rgb;
  /** the lit limb, and the distant sun */
  hot: Rgb;
  blend: GlobalCompositeOperation;
  /** scale on the atmosphere, the sun and the limb halo */
  glow: number;
};

const INK: Record<Theme, Ink> = {
  dark: {
    deep: hexToRgb("#2b1a5c"),
    core: hexToRgb("#6d3dff"),
    hot: hexToRgb("#ff9be1"),
    blend: "lighter",
    glow: 1,
  },
  light: {
    deep: hexToRgb("#cfc7f0"),
    core: hexToRgb("#4a1fd2"),
    hot: hexToRgb("#b5238f"),
    blend: "source-over",
    glow: 0.5,
  },
};

/* ── the trackball ────────────────────────────────────────────────────────── */

/**
 * Radians per pixel dragged is `1 / radius` — derived from the planet actually
 * drawn rather than fixed, so the surface moves exactly as far as the finger
 * does, at the centre of the disc, on a 320px phone and a 620px desktop alike.
 * A fixed constant cannot do that: the orb's size is `clamp(320px, 52vw, 620px)`,
 * so the same number is 25% too slow at one end and 40% too fast at the other.
 *
 * Away from the centre it falls off exactly like a real trackball, because the
 * projection does that on its own.
 */
const FALLBACK_RADIUS = 260; // CSS px, if a drag somehow lands before the first draw
/** the pole never tips past this, or the planet reads as sideways */
const MAX_TILT = 0.7;

/**
 * How much of the drag's 1:1 gain a *hover* gets, and how far beyond the disc the
 * pointer still counts. Both are calibrated against the reference recording: the
 * pointer was sweeping up to ~1.7 disc-radii from the centre and the ink kept
 * turning, while the surface travelled about half as far as the pointer did.
 *
 * So: half gain (uniform — the recording shows no strength difference across that
 * band) out to ~2.25 radii, and nothing beyond. A grab stays 1:1 and precise; a
 * hover is a softer stir, and the far corner of the page does not spin the planet.
 */
const HOVER_GAIN = 0.5;
const HOVER_EXTRA = 300; // CSS px beyond the disc's radius

/**
 * Idle drift, radians per second — one slow revolution about every 9 minutes.
 * The recording is authoritative here: across 11 consecutive frames with the
 * pointer parked, the canvas changed by exactly zero pixels. The old 0.062 rad/s
 * moved the surface a couple of pixels in that time, which is the same as saying
 * it never idled. This keeps the planet alive over minutes while being invisible
 * over the length of a gesture.
 */
const IDLE_SPIN = 0.012;
/** how far the stage may follow the pointer, in CSS px */
const MOVE_X = 72;
const MOVE_Y = 54;
/** a flick is capped, so no gesture can spin the planet forever */
const MAX_FLING = 0.02;
/** per-frame decay of the throw; ~0.9 stops a hard flick in about a second */
const FLING_DECAY = 0.9;
/** below this the throw has stopped being visible */
const FLING_FLOOR = 0.00002;

type Drag = {
  pointerId: number;
  /** last pointer position, in client px */
  x: number;
  y: number;
  /** where the drag started, so the stage can be offset from it */
  startX: number;
  startY: number;
  /** the astral stage the orb sits inside, if any — it slides with the pointer */
  stage: HTMLElement | null;
  /** radians per millisecond, for the throw after release */
  spinVel: number;
  tiltVel: number;
  lastStamp: number;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function shade(ink: Ink, lum: number): Rgb {
  if (lum <= 0.75) return mixRgb(ink.deep, ink.core, lum / 0.75);
  return mixRgb(ink.core, ink.hot, clamp((lum - 0.75) / 0.85, 0, 1));
}

export function GlyphOrb({ className = "" }: { className?: string }) {
  const fontRef = useRef("ui-monospace, monospace");
  /** yaw offset in radians — the drag's trackball, on top of the slow auto-spin */
  const spinRef = useRef(0);
  /** pitch offset in radians */
  const tiltRef = useRef(0);
  const dragRef = useRef<Drag | null>(null);
  const glideRef = useRef(0);
  /** last hover position, so a hover turns by the distance the pointer moved */
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  /** the radius of the disc as last drawn, in CSS px — the drag's scale */
  const radiusRef = useRef(FALLBACK_RADIUS);

  const draw = useCallback<SceneDraw>((ctx, { w, h }, t) => {
    // read the theme from the document rather than from React state: the frame
    // loop must never paint a stale palette, and this is one DOM read per frame
    const ink = INK[getTheme()];
    const { core, hot, blend, glow } = ink;

    const short = Math.min(w, h);
    const cx = w / 2;
    const cy = h / 2;
    const radius = (short / 2) * 0.84;
    radiusRef.current = radius;

    const spin = t * IDLE_SPIN + spinRef.current;
    const tilt = tiltRef.current;

    // The trackball is applied in reverse — the object turns, the view does not:
    // yaw first (about the pole), then pitch.
    //
    // The sign matters twice over. The original formulation is
    // `longitude = atan2(u, z) + spin`, so `yaw = -spin` is what makes the
    // auto-spin turn the same way it always did *and* what makes a rightward
    // drag push the surface to the right (the point under the finger stays under
    // the finger). Getting it backwards is a planet that spins against your hand.
    const yaw = -spin;
    const cosPsi = Math.cos(yaw);
    const sinPsi = Math.sin(yaw);
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);

    ctx.globalCompositeOperation = blend;

    /* ── atmosphere: a faint ring of light at the limb ───────────────────── */

    const halo = ctx.createRadialGradient(cx, cy, radius * 0.9, cx, cy, radius * 1.13);
    halo.addColorStop(0, rgba(core, 0));
    halo.addColorStop(0.55, rgba(core, 0.12 * glow));
    halo.addColorStop(1, rgba(core, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);

    /* ── the distant sun: small, faint, sitting where the light comes from ── */

    const sunLength = Math.hypot(SUN_DIR[0], SUN_DIR[1]) || 1;
    const sunX = cx + (SUN_DIR[0] / sunLength) * radius * 1.16;
    const sunY = cy - (SUN_DIR[1] / sunLength) * radius * 1.16;
    // a tight core inside a wide faint halo reads as "distant" — one big soft
    // blob would just look like a smudge on the lens
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius * 0.3);
    sunGlow.addColorStop(0, rgba(hot, 0.55 * glow));
    sunGlow.addColorStop(0.06, rgba(hot, 0.32 * glow));
    sunGlow.addColorStop(0.3, rgba(core, 0.12 * glow));
    sunGlow.addColorStop(1, rgba(core, 0));
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h);

    /* ── the planet ──────────────────────────────────────────────────────── */

    const cols = Math.round(clamp(w / 9, 20, 56));
    const cell = w / cols;
    const rows = Math.max(6, Math.round(h / cell));

    ctx.font = `${(cell * 1.02).toFixed(2)}px ${fontRef.current}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let lastStyle = "";
    let style: string;

    for (let row = 0; row < rows; row++) {
      const y = (row + 0.5) * cell;
      const v = (y - cy) / radius;
      if (v < -1.12 || v > 1.12) continue;

      for (let col = 0; col < cols; col++) {
        const x = (col + 0.5) * cell;
        const u = (x - cx) / radius;
        const d2 = u * u + v * v;
        const vDepth = Math.sqrt(u * u + v * v) || 0;

        // ── outside the disc: a sparse glyph halo hugging the limb
        if (d2 > 1) {
          if (d2 > 1.055 || vDepth > 1.12) continue;

          const ring = 1 - (vDepth - 1) / 0.055;
          const lum = smoothstep(-0.1, 0.9, u * SUN_DIR[0] + -v * SUN_DIR[1] + 0.35) * ring;
          if (lum < 0.22) continue;

          style = rgba(core, lum * 0.34);
          if (style !== lastStyle) {
            ctx.fillStyle = style;
            lastStyle = style;
          }
          ctx.fillText("·", x, y);
          continue;
        }

        // ── a point on the unit sphere
        //
        // `(u, north, z)` is the *view-space* surface normal. It is what the
        // fixed sun is measured against, so it must not be rotated. The
        // trackball is applied to it in reverse to answer the other question —
        // which point of the planet is being seen here — and only the texture
        // (bands, latitude, longitude) is read off that.
        const north = -v;
        const z = Math.sqrt(Math.max(0, 1 - d2));

        const ny = north * cosTilt + z * sinTilt;
        const nz1 = -north * sinTilt + z * cosTilt;
        const nx2 = u * cosPsi - nz1 * sinPsi;
        const nz2 = u * sinPsi + nz1 * cosPsi;

        const longitude = Math.atan2(nx2, nz2);

        // latitude bands, rippled by longitude so the spin is visible
        const latitude = Math.asin(clamp(ny, -1, 1)) + 0.07 * Math.sin(longitude * 3.1 + 0.8);

        const belt = Math.sin(latitude * 7.2 + 0.6);
        const fine = Math.sin(latitude * 15.5 - 1.1);
        const swirl = 0.5 + 0.5 * Math.sin(longitude * 2.3 + latitude * 3.1);

        const band = clamp(0.72 + 0.2 * belt + 0.12 * fine + 0.1 * swirl, 0, 1.25);

        // ── lighting from the fixed sun
        //
        // The `0.18 +` floor keeps the unlit side readable as glyphs instead of
        // letting it fall to nothing: a sphere that fades out entirely stops
        // looking like a sphere. The rim term is deliberately strong — the limb
        // is what sells "planet" rather than "text in a circle".
        const lambert = u * SUN_DIR[0] + north * SUN_DIR[1] + z * SUN_DIR[2];
        const day = smoothstep(-0.25, 0.4, lambert);
        const rim = Math.pow(1 - z, 3.2) * (0.75 + 0.25 * day);
        const spec = Math.pow(Math.max(lambert, 0), 26) * 0.85;

        const lum = band * (0.18 + 0.82 * day) * 1.2 + rim * 0.75 + spec;
        if (lum < 0.1) continue;

        const index = clamp(Math.round(lum * (RAMP.length - 1)), 1, RAMP.length - 1);
        const glyph = RAMP[index];
        if (glyph === " ") continue;

        const alpha = clamp(0.35 + lum * 0.85, 0, 1);
        style = rgba(shade(ink, Math.min(lum, 1.6)), alpha);
        if (style !== lastStyle) {
          ctx.fillStyle = style;
          lastStyle = style;
        }

        ctx.fillText(glyph, x, y);
      }
    }

    ctx.globalCompositeOperation = "source-over";
  }, []);

  const { ref, ready, paint } = useScene(draw, { fps: 30 });

  // The stack is published on the canvas itself by CSS (`.glyph-orb`), so this
  // is the resolved next/font family rather than a guess at its generated name.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const family = window.getComputedStyle(element).fontFamily;
    if (family) fontRef.current = family;
  }, [ref]);

  // The palette is part of the drawing and the frame loop is not guaranteed to
  // be running (hidden tab, reduced motion, a suspended webview), so a theme
  // change repaints once directly.
  useEffect(() => {
    const onTheme = () => paint();
    window.addEventListener(THEME_EVENT, onTheme);
    return () => window.removeEventListener(THEME_EVENT, onTheme);
  }, [paint]);

  /* ── the trackball: pointer handling ───────────────────────────────────── */

  const stopGlide = useCallback(() => {
    if (glideRef.current) {
      window.cancelAnimationFrame(glideRef.current);
      glideRef.current = 0;
    }
  }, []);

  useEffect(() => stopGlide, [stopGlide]);

  /**
   * The planet follows the pointer, no button needed.
   *
   * The listening zone is the whole hero rather than the orb's own box, because
   * that is where the reference shows the ink reacting: the pointer spent most of
   * the gesture outside the disc and the planet kept turning. Two guards keep it
   * from becoming noise — it is mouse-only (a finger dragging the page is a
   * scroll, not a gesture at the sky), and it stands down while a grab is live,
   * so the two never fight over the same radians.
   */
  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    const zone: HTMLElement = host.closest<HTMLElement>(".hero") ?? host.parentElement ?? host;

    const onHover = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || dragRef.current) return;

      const last = hoverRef.current;
      hoverRef.current = { x: event.clientX, y: event.clientY };
      if (!last) return;

      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      if (!dx && !dy) return;

      const radius = radiusRef.current;

      const rect = host.getBoundingClientRect();
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      if (Math.hypot(event.clientX - centreX, event.clientY - centreY) > radius + HOVER_EXTRA) {
        return;
      }

      const perPixel = HOVER_GAIN / radius;
      spinRef.current -= dx * perPixel;
      tiltRef.current = clamp(tiltRef.current + dy * perPixel, -MAX_TILT, MAX_TILT);
      paint();
    };

    const onLeave = () => {
      hoverRef.current = null;
    };

    zone.addEventListener("pointermove", onHover, { passive: true });
    zone.addEventListener("pointerleave", onLeave);

    return () => {
      zone.removeEventListener("pointermove", onHover);
      zone.removeEventListener("pointerleave", onLeave);
    };
  }, [paint, ref]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const host = event.currentTarget;
      const stage = host.closest<HTMLElement>(".astral");

      stopGlide();

      dragRef.current = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startX: event.clientX,
        startY: event.clientY,
        stage,
        spinVel: 0,
        tiltVel: 0,
        lastStamp: event.timeStamp,
      };

      host.dataset.dragging = "true";
      if (stage) stage.dataset.dragging = "true";

      // Capture keeps the drag alive when the pointer leaves the box. It can
      // legitimately throw (the pointer may already be gone), and the drag works
      // without it — so the state is committed above and this stays optional.
      try {
        host.setPointerCapture(event.pointerId);
      } catch {
        /* drag continues uncaptured */
      }
    },
    [stopGlide],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.x = event.clientX;
      drag.y = event.clientY;

      const elapsed = Math.max(1, event.timeStamp - drag.lastStamp);
      drag.lastStamp = event.timeStamp;

      // dragging right turns the surface right; dragging down brings the north
      // pole toward the viewer — in both cases the point under the finger stays
      // under the finger, ~1:1 at the centre of the disc
      const perPixel = 1 / radiusRef.current;
      const dSpin = -dx * perPixel;
      const dTilt = dy * perPixel;

      spinRef.current += dSpin;
      tiltRef.current = clamp(tiltRef.current + dTilt, -MAX_TILT, MAX_TILT);

      drag.spinVel = clamp(dSpin / elapsed, -MAX_FLING, MAX_FLING);
      drag.tiltVel = clamp(dTilt / elapsed, -MAX_FLING, MAX_FLING);

      if (drag.stage) {
        const offsetX = clamp(event.clientX - drag.startX, -MOVE_X, MOVE_X);
        const offsetY = clamp(event.clientY - drag.startY, -MOVE_Y, MOVE_Y);
        drag.stage.style.transform = `translate3d(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px, 0)`;
      }

      // repaint now rather than at the next frame: the loop is up to 33ms behind
      // the finger at 30fps, and in a suspended webview it may not run at all
      paint();
    },
    [paint],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;

      const host = event.currentTarget;
      delete host.dataset.dragging;
      try {
        if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
      } catch {
        /* nothing to release */
      }

      if (drag.stage) {
        delete drag.stage.dataset.dragging;
        drag.stage.style.transform = ""; // the CSS transition springs it home
      }

      let spinVel = drag.spinVel;
      let tiltVel = drag.tiltVel;
      if (Math.abs(spinVel) < FLING_FLOOR && Math.abs(tiltVel) < FLING_FLOOR) return;

      let last = performance.now();

      const step = (now: number) => {
        const delta = clamp(now - last, 1, 48);
        last = now;

        // decay per 16.7ms of real time, so the throw lasts the same wall-clock
        // time whether the screen is 60Hz or 120Hz
        const decay = Math.pow(FLING_DECAY, delta / 16.7);
        spinVel *= decay;
        tiltVel *= decay;

        spinRef.current += spinVel * delta;
        tiltRef.current = clamp(tiltRef.current + tiltVel * delta, -MAX_TILT, MAX_TILT);
        paint();

        glideRef.current =
          Math.abs(spinVel) > FLING_FLOOR || Math.abs(tiltVel) > FLING_FLOOR
            ? window.requestAnimationFrame(step)
            : 0;
      };

      glideRef.current = window.requestAnimationFrame(step);
    },
    [paint],
  );

  return (
    <div
      className={`fx-host glyph-orb ${className}`.trim()}
      data-fx={ready ? "on" : "off"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <canvas ref={ref} className="fx-canvas" aria-hidden="true" />
    </div>
  );
}
