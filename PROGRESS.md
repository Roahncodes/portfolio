# PROGRESS — "on repeat." · Spotify-themed portfolio for Rohan Dabhade

> **Read this file first when resuming. It is the single source of truth.**
> Update the checkbox table at the end of every step, and append to the step log in
> `MEMORY/step-log.md`. Each step has its own detailed note in `MEMORY/`.

---

## 0. How to resume after running out of tokens

Paste this to the agent:

> Read `PROGRESS.md` and `MEMORY/step-log.md`, then continue from the first step whose
> status is not ✅. Do not redo completed steps unless a verification fails.

Then run the resume check:

```bash
npm run resume        # typecheck + prints the next incomplete step
```

---

## 1. What is being built

A single-artist, multi-page portfolio styled as a **music streaming app** ("on repeat.").
Reference screenshots (theme, copy tone and layout) live in `MEMORY/design-reference.md`.

Key visual language:

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#050706` | page background |
| `--bg-sidebar` | `#030504` | left rail |
| `--surface` | `#0c110d` | cards / panels |
| `--surface-2` | `#111813` | hover / nested cards |
| `--line` | `rgba(255,255,255,0.07)` | hairlines |
| `--line-accent` | `rgba(74,222,128,0.2)` | green hairlines |
| `--accent` | `#4ade80` | neon spring green |
| `--accent-bright` | `#5cf29a` | buttons / hover |
| `--text` | `#e9f2eb` | primary text |
| `--muted` | `#7e8f84` | secondary text |
| `--dim` | `#4a574f` | labels |
| Display font | Inter (400–900, tracking `-0.045em`) | headlines |
| Mono font | JetBrains Mono (500, uppercase, tracking `.18em`) | eyebrow labels |

"Astral" treatment = a large green radial orb with layered blurred glows, slow drift
animation, fine star field, and a soft spherical bloom behind the big type.

---

## 2. Routes

| Route | Screenshot name | Contents |
| --- | --- | --- |
| `/` | Artist home | Astral hero, name, tagline, CTA pair, "Behind the tracks" bio, **Last song listened** card |
| `/curiosity` | Curiosity. | Giant "Curiosity." headline, artist note, "Currently studying" card, **Skills in rotation**, "Learning outside the classroom" |
| `/projects` | Built. Not shuffled. | Two **albums** in rotation + "Every track, one place" full track index |
| `/projects/[slug]` | Project album | `J/01` badge, album meta, **Open repository** button, **Track list**, "Behind this album" |
| `/resume` | The paperwork | One-page resume: **download**, inline **preview**, and a summary of what's on it |
| `/notes` | Liner notes | Short-form notes / certifications / hackathons |
| `/connect` | Say hello | Contact + social links, generated from `profile.socials` |

---

## 3. Data model

Everything is typed in `src/content/` and derived from the real sources below — no lorem ipsum.

```
src/content/profile.ts    -> identity, bio, socials, skills, experience, certifications
src/content/albums.ts     -> album (repo) + track (file/project) definitions
```

**Sources used (verified via API):**

- Resume: `C:\Users\rohan\Downloads\Resume.pdf` (extracted with `scripts/extract-resume.mjs`)
- GitHub: `Roahncodes/JetNet-SuperRes-PFlow`, `Roahncodes/Python-Projects`
- LinkedIn: https://www.linkedin.com/in/rohan-dabhade

---

## 4. Step checklist

| # | Step | Status |
| --- | --- | --- |
| 00 | Recon: resume text + GitHub repo/file inventory | ✅ |
| 01 | Scaffold Next.js + Tailwind + design tokens + memory files | ✅ |
| 02 | Content data layer (profile, skills, albums, tracks) | ✅ |
| 03 | App shell: sidebar rail, mobile nav, page frame | ✅ |
| 04 | Artist home page (astral hero, bio, last-song card) | ✅ |
| 05 | Curiosity page (intro + skills, oversized astral layout) | ✅ |
| 06 | Discography page (albums + full track index) | ✅ |
| 07 | Album detail pages per project | ✅ |
| 08 | Spotify integration (OAuth + now-playing + fallbacks) | ✅ |
| 09 | Liner notes + Say hello pages | ✅ |
| 10 | Motion polish, responsive pass, accessibility | ✅ |
| 11 | Verification: typecheck, build, dev-server checks | ✅ |
| 12 | Deploy guide (Vercel) + README + .env.example | ✅ |
| 13 | Final completion check: lint repaired at the cause | ✅ |
| 14 | Photon Knot, Glyph Orb, Stipple Type (hand-built equivalents) | ✅ |
| 15 | Résumé page · per-album palettes · violet orb · contact links · tablet & phone pass | ✅ |
| 16 | Fresh-server re-verification · dev-hydration bug (`allowedDevOrigins`) repaired | ✅ |
| 17 | Orb raised + draggable · dark/light theme · run-from-IDE path (`C:\Users\rohan\portfolio`) | ✅ |
| 18 | Beige light room · orb calibrated to the reference recording (hover + slower idle) | ✅ |
| 19 | Next.js 16.4.3 security patch · `experimental.agentUpgrade` · stored upgrade runbook | ✅ |
| 20 | Sunrise light room · `RD` monogram and Next dev badge removed | ✅ |
| 21 | Player dock auto-scroll repair (instant scroll + 33ms ticker) | ✅ |
| 22 | Supplied resume installed (PDF master + 200 DPI PNG preview) | ✅ |
| 23 | Soundtrack: five CC BY 4.0 tracks, real playback with the auto-scroll, credits | ✅ |
| 24 | Guestbook: seeded reviews removed, MongoDB pending/approved store, Atlas runbook | 🔄 |

Legend: ⬜ todo · 🔄 in progress · ✅ done · ⚠️ blocked (see step log)

### STEP 14 — the three effects, hand-built

The React Bits Pro registry is a paid tier and no license key exists on this machine, so
the three components were **written from scratch instead** (the user's choice) — no
animation dependency, nothing added to `package.json`. See `src/components/fx/`:

| Effect | Placed at |
| --- | --- |
| Photon Knot | `/projects` hero backdrop + inside every album cover (cards *and* album detail) |
| Glyph Orb | the planet in the home hero's astral treatment (`<Astral core>`) |
| Stipple Type | the artist name on the home page |

`components.json` is still in place, wired exactly as the docs describe, so the paid
components remain a one-command install if a key ever appears:

```bash
# .env.local → REACTBITS_LICENSE_KEY=<key from pro.reactbits.dev → Account>
npx shadcn@latest add @reactbits-starter/photon-knot-tw
```

**Remaining known limitation:** the agent host could not capture
browser screenshots (the preview webview never composited), so the visual pass was
verified through measured layout/computed-style audits and canvas pixel readback instead
of images — see `MEMORY/step-log.md`, STEP 11 and STEP 14. The three canvas effects are
*motion-unverified*: the preview webview suspends `requestAnimationFrame`, so only their
still frames could be measured. Open the site in a real browser to see them move.

### STEP 16 — re-verification, and the dev-hydration bug

Everything from STEP 15 was re-checked from scratch on a freshly started dev server, and
one real defect turned up that STEP 15 could not have seen:

**Next 16 blocks its own dev resources for unlisted origins, and that silently disables
hydration.** Open the site at `http://127.0.0.1:3000` (the host the Spotify redirect URI
uses) and the page renders — it is server-rendered HTML — but nothing is interactive: no
mobile drawer, no resume preview toggle, and the canvases stay at their default 300×150
with `data-fx="off"`. The server log said it plainly:

```
⚠ Blocked cross-origin request to Next.js dev resource /_next/hmr from "127.0.0.1".
```

`next.config.ts` now carries `allowedDevOrigins: ["127.0.0.1", "localhost"]`. Confirmed
fixed: `[HMR] connected`, `data-fx="on"`, orb canvas 570×570, drawer and preview toggle
both functional. The production build was never affected — which is exactly why this
survived STEP 15.

Also re-verified, with the artefacts themselves rather than the code that makes them:

| Check | Result |
| --- | --- |
| `rohan-dabhade-resume.pdf` structure | 9/9: header, xref (7 entries, free head 0/65535/f), every offset lands on its own `n 0 obj`, image stream exactly `/Length` bytes, inflates to 1654×2339×3 = 11,606,118, A4 page box 595.28×841.89 (ratio 0.7071), content stream `q 595.28 0 0 841.89 0 0 cm /Im0 Do Q`, trailer + `%%EOF` |
| Download path in the browser | the anchor's `href` returns 200 `application/pdf`, magic `%PDF-1.4`, 250154 B, `download="Rohan-Dabhade-Resume.pdf"` |
| Glyph Orb pixels | brightest ink `#ff9be1` exact, deepest `#673dff`/`#6f3dff` ≈ `#6d3dff`, **0 green pixels** left |
| Photon Knot pixels | JetNet `--cover-glow` = `#6d3dff`, mean `#9558f6`; Python Sessions `--cover-glow` = `#9b1b30`, mean `#b64447` |
| Preview tracks | ≥900px → `IFRAME.resume-frame` (`application/pdf` in its `contentDocument`); <900px → `img.resume-page`, natural size 1654×2339 |
| Layout | 390 / 768 / 820 / 1024 / 1440: `scrollWidth − clientWidth` = 0 on every page; offenders are only the clipped decorative marquee and veil |

**Remaining unverified:** the motion of the three canvas effects (this webview suspends
`requestAnimationFrame`, so only still frames can be measured) and the Spotify round-trip
(no credentials yet — the `NOT CONNECTED` path is what ships).

### Optional next steps (not requested, safe to add later)

1. Real Spotify data can only be verified once `SPOTIFY_*` values exist — the connect
   flow and the `NOT CONNECTED` fallback are both confirmed working without them.
2. Add a `/projects/[slug]` **per-track detail view** if single files deserve their own page.
3. Consider a hidden `/studio` route for editing content without touching TypeScript.

---

## 5. Environment variables (Spotify)

Put real values in `.env.local` (never committed). See `.env.example`.

```
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

The UI degrades gracefully: when these are missing, the card shows
**"Off the record, for now. / NOT CONNECTED"** exactly as in the reference.

---

### STEP 17 — a planet you can pick up, and a light room  (2026-10-10)

#### 1. Why `npm install` / `npm run dev` failed in the IDE

Reproduced exactly, and it was not the code:

```
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory,
open 'C:\Users\rohan\.config\freebuff-desktop\local-projects\portfolio\package.json'
```

The app keeps the project inside its own tree, one folder deeper than the workspace it
hands to an IDE: `local-projects/portfolio/threads/<hash>/`. That parent folder contains
nothing but a placeholder `package-lock.json` (written by the failed `npm install` itself),
so **both** commands fail there while the project is perfectly healthy one level down.

Fix: a Windows **directory junction** — no admin needed, no second copy, no drift:

```powershell
New-Item -ItemType Junction -Path C:\Users\rohan\portfolio `
         -Target C:\Users\rohan\.config\freebuff-desktop\local-projects\portfolio\threads\fb1a78c4…46c
```

`npm install` → exit 0 and `npm run dev` → 200 from the junction path, verified.

A second, quieter trap found while testing: this environment sets **`PORT=0`**, which makes
`next dev` pick a random free port (it printed `- Local: http://localhost:59021`). Harmless
on its own, fatal for the Spotify redirect URI, which is pinned to 3000. `npx next dev -p 3000`
is the workaround; both gotchas are now in the README.

#### 2. The orb, raised and draggable

- `.hero-orb` moved from `top: -6%` to `-13%`: 43px higher at 1440, so the bright limb
  clears the first line of the headline instead of hiding behind it.
- The drag is a **trackball**, not a translation: yaw and pitch in radians, held in refs and
  applied *in reverse* to each cell's surface normal. The sun therefore stays fixed while the
  planet turns under it, and the bands and the terminator stay correctly related.
- Rotation is **1:1 with the pointer at the centre of the disc** at every screen size:
  `perPixel = 1 / radius`, read off the radius actually drawn (`clamp(320px,52vw,620px)` means a
  fixed constant would be ~25% slow on a phone and ~40% fast on a desktop). Measured: a 60px
  drag moved the centred surface point 59.0px (`solveYaw`/`solvePitch` over the same mapping);
  the tilt direction and the auto-spin were checked against the *original* formula — with no
  tilt the new mapping reduces to the old `atan2(u,z) + spin` to within `2.2e-16`.
- The whole astral stage slides with the pointer (clamped to 72×54px) and springs home through
  a CSS transition on release; a flick keeps spinning on decaying velocity.
- `touch-action: pan-y`, not `none`: the orb sits exactly where a thumb starts a scroll, and
  trapping the first screen of the home page to make a circle draggable is a bad trade.
- `setPointerCapture` is optional and wrapped: it can throw when the pointer is already gone,
  and the drag works without it.

**A real bug this surfaced:** the first implementation had the sign of the yaw inverted — the
surface turned *against* the hand, and the planet's auto-spin ran backwards compared to STEP
14. Found by measuring where the centred point went (it slid −60.3px for a +60px drag), fixed
with `yaw = -spin`, and the identity check above is what pins it down.

#### 3. Dark and light

- `data-theme="dark|light"` on `<html>`; `src/lib/theme.ts` holds the key, the subscribe/apply
  pair and the **pre-paint script**, which the root layout inlines into `<head>` — verified at
  byte 4638, before `<body>` at 5197. `useTheme()` is a `useSyncExternalStore` over the
  attribute, so there is no "set state after mount" and no hydration mismatch.
- The toggle is a two-option segmented control (labelled on desktop, icons + `sr-only` text in
  the mobile bar) at the top of every page.
- The light theme is not the dark one with two variables flipped. The dark room is additive,
  so on paper every glow has to become a wash: ~24 rules at the end of `globals.css` re-light
  the grain, the astral bloom, the orbit rings, the star field, the chips, the buttons and the
  closing panel; `--star` became bare RGB channels so one token carries twelve gradients.
- The canvases switch with it. The orb draws translucent ink (`source-over`, `#4a1fd2` body,
  `#b5238f` limb) and the discography knot follows the theme (mean pixel `[23,173,83]`,
  54% of its ink dark) while **album covers keep their own black in both themes** — measured
  identical to the byte (`mean [125,73,250]`, ink count 74497) in either theme. The headline
  re-samples a dark marble.
- Palette is read from `document.documentElement.dataset.theme` inside each frame, not from
  React state, so no frame is ever painted with the previous theme.

**A late defect, found by measuring the rail instead of trusting it:** the labelled toggle is
152px wide and the desktop rail only offers 216px of content width, so it hung 36px out into
the page (`.rail-top` `scrollWidth − width` = +36). `.rail-top` now wraps, and the control
drops onto its own line under the wordmark. Re-measured: overflow 0, right edge inside the
rail, nav still below, no page-level overflow at 1600 / 1440 / 820 / 390.

**Verified:** lint 0 · typecheck 0 · build 0 (14 routes, all prerendered as before) · toggle
round-trips and survives a reload (light after reload, body `rgb(245,244,251)`, meta
`#050706`→`#f5f4fb`, both toggles in sync) · console clean (React DevTools + HMR only) ·
no dark surfaces left on `/`, `/projects`, `/curiosity`, `/resume` in light mode ·
`scrollWidth − clientWidth` = 0 at 390 / 820 · CTA and headline stay hit-testable over the
orb · orbit/canvas pixels change on a drag and the stage transform returns to nothing.

**Not verified:** the *motion* (this webview suspends rAF, and it cannot composite, so no
screenshots exist at all — every visual claim here is a computed-style or canvas-pixel
measurement), and the Spotify round-trip (still no credentials).

---

### STEP 18 — the beige room, and the orb the recording actually shows  (2026-10-10)

#### 1. What the recording says (frame analysis, because the clip cannot be watched here)

`Screen Recording 2026-10-10 174524.mp4` — 1414×668, 30fps, 41 frames, 1.37s. It was
decoded to raw RGB and measured frame by frame (the webview cannot composite, so there are
no screenshots to read; the pixels are the evidence):

| Measurement | Result |
| --- | --- |
| Orb outline | **never moves** — left edge pinned at x=448 across all 41 frames (so this is not a translation) |
| Orb ink | changes by 40–50k pixels per frame **while the pointer moves** |
| Orb ink while the pointer is parked | **exactly 0 changed pixels**, for 11 consecutive frames |
| Brightest ink centroid | stays at 225–244° (up-left) throughout — the **sun does not move** |
| Pointer path | a wide arc, polar angle 246° → 290°, at up to ~1.7 disc-radii from the centre |
| Surface travel per pointer travel | ~0.4–0.6 (measured by windowed cross-correlation) |

So the reference is: a **pointer-driven rotation with a fixed sun, no idle spin, reacting
well beyond the disc's own box** — not a drag-the-orb-around-the-page interaction, which is
what "move it when I drag it" had been read as in STEP 17.

#### 2. What the orb does now

- A **hover** turns it: listening zone is the whole `.hero`, half the drag's gain, uniform
  across a band out to ~2.25 disc-radii. Calibration is in the constants' comments — the
  620px zone first written was ~3.6 radii and made the whole page a trackpad; the recording
  only demonstrates out to ~1.7.
- A **grab** is unchanged and still 1:1 at the centre of the disc.
- Two guards: **mouse only** (a finger dragging the page is a scroll — `touch-action: pan-y`
  already says so) and the hover **stands down while a grab is live**.
- Idle drift 0.062 → **0.012 rad/s** (one revolution per ~9 minutes). The recording shows a
  true standstill between moves; a completely static orb would be dead on a phone, where
  there is no hover, so it keeps a breath instead of nothing.

Measured after: hover at 1.4 radii turns the planet with no button and slides the surface
29.6px for a 60px sweep (the 0.5 gain exactly); the far corner at 589px (reach 540px) is
ignored; a grab still slides 59.0px for 60px; a touch drag still turns it; touch *moves* are
ignored; the stage transform clears on release.

#### 3. The beige room

`--bg: #f2e9d7` with warmed panels (surface `#fbf5e7`, rail `#ebe0c9`), warm neutrals for
text (`#241b10` / `#473a25` / `#6b5b41` / `#756239`), warm grain, warm star ink (`92 74 48`),
and the browser-chrome colour moved to `#f2e9d7` in `theme.ts`. The astral bloom's white core
became a warm cream so it belongs to the paper instead of sitting on it.

Contrast was computed rather than eyeballed, which is how `--dim` ended up at `#756239`:
the first warm grey was 3.4–3.7:1 and now reads 4.9:1 on the page, 4.5:1 on the rail and
5.4:1 on a panel — AA for the 11px mono labels that use it. Everything else is ≥4.5:1
(text 14.1, text-soft 10.2, muted 5.4–6.0, accent 4.5–5.0, button ink 5.3).

**Verified:** lint 0 · typecheck 0 · build 0 (14 routes) · `/`, `/projects`, `/resume`,
`/curiosity` 200 · theme flips to the beige values (`body rgb(242,233,215)`, rail
`rgb(235,224,201)`, meta `#f2e9d7`) · no dark surfaces left · no overflow at 1440 / 390.

---

### STEP 19 — Next.js 16.4.0 → 16.4.3 (security patch)  (2026-10-24)

A published advisory covered the installed Next.js, so `next` is now pinned to **16.4.3** and
`eslint-config-next` moved with it to keep the lint stack on one release. No codemod: same
major, no migration guide. `npm audit` no longer lists Next; the one remaining high is `zod`
via `eslint-config-next → eslint-plugin-react-hooks` — dev-only lint tooling, left alone.

[`next.config.ts`](next.config.ts) now carries the policy that made this an agent job rather
than a manual one — no other key changed:

```ts
experimental: { agentUpgrade: "security" },
```

The method — duplicate check, target confirmation, pin, install, the full verification set,
the benign warnings, rollback — is stored as a runbook so it survives a token reset:
**[`MEMORY/next-upgrade.md`](MEMORY/next-upgrade.md)**. Read it before the next bump; it is
written to be started cold.

**Verified:** `next --version` = 16.4.3 · `npm install` 0 · lint 0 · typecheck 0 · build 0
(14 routes) · every page and API endpoint 200 on `-p 3000` · served CSS still carries the
theme tokens (74,749 B in the build).

**Not applicable here:** the repository has no Git, so there was no branch, worktree, commit
or PR step — the upgrade was made in place.

---

### STEP 20 — Sunrise light room + header clean-up  (2026-10-24)

**Light theme only; the dark room was not touched.** The old beige-and-green light room is now
sunlit paper: `--bg #fff3e2` with cream panels, a four-corner wash of apricot/lilac/rose/mint
(`.ambient-glow::before`), and its own persimmon accent (`#a83a0e`) instead of the dark room's
green. Every light-theme accent tint (60 rules) moved from green to persimmon, and the few
inline washes that were hard-coded green now use `color-mix(… var(--accent) …)`, so they follow
the theme instead of fighting it. The headline marble ends in persimmon, the pastel orb is
peach → rose → lilac, and the browser-chrome colour is `#fff3e2` in `theme.ts`.

Contrast was computed over the strongest apricot wash, not just the flat ground: `--dim`
`#755631` = 6.1:1 page / 5.2:1 wash / 5.6:1 rail; accent = 5.9:1 page / 4.9:1 wash; ivory on
persimmon = 6.0:1. Nothing is below AA.

Also removed: the `RD` monogram chip from every page header (and `profile.monogram`), and the
floating Next.js dev badge (the “N” at the bottom-left) via `devIndicators: false` — it was
development chrome, never part of the shipped site. Project detail pages keep their album code.

**Verified:** lint 0 · typecheck 0 · build 0 (14 routes) · all pages/API 200 on `-p 3000` ·
light measured live (`body rgb(255,243,226)`, rail `rgb(248,232,210)`, panel `rgb(255,249,239)`,
accent `#a83a0e`, meta `#fff3e2`, aurora present, no dev badge, no overflow) · dark re-measured
unchanged (`rgb(5,7,6)`, accent `#4ade80`, panel `rgb(12,17,13)`, no aurora) · console clean.

---

### STEP 21 — Player dock auto-scroll repair  (2026-10-24)

Play looked dead because of two independent mistakes in the dock's loop: the page sets
`html { scroll-behavior: smooth }`, so a `scrollBy` on every animation frame started a new
smooth animation that the next frame cancelled (the page crept, if it moved at all), and the
loop ran on `requestAnimationFrame`, which browsers suspend in a background tab. The effect in
[`player-dock.tsx`](src/components/player-dock.tsx) now owns a float position and advances it
from a 33ms ticker with `scrollTo({ behavior: "instant" })`, so nothing can re-animate or
throttle it away. Speed is 64 px/s.

Two adjacent bugs went with it: scrubbing the seek bar mid-play used to leave the ticker's
private position behind (it snapped back a frame later) — `handleSeek` now writes the same
ref; and on touch, a `touchstart` on the dock's own pause button counted as “the user scrolled”
and paused first, so the click re-started playback. The pause listener now ignores events
inside `.player-dock` and the first 350ms after Play (trackpad inertia).

**Verified in the browser:** 0 → 23 → 50 → 76 → 101 → 126 → 154 px over 2.4s (64 px/s) ·
loop wraps from the bottom to 0 and keeps playing · seek to 75% mid-play lands at 814 px
(expected 770 + 0.7s of travel) instead of snapping back · real wheel input pauses ·
lint 0 · typecheck 0 · build 0 (14 routes).

---

### STEP 22 — Supplied resume installed  (2026-10-24)

`public/resume/` was empty, so the download/preview page had nothing to hand over. The
supplied `Rohan_Dabhade_Resume.pdf` is now the master at
`public/resume/rohan-dabhade-resume.pdf` (bytes identical to the original), with a 200 DPI
PNG render (1654×2339) beside it for the inline preview. The PDF is the source now, so the
README's asset flow was flipped: overwrite the PDF, re-render the PNG.

The page's "What's on it" cards and the **ATS Plaintext** were rewritten to describe this
resume rather than the previous one. `PROJECTS` now lists the AI voice assistant, message
encryption tool, portfolio and ML4SCI; a new `HACKATHONS` card covers the 3+ team
prototypes; the experience note mentions building and refining the rule engine. The old
`OPEN SOURCE` card and the longer ATS text (which carried facts absent from this PDF, such
as coursework and validation loss) are gone.

**Verified:** PDF bytes identical · `/resume` 200 · PDF 200 `application/pdf` 4,945 B ·
PNG 200 `image/png` 338 KB · poster renders 1654×2339 · stats read `5 KB / October 2026` ·
desktop iframe preview loads `…pdf#view=FitH` · mobile image preview, no overflow at 390 ·
ATS tab carries the new sections · lint 0 · typecheck 0 · build 0 (14 routes).

---

### STEP 23 — Real soundtrack, in order  (2026-10-24)

**The request.** Add the five tracks the user supplied, in order, to the auto-scroll. The
five attachments were commercial Radiohead masters from *In Rainbows*; serving those from
`public/` would redistribute them. The user chose cleared CC-licensed music instead, so the
soundtrack is five instrumental pieces by **Scott Buckley**, all **CC BY 4.0**, verified on
the artist's own page for each track.

**The mapping.** One piece per section, in the order the pages are read:

| # | Track | Page | Length |
| - | ----- | ---- | ------ |
| 01 | Petrichor | `/` | 4:31 |
| 02 | Luminance | `/curiosity` | 4:53 |
| 03 | Machina | `/projects` and both project detail pages | 4:51 |
| 04 | Undertow | `/notes` | 4:10 |
| 05 | Hiraeth | `/resume` and `/connect` | 5:46 |

**What changed.** [`src/content/soundtrack.ts`](src/content/soundtrack.ts) is the new source
of truth (files, durations, page map, licence and source links). [`player-dock.tsx`](src/components/player-dock.tsx)
now renders a real `<audio>` element: Play starts the song and the 64 px/s auto-scroll, Pause
stops both, Next/Previous keep playing, Loop loops both, a manual wheel/touch pauses both,
and Play at the bottom starts a fresh pass. Reaching the bottom stops the scroll but lets
the record play out (a 4–5 minute piece should not be cut off by a short page). The time
readout is the song's clock; the top
hairline still scrubs the page. The dock shows the song title and `Scott Buckley · page`.
The old fake durations were removed, and the longest-path match makes the project detail
entries reachable instead of being masked by `/projects`.

The files were downloaded from Wikimedia Commons (Ogg Vorbis, verified full-length), then
re-encoded once to 160 kbps MP3 with loudness normalisation; the change is declared. Total
28 MB in `public/audio/`. Attribution appears in the dock (`CC BY 4.0`), in every footer,
and in full on `/connect#soundtrack`.

**Verified** at 230×730 and 390 px later: audio element loads `/audio/01-petrichor.mp3`,
271.25 s, 55% volume · native Play advances `currentTime` and the page together (samples
35 px / 0.6 s, then 13 s / 874 px) · Pause freezes both at 21.171 s / 1404 px · at the
390 px page bottom (1032 px) the scroll stops while the record keeps playing (51.6 s,
vinyl spinning) · Next keeps playing and swaps to `/audio/02-luminance.mp3` on
`/curiosity` · the readout shows
`0:00 / 4:53 · CC BY 4.0` · the footer credit is present on `/` and all five credits on
`/connect` · all five MP3s return 200 `audio/mpeg` · typecheck 0 · lint 0 · build 0.

**Not done:** the original five Radiohead files were not copied into the project; they are
commercial masters. [`SOUNDTRACK.md`](SOUNDTRACK.md) stores the licence terms, the exact
attribution text and the swap procedure.

---

### STEP 24 — Guestbook is database-backed  (2026-10-25)

**Status:** code and local verification complete · live Atlas connection pending
`MONGODB_URI`.

**What changed.** All four `CURATED_REVIEWS` and the whole `localStorage` signature store
were removed. The board now talks to one MongoDB collection:

- `POST /api/reviews` validates the form and inserts `status: "pending"`.
- `GET /api/reviews` returns **only** `status: "approved"`.
- The owner approves by editing that one field in Atlas; `approvedAt` is optional and the
  board falls back to `createdAt`.

Files: `src/content/reviews.ts` (shared stamps/limits/colours), `src/lib/reviews.ts`
(server-only Mongo client, validation, indexes), `src/app/api/reviews/route.ts` (public
API, per-IP throttle), and a rewritten `src/components/guestbook.tsx` (loading, empty,
offline and pending-confirmation states, no delete button). `next.config.ts` externalises
the driver; `MONGODB_URI` / `MONGODB_DB` were added to `.env.example`; `REVIEWS.md` is the
step-by-step Atlas + approval + Vercel runbook.

**Why the live link is not done.** Gravity's account provisioning is disabled, so the free
Atlas cluster could not be created from here. The user chose “create it for me”; the setup
link and the exact remaining steps are in the final message. The code never falls back to
sample reviews: without `MONGODB_URI` the section says it is being set up and the sign
button is disabled.

**Verified** against a temporary in-memory MongoDB 8.2.6 (removed afterwards): POST 201 ·
pending docs absent from GET · changing only `status` to `approved` makes the review appear
with the `createdAt` fallback · invalid rating 400 · missing comment 400 · 7 KB body 413 ·
sixth submission in ten minutes 429 `Retry-After` · production `next build` + `next start`
with the real driver · UI submit success notice, pending hidden, two approved cards in the
right order, rating filter switches to one card, empty state, 390 px no horizontal overflow.
lint 0 · typecheck 0 · build 0 (14 routes). The build still prints the known non-fatal
Tailwind `@theme` parse warning.

**Security note:** `.env.example` had live-looking Spotify credentials; they are now
placeholders. If that file was ever shared or committed, rotate the client secret. The real
values stay only in the git-ignored `.env.local`.
