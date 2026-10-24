"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_THEME, getTheme, subscribeTheme, type Theme } from "@/lib/theme";

/** Stable server snapshot — the same value the layout renders into `<html>`. */
function serverTheme(): Theme {
  return DEFAULT_THEME;
}

/**
 * The live theme, as a React value.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` for the usual
 * reason: the theme can change from outside this component (another tab) and
 * the pre-paint script has already set it before React runs, so there is nothing
 * to synchronise *after* mount — which also means no mismatch warning when the
 * visitor's saved theme is light while the server rendered dark.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, getTheme, serverTheme);
}
