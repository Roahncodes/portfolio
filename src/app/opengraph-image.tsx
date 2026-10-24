import { ImageResponse } from "next/og";

import { profile } from "@/content/profile";

export const alt = `${profile.name} — on repeat.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card. Same visual language as the site: near-black, one green orb,
 * tight display type, mono labels.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050706",
          padding: "64px 72px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* orb */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -60,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(140,255,190,0.85) 0%, rgba(74,222,128,0.45) 26%, rgba(20,90,50,0.28) 52%, rgba(5,7,6,0) 72%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#4ade80" }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "2px solid #4ade80",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 24, letterSpacing: 2 }}>on repeat.</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 20,
              letterSpacing: 6,
              color: "#4a574f",
              marginBottom: 22,
            }}
          >
            INDEPENDENT BUILDER
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: -5,
              lineHeight: 1,
              color: "#e9f2eb",
            }}
          >
            {`${profile.firstName} ${profile.lastName}`}
          </div>
          <div style={{ fontSize: 30, color: "#7e8f84", marginTop: 22 }}>
            {profile.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 20,
            letterSpacing: 3,
            color: "#4a574f",
          }}
        >
          <div>{`${profile.handle.toUpperCase()} / GITHUB`}</div>
          <div>ALBUMS · TRACKS · LINER NOTES</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
