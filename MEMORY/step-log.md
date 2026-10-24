# MEMORY/step-log.md

Append-only log. Newest entry at the bottom. One entry per completed step.

Format:

```
## STEP NN — <title>  (<date>)
Status: ✅ done
Files: <changed/created>
Notes: <decisions, gotchas, what the next step must know>
Verify: <exact command run + result>
```

---

## STEP 00 — Recon  (2026-10-07)

Status: ✅ done

Files:
- `scripts/extract-resume.mjs` (PDF text extractor: inflate + ASCII85 + `(...)` string reader)
- `PROGRESS.md`, `MEMORY/design-reference.md`, `MEMORY/step-log.md`

Notes:
- Workspace was empty; a fresh git repo.
- Resume PDF is ReportLab-generated; its page content stream uses
  `/Filter [ /ASCII85Decode /FlateDecode ]`, which is why a plain inflate returned nothing.
  The extractor handles both.
- GitHub user `Roahncodes` has **exactly 2 public repos**, which is why the reference
  design shows two albums:
  1. `JetNet-SuperRes-PFlow` — Python, PyTorch/PL, GSoC ML4SCI contribution.
     Files: `project/{dataset,model,train,train_pf,inference,inference_pf}.py`,
     checkpoints, `outputs/`, `pflow_outputs/`, `tb_logs/`.
  2. `Python-Projects` — `Jarvis/` (voice assistant), `Mini Projects/`
     (`Dice_roller.py`, `Project1.py`, `Project2.py`, `Timer.py`, `encrypt.py`, `main.py`
     = slot machine, 3×3 grid, bet validation).
- Resume facts extracted verbatim (used by step 02):
  - Name Rohan Dabhade, +91 951 2693 422, rohandabhade58@gmail.com
  - `linkedin.com/in/rohan-dabhade/`, `github.com/Roahncodes`
  - CS student at Jain University, Bangalore, Karnataka — expected graduation Sep 2028,
    current status second-year.
  - Experience: Shivohini — AI/ML Intern, May 26 2026 → Aug 1 2026. Built and refined a
    rule engine for a fire-safety tool recommendation model; translated fire-safety
    requirements into structured rules used to generate recommendations.
  - Open source: ML4SCI — JetNet-SR-PFlow (GSoC 2026 contributor). Two-stage system using
    Generative Flow Matching and Set-to-Set Transformers; 1:1 particle matching (30/30)
    on JetNet; GPU-accelerated training (NVIDIA).
  - Skills — Programming: Python (NumPy, Pandas, OOP), C, C++, Java, JavaScript,
    TypeScript, HTML, CSS. Frameworks/libraries: PyQt5, NumPy, Pandas, learning
    Scikit-learn and Matplotlib. Databases: MongoDB, SQL. Concepts: Encryption, Speech
    Recognition. Tools: Git, GitHub.
  - Hackathons: 3+, built functional prototypes under time constraints; backend + database
    logic with Supabase and MongoDB.
  - Certifications: Electronic Arts — Software Engineering Job Simulation (Forage);
    AWS APAC — Solutions Architecture Job Simulation (Forage). ✔ C2PA "Content
    Credentials" embedded file present in the PDF (ignored).
  - Projects from resume: AI Voice Assistant, Message Encryption Tool, Personal Portfolio
    Website (Vercel + custom domain).

Verify:
```
node scripts/extract-resume.mjs "C:/Users/rohan/Downloads/Resume.pdf"   # -> full resume text
curl -s https://api.github.com/users/Roahncodes/repos                  # -> 2 repos
```

---

## STEP 01 — Scaffold + design system  (2026-10-07)

Status: ✅ done

Files: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`,
`.gitignore`, `.env.example`, `src/app/globals.css`, `src/app/layout.tsx`

Notes:
- Stack pinned to **Next 16.4.0 + React 19.3.0 + Tailwind 4.3.3 + TypeScript 5.7**.
  Checked the real published versions with `npm view` instead of guessing.
- **No UI dependencies at all** — no framer-motion, no icon library. All icons are
  hand-written strokes in `src/components/icons.tsx`; all motion is CSS keyframes plus a
  shared `requestAnimationFrame` reveal scheduler.
- Tailwind v4 configured CSS-first (`@import "tailwindcss"` + `@theme inline`); the
  design system is one file, `src/app/globals.css`.
- **Gotcha:** `@theme inline { --font-mono: var(--font-mono) }` is self-referential and
  silently breaks the font stack. The next/font variables are therefore named
  `--font-inter` / `--font-jetbrains`, and `--font-display` / `--font-mono-stack` alias
  them in `:root`.
- **Gotcha:** `next dev` warned it would treat `C:\Users\rohan` as the workspace root
  because of a stray `package-lock.json` in the home directory. Fixed with
  `turbopack: { root: __dirname }` in `next.config.ts`.
- **Gotcha:** `overflow-x: hidden` creates a scroll container and breaks `position:
  sticky` on the rail. Used `overflow-x: clip` on `html`/`body` instead — that also
  stopped the decorative orb glows widening the page (scrollWidth went 1271 → 1183).

Verify: `npm run build` → 9 routes generated, exit 0.

---

## STEP 02 — Content data layer  (2026-10-07)

Status: ✅ done

Files: `src/content/profile.ts`, `src/content/albums.ts`

Notes:
- `profile.ts` holds identity, the two "Behind the tracks" paragraphs, four
  `skillGroups` for the "Skills in rotation" cards, `currentlyStudying`,
  `experiences` (Shivohini internship + ML4SCI open source), `hackathons`,
  `certifications`, and `rotationStrip` for the ticker.
- `albums.ts` provides `albums`, `getAlbum`, `getAlbumSlugs` and `allTracks`. Each track
  links to a **real** GitHub blob/tree URL — verified paths:
  `project/{train,train_pf,dataset,model,inference,inference_pf}.py` and
  `Jarvis/` + `Mini Projects/{encrypt,Dice_roller,Project1,Timer,main,project2}*.py`
  (note the `Mini%20Projects` URL encoding).
- The reference screenshots showed 2 JetNet tracks and 7 Python tracks. The JetNet album
  was expanded to 6 tracks because those six files genuinely exist and the layout
  presents them well; the Python album keeps the 7 from the reference.

Verify: `npx tsc --noEmit` → exit 0.

---

## STEP 03 — App shell  (2026-10-07)

Status: ✅ done

Files: `src/components/side-rail.tsx`, `src/components/{astral,reveal,page-footer,strip}.tsx`,
`src/app/globals.css` (rail/hero/grid sections)

Notes:
- `.shell` is a two-column grid: a 264px sticky rail and the scrolling main column.
- `SideRail` is a client component: `usePathname` drives the green active state,
  `data-active` draws a 2px left bar, and a single `aria-expanded` button reveals the
  mobile panel. The drawer auto-closes on route change.
- Below 1000px the rail becomes a blurred sticky top bar and the shell collapses to one
  column; `.main` gains 132px bottom padding.
- `Reveal` uses a **shared positional scheduler**, not IntersectionObserver — see STEP 10
  for why.

Verify: measured at 1200px → rail 264px, main 919px, no horizontal overflow.

---

## STEP 04 — Artist home  (2026-10-07)

Status: ✅ done

Files: `src/app/page.tsx`, `src/components/last-song-card.tsx`

Notes:
- `export const revalidate = 30` so the SSR'd now-playing value is at most 30s stale;
  the client component then polls `/api/spotify/now-playing` every 30s and re-renders its
  clock every 15s.
- The card handles three states: **now playing** (equaliser + progress), **last played**
  ("Last played · x min ago"), and **not connected** (reference copy, plus a
  `Connect Spotify` link only when it is genuinely unconfigured).
- **Bug found and fixed:** `<h1>{a} {b}</h1>` produced the accessible name
  "RohanDabhade". Now a single template string.
- Hero name font-size tuned from `clamp(3rem,11vw,8rem)` to `clamp(2.6rem,9.2vw,6.6rem)`
  so the full name sits on one line at desktop width like the reference.

Verify: h1 = "Rohan Dabhade", 823×95px, 105.6px font, one line; no console errors.

---

## STEP 05 — Curiosity page  (2026-10-07)

Status: ✅ done

Files: `src/app/curiosity/page.tsx`

Notes:
- "Astral" hero: an 864px orb behind a gradient-clipped `Curiosity.` set at 180px
  (`.giant-word`, `clamp(3.6rem,15vw,12rem)`, white→mint gradient text).
- Eleven reveals with staggered delays; the timeline is the page's only motion.
- Four `skillGroups` render as a 2×2 grid of `ON REPEAT` cards, then experience
  (green `OPEN SOURCE` kicker for ML4SCI, dim kicker for the internship), then
  hackathons + certifications.

Verify: `.giant-word` 823×155px at 180px; 6 skill cards; 14 reveals, 5 visible at top and
14/14 after scrolling to the bottom.

---

## STEP 06 — Discography  (2026-10-07)

Status: ✅ done

Files: `src/app/projects/page.tsx`, `src/components/{album-card,track-row}.tsx`

Notes:
- `.cover` is pure CSS album art: two radial gradients, a blurred orb pseudo-element, a
  star-field `::after`, and a mono `.cover-label` (J / 01, P / 02) with a green text
  glow. `aspect-ratio: 1` verified at 399×399.
- The discography lists all 13 tracks grouped by album, each row a real outbound link
  (`target="_blank"`, `rel="noreferrer noopener"`).
- `track.is-live` gives the album page's headline track the "now playing" treatment.

Verify: 2 album cards, 13 track rows, all external, cover aspect exactly 1.000.

---

## STEP 07 — Album detail pages  (2026-10-07)

Status: ✅ done

Files: `src/app/projects/[slug]/page.tsx`

Notes:
- `generateStaticParams` pre-renders both albums; `generateMetadata` derives title and
  description from the album record. `params` is awaited (Next 15+ contract).
- Layout: cover on the left (sticky-ish 300px column), `PROJECT ALBUM` kicker, display
  title, genre line, credit, **Open repository** + **Play track 01** buttons, a status
  chip, and four `stat` tiles (30 / 30 particles, 0.0542 val loss, 50 epochs, 02 stages).
- `notFound()` handles an unknown slug; `/projects/nope` returns a real 404.

Verify: `detailCols = 300px 475.2px`, 1 live track, repo href correct, 404 status on a
bad slug.

---

## STEP 08 — Spotify integration  (2026-10-07)

Status: ✅ done

Files: `src/lib/spotify.ts`, `src/app/api/spotify/{login,callback,now-playing}/route.ts`

Notes:
- Three routes: `/api/spotify/login` (redirects with a `state` cookie),
  `/api/spotify/callback` (exchanges the code and **prints the refresh token once**, as
  plain styled HTML — it is never logged, stored or sent to the client), and
  `/api/spotify/now-playing` (30s `s-maxage`).
- `getAccessToken()` memoises the access token per server isolate and refreshes 5s early.
- `getNowPlaying()` falls back from currently-playing to recently-played, and returns
  `{ connected: false, reason: "unconfigured" | "error" }` on any failure — it never
  throws, so a broken token can never break the build or the page.

Verify without credentials: `/api/spotify/now-playing` → 200
`{"connected":false,"reason":"unconfigured"}`.

**Still to confirm once real credentials exist:** an actual track rendering, the OAuth
round-trip, and the callback page. Not verified yet — no credentials were provided.

---

## STEP 09 — Liner notes + Say hello  (2026-10-07)

Status: ✅ done

Files: `src/app/notes/page.tsx`, `src/app/connect/page.tsx`, `src/components/copy-button.tsx`,
`src/app/not-found.tsx`

Notes:
- `/notes` writes four short honest notes plus sleeve credits, rather than restating the
  resume in bullet form.
- `/connect` lists four channels and a `CopyButton` that falls back silently when the
  clipboard API is unavailable (insecure context or denied permission).
- `not-found.tsx` reuses the astral hero at a smaller scale and offers both a jump to the
  discography and back to the artist home.

Verify: all three routes 200; `/connect` exposes the real email; `/nope` → 404 with the
styled page.

---

## STEP 10 — Motion, responsive, accessibility  (2026-10-07)

Status: ✅ done

Files: `src/components/reveal.tsx` (rewritten), `src/app/layout.tsx`, `src/app/globals.css`

Notes:
- **Real bug found and fixed.** The first `Reveal` used IntersectionObserver. Jumping to
  the bottom of a page skips elements between the old and new scroll positions, and the
  observer reports them as never intersecting — content stayed permanently at
  `opacity: 0`. Reproduced: 1 of 10 reveals stuck hidden after a scroll-to-bottom.
  Replaced with a single shared `requestAnimationFrame` scheduler that reveals on
  position (`rect.top < innerHeight * 0.92`), which is also true for anything already
  scrolled past. Re-verified: 0 of 10 hidden after the same jump.
- Added a `<noscript>` style so reveals are fully visible if JavaScript never runs.
- Added `icon.svg`, `opengraph-image.tsx` (next/og, 1200×630), `robots.ts`, `sitemap.ts`.
- Accessibility: `aria-current` on the active rail link, `aria-expanded`/`aria-controls`
  on the mobile menu, `aria-hidden` on decorative layers, `aria-live="polite"` on the
  now-playing card, focus rings on every interactive element, `.sr-only` labels on
  icon-only controls.
- `prefers-reduced-motion: reduce` collapses every animation and transition.

Verify: OG image is a real 1200×630 PNG (114,601 bytes, PNG signature checked);
sitemap lists all 7 URLs; robots disallows `/api/`.

---

## STEP 11 — Verification  (2026-10-07)

Status: ✅ done (with one stated limitation)

Files: none changed.

Notes — what was actually run:

| Check | Command / method | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | exit 0 |
| Production build | `npm run build` | exit 0, 13 static pages + 3 dynamic API routes |
| Route status | `curl -o /dev/null -w "%{http_code}"` for all 6 pages + API | all 200 (404 for a bad slug) |
| Content presence | `curl` + `grep` for reference copy on every page | all found |
| Layout | in-page `getBoundingClientRect` audit at 1200px and 414px | rail 264px, correct grids, `scrollWidth === clientWidth` (no overflow) at both widths |
| Design tokens | computed-style audit | bg `rgb(5,7,6)`, accent `rgb(74,222,128)`, Inter + JetBrains Mono both loaded, panel radius 20px |
| Interactions | scripted click on the mobile menu button | `aria-expanded` false→true, panel with 4 links |
| Reveal behaviour | scripted violent scroll-to-bottom | 14/14 revealed, 0 stuck |
| Animations | `CSSRule` walk + `matchMedia` | all 9 keyframes registered; correctly suppressed because the host reports `prefers-reduced-motion: reduce` |

**⚠️ Limitation — no visual screenshots.** `preview_screenshot` failed three times with
"the preview webview is not being composited", so the design was verified numerically
(geometry, computed styles, colours, fonts, interactions) rather than by looking at
rendered images. A human should still eyeball the pages in the Preview tab, especially
the orb glow intensity and the hero type scale.

**Not verified:** anything requiring real Spotify credentials (see STEP 08).

---

## STEP 12 — Deploy guide + README  (2026-10-07)

Status: ✅ done

Files: `README.md`, `.env.example`, `PROGRESS.md`, `scripts/resume-check.mjs`
(renamed from `.js` in STEP 13)

Notes:
- `README.md` covers quick start, the six routes, the exact Spotify OAuth walkthrough
  (including the redirect-URI equality gotcha), security notes, Vercel deployment with
  the env vars and the second redirect URI, the content model, the file layout, and the
  `npm run resume` recovery flow.
- `scripts/resume-check.mjs` powers `npm run resume`: it typechecks, then parses the step
  table out of `PROGRESS.md` and prints the first non-✅ step.

Verify: `node scripts/resume-check.mjs` → prints 13/13 complete, exit 0.

**Nothing is deployed.** No hosting was requested, so no deployment was attempted.

---

## STEP 13 — Final completion check: lint repaired  (2026-10-07)

Status: ✅ done

Files: `eslint.config.mjs` (new), `package.json`, `src/components/side-rail.tsx`,
`src/app/layout.tsx`, `scripts/extract-resume.mjs`, `scripts/resume-check.mjs`

Notes — an honest defect found while auditing the deliverables:

- **`npm run lint` was broken.** STEP 01 added the script but no ESLint install, so it
  failed with `'eslint' is not recognized` (exit 1) — and the two `eslint-disable`
  comments in `layout.tsx` / `last-song-card.tsx` referenced rules that did not exist.
  Installed `eslint@9` + `eslint-config-next@16.4.0` (peer range `eslint >= 9.0.0`) and
  added a flat `eslint.config.mjs` in the Next 16 convention. The script now runs and
  passes with **0 errors, 0 warnings**.
- Fixes were real, not suppressions:
  1. `react-hooks/set-state-in-effect` on `side-rail.tsx`. The drawer used to close via
     `useEffect(() => setOpen(false), [pathname])`. Replaced with derived state —
     `open = openPath === pathname` — so any navigation (link, back button, programmatic)
     closes it with no effect and no cascading render. The stale `useEffect` import went too.
  2. `@typescript-eslint/no-require-imports` on both `scripts/*.js`. Rather than
     exempting the directory, both scripts were converted to ESM `.mjs` (the project has
     no `"type": "module"`, so `.mjs` is the correct signal) and `npm run resume` was
     repointed. `extract-resume.mjs` output was diffed against the old script — identical.
  3. `react/no-danger` was an **unused** disable directive — removed.
  4. `import/no-anonymous-default-export` in the new config — assigned to a `const` first.

Verify (all re-run after the repairs, exit statuses captured, not just filtered):

```
npm run lint        → exit 0  (0 errors, 0 warnings)
npx tsc --noEmit    → exit 0
npm run build       → exit 0, all routes unchanged
npm run resume      → exit 0, 13/13 steps complete
node scripts/extract-resume.mjs <resume.pdf> → resume text, unchanged
```

Behavioural re-verification of the rewritten drawer, driven in the live browser:

| Action | Result |
| --- | --- |
| initial | `aria-expanded=false`, no panel |
| open | `aria-expanded=true`, panel present |
| close (same button) | `aria-expanded=false`, no panel |
| reopen | `aria-expanded=true`, panel present |
| drawer links | `[/, /projects, /notes, /connect]` |
| click `/notes` in drawer | navigated, drawer auto-closed |
| open, then browser **Back** | navigated to `/projects`, drawer auto-closed |

**Still not verified:** the Spotify OAuth round-trip and a real now-playing track — no
credentials exist. The `NOT CONNECTED` path is confirmed working.

**Still limited:** no visual screenshots (preview webview never composited) — the visual
pass remains a measured layout/style audit rather than a look at rendered images.

---

## STEP 14 — React Bits Pro components (Photon Knot, Glyph Orb, Stipple Type)  (2026-10-08)

Status: ✅ done — the license route was abandoned, the three effects were hand-built
        (the turn below is kept because the registry findings are still useful)

Files so far:

- `components.json` (NEW) — shadcn config + the two React Bits registries
- `.env.example` — documents `REACTBITS_LICENSE_KEY`
- `.env.local` — **required from the user, not present yet** (gitignored)

Notes:

- The project was scaffolded by hand, so `components.json` never existed. Created it with
  `tailwind.config: ""` and `tailwind.css: "src/app/globals.css"` (Tailwind v4 has no JS
  config), aliases `@/*`, plus:

  ```json
  "registries": {
    "@reactbits-starter": { "url": "https://pro.reactbits.dev/api/r/starter/{name}.json",
      "headers": { "Authorization": "Bearer ${REACTBITS_LICENSE_KEY}" } },
    "@reactbits-pro":     { "url": "https://pro.reactbits.dev/api/r/pro/{name}.json",
      "headers": { "Authorization": "Bearer ${REACTBITS_LICENSE_KEY}" } }
  }
  ```

- **Header format probed empirically before guessing** (the docs render the value as
  `******`). Against `https://pro.reactbits.dev/api/r/starter/photon-knot-tw.json`:

  | `Authorization` header | response |
  | --- | --- |
  | absent | 401 `"License key required."` |
  | `bogus` | 401 `"License key required."` (raw value ignored → `Bearer` prefix is required) |
  | `Bearer bogus` | 401 `"License key not found"` ← the key is actually parsed |

- **Env interpolation confirmed** the same way: with a temporary fake
  `REACTBITS_LICENSE_KEY` in `.env.local`, `npx shadcn@latest add
  @reactbits-starter/photon-knot-tw --yes` returned `[Unauthorized] License key not found`
  instead of `License key required` — i.e. the CLI did read `.env.local` and substitute
  `${REACTBITS_LICENSE_KEY}` into the header. The probe file was deleted immediately.
- Components requested: `@reactbits-starter/photon-knot-tw` → `/projects`,
  `@reactbits-starter/glyph-orb-tw` → home "planet", `@reactbits-starter/stipple-type-tw`
  → the hero name.
- These are canvas/WebGL-driven, so they break the project's zero-UI-dependency rule on
  purpose (user-requested). Expect `clsx`/`tailwind-merge`/`motion` to land with them;
  `npx shadcn add` may also try to rewrite `globals.css` — must be audited and reverted
  so the existing design tokens survive.

Verify (so far):

```
curl -s -o /dev/null -w '%{http_code}' -H 'Authorization: Bearer ...' <registry>  → 401 + "License key not found" (config wired correctly)
npx tsc --noEmit                                                                   → not re-run yet (no source changed)
```

### STEP 14 — outcome: hand-built

Asked the user how to proceed; they chose **"No license — hand-build all three"** and
placed the Photon Knot in **two** places (the `/projects` hero *and* inside each album
card). So nothing was installed and `package.json` gained no dependency.

Files created:

```
src/components/fx/scene.ts         shared plumbing: DPR sizing, gated rAF loop, still frame
src/components/fx/photon-knot.tsx  trefoil swept into a ribbon, depth-sorted additive quads
src/components/fx/glyph-orb.tsx    per-cell sphere shading quantised onto a glyph ramp
src/components/fx/stipple-type.tsx offscreen rasterise → particle field with a spring
```

Files changed:

```
src/components/astral.tsx          gained an optional `core` slot
src/components/album-card.tsx      AlbumCover renders <PhotonKnot variant="card">
src/app/page.tsx                   <Astral core={<GlyphOrb />}>, name → <StippleType>
src/app/projects/page.tsx          hero section is now .projects-hero + <PhotonKnot>
src/app/globals.css                new "canvas effects" block (the .fx-host / .fx-canvas pair)
```

Three bugs found and fixed **at the cause** while verifying:

1. **`requestAnimationFrame` never fires in the agent's webview.** The first version only
   painted from inside rAF, so both canvases sat at their default 300×150 with
   `data-fx="off"` — an empty rectangle, forever. In a hidden or backgrounded webview
   Chromium suspends rAF completely (`document.visibilityState === "hidden"` and a rAF
   probe never resolved in 1500 ms). Fixed by painting the still frame **synchronously in
   the effect body** (which is after layout, so the box is measurable) and delivering the
   readiness signal from a **microtask** instead of rAF, since CSS keys the fade-in off it.
   The animation loop is now a pure upgrade. This is a genuine robustness win, not a test
   workaround: the same thing would have happened in any background tab.
2. **A bare canvas cannot both be sized and fill its parent.** `.fx-canvas { width:100%;
   height:100% }` beat `aspect-ratio: 1` on `.projects-knot`, so the hero knot measured
   897×223 (its *section*) instead of 470×470. Fixed structurally: every effect is now a
   `.fx-host` wrapper (which takes the positioning class) containing a `.fx-canvas` that
   fills it, and `useScene` measures the wrapper.
3. **The planet was too dim.** Measured *perceived* luminance (ink composited over the page
   background — measuring raw RGBA overstates brightness badly, since an ASCII glyph only
   covers ~25% of its cell): median 23/255, glyph strokes only 54% at p90. Raised the band
   floor 0.6 → 0.72, added a `0.18 +` day term so the unlit side stays readable as glyphs,
   brightened `DEEP` to `[30,96,60]`, raised the alpha floor to 0.35. Re-measured: strokes
   p10 124 / median 159 / p90 201, lit side ~3× the unlit side, limb up to 249.

Also toned the distant sun down to a tight core (`0.06` gradient stop) inside a wide faint
halo — as one big soft blob it read as a smudge rather than a star.

Verify (exit statuses captured, not just filtered output):

```
npx tsc --noEmit   → exit 0
npm run lint       → exit 0  (0 errors, 0 warnings)
npm run build      → exit 0, all 13 routes unchanged
npm run resume     → exit 0
curl / /curiosity /projects /projects/[both slugs] /notes /connect → 200; /nope → 404
```

Canvas pixel readback, measured through the interface the user sees (the DOM):

| Page | Effect | Host box | Ink | Result |
| --- | --- | --- | --- | --- |
| `/` @1280 | Glyph Orb | 570×570 | 33% | `data-fx="on"`, opacity 1, strokes 49–79% bright, terminator visible |
| `/` @1280 | Stipple Type | 897×95 | 33025 px | h1 `rgba(0,0,0,0)`, canvas ink in a glyph-shaped profile |
| `/` @414 | both | 294×294 / 358×37 | ✓ | horizontal ink profile shows letters, not a block |
| `/projects` @1280 | hero knot | 470×470 | 25.8% | `z-index:-1`, centred ink box |
| `/projects` @1280 | 2× cover knot | 434×434 | 27.8% | `elementFromPoint` at the centre → `cover-label` (the `J/01` stays on top) |
| `/projects` @414 | hero + covers | 215×215 / 356×356 | ✓ | knot on-screen, `overflow-x` 0 |
| `/projects/[slug]` @414 | cover knot | 338×338 | 27.8% | label still above the canvas |

No horizontal overflow on any page at either width; no JavaScript errors from the site
(the only console warnings are Next's font-preload notice and a `getImageData` notice
raised by the *verification probes themselves*, not by product code).

**Not verified — motion.** The webview never composites, so rAF never runs and no
animation, pointer-stirring or drift could be observed. Only the still frames are
measured. `prefers-reduced-motion: reduce` is active on this host, which is also the state
the still frames represent. A human must open the site in a real browser to judge the
motion, and the borders/glow of all three effects.

---

## STEP 15 — résumé page, per-album colours, violet orb, contacts, device pass  (2026-10-08)

Status: ✅ done

### 1. The resume page (the PDF from STEP 00 is gone)

**`C:\Users\rohan\Downloads\Resume.pdf` no longer exists.** Searching Downloads,
Desktop, Documents and OneDrive for `*.pdf` / `*resume*` turned up no replacement.
What did exist: `Downloads/pdf2png/Resume/Resume-1.png` — a **1654×2339 render**
(exactly A4 at 200 DPI, aspect 1.414, 8-bit palette PNG, 151 KB), created 23:05 on
Oct 7. That render is the only surviving copy of the resume.

So the page is built on that one asset, plus a PDF **generated from the same pixels**:

```
public/resume/rohan-dabhade-resume.png   151 KB  ← preview (and the source of truth)
public/resume/rohan-dabhade-resume.pdf   244 KB  ← download
```

`scripts/make-resume-pdf.mjs` does the conversion from scratch — a PNG reader
(palette / greyscale / truecolour, 8-bit, non-interlaced, all five scanline filters)
plus a minimal PDF writer, both deflated with Node's zlib. No dependency, and no JPEG
re-encoding, so the glyph edges are identical to the render.

**Verification of the generated PDF** (it had to be proven, not assumed):

| Check | Result |
| --- | --- |
| `startxref` points at `xref` | yes, offset 249936 |
| every xref offset resolves to `N 0 obj` | yes, all 6 |
| `/Length` vs bytes before `endstream` | 249280 ✓ |
| image stream inflates to `w*h*3` | 11,606,118 = 1654×2339×3 ✓ |
| **pixels fingerprint like Chromium's decode of the PNG** | identical — sum 355081, 520 ink cells, FNV `166e9c02`, same 12 sampled cells |
| Chromium opens it | `document.contentType === "application/pdf"`, a real `EMBED` viewer |

That last fingerprint check is the important one: Chromium decoded the PNG, my
hand-written decoder + writer produced the PDF, and both fingerprint the same — so the
PDF provably carries the same page rather than a blank or mangled one.

Files:

```
public/resume/rohan-dabhade-resume.{png,pdf}   the two assets
scripts/make-resume-pdf.mjs                    PNG → A4 PDF (documented in README)
src/content/resume.ts                          asset paths + the four summary cards
src/app/resume/page.tsx                        the page (static; reads the file size at build time)
src/components/resume-viewer.tsx               download + preview (client)
```

The viewer is two-track on purpose: **iframe with the PDF from 900px up** (a real
document — selectable, zoomable), and **the render below that**, because mobile browsers
either refuse inline PDFs or trap them on one un-zoomable page. It uses
`useSyncExternalStore` for the media query rather than an effect, so there is no
post-mount setState and no hydration mismatch — and it flips live on resize (verified).

### 2. Glyph Orb

- Ramp was `" .·:-=+*xX$&8@#"`. Now `" .·:-=*"` — the heavy text glyphs are gone and
  `*` is the single dense character at the bright end. `$` and `&` went with them
  (same family of heavy glyphs); say the word and they come back.
- Palette is now **violet → pink**: `#2b1a5c` (unlit) → `#6d3dff` → `#ff9be1`, with the
  atmosphere ring, the distant sun and the limb glyphs tinted to match. The site-wide
  green `.orb-veil` behind it is untouched — that is the shared astral treatment.
- Measured after: 98.5% of ink pixels violet, 17.6% pink, ink coverage 33.2% → 29.0%
  (the ramp is lighter, as intended), hence a dimmer peak (maxLum 251 → 186).

### 3. Photon Knot — one light per project

`Album.palette: [core, highlight]` drives both the ribbon and the cover:

| Album | Palette | Measured on the canvas |
| --- | --- | --- |
| JetNet Super-Resolution | `#6d3dff` → `#ff9be1` | avg rgb `[126, 73, 250]`, 100% violet |
| Python Sessions | `#9b1b30` → `#ffc08a` (maroon → ember) | avg rgb `[167, 42, 57]`, 100% warm |
| `/projects` hero | site green (default) | avg `[100, 223, 150]` |

`AlbumCover` also derives `--cover-glow`, `--cover-base`, `--cover-label-glow` and
`--cover-orb` from the palette, so the bloom, the inner wash, the floating `J / 01` label
and the hover shadow all belong to that record. Green stays the fallback everywhere.

`src/lib/color.ts` exists because the fx modules are client components ("use client") and
a **server** component cannot call a plain function out of a client module — so the colour
helpers live in a neutral file both sides can import.

### 4. Contacts, and the nav gap

`profile.socials` is now the single list (GitHub, LinkedIn, Email, Phone) with an `icon`
key, and the hero, footer and `/connect` all render from it. The hero shows the three
public ones as buttons next to "Explore my work".

Also fixed while in there: **`/curiosity` was not in `navItems`** — the page has existed
since STEP 05 and was unreachable from the rail. The rail now lists Artist home,
Curiosity, GitHub projects, Liner notes, Resume.

### 5. Tablet and phone

Measured at 414 (phone), 820 (tablet portrait), 1024 (tablet landscape) and 1280:

| Width | Result |
| --- | --- |
| 414 /resume | 1-column cards, poster 560→full width, preview uses the **image** path, no overflow |
| 820 /resume | still the image path (< 900px), 2-column cards, single-row toolbar, no overflow |
| 1024 /resume | flips to the **PDF iframe live on resize**, desktop rail returns (> 1000px), 2 columns, no overflow |
| 414 / and /projects | phone rail bar, 1-column album grid, orb 294px (98.6% violet), both covers keep their own colours, no overflow |

One real problem found and fixed: on a 414px phone the hero's five full-size buttons
stacked to **159px** of the first screen. The contact links now render as mono chips
below 760px (the same shape as the footer row) — 159px → ~105px with 38px touch targets.

### 6. A dev-server red herring, and how it was settled

The first request to `/resume` returned **500** with *"Element type is invalid … got:
undefined"*. It looked like a broken import. It was not: the request landed while
Turbopack was still compiling the brand-new route (the log shows a burst of
`✓ Compiled in …` immediately before). Re-requesting returned 200, and the **production
build prerenders `/resume` to static HTML with no error** — which is the decisive test.
`.next/server/app/resume.html` (39 KB) contains the headline, both asset paths, the
download filename, the build-time file size, the poster and all four cards.

Verify (exit statuses captured):

```
npx tsc --noEmit   → exit 0
npm run lint       → exit 0  (0 errors, 0 warnings)
npm run build      → exit 0, 14 pages, /resume prerendered as static content
curl /  /curiosity  /projects  /projects/[both]  /notes  /connect  /resume → 200 ; /nope → 404
curl /resume/rohan-dabhade-resume.pdf → 200 application/pdf (250154 B)
curl /resume/rohan-dabhade-resume.png → 200 image/png (151336 B)
sitemap.xml → includes /resume
console on /resume → only Next's font-preload notices, no errors
```

**Still not verified:** the animation of all three canvas effects (this webview suspends
rAF) and the Spotify round-trip (no credentials). No screenshots exist for anything.

---

## STEP 16 — Re-verification on a fresh server, and the dev-hydration bug  (2026-10-09)

Status: ✅ done

Files: `next.config.ts` (real fix), `README.md`, `PROGRESS.md`, this log

Notes — the session host restarted, so the dev server was gone and every claim from
STEP 15 was re-established from scratch. That is what exposed the one genuine defect:

### The bug: `127.0.0.1` was serving a non-interactive page

Next 16 treats `localhost` and `127.0.0.1` as different origins and blocks its own dev
resources for the unlisted one. The server log was explicit:

```
⚠ Blocked cross-origin request to Next.js dev resource /_next/hmr from "127.0.0.1".
```

Consequence, measured in the browser: the page **renders** (it is server-rendered HTML)
but **nothing hydrates** — `data-fx="off"` everywhere, canvases stuck at their default
300×150, no drawer, no preview toggle. A programmatic `element.click()` did nothing, and
no React fibre was attached to any node, which is what settled it.

This matters because `127.0.0.1:3000` is the host in the Spotify redirect URI
(`SPOTIFY_REDIRECT_URI`), so it is the address the OAuth flow will use.

Fix: `allowedDevOrigins: ["127.0.0.1", "localhost"]` in `next.config.ts`. After the
restart: `[HMR] connected`, `data-fx="on"`, orb canvas 570×570, drawer and preview toggle
both live. The production build was never affected, which is why STEP 15 missed it —
production has no HMR client and no origin gate.

Ruled out while diagnosing, so the next reader does not repeat it: the websocket itself is
fine (`curl` gets `101 Switching Protocols` from the dev server); it is the browser's
origin that was refused.

### Everything else, re-verified on the artefact

| Check | Result |
| --- | --- |
| PDF structure | 9/9 — xref 7 entries, free head `0 65535 f`, each in-use offset lands exactly on `n 0 obj`, image stream exactly `/Length` bytes then `endstream`, inflates to 1654×2339×3 = 11 606 118 B, MediaBox `0 0 595.28 841.89` (ratio 0.7071 = A4), content `q 595.28 0 0 841.89 0 0 cm /Im0 Do Q`, trailer `/Size 7 /Root 1 0 R /Info 6 0 R`, `%%EOF` |
| Download, through the UI | `fetch()` of the button's own `href` → 200, `application/pdf`, `%PDF-1.4`, 250 154 B, and the anchor carries `download="Rohan-Dabhade-Resume.pdf"` |
| Resume preview, ≥ 900px | `IFRAME.resume-frame`, `src=/resume/rohan-dabhade-resume.pdf#view=FitH`, iframe `contentDocument.contentType === "application/pdf"` (Chromium's viewer is really instantiated) |
| Resume preview, < 900px | `DIV.resume-scroll > IMG.resume-page`, declared 1654×2339, `naturalWidth/Height` 1654×2339 — the pinch-zoomable render, not the iframe |
| Glyph Orb | brightest ink `#ff9be1`, `#ff9ce1`, `#ff9ae1` (the requested pink, exact); deepest `#673dff`, `#6f3dff` (the requested violet); **greenish pixels = 0** |
| Photon Knot per album | JetNet mean `#9558f6`, `--cover-glow rgba(109,61,255,.32)`; Python Sessions mean `#b64447`, `--cover-glow rgba(155,27,48,.32)`, `--cover-label-glow rgba(255,192,138,.8)` — maroon and violet/pink, visibly distinct records |
| Glyph ramp | `RAMP = " .·:-=*"`; no `@ # 8 X x + $ &` anywhere in `src/components/fx/` |
| Layout | 390 (phone), 768 and 820 (tablet), 1024, 1440 — `scrollWidth − clientWidth` = 0 on `/`, `/projects`, `/projects/[slug]`, `/resume`, `/connect`; the only elements past the viewport are the intentionally clipped marquee track and the decorative veil |
| Contacts | `/connect` and the footer both render GitHub · LinkedIn · Email · Phone from `profile.socials`; `target="_blank"` only on the two external links, `mailto:` and `tel:` left alone |

An earlier version of the PDF checker reported 3 failures — those were **bugs in the
checker** (wrong capture-group indices, and a 9-character slice where the header is 8).
Re-derived with `startsWith` and explicit groups: 9/9 PASS. Worth recording because
"the test failed" and "the artefact is broken" are not the same claim.

### Honest limits

- The three canvas effects are still **motion-unverified**: this webview suspends
  `requestAnimationFrame`, so only the still frame (painted synchronously on mount) can be
  measured. Everything above is a still-frame or DOM measurement.
- Chromium **screenshots the PDF-plugin surface as flat grey** — the plugin is real
  (the iframe's own document reports `application/pdf`), it simply does not composite into
  an offscreen capture. Not a page defect.
- Spotify: still no credentials, so the round-trip is unverified; `NOT CONNECTED` is what
  ships until `.env.local` is filled in.

Verify (exit statuses captured):

```
npm run lint      → exit 0
npm run typecheck → exit 0
npm run build     → exit 0, 14 pages, /resume static
curl /  /curiosity  /projects  /projects/[both]  /notes  /connect  /resume  /sitemap.xml → 200
curl /resume/rohan-dabhade-resume.pdf → 200 application/pdf (250154 B)
curl /resume/rohan-dabhade-resume.png → 200 image/png (151336 B)
dev server: PID tracked, /tmp/next-dev.log, listening on 127.0.0.1:3000
```

## STEP 17 — draggable planet, raised orb, dark/light theme  (2026-10-10)

### The IDE error was a folder problem, not a code problem

Reproduced it: `npm run dev` and `npm install` both die with `ENOENT … Could not read
package.json … local-projects\portfolio\package.json`. The app keeps the project one level
deeper (`…/portfolio/threads/<hash>/`), and the parent folder only ever received a stub
`package-lock.json` from the failed install. Fixed with a Windows directory junction
(`C:\Users\rohan\portfolio` → the real folder), which needs no admin and creates no second
copy, so the IDE, the terminal and the app all edit the same files. Verified: install exit 0,
dev server 200 from the junction.

While testing, `PORT=0` turned up in the environment — Next then prints
`- Local: http://localhost:59021`. Fine until the Spotify redirect URI (pinned to 3000) is
involved; `npx next dev -p 3000` pins it. Both gotchas documented in the README.

### Orb raised, and pickable

`.hero-orb` `top: -6% → -13%`. The drag is a trackball: the object rotation is applied in
reverse to each cell's surface normal, so the sun stays fixed and the terminator keeps its
meaning. `perPixel = 1 / radius` (read from the draw) makes the surface track the pointer
1:1 at the centre of the disc at any size; a fixed constant would be 25–40% off either way.
The stage slides with the pointer (clamped 72×54) and springs home on release; a flick keeps
spinning with decaying velocity. `touch-action: pan-y` so phones can still scroll the hero.

**Bug found by measurement:** the first version had yaw inverted — the surface slid −60.3px
for a +60px drag, and the auto-spin ran backwards vs STEP 14. Fixed with `yaw = -spin`; the
identity check (no tilt ⇒ reduces to the original `atan2(u,z) + spin`) holds to 2.2e-16, and
the centred point now moves 59.0px for a 60px drag.

### Dark/light

- `src/lib/theme.ts` (no directive, so the server layout can read it) + `use-theme.ts`
  (`useSyncExternalStore`) + `theme-toggle.tsx`. Pre-paint script inlined in `<head>`
  (byte 4638, before `<body>` at 5197) so a light visitor never sees a dark flash.
- The light theme inverts the design's premise: dark is additive, paper is subtractive, so
  ~24 rules repair the glows (grain, bloom, rings, stars, chips, buttons, closing panel).
  `--star` became bare RGB channels for the same reason.
- Canvases follow the theme via `getTheme()` *inside the draw*, so no stale-palette frame;
  a `THEME_EVENT` listener repaints when the loop is not running. Stipple Type re-samples
  with a dark marble. Album covers deliberately do not follow (measured byte-identical
  between themes: mean `[125,73,250]`, 74497 ink px).

Verified: lint 0, tsc 0, build 0 (14 routes), toggle round-trip + persistence, clean
console, no dark surfaces left on the light pages, no overflow at 390/820, CTA and headline
still hit-testable over the orb's hit area, canvas pixels change on drag, transform cleared
on release. No screenshots are possible in this webview (it does not composite), so every
visual claim is a computed-style or canvas-pixel measurement; motion remains unverified.

## STEP 18 — beige light room, orb calibrated to the recording  (2026-10-10)

The user supplied a 1.37s screen recording as the spec for the orb. Decoded to raw RGB and
measured per frame:

- orb outline frozen (left edge x=448 in all 41 frames) → not a translation;
- ink changes 40–50k px/frame only *while the pointer moves*, and **exactly zero** for 11
  consecutive frames when it is parked → pointer-driven, no idle spin;
- brightest-ink centroid pinned at 225–244° → the **sun is fixed**;
- pointer swept to ~1.7 disc-radii, surface travelled ~0.4–0.6 of the pointer's distance.

Implemented: hover turns the planet (whole `.hero` as the zone, half gain, uniform out to
~2.25 radii), grab stays 1:1, mouse-only, hover stands down during a grab, idle drift cut to
0.012 rad/s. The first hover zone written (620px ≈ 3.6 radii) was measured to make the far
corner of the page stir the planet and was cut to 300px.

Measured: hover at 1.4R → 29.6px surface for 60px pointer (the 0.5 gain exactly), far corner
(589px vs 540px reach) ignored, grab 59.0px for 60px, touch moves ignored, touch drag turns
it, transform clears on release. lint 0, tsc 0, build 0, routes 200.

Beige: `--bg #f2e9d7` + warmed panels/neutrals/grain/star ink, meta `#f2e9d7`, warm-cream
bloom core. Contrast computed, not eyeballed — `--dim` moved to `#756239` after the first
warm grey measured 3.4–3.7:1 (now 4.5–5.4:1, AA for the mono labels).

## STEP 19 — Next.js 16.4.0 → 16.4.3 (security patch)  (2026-10-24)

Status: ✅ done

Files:
- `package.json` — `next` 16.4.0 → **16.4.3** (exact pin kept), `eslint-config-next` ^16.4.0 → **^16.4.3**
- `next.config.ts` — added `experimental.agentUpgrade: "security"`; every existing key untouched
- `package-lock.json` — regenerated (lockfileVersion still 3)
- `MEMORY/next-upgrade.md` — new runbook: the repeatable procedure for the next patch bump
- `PROGRESS.md`, `README.md` — pointer + step row

Notes:
- **No Git repository** (`git rev-parse` → `fatal: not a git repository`), so the branch,
  worktree, commit and PR checks in the upgrade guide were *unavailable*, not empty. Done in
  place; nothing to commit or publish. The marker search found no `next-upgrade:` claims.
- Same-major patch → **no codemod** and no migration guide. Only the pin and the config key.
- `experimental.agentUpgrade` is in the 16.4 config schema (`zod` union
  `'security' | 'latest' | 'experimental-future' | false`), and the build accepted it — Next
  validates unknown experimental keys at build time, so exit 0 is the proof it is supported.
- `npm install` alone left `eslint-config-next` at 16.4.0 because `^16.4.0` still matched the
  lockfile; it took an explicit `npm install -D eslint-config-next@16.4.3`. It does not export
  `package.json`, so its version was read off disk with `fs`.
- Audit after: the Next advisory is **gone**; one high remains in `zod <4.6.6` (memory
  exhaustion while validating oversized constrained collections), reached through
  `eslint-config-next → eslint-plugin-react-hooks → zod`. Dev-only lint tooling, out of scope
  here — `npm audit fix` would clear it as a separate change.
- Still warns `Unknown at rule: @theme` in dev and build. That is Turbopack's CSS parser not
  knowing a Tailwind v4 at-rule, not a regression: the served CSS contains `--color-accent`
  and `f2e9d7`, and the build exits 0. **Do not "fix" it by editing `globals.css`.**

Verify (all from the app root, exit codes captured with `PIPESTATUS`):
- `npm install` → 0 · `npx next --version` → `Next.js v16.4.3`
- `npm run lint` → 0 · `npm run typecheck` → 0
- `rm -rf .next && npm run build` → 0, 14 routes prerendered as before
- dev server on `-p 3000`: `/`, `/connect`, `/curiosity`, `/notes`, `/projects`,
  `/projects/jetnet-super-resolution`, `/projects/python-sessions`, `/resume`, `/robots.txt`,
  `/sitemap.xml`, `/icon.svg`, `/opengraph-image`, `/api/spotify/now-playing` → **all 200**
- served CSS 90,211 B in dev / 74,749 B in the build, both carrying the theme tokens

## STEP 20 — Sunrise light room + header clean-up  (2026-10-24)

Status: ✅ done

Files:
- `src/app/globals.css` — light token block rebuilt; 60 green accent tints → persimmon;
  light `.orb`, `.giant-word`, `.song-art`, dock and focus/hover shadows retuned; new
  light-only aurora on `.ambient-glow::before`; `--dim` `#755631` for AA over the wash
- `src/lib/theme.ts` — `THEME_COLORS.light` → `#fff3e2`
- `src/components/fx/stipple-type.tsx` — light marble ends in persimmon, not green
- `src/app/notes|curiosity|connect/page.tsx`, `curiosity-skills.tsx`,
  `interactive-track-list.tsx` — green inline washes → `color-mix(… var(--accent) …)`
- `src/app/projects/page.tsx` — waveform uses the theme accent instead of a fixed green pair
- `src/app/{page,curiosity,notes,projects,resume,connect,not-found}.tsx`,
  `src/content/profile.ts` — `RD` monogram chip removed; `monogram` field deleted
- `next.config.ts` — `devIndicators: false` (removes the floating Next “N” in dev)
- `README.md`, `PROGRESS.md`, `MEMORY/design-reference.md` — docs updated

Notes:
- Dark is untouched by construction: every edit is either inside a
  `:root[data-theme="light"]` rule or a theme-aware `var(--accent)` change whose dark value is
  the old green. Re-measured dark live: `rgb(5,7,6)`, rail `rgb(3,5,4)`, panel `rgb(12,17,13)`,
  accent `#4ade80`, no aurora, meta `#050706`.
- The "N" was `#next-logo` inside the `nextjs-portal` shadow root, pinned bottom-left by Next.
  `devIndicators: false` leaves the portal in the DOM but renders the badge at 0×0; verified
  `hasLogo: false` in the shadow root. Restart `next dev` (or let it auto-restart) for the
  config to take effect.
- The `Spotify` card still falls back to the curated crate: the stored refresh token is the
  3-character placeholder from `.env.example`, so the token endpoint answers `invalid_grant`.
  That is an account-authorisation step, not a code defect. The integration is read-only by
  design (three read scopes, no playback scope) — see the conversation notes.
- `Unknown at rule: @theme` still warns in dev/build; cosmetic, predates this step.

Verify:
- `npm run lint` → 0 · `npm run typecheck` → 0 · `npm run build` → 0 (14 routes)
- routes `/`, `/curiosity`, `/projects`, both project pages, `/notes`, `/resume`, `/connect`,
  `/api/spotify/now-playing`, `/sitemap.xml`, `/robots.txt` → 200; `/nope` → 404
- light computed: `body rgb(255,243,226)`, rail `rgb(248,232,210)`, panel `rgb(255,249,239)`,
  accent `#a83a0e`, meta `#fff3e2`, aurora gradients present, dev badge absent, no overflow

## STEP 21 — Player dock auto-scroll repair  (2026-10-24)

Status: ✅ done

Files:
- `src/components/player-dock.tsx` — autoscroll rewritten to a 33ms ticker with a float
  position and `scrollTo({ behavior: "instant" })`; `handleSeek` shares the position ref;
  the pause-on-scroll listener ignores the dock and the first 350ms after Play
- `PROGRESS.md` — step entry

Notes:
- `html { scroll-behavior: smooth }` made every per-frame `scrollBy` a new smooth animation
  that the next frame replaced. `requestAnimationFrame` is also suspended in hidden tabs.
  Both are bypassed by the ticker + explicit `instant`.
- Touch used to pause on `touchstart` from the dock's own pause button, then the click
  re-started playback. That is why the button is excluded now.
- Speed is 64 px/s; loops are instant when the Repeat button is active.

Verify:
- measured 0 → 23 → 50 → 76 → 101 → 126 → 154 px over 2.4s; loop wraps 957 → 56 and keeps
  playing; seek to 75% mid-play lands at 814 px; real wheel pauses
- lint 0 · typecheck 0 · build 0 (14 routes)

## STEP 22 — Supplied resume installed  (2026-10-24)

Status: ✅ done

Files:
- `public/resume/rohan-dabhade-resume.pdf` — the supplied master, byte-identical
- `public/resume/rohan-dabhade-resume.png` — 200 DPI render, 1654×2339
- `src/content/resume.ts` — projects/hackathons cards, experience note, asset comments
- `src/components/resume-viewer.tsx` — ATS text matches the new PDF
- `src/app/resume/page.tsx` — metadata description
- `README.md`, `PROGRESS.md` — asset flow and step entry

Notes:
- The directory was empty before this step; the page had a broken poster, iframe and
  download. The supplied PDF replaces whatever the old master was.
- PDF is now the source of truth; the PNG is a render of page one. `resume:pdf` is kept as
  a legacy image-first path.

Verify:
- `/resume` 200 · PDF 200 `application/pdf` 4,945 B (bytes identical) · PNG 200
  `image/png` 338,441 B · poster 1654×2339 · stats `5 KB / October 2026` · desktop iframe
  `…pdf#view=FitH` · mobile image, no overflow at 390 · ATS tab shows the new sections ·
  lint 0 · typecheck 0 · build 0 (14 routes)

## STEP 23 — Real soundtrack, in order  (2026-10-24)

Status: ✅ done

Files:
- `src/content/soundtrack.ts` — five tracks, durations, page map, licence + source URLs
- `src/components/player-dock.tsx` — real `<audio>`, play/pause, route hand-off, loop
- `src/components/page-footer.tsx` + `src/app/globals.css` — visible CC BY credit
- `src/app/connect/page.tsx` — full soundtrack credits at `#soundtrack`
- `public/audio/01-petrichor.mp3` … `05-hiraeth.mp3` — 28 MB total
- `SOUNDTRACK.md`, `README.md`, `PROGRESS.md` — sources, licence, swap procedure

Notes:
- The five files the user attached were commercial Radiohead masters. They are not copied
  into the project; the user chose the CC-licensed route instead.
- Scott Buckley's tracks are CC BY 4.0. The licence was checked on each artist page, not
  only on the Commons mirror. Every page carries a credit link to `/connect#soundtrack`.
- Originals are Ogg Vorbis; the served files are one-pass 160 kbps MP3 with loudness
  normalisation (`I=-18:TP=-1.5:LRA=11`). The change is declared in the credits.
  Attribution format in `SOUNDTRACK.md`; do not remove it while these files ship.
- Play starts audio + the 64 px/s auto-scroll; Pause stops both. Next/Previous and the rail
  keep the record playing across routes. A trusted wheel/touch outside the dock pauses both.
  Loop loops both. At the page bottom the scroll stops and the record plays out (otherwise a
  4–5 minute track would be cut off after ~16 s on a phone). The time readout is the song
  clock; the hairline still scrubs the page.
- `audioTime`/`audioDuration` are derived from a `{ src, time, duration }` clock, so a route
  change resets the readout without a setState-in-effect lint violation.

Verify:
- audio 271.25 s, 55% volume · play advances time and scroll together · pause freezes both
  at 21.171 s / 1404 px · at 390 px the page bottom (1032 px) stops the scroll but the record
  keeps playing (51.6 s, vinyl still spinning) · Next keeps playing on `/curiosity` with
  `02-luminance.mp3` · all five MP3s 200 `audio/mpeg` · footer credit on `/` · five credits
  on `/connect` · typecheck 0 · lint 0 · build 0 (14 routes)

## STEP 24 — Guestbook is database-backed  (2026-10-25)

Status: 🔄 code + local verification done; live Atlas connection needs `MONGODB_URI`

Files:
- `src/content/reviews.ts` — shared ratings, labels, colours and length limits
- `src/lib/reviews.ts` — server-only MongoDB client, validation, pending insert, approved read
- `src/app/api/reviews/route.ts` — GET approved only, POST pending, 5/10 min per-IP throttle
- `src/components/guestbook.tsx` — rewritten, no seeded reviews and no `localStorage`
- `next.config.ts` — `serverExternalPackages: ["mongodb"]`
- `.env.example`, `README.md`, `REVIEWS.md`, `PROGRESS.md` — setup and approval runbook

Notes:
- Removed `CURATED_REVIEWS` (Vikram R., Elena Chen, Arjun M., DevK) and the
  `onrepeat_guestbook_signatures_v1` store. The board can only show rows that exist in
  MongoDB with `status: "approved"`.
- Atlas Data Explorer approval is one edit: `status: "pending"` → `"approved"`.
  `approvedAt` is optional; the API falls back to `createdAt`. `rejected` and pending rows
  never reach the browser.
- Gravity account provisioning is disabled, so the free M0 cluster could not be created
  from here. The tracked setup link and the remaining steps are in `REVIEWS.md`.
- `MONGODB_URI` is server-only; never prefix it with `NEXT_PUBLIC_` and never print it.
- `.env.example` held live-looking Spotify credentials; replaced with placeholders. If it
  was ever committed or shared, rotate the client secret.

Verify (temporary MongoDB 8.2.6, removed afterwards):
- POST 201 → `GET /api/reviews` stays `[]` → set only `status:"approved"` → review appears
  with `createdAt` fallback · invalid rating 400 · missing comment 400 · 7 KB body 413 ·
  sixth submission in ten minutes 429 with `Retry-After`
- production `next build` + `next start` with the real driver: POST 201, pending hidden,
  approved visible · `/connect` 200 · UI submit success notice, pending hidden, two cards,
  filter, empty state · 390 px no horizontal overflow · lint 0 · typecheck 0 · build 0
