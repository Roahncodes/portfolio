import type { SVGProps } from "react";

/**
 * Hand-rolled icon set — stroke based, 1.6px, sized from `font-size` via `1em`.
 * Dependency-free on purpose: the whole set costs less than one icon library.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Svg({ size = "1em", children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function PlayIcon({ filled = true, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...props}>
      <path
        d="M8.5 5.6v12.8a.9.9 0 0 0 1.37.77l10.1-6.4a.9.9 0 0 0 0-1.54L9.87 4.83A.9.9 0 0 0 8.5 5.6Z"
        fill={filled ? "currentColor" : "none"}
        strokeWidth={filled ? 0 : 1.6}
      />
    </Svg>
  );
}

export function PauseIcon({ filled = true, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...props}>
      <rect x="7" y="5" width="3.4" height="14" rx="1.2" fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : 1.6} />
      <rect x="13.6" y="5" width="3.4" height="14" rx="1.2" fill={filled ? "currentColor" : "none"} strokeWidth={filled ? 0 : 1.6} />
    </Svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2.6" />
      <path d="m3.6 6.9 7.1 5.2a2.2 2.2 0 0 0 2.6 0l7.1-5.2" />
    </Svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7.5 16.5 16.5 7.5" />
      <path d="M9.2 7.5h7.3v7.3" />
    </Svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </Svg>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <Svg strokeWidth={1.4} {...props}>
      <path d="M9.3 20.4c-4.4 1.3-4.4-2.2-6.2-2.7m12.4 5.1v-3.6c0-1 .1-1.4-.5-2 2.5-.3 4.9-1.2 4.9-5.4a4.2 4.2 0 0 0-1.2-2.9 3.9 3.9 0 0 0-.1-2.9s-1-.3-3.2 1.2a11 11 0 0 0-5.8 0C7.4 5.7 6.4 6 6.4 6a3.9 3.9 0 0 0-.1 2.9 4.2 4.2 0 0 0-1.2 2.9c0 4.2 2.4 5.1 4.9 5.4-.5.5-.6 1-.5 1.6v3.9" />
    </Svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <Svg strokeWidth={1.4} {...props}>
      <rect x="2.9" y="2.9" width="18.2" height="18.2" rx="3.4" />
      <path d="M7.4 10.4v6.2" />
      <path d="M7.4 7.6v.02" />
      <path d="M11.4 16.6v-3.4a2.6 2.6 0 0 1 5.2 0v3.4" />
      <path d="M11.4 10.4v6.2" />
    </Svg>
  );
}

export function SpotifyIcon(props: IconProps) {
  return (
    <Svg strokeWidth={1.4} {...props}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M7.4 9.3c3-.9 6.3-.6 9 .9" />
      <path d="M8 12.4c2.5-.7 5.1-.4 7.3.8" />
      <path d="M8.6 15.3c1.9-.5 3.8-.3 5.5.6" />
    </Svg>
  );
}

export function HeadphonesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.4 15v-3a7.6 7.6 0 1 1 15.2 0v3" />
      <path d="M4.4 14.2h1.9a1.4 1.4 0 0 1 1.4 1.4v2.6a1.4 1.4 0 0 1-1.4 1.4H5.6a1.2 1.2 0 0 1-1.2-1.2Z" />
      <path d="M19.6 14.2h-1.9a1.4 1.4 0 0 0-1.4 1.4v2.6a1.4 1.4 0 0 0 1.4 1.4h.7a1.2 1.2 0 0 0 1.2-1.2Z" />
    </Svg>
  );
}

export function MusicIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 18V6.6l9-1.8v11" />
      <circle cx="6.4" cy="18" r="2.6" />
      <circle cx="15.4" cy="15.8" r="2.6" />
    </Svg>
  );
}

export function AlbumIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9.2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 2.8v3.2M12 18v3.2" />
    </Svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21.2s6.4-5.2 6.4-10.4a6.4 6.4 0 1 0-12.8 0C5.6 16 12 21.2 12 21.2Z" />
      <circle cx="12" cy="10.6" r="2.3" />
    </Svg>
  );
}

export function GraduationIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.8 9.4 12 5l9.2 4.4L12 13.8Z" />
      <path d="M6.4 11.4v4.2c0 1.4 2.5 2.6 5.6 2.6s5.6-1.2 5.6-2.6v-4.2" />
    </Svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.2v3.4M12 17.4v3.4M3.2 12h3.4M17.4 12h3.4" />
      <path d="M6.3 6.3 8.6 8.6M15.4 15.4l1.7 1.7M17.7 6.3l-2.3 2.3M8.6 15.4l-1.7 1.7" />
    </Svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9.2" y="9.2" width="11.4" height="11.4" rx="2.4" />
      <path d="M6.6 14.8H5.6a2.4 2.4 0 0 1-2.4-2.4V5.6a2.4 2.4 0 0 1 2.4-2.4h6.8a2.4 2.4 0 0 1 2.4 2.4v1" />
    </Svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.6v11.2" />
      <path d="m7.4 10.4 4.6 4.6 4.6-4.6" />
      <path d="M4.4 18.2v1.2a1.4 1.4 0 0 0 1.4 1.4h12.4a1.4 1.4 0 0 0 1.4-1.4v-1.2" />
    </Svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.6 12s3.5-6.4 9.4-6.4S21.4 12 21.4 12s-3.5 6.4-9.4 6.4S2.6 12 2.6 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </Svg>
  );
}

export function DocumentIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.4 3.4H7.2a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h9.6a2 2 0 0 0 2-2V8.8Z" />
      <path d="M13.4 3.4v4.2a1.2 1.2 0 0 0 1.2 1.2h4.2" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m4.8 12.6 4.6 4.6 9.8-10.4" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.8 7h16.4M3.8 12h16.4M3.8 17h16.4" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function RingDotIcon({ size = "1em", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth={1.5} />
      <circle cx="8" cy="8" r="2.1" fill="currentColor" />
    </svg>
  );
}

export function RepeatIcon({ size = "1em", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth={1.5} opacity="0.55" />
      <circle cx="8" cy="8" r="2.4" fill="currentColor" />
      <path
        d="M8 1.7a6.3 6.3 0 0 1 6.3 6.3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── the theme toggle ─────────────────────────────────────────────────────── */

/** Sun: the disc, plus eight rays that stop short of it. */
export function SunIcon({ size = "1em", ...props }: IconProps) {
  return (
    <Svg size={size} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6" />
    </Svg>
  );
}

/** Moon: a crescent cut with a single arc, the same 24-box as the rest. */
export function MoonIcon({ size = "1em", ...props }: IconProps) {
  return (
    <Svg size={size} {...props}>
      <path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.6 8.6 0 1 0 10.7 10.7Z" />
    </Svg>
  );
}

/* ── music player dock icons ─────────────────────────────────────────────── */

export function SkipBackIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" strokeWidth={0} />
      <line x1="5" y1="19" x2="5" y2="5" strokeWidth={2} />
    </Svg>
  );
}

export function SkipForwardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" strokeWidth={0} />
      <line x1="19" y1="5" x2="19" y2="19" strokeWidth={2} />
    </Svg>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <Svg strokeWidth={1.7} {...props}>
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="m15 15 6 6" />
      <path d="m4 4 5 5" />
    </Svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" strokeWidth={0} />
      <path d="M15.5 8.5a4.8 4.8 0 0 1 0 7" />
      <path d="M18.8 5.2a9.2 9.2 0 0 1 0 13.6" />
    </Svg>
  );
}

export function VolumeMuteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" strokeWidth={0} />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </Svg>
  );
}

export function DiscIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function GuestbookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10M6 10h10M6 14h6" />
      <circle cx="18" cy="18" r="3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function PrinterIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </Svg>
  );
}

export function AwardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="6" />
      <polyline points="8.21 13.89 7 22 12 19 17 22 15.79 13.88" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function StarIcon({ filled = true, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Svg {...props}>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill={filled ? "currentColor" : "none"}
        strokeWidth={filled ? 0 : 1.6}
      />
    </Svg>
  );
}

