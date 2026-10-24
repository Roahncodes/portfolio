"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared canvas plumbing for the hand-built effect components
 * (`photon-knot`, `glyph-orb`, `stipple-type`).
 *
 * Every one of them needs the same things, and getting any of them wrong is what
 * makes canvas effects expensive, invisible or broken:
 *
 *   1. device-pixel-ratio sizing, so the drawing is crisp on a HiDPI screen;
 *   2. a frame loop that actually stops — when the canvas scrolls out of view and
 *      when the tab is hidden;
 *   3. a frame that is painted *synchronously* on mount. Not every environment
 *      runs `requestAnimationFrame`: a hidden or backgrounded webview suspends it
 *      completely, and an effect that only ever draws from rAF stays blank there
 *      forever. So the still frame is drawn during the effect itself, and the
 *      loop is a separate, purely optional upgrade;
 *   4. the same reasoning for the readiness signal — it is delivered in a
 *      microtask, never from rAF, because CSS keys the fade-in off it;
 *   5. `prefers-reduced-motion` handled by keeping that still frame and going
 *      quiet, rather than by hiding the effect.
 *
 * The draw callback is kept in a ref and refreshed after every render, so the
 * loop never restarts just because a closure changed identity.
 */

export type SceneSize = { w: number; h: number };

export type SceneDraw = (ctx: CanvasRenderingContext2D, size: SceneSize, t: number) => void;

export type SceneOptions = {
  /** frame-rate cap; `0` draws on every animation frame */
  fps?: number;
};

/** The static pose every effect renders for reduced motion and first paint. */
export const STILL_T = 0.6;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useScene(draw: SceneDraw, { fps = 0 }: SceneOptions = {}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawRef = useRef(draw);
  const fpsRef = useRef(fps);
  const repaintRef = useRef<() => void>(() => undefined);
  const [ready, setReady] = useState(false);

  // Declared before the scene effect so the callback is always current on mount.
  useEffect(() => {
    drawRef.current = draw;
    fpsRef.current = fps;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let w = 0;
    let h = 0;
    let frame = 0;
    let lastStamp = 0;
    let elapsed = STILL_T;
    let running = false;
    let onScreen = true;
    let origin = 0;
    let disposed = false;
    let announced = false;

    const measure = () => {
      const rect = host.getBoundingClientRect();
      const nextW = Math.max(1, Math.round(rect.width));
      const nextH = Math.max(1, Math.round(rect.height));

      if (nextW === w && nextH === h) return false;

      w = nextW;
      h = nextH;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));

      return true;
    };

    const paint = () => {
      if (disposed) return;
      if (!w || !h) measure();
      if (!w || !h) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
      drawRef.current(ctx, { w, h }, elapsed);
    };

    const announce = () => {
      if (announced || disposed) return;
      announced = true;

      // A microtask, never rAF: CSS waits for this before fading the canvas in,
      // and rAF is not guaranteed to run in a suspended webview.
      Promise.resolve().then(() => {
        if (!disposed) setReady(true);
      });
    };

    const still = () => {
      elapsed = STILL_T;
      paint();
      announce();
    };

    repaintRef.current = () => {
      measure();
      paint();
    };

    const loop = (stamp: number) => {
      if (!running) return;
      frame = window.requestAnimationFrame(loop);

      const cap = fpsRef.current;
      if (cap > 0 && stamp - lastStamp < 1000 / cap - 1) return;
      lastStamp = stamp;

      elapsed = (stamp - origin) / 1000;
      paint();
    };

    const start = () => {
      if (running || disposed) return;
      if (motionQuery.matches || !onScreen || document.visibilityState === "hidden") return;

      // Continue from the pose already on screen, so there is no jump on start.
      origin = performance.now() - elapsed * 1000;
      lastStamp = 0;
      running = true;
      frame = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    // Paint now. `useEffect` runs after layout, so the box is measurable here and
    // the canvas is never an empty rectangle waiting for a compositor.
    still();
    start();

    const resizeObserver = new ResizeObserver(() => {
      if (disposed || !measure()) return;
      paint();
    });
    resizeObserver.observe(host);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        if (onScreen) start();
        else stop();
      },
      { rootMargin: "160px" },
    );
    intersectionObserver.observe(canvas);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMotionChange = () => {
      if (motionQuery.matches) {
        stop();
        still();
      } else {
        start();
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      repaintRef.current = () => undefined;
    };
  }, []);

  /** Repaint on demand — interactive effects call it after they rebuild. */
  const paint = useCallback(() => repaintRef.current(), []);

  return { ref: canvasRef, ready, paint };
}

/* ── small shared maths ────────────────────────────────────────────────────── */

export function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

// Colour helpers live in `@/lib/color` so server components can use them too.
export { deepenRgb, hexToRgb, mixRgb, rgba, type Rgb } from "@/lib/color";
