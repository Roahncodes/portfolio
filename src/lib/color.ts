/**
 * Colour helpers shared by the canvas effects and the album covers.
 *
 * Deliberately not inside `components/fx/`: those modules are client components
 * ("use client"), and a server component cannot call a plain function out of a
 * client module. This file has no directive, so both sides can use it.
 */

export type Rgb = [number, number, number];

/** `#6d3dff` → `[109, 61, 255]`. Falls back to the given colour on bad input. */
export function hexToRgb(hex: string, fallback: Rgb = [74, 222, 128]): Rgb {
  const value = hex.trim().replace(/^#/, "");

  const expanded =
    value.length === 3
      ? value
          .split("")
          .map((character) => character + character)
          .join("")
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return fallback;

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ];
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function rgba(c: Rgb, alpha: number) {
  return `rgba(${Math.round(c[0])}, ${Math.round(c[1])}, ${Math.round(c[2])}, ${alpha.toFixed(3)})`;
}

/* ── light-theme ink ──────────────────────────────────────────────────────── */

function rgbToHsl(c: Rgb): [number, number, number] {
  const r = c[0] / 255;
  const g = c[1] / 255;
  const b = c[2] / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return [0, 0, l];

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;

  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): Rgb {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const channel = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };

  return [
    Math.round(channel(h + 1 / 3) * 255),
    Math.round(channel(h) * 255),
    Math.round(channel(h - 1 / 3) * 255),
  ];
}

/**
 * The same colour as ink: same hue, less light. `amount` 0 leaves it alone, 1
 * blackens it.
 *
 * Straight channel scaling is what you would reach for first, and it is what
 * turns a pastel into grey mud — saturation and lightness are not independent.
 * Going through HSL keeps the hue honest and nudges saturation up on the way
 * down, so `#ff9be1` becomes a deep pink rather than a dusty one. That matters
 * because the light theme draws these colours as translucent ink on paper
 * instead of as light added to black.
 */
export function deepenRgb(c: Rgb, amount: number): Rgb {
  const [h, s, l] = rgbToHsl(c);
  return hslToRgb([h, Math.min(1, s * 1.18), Math.max(0, Math.min(1, l * (1 - amount)))]);
}
