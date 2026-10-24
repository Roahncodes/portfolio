import { rotationStrip } from "@/content/profile";

/** The scrolling ticker of tools — the "now in rotation" list, twice for seamlessness. */
export function Strip() {
  const items = [...rotationStrip, ...rotationStrip];

  return (
    <div className="strip" aria-hidden="true">
      <div className="strip-track">
        {items.map((item, index) => (
          <span className="strip-item mono-sm" key={`${item}-${index}`}>
            {item}
            <span className="dot" style={{ opacity: 0.5 }} />
          </span>
        ))}
      </div>
    </div>
  );
}
