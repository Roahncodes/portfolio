"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { CloseIcon, MailIcon, MenuIcon, RepeatIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { navItems } from "@/content/profile";
import { sound } from "@/lib/audio";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="rail-nav" aria-label="Sections">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rail-link"
          data-active={isActive(pathname, item.href)}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
          onClick={() => {
            sound.playClick(0.04, 380);
            onNavigate?.();
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function RailBody() {
  return (
    <>
      <div className="rail-body">
        <span className="mono rail-section">Your library</span>
        <p style={{ margin: 0 }}>Ideas in rotation.</p>
        <p style={{ margin: 0 }}>Python, machine learning and things worth building.</p>
      </div>

      <Link href="/connect" className="btn btn-ghost btn-block">
        <MailIcon size={15} />
        Say hello
      </Link>
    </>
  );
}

export function SideRail() {
  const pathname = usePathname();

  // The drawer is remembered per route rather than toggled with an effect:
  // any navigation (link, back button, programmatic) changes `pathname`, which
  // makes `open` false on its own — no setState-in-effect, no cascading render.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const open = openPath === pathname;
  const toggle = () => {
    sound.playClick(0.04, 440);
    setOpenPath(open ? null : pathname);
  };
  const closeDrawer = () => {
    sound.playClick(0.03, 340);
    setOpenPath(null);
  };

  // Touch gesture support: swipe up to dismiss mobile drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (deltaY < -35) {
      // Swiped up
      closeDrawer();
    }
    setTouchStartY(null);
  };

  return (
    <>
      <aside className="rail rail-desktop" aria-label="Artist">
        <div className="rail-top">
          <Link href="/" className="wordmark" aria-label="on repeat. — home">
            <RepeatIcon size={16} />
            on repeat.
          </Link>

          <ThemeToggle />
        </div>

        <NavLinks />

        <div className="rail-spacer" />

        <RailBody />

        <p className="rail-footer">A portfolio, not a playlist.</p>
      </aside>

      <div className="rail-mobile">
        <div className="rail-mobile-bar">
          <Link href="/" className="wordmark" aria-label="on repeat. — home">
            <RepeatIcon size={16} />
            on repeat.
          </Link>

          <div className="rail-mobile-actions">
            <ThemeToggle compact />

            <button
              type="button"
              className="btn btn-ghost"
              style={{
                minHeight: 44,
                minWidth: 44,
                padding: "9px 13px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={toggle}
            >
              {open ? <CloseIcon size={16} /> : <MenuIcon size={16} />}
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span className="mono-sm" style={{ letterSpacing: "0.14em" }}>
                Menu
              </span>
            </button>
          </div>
        </div>

        {open ? (
          <div
            className="rail-mobile-panel"
            id="mobile-nav"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <NavLinks onNavigate={closeDrawer} />
            <div style={{ height: 10 }} />
            <RailBody />
            <p className="rail-footer" style={{ marginTop: 14 }}>
              A portfolio, not a playlist.
            </p>
            {/* Grab handle indicating swipe-up to close */}
            <button
              type="button"
              className="drawer-grab-bar"
              onClick={closeDrawer}
              aria-label="Swipe up or tap to close menu"
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
