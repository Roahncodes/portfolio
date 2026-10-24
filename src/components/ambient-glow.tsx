"use client";

import { usePathname } from "next/navigation";

type GlowConfig = {
  c1: string;
  c2: string;
  pos: string;
};

function getGlowForRoute(pathname: string): GlowConfig {
  if (pathname === "/") {
    return {
      c1: "rgba(74, 222, 128, 0.14)",
      c2: "rgba(22, 101, 58, 0.08)",
      pos: "65% 25%",
    };
  }
  if (pathname === "/curiosity") {
    return {
      c1: "rgba(45, 212, 191, 0.13)",
      c2: "rgba(13, 148, 136, 0.08)",
      pos: "50% 30%",
    };
  }
  if (pathname.includes("jetnet-super-resolution")) {
    return {
      c1: "rgba(109, 61, 255, 0.18)",
      c2: "rgba(255, 155, 225, 0.10)",
      pos: "70% 35%",
    };
  }
  if (pathname.includes("python-sessions")) {
    return {
      c1: "rgba(155, 27, 48, 0.18)",
      c2: "rgba(255, 192, 138, 0.12)",
      pos: "70% 35%",
    };
  }
  if (pathname.startsWith("/projects")) {
    return {
      c1: "rgba(109, 61, 255, 0.13)",
      c2: "rgba(74, 222, 128, 0.09)",
      pos: "60% 25%",
    };
  }
  if (pathname === "/notes") {
    return {
      c1: "rgba(245, 158, 11, 0.12)",
      c2: "rgba(180, 83, 9, 0.07)",
      pos: "40% 30%",
    };
  }
  if (pathname === "/resume") {
    return {
      c1: "rgba(56, 189, 248, 0.14)",
      c2: "rgba(2, 132, 199, 0.08)",
      pos: "55% 20%",
    };
  }
  if (pathname === "/connect") {
    return {
      c1: "rgba(74, 222, 128, 0.14)",
      c2: "rgba(34, 197, 94, 0.08)",
      pos: "50% 40%",
    };
  }
  return {
    c1: "rgba(74, 222, 128, 0.12)",
    c2: "rgba(22, 101, 58, 0.07)",
    pos: "60% 25%",
  };
}

export function AmbientGlow() {
  const pathname = usePathname();
  const glow = getGlowForRoute(pathname);

  return (
    <div
      aria-hidden="true"
      className="ambient-glow"
      style={{
        transition: "filter 1.2s ease",
      }}
    >
      <div
        className="ambient-glow-orb"
        style={{
          background: `radial-gradient(circle at ${glow.pos}, ${glow.c1} 0%, ${glow.c2} 42%, transparent 70%)`,
          transition: "background 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}
