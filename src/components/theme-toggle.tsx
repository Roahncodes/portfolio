"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "@/components/use-theme";
import { sound } from "@/lib/audio";
import { applyTheme, type Theme } from "@/lib/theme";

/**
 * The dark/light switch. A two-option segmented control rather than a single
 * switch: with a switch, "off" means nothing on its own, and this site's two
 * rooms are genuinely different places, so both are named.
 *
 * `compact` drops the labels (the mobile bar is narrow) but keeps them for
 * screen readers, so the control never becomes an unlabelled icon pair.
 */
const OPTIONS: { value: Theme; label: string; Icon: typeof SunIcon }[] = [
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "light", label: "Light", Icon: SunIcon },
];

export function ThemeToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const theme = useTheme();

  return (
    <div
      className={`theme-toggle ${className}`.trim()}
      role="group"
      aria-label="Colour theme"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;

        return (
          <button
            key={value}
            type="button"
            className="theme-option"
            data-active={active}
            aria-pressed={active}
            onClick={() => {
              applyTheme(value);
              sound.playClick(0.06, 480);
            }}
          >
            <Icon size={13} />
            {compact ? (
              <span className="sr-only">{label} theme</span>
            ) : (
              <span className="mono-sm theme-option-label">{label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
