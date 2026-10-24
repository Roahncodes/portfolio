"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** stagger, in milliseconds */
  delay?: number;
  as?: ElementType;
  className?: string;
};

/* ────────────────────────────────────────────────────────────────────────────
   One shared scroll scheduler for every <Reveal> on the page.

   IntersectionObserver alone is not enough here: a fast scroll, a jump to the
   bottom of the page, or landing on a `#hash` can skip past an element without
   ever reporting it as intersecting, leaving the content stuck at opacity 0.
   The rule below is therefore positional rather than event-based —
   "reveal once the top edge is above 92% of the viewport height", which also
   holds true for anything already scrolled past.
   ──────────────────────────────────────────────────────────────────────────── */

type Registration = { element: HTMLElement; show: () => void };

const registrations = new Set<Registration>();
let frame = 0;
let listening = false;

function sweep() {
  frame = 0;
  const limit = window.innerHeight * 0.92;

  for (const registration of registrations) {
    const rect = registration.element.getBoundingClientRect();

    // above the viewport (scrolled past) OR about to enter it
    if (rect.top < limit) {
      registration.show();
      registrations.delete(registration);
    }
  }

  if (registrations.size === 0) stopListening();
}

function schedule() {
  if (frame) return;
  frame = window.requestAnimationFrame(sweep);
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function stopListening() {
  if (!listening) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
}

export function Reveal({ children, delay = 0, as, className = "" }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const registration: Registration = { element, show: () => setShown(true) };
    registrations.add(registration);
    startListening();
    schedule();

    return () => {
      registrations.delete(registration);
      if (registrations.size === 0) stopListening();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
