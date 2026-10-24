/**
 * The colour-theme contract, shared by both sides of the app.
 *
 * Deliberately not inside `components/` and deliberately without `"use client"` —
 * the same reason `src/lib/color.ts` exists: the root layout is a *server*
 * component and needs these values for the pre-paint script, while the toggle
 * and the canvas effects are client components. A module with no directive can
 * be read by both; a client module cannot be read by a server component.
 *
 * The theme lives on `<html data-theme="dark|light">` — an attribute rather than
 * a class, so it cannot collide with Tailwind's class list and so CSS can key off
 * `:root[data-theme="light"]`. It is remembered in `localStorage` and written
 * onto `<html>` by `THEME_BOOTSTRAP` *before* the first paint, which is what
 * keeps a light-theme visitor from seeing a dark flash on every navigation.
 */

export type Theme = "dark" | "light";

/** The site is a dark room by default; light is opt-in. */
export const DEFAULT_THEME: Theme = "dark";

export const THEME_KEY = "on-repeat:theme";

/** Fired on `window` whenever the theme is applied, so every subscriber repaints. */
export const THEME_EVENT = "on-repeat:themechange";

/**
 * Browser chrome colour (the address bar tint on mobile) per theme. Must track
 * `--bg` in `globals.css`: the light room is sunlit cream by design, not white.
 */
export const THEME_COLORS: Record<Theme, string> = {
  dark: "#050706",
  light: "#fff3e2",
};

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

/** The theme currently painted, read straight off the document. */
export function getTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  const value = document.documentElement.dataset.theme;
  return isTheme(value) ? value : DEFAULT_THEME;
}

/** The visitor's saved preference, or `null` if they have never chosen. */
export function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_KEY);
    return isTheme(value) ? value : null;
  } catch {
    // storage can be unavailable (private mode, blocked cookies). The attribute
    // still works for the current page; the choice just will not be remembered.
    return null;
  }
}

function paintThemeColor(theme: Theme) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
}

/** Paint a theme, remember it, and tell every subscriber. Used by the toggle. */
export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  paintThemeColor(theme);

  // only write when it actually changes: writing the same value back would
  // bounce another `storage` event around the other tabs for nothing
  if (readStoredTheme() !== theme) {
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* see readStoredTheme */
    }
  }

  window.dispatchEvent(new Event(THEME_EVENT));
}

/**
 * External-store subscription for `useSyncExternalStore`.
 *
 * The `storage` event only fires in the *other* tabs. It does not just notify:
 * the preference is global, so the tab adopts it too, rather than showing a
 * toggle in the new position while still painting the old room.
 */
export function subscribeTheme(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_KEY) return;

    const next = readStoredTheme();
    if (next && next !== getTheme()) applyTheme(next);
    else listener();
  };

  window.addEventListener(THEME_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(THEME_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * The pre-paint script. Inlined into `<head>` by the root layout.
 *
 * It has to be a string rather than a React component: React would render it
 * after hydration, and "after hydration" is several frames too late — the whole
 * point is that the attribute exists before the first pixel. It is intentionally
 * tiny and dependency-free, and it also tints the `theme-color` meta (retrying
 * on DOMContentLoaded, because Next emits that meta itself and the exact order
 * of head tags is not something to rely on).
 */
export const THEME_BOOTSTRAP = `(function(){try{
var k=${JSON.stringify(THEME_KEY)};
var t=localStorage.getItem(k)==="light"?"light":"dark";
var r=document.documentElement;
r.setAttribute("data-theme",t);
var c=${JSON.stringify(THEME_COLORS)};
function m(){var e=document.querySelector('meta[name="theme-color"]');if(e)e.setAttribute("content",c[t]);}
m();
document.addEventListener("DOMContentLoaded",m);
}catch(e){}})();`;
