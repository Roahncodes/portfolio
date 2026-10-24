# MEMORY/design-reference.md

Distilled from the four reference screenshots supplied in chat. Reproduce this look
exactly; the only thing that changes is the data.

## Frame

```
┌──────────────┬──────────────────────────────────────────────┐
│ on repeat.   │  page content (max-width ~1100px, padded)     │
│ (green dot)  │                                              │
│              │                                              │
│ Artist home  │                                              │
│ GitHub projects                                            │
│ Liner notes  │                                              │
│              │                                              │
│ YOUR LIBRARY │                                              │
│ Ideas in rotation.                                         │
│              │                                              │
│ Python, machine learning and things worth building.        │
│              │                                              │
│ [✉ Say hello]│                                              │
│              │                                              │
│ A portfolio, not a playlist.                               │
└──────────────┴──────────────────────────────────────────────┘
```

- Rail width ≈ 260px, background darker than the page, very subtle right hairline.
- Nav links are mono, uppercase-ish small text; **active link is green**, rest grey.
- `on repeat.` wordmark: a small green ring/dot icon then lowercase "on repeat." in
  green mono. Render as `⟳ on repeat.` — the icon is a thin circle with a dot.
- `YOUR LIBRARY` is a dim uppercase mono section label.
- `Ideas in rotation.` and `Python, machine learning and things worth building.` are
  muted serif-less body copy in the rail.
- `Say hello` is a bordered pill button with an envelope icon.
- Footer line `A portfolio, not a playlist.` is dim and small.
- On mobile the rail collapses to a bottom bar / drawer.
- Top-right of the page frame carries no monogram; the initials chip was removed on request.
  Project detail pages still show their album short code there (e.g. `J01`).

## Page: Artist home (`/`)

- Eyebrow row: `THE PERSONAL COLLECTION / VOL. 01` (mono, dim, left) + `REC` indicator (right).
- Giant astral orb centred behind the headline; green core, wide soft bloom, faint stars.
- `◉ INDEPENDENT BUILDER` chip: small ring glyph + mono uppercase label.
- Headline: **Rohan Dabhade** — display font, ~clamp(2.6rem, 8vw, 6.5rem), weight 800,
  tracking tight, white.
- Subline: `Computer Science student. Python enthusiast. Exploring AI & ML.`
- Meta line: `Bangalore, India · Jain University · Class of 2028`
- CTAs: filled green pill `▶ Explore my work` + outlined pill `✉ Let's connect`.
- Two-column block: left `Behind the tracks` heading + 2 paragraphs; right a card:
  - card header `◉ LAST SONG LISTENED` (mono, dim, with green ring glyph)
  - `Off the record, for now.` (display, large-ish)
  - body `Spotify isn't connected yet. My latest track will appear here once it is.`
  - pill tag `NOT CONNECTED`
- Footer: `Made of curiosity. Always in rotation.` left, `ROHAN DABHADE / 2026` right.

## Page: Curiosity (`/curiosity`)

- Page eyebrow: `THE DISCORIGRAPHY / ROHAN DABHADE` (mono, dim).
- Hero orb sits behind the word **Curiosity.** — huge, weight 900, tracking very tight.
- Eyebrow chip `◉ LYRICS BEHIND THE PERSON BEHIND THE CODE`.
- Lead sentence: `On repeat, in progress, and interesting to think about.`
- Byline meta: `Rohan Dabhade · Computer Science Student · Bangalore, India`.
- Two-column: left = 2 bio paragraphs + `GETTING STARTED` block
  (`Jain University` / `Computer Science — Second-year student. Bangalore, Karnataka` /
  `Expected graduation: September 2028`); right = bio continuation + a green `GETTING
  STARTED`/`CURRENTLY STUDYING` card.
- `THE ROTATION / IN ROTATION` section: heading `Skills in rotation`, subcopy
  `The languages and tools work with, plus the ones I'm still exploring. No percentages,
  just the thing I'm learning. (Persistence > motivation.)`
- Four `ON REPEAT` cards (2×2): each has a mono `◉ ON REPEAT` label, a bold title and a
  small list. Titles from the reference: **The building blocks**, **Working with data**,
  **Ideas into applications**, **Still exploring**, plus an `ON CONTINUOUS PLAY` card.
- `THE ROTATION / BACKGROUND` section: heading `Learning outside the classroom`,
  `ON REPEAT` experience card with `AI/ML Internship — Shivohini` and a green `OPEN
  SOURCE` card for the GSoC contribution, each with a small mono footer link.

## Page: Discography (`/projects`)

- Eyebrow `THE DISCOGRAPHY / ROHAN DABHADE`.
- Headline **Built. Not shuffled.** + subcopy `Two repositories. A collection of
  experiments, practical tools and machine learning. Pick an album, then explore the
  tracks behind it.`
- Section `Albums in rotation`: 2 album cards. Each card:
  - a square cover with a green orb and a big mono code overlay `J / 01`, `P / 02`
  - below the cover a mono line `ROHANCODES / ORIGINAL WORK`
  - bold title, small grey subtitle, then a green `Explore album ↗` link.
- Section `Every track, one place`: grouped by album, each group headed by the album name
  in mono-green, then a list of track rows:
  - left: a small green play glyph
  - mono index `01-` … `07-`
  - track title (medium weight)
  - one-line description (dim)
  - right: `↗` arrow
  - rows are hairline-separated panels; hover lifts + green border.
- Footer note: `Original code, open for exploration. Album cards open project notes;
  tracks open their source files.`

## Page: Album detail (`/projects/[slug]`)

- Top-left link `← Back to the discography`.
- Left column: big square cover with `J / 01` mono overlay.
- Right column:
  - eyebrow `PROJECT ALBUM`
  - headline = project title (`JetNet Super-Resolution`), display, large
  - subtitle = `Machine learning · 2-stage pipeline`
  - author line = `Rohan Dabhade · Original code`
  - filled green pill `▶ Open repository`
- Section `Track list` + subcopy `Select a track to explore its source code on GitHub.`
- Track rows as above with `01-`, `02-`.
- `Behind this album` panel: heading + paragraph + mono chips of the stack
  (`Python · PyTorch · PyTorch Lightning · JetNet`).

## Motion / interaction rules

- Everything eases in with a short `translateY + opacity` on scroll (IntersectionObserver,
  `prefers-reduced-motion` respected).
- Album covers tilt subtly toward the cursor on hover; track rows shift 2–3px right.
- The orb drifts slowly (CSS keyframes, 18–26s) and breathes with a soft scale pulse.
- The active nav item gets a small green bar/dot; hover states are background lifts only.
- Keyboard focus is always visible: 2px green outline with a 2px offset.
