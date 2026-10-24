import { ArrowUpRightIcon, PlayIcon } from "@/components/icons";

type TrackRowProps = {
  index: string;
  title: string;
  description: string;
  href: string;
  kind?: string;
  /** renders the row in the "now playing" state */
  live?: boolean;
  /** force the arrow to read as a link-out instead of a play button */
  external?: boolean;
};

/**
 * One row of the track list. Links straight out to the source file so the
 * "playlist" is genuinely explorable.
 */
export function TrackRow({
  index,
  title,
  description,
  href,
  kind,
  live = false,
  external = true,
}: TrackRowProps) {
  const isExternal = external && href.startsWith("http");

  return (
    <a
      className={`track ${live ? "is-live" : ""}`.trim()}
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      <span className="track-play">
        <PlayIcon size={11} />
      </span>

      <span
        className="mono-sm"
        style={{
          color: live ? "var(--accent)" : undefined,
          letterSpacing: "0.08em",
          flex: "none",
        }}
      >
        {index}
        <span style={{ opacity: 0.4 }}>—</span>
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="track-title" style={{ display: "block" }}>
          {title}
        </span>
        <span className="track-desc" style={{ display: "block" }}>
          {description}
        </span>
      </span>

      {kind ? (
        <span
          className="tag mono-sm"
          style={{ flex: "none" }}
          aria-label={`Track type: ${kind}`}
        >
          {kind}
        </span>
      ) : null}

      <span className="track-arrow">
        <ArrowUpRightIcon size={16} />
        <span className="sr-only">Open source</span>
      </span>
    </a>
  );
}
