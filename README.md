# on repeat. — a portfolio, not a playlist

A multi-page portfolio for **Rohan Dabhade** built as if GitHub were a record label:
repositories are **albums**, source files are **tracks**, and the "last song listened"
card shows what is actually playing on Spotify.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4.
Zero UI dependencies — every icon, animation and visual is hand-written.

---

## Quick start

**Run it from `C:\Users\rohan\portfolio`, not from the app's workspace folder.**

```powershell
cd C:\Users\rohan\portfolio
npm install
npm run dev          # http://127.0.0.1:3000
```

That path is a Windows **directory junction** to the real project folder. It exists
because the app keeps the project inside its own tree —
`%USERPROFILE%\.config\freebuff-desktop\local-projects\portfolio\threads\<hash>\` — and
opening *that* parent folder in an IDE is what produces the confusing
`npm error enoent … Could not read package.json` on both `npm install` and `npm run dev`:
the parent holds only a placeholder `package-lock.json`. The junction gives the same files
a normal-looking address, so the IDE, the terminal and the app all edit one copy — there is
no second checkout to keep in sync. (Recreate it with
`New-Item -ItemType Junction -Path C:\Users\rohan\portfolio -Target <real folder>` if it is
ever removed.)

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript rules) |
| `npm run resume` | **Continue-after-tokens-run-out helper** — typechecks and prints the next incomplete step from `PROGRESS.md` |
| `npm run resume:pdf` | (Legacy) Wraps the PNG render back into an A4 PDF; the supplied PDF is now the master |

### Two dev-server gotchas

**1. Origins.** Next 16 treats `localhost` and `127.0.0.1` as **different origins**, and
blocks its own dev resources (HMR, and with them hydration) for whichever one isn't
allowed. Because the Spotify redirect URI is registered against `127.0.0.1:3000`, that is
the address you should use — so [`next.config.ts`](next.config.ts) lists both:

```ts
allowedDevOrigins: ["127.0.0.1", "localhost"],
```

Without it the site still *renders* at `127.0.0.1:3000` (it is server-rendered HTML), but
nothing is interactive — no drawer, no preview toggle, no canvas. If a page ever looks
right and does nothing, check this first.

**2. `PORT`.** If `PORT` is set in the environment — some IDEs and terminals set it, and
`PORT=0` means "any free port" — `next dev` will **not** use 3000, and it says so in its
banner (`- Local: http://localhost:59021`). Everything still works, but the Spotify
redirect URI will not match. Pin it explicitly when that happens:

```powershell
npx next dev -p 3000      # or: set PORT=3000 first
```

---

## Routes

| Route | Role |
| --- | --- |
| `/` | Artist home — astral hero, "Behind the tracks" bio, **Last song listened** |
| `/curiosity` | Oversized astral introduction + **Skills in rotation** + experience |
| `/projects` | Discography — albums in rotation and every track in one place |
| `/projects/[slug]` | An album per repository — cover, track list, "Behind this album" |
| `/resume` | The paperwork — **download** or **preview** the one-page resume, plus a summary of it |
| `/notes` | Liner notes — certifications, hackathons, the reasoning |
| `/connect` | Say hello — email, LinkedIn, GitHub, phone |

Every contact channel comes from one list, `profile.socials`, so the hero, the footer and
`/connect` can never drift apart.

---

## Dark and light

The theme switch sits at the top of every page — in the rail's header on desktop, in the
sticky bar on phones and tablets — and the choice is remembered, applied **before the first
paint** by a small inline script in the root layout, so there is no dark flash on a light
reload. It is an attribute, `data-theme="dark|light"` on `<html>`; every colour in the
light theme hangs off that one selector at the end of
[`globals.css`](src/app/globals.css).

The light room is **sunlit paper**, not white — `#fff3e2` under cream panels, with a
four-corner wash of apricot, lilac, rose and mint falling behind the content, and a
persimmon accent (`#a83a0e`) instead of the dark room's green. Every text token is checked
against the strongest of those washes, not just the flat ground: `--dim` is `#755631` so
the 11px mono labels stay at 5.2:1 there (6.1:1 on the page, 5.6:1 on the rail), and the
accent holds 4.9–5.9:1 everywhere it is used as text.

The light theme has its own palette on purpose. The dark room is one green light on black;
the light room is a warm sunrise with a different accent hue, so switching themes changes
the feeling of the page rather than just its brightness.

The two themes are not one palette with two backgrounds swapped. The dark room is
*additive* — colour is added to near-black, so glows read as glows — and on paper that
inverts, because adding light to a white ground is invisible. So the canvas effects switch
too: the glyph orb and the discography's Photon Knot draw **translucent ink** in light mode
(same hues, pushed through `deepenRgb`), and the giant headline is re-sampled with a dark
marble.

One deliberate exception: **album artwork stays dark in both themes.** A record sleeve is
black whatever colour the wall is, so the covers keep their own additive light — only the
knot behind the `/projects` headline follows the theme.

### Picking up the planet

The glyph orb on the home page follows the pointer. There are two gears:

| Gesture | Gain | Zone |
| --- | --- | --- |
| Sweep the pointer near the orb (no click) | half — the surface travels about half as far as the pointer | up to ~2.25× the disc's radius |
| Press and drag | **1:1 with the pointer at the centre of the disc**, at any screen size | captured, so the drag survives leaving the box |

The 1:1 comes from `perPixel = 1 / radius`, derived from the planet actually drawn rather
than a constant — the orb is `clamp(320px, 52vw, 620px)`, so one fixed number would be a
quarter too slow on a phone and two-fifths too fast on a desktop. The hover gain and its
reach are calibrated against the reference recording (see `PROGRESS.md`, STEP 18).

Underneath it is a *trackball*: yaw and pitch in radians, applied in reverse to each cell's
surface normal, so the bands and the day/night terminator stay correctly related while the
sun itself never moves. The whole astral stage slides with the pointer and springs home on
release, and a flick keeps spinning on decaying velocity.

Two guards keep it from becoming noise. It is **mouse-only** — a finger dragging the page is
a scroll, not a gesture at the sky, and `touch-action: pan-y` keeps vertical swipes
scrolling the page on top of that (trapping the first screen of the home page to make a
320px circle draggable would be a bad trade). And the hover stands down while a grab is
live, so the two never fight over the same radians. On touch, a sideways drag on the orb
still turns it.

Idle drift is deliberately near-still: one revolution every ~9 minutes. The reference shows
the ink *frozen* between pointer moves, but a completely static orb would be dead on a
phone, so it keeps a slow breath instead.

---

## Connecting Spotify (one time)

The card degrades gracefully: until you finish this, it renders
**"Off the record, for now. / NOT CONNECTED"**.

1. Create an app at <https://developer.spotify.com/dashboard>.
2. In the app settings add this Redirect URI **exactly** (Spotify does not normalise
   trailing slashes or `localhost` vs `127.0.0.1`):
   `http://127.0.0.1:3000/api/spotify/callback`
3. Copy `.env.example` to `.env.local` and set `SPOTIFY_CLIENT_ID`,
   `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REDIRECT_URI`.
4. Run `npm run dev`, then open
   <http://127.0.0.1:3000/api/spotify/login> in your browser and approve the scopes.
5. The callback page prints your **refresh token** — that is the only time it is ever
   shown. Paste it into `.env.local` as `SPOTIFY_REFRESH_TOKEN` and restart the server.

```env
SPOTIFY_CLIENT_ID=…
SPOTIFY_CLIENT_SECRET=…
SPOTIFY_REFRESH_TOKEN=…
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback
```

Scopes requested: `user-read-currently-playing`, `user-read-recently-played`,
`user-read-playback-state`.

**Security notes**

- `.env.local` is git-ignored — never commit it.
- The refresh token is only ever read server-side, inside `/api/spotify/*`; it is never
  sent to the browser and never bundled.
- The refresh token is exchanged for an access token with a `state` cookie guarding the
  callback, and the access token is memoised in the server isolate until it expires.
- `/api/spotify/now-playing` is public but read-only, and cached for 30 seconds.

---

## The guestbook

`/connect#guestbook` is a real, moderated board — no seeded quotes and no
`localStorage`. A submission is written to MongoDB as `status: "pending"`, and
`GET /api/reviews` only ever returns `status: "approved"` documents. You approve
a review by editing that one field in Atlas; the full walkthrough, schema and
troubleshooting live in [`REVIEWS.md`](REVIEWS.md).

```env
MONGODB_URI=mongodb+srv://…
MONGODB_DB=portfolio
```

Without `MONGODB_URI` the section says *"The guestbook is being set up"* and the
sign button is disabled; it never falls back to sample content.

---

## Deploying

The project is dependency-light and works on any host that runs Next.js.

### Vercel (recommended — the API routes need a Node runtime)

```bash
npx vercel            # preview
npx vercel --prod     # production
```

Then, in the Vercel project:

1. Add the four `SPOTIFY_*` variables under *Settings → Environment Variables*.
2. Add `MONGODB_URI` (and optionally `MONGODB_DB=portfolio`) so the guestbook can
   read and write reviews. Add `0.0.0.0/0` to Atlas Network Access first — see
   [`REVIEWS.md`](REVIEWS.md).
3. Add `NEXT_PUBLIC_SITE_URL=https://your-domain.com` so canonical URLs, `sitemap.xml`
   and `robots.txt` point at the real domain.
4. Add `https://your-domain.com/api/spotify/callback` as a second Redirect URI in the
   Spotify dashboard, and update `SPOTIFY_REDIRECT_URI` to match.

---

## Content

All copy lives in two typed files, verified against the resume and the GitHub API —
no lorem ipsum anywhere:

```
src/content/profile.ts     identity, bio, skills, experience, certifications, nav
src/content/albums.ts      albums (repositories) and tracks (source files)
src/content/soundtrack.ts  five CC BY 4.0 tracks and their page mapping
```

**Albums**

| Album | Repository | Tracks |
| --- | --- | --- |
| `J/01` JetNet Super-Resolution | [JetNet-SuperRes-PFlow](https://github.com/Roahncodes/JetNet-SuperRes-PFlow) | 6 |
| `P/02` Python Sessions | [Python-Projects](https://github.com/Roahncodes/Python-Projects) | 7 |

Every track row links to the real file on GitHub.

### Adding an album

Append an `Album` object to `src/content/albums.ts`. The detail page, the discography
grid, the sitemap and the track index all derive from that array — nothing else to touch.

---

## The soundtrack

The dock's Play button now plays a real song with the auto-scroll. Five instrumental
pieces by **Scott Buckley**, all **CC BY 4.0**, score the pages in order:

| Page | Track | Length |
| --- | --- | --- |
| `/` | Petrichor | 4:31 |
| `/curiosity` | Luminance | 4:53 |
| `/projects` (+ detail pages) | Machina | 4:51 |
| `/notes` | Undertow | 4:10 |
| `/resume`, `/connect` | Hiraeth | 5:46 |

The files live in `public/audio/`; the mapping, durations and licence links live in
[`src/content/soundtrack.ts`](src/content/soundtrack.ts). Play/pause, Next/Previous and
Loop carry the music across pages; a manual scroll pauses both the song and the auto-scroll.
When the page reaches the bottom the scroll stops but the record keeps playing until the
track ends, so a long piece is not cut short by a short page.
The credit is in the dock's time readout, the footer of every page and the full list on
`/connect#soundtrack`. Read [`SOUNDTRACK.md`](SOUNDTRACK.md) before swapping a track —
it has the sources, the licence terms and the exact attribution text.

---

## Project layout

```
src/
├─ app/
│  ├─ layout.tsx              fonts, metadata, the shell
│  ├─ globals.css             the entire design system (tokens → components → motion)
│  ├─ page.tsx                artist home
│  ├─ curiosity/              introduction + skills
│  ├─ projects/               discography
│  │  └─ [slug]/              album detail (SSG via generateStaticParams)
│  ├─ resume/                the download/preview page
│  ├─ notes/ connect/          liner notes, contact
│  ├─ api/spotify/            login, callback, now-playing
│  ├─ api/reviews/            public read + pending submission
│  ├─ icon.svg opengraph-image.tsx robots.ts sitemap.ts
├─ components/                rail, astral orb, track row, album card, reveal, …
│  ├─ fx/                     hand-built canvas effects (see below)
│  ├─ resume-viewer.tsx       download + preview
│  └─ social-links.tsx        contact chips, from profile.socials
├─ content/                   all copy
│  ├─ soundtrack.ts           tracks, licences and page mapping
│  └─ reviews.ts              review stamps, colours and limits
├─ lib/color.ts               colour helpers shared by server and client
├─ lib/reviews.ts             server-only MongoDB review store
└─ lib/spotify.ts             server-only Spotify client

public/resume/                the resume PDF (master) + its 200 DPI PNG preview
public/audio/                 five CC BY 4.0 MP3s (28 MB)
SOUNDTRACK.md                 sources, licence, attribution and swap procedure
REVIEWS.md                    Atlas setup, approval workflow and deployment
scripts/make-resume-pdf.mjs   legacy PNG → A4 PDF wrapper
```

---

## The resume

`public/resume/` holds two files that are the same page:

```
rohan-dabhade-resume.pdf   the master document, supplied directly   ← what the button hands over
rohan-dabhade-resume.png   1654×2339 = A4 at 200 DPI, rendered from it   ← the inline preview
```

**To replace the resume:** overwrite the PDF, then re-render the PNG at 200 DPI so the
preview matches it (PyMuPDF is installed on this machine):

```bash
python -c "import pymupdf; d = pymupdf.open('public/resume/rohan-dabhade-resume.pdf'); d[0].get_pixmap(dpi=200).save('public/resume/rohan-dabhade-resume.png')"
```

The page reads the PDF's size and date off disk at build time, so those numbers can never
drift from the file. `scripts/make-resume-pdf.mjs` (PNG → PDF, from scratch, no
dependency) is still available for image-first resumes via `npm run resume:pdf`, but it is
no longer the normal flow.

---

## The three canvas effects

`src/components/fx/` holds three effects written from scratch — no animation library, no
registry, nothing added to `package.json`:

| Effect | Where | What it actually is |
| --- | --- | --- |
| **Photon Knot** | backdrop of the `/projects` hero, and the artwork inside every album cover | a trefoil curve swept with a Frenet frame into a flat ribbon, projected with a perspective divide and drawn as depth-sorted quads under additive blending |
| **Glyph Orb** | the planet in the home hero's astral treatment | per character cell: a point on the unit sphere, latitude bands rippled by longitude, lit by a fixed sun with a rim term, quantised onto a glyph ramp |
| **Stipple Type** | the artist name on the home page | the headline rasterised offscreen with its real computed font, sampled into particles that get stirred by the pointer and spring back into the letterform |

They share [`scene.ts`](src/components/fx/scene.ts), which owns DPR sizing, a frame loop
that stops when the canvas scrolls away or the tab is hidden, and the reduced-motion
handling.

Two details worth keeping if you touch them:

1. **The still frame is painted synchronously on mount.** `requestAnimationFrame` is not
   guaranteed to run — a hidden or backgrounded webview suspends it entirely — so an
   effect that only draws from rAF can stay blank forever. The loop is an upgrade, not a
   requirement.
2. **Each effect is a `.fx-host` wrapper plus a `.fx-canvas` that fills it.** A bare
   canvas carrying both jobs stretches to its parent instead of the size it was given.

The canvas stays at `opacity: 0` until its first real frame lands (`data-fx="on"`), and
Stipple Type additionally refuses to hide the headline until its sample passes validation
— so a browser that can't run any of this still shows ordinary text.

Under the hood: `--bg #050706`, one accent (`#4ADE80`), Inter for display and JetBrains
Mono for labels. The "astral" look is a radial orb with layered blur and drift
animation plus a masked star field — see `MEMORY/design-reference.md`.

---

## Continuing after running out of tokens

Work is split into numbered steps tracked in [`PROGRESS.md`](PROGRESS.md), with a
detailed entry per step in [`MEMORY/step-log.md`](MEMORY/step-log.md).

```bash
npm run resume
```

prints the completed/total steps and names the next one to pick up.

Dependency bumps have their own stored method: [`MEMORY/next-upgrade.md`](MEMORY/next-upgrade.md)
covers duplicate checks, the exact pin, the config policy, the full verification set, the two
known benign warnings, and rollback — written to be started cold.

---

## Accessibility & motion

- Every interactive element has a visible focus ring; the nav exposes `aria-current`.
- The mobile drawer is a labelled, `aria-expanded` disclosure.
- Decorative layers (orb, stars, ticker) are `aria-hidden`.
- Scroll reveals fall back to fully visible markup when JavaScript is unavailable.
- The `<h1>` is never replaced by a canvas: Stipple Type keeps the real heading in the
  DOM for screen readers, search engines and no-JavaScript visitors, and only makes it
  transparent once its own sample has painted. If sampling fails it hands the pixels back.
- Audio never autoplays: it starts only after Play, and the dock exposes a labelled
  Play/Pause key. The soundtrack is CC BY 4.0 and credited on every page.
- `prefers-reduced-motion: reduce` disables every animation and transition, and the three
  canvas effects render exactly one still frame instead of animating.
  If the motion looks static on your machine, check Windows *Settings → Accessibility →
  Visual effects → Animation effects*.
- The canvas effects need `requestAnimationFrame`, which a background or hidden tab
  suspends. They degrade to that still frame — open the site in a real browser window to
  see them move.
