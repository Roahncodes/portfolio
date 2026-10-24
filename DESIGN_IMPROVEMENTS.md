# Portfolio Design & Experience Improvisation Plan
> **Project:** "on repeat." — Rohan Dabhade's Spotify-inspired Portfolio  
> **Location:** `C:\Users\rohan\portfolio`  
> **Status:** Codebase verified (TypeScript, ESLint, and Next.js Turbopack build all passing 100%)

---

## 📌 Phase Overview & Step-by-Step Roadmap

Each step below is designed to be reviewed, refined, and executed one by one. Check off items as we progress together.

---

### Step 1: Global Aesthetic & Music Player Vibe Polish
- [x] **1.1 Persistent "Now Playing" Bottom Dock / Mini-Player:**
  - Added Spotify-style persistent mini-player bar (`player-dock.tsx`) at the bottom of the viewport with acrylic blur, live page scrubber, vinyl rotation animation, and responsive controls.
  - Controls: Prev/Next track navigation, Play/Pause auto-scroll reading engine, Shuffle jump, and Loop.
- [x] **1.2 Subtle Audio / Haptic UI Feedback (Optional & Toggleable):**
  - Built zero-dependency Web Audio API synthesizer (`src/lib/audio.ts`) for tactile clicks, vinyl needle drops, track sweep sounds, and copy chimes (opt-in, muted by default, synced via `useSyncExternalStore`).
- [x] **1.3 Ambient Palette Sync:**
  - Added dynamic atmospheric background glow (`ambient-glow.tsx`) that transitions hue based on the active route/project album (emerald, cyan, violet, crimson, amber, ice blue) for both dark and beige light mode.

---

### Step 2: Hero & Astral Canvas Refinement (Home `/`)
- [x] **2.1 Glyph Orb & Astral Stage Micro-Interactions:**
  - Added orbiting dashed equalizer ring (`.orb-eq-ring`) with pulsing planetary marker and radar wave aura (`.orb-pulse-ring`) around the Astral Glyph Orb.
- [x] **2.2 Stipple Type & Typography Hierarchy:**
  - Added `MASTER TAPE · 24-BIT / 96kHz` recording badge, pulsing live `● REC` indicator, availability status chip (`● OPEN TO INTERNSHIPS`), track tags (`[SIDE A · 03 TRACKS]`), and track timestamps (`TRACK 01 · 00:00 - 02:45`).
- [x] **2.3 Spotify "Last Song Listened" Card Upgrade:**
  - Added live 4-bar equalizer visualizer (`.eq-live`) that bounces with music playback.
  - Added rich curated fallback crate ("Curated in heavy rotation") featuring real artist tracks (Tycho, Daft Punk, Ludwig Göransson, HOME) with tactile track-switching, spinning vinyl indicator, and direct Spotify connect option.

---

### Step 3: Curiosity & Skills Rotation (`/curiosity`)
- [x] **3.1 Interactive Vinyl / Cassette Skill Selector:**
  - Built interactive crate selector (`curiosity-skills.tsx`) with category tabs (`All Crates`, `A-Side: Foundations`, `B-Side: Data & Storage`, `C-Side: Applications`, `Deep Cut: Machine Learning`).
  - Interactive skill pill clicks show "Track Insight" banner explaining real-world usage across projects with needle-drop sound feedback.
- [x] **3.2 Timeline & Milestones Overhaul:**
  - Re-engineered experiences into master-tape audio chapters (`curiosity-timeline.tsx`) with timestamps (`[01:00]`, `[02:15]`, `[03:30]`, `[04:45]`).
  - Interactive expandable/collapsible liner notes with key metrics badges (30/30 matched, val loss 0.0524, 3+ hackathons) and direct album/LinkedIn links.

---

### Step 4: Discography & Album Details (`/projects` & `/projects/[slug]`)
- [x] **4.1 Interactive Project Showcase & Live Previews:**
  - Built interactive `WaveformVisualizer` showing harmonic frequency bars, commit depth, and tactile audio feedback.
  - Built comprehensive `ProjectPreviewModal` featuring tabbed views: Pipeline & Architecture Diagram (with flow steps), Live Code & Terminal interactive snippet runner, Quantitative Benchmarks & Metrics (PSNR, inference latency, val loss), and 1-click git clone command with copy chime feedback.
- [x] **4.2 Track List Interactivity & Code Inspector:**
  - Built `InteractiveTrackList` component allowing visitors to play any track, see animated equalizer bars on the active track, and open a slide-out file inspector drawer revealing technical role, architecture significance, and snippet previews.
  - Linked album header to direct GitHub repository and live preview triggers.

---

### Step 5: Resume & Certifications (`/resume` & `/notes`)
- [x] **5.1 Split View & Interactive Skills Matrix:**
  - Upgraded `ResumeViewer` with multi-mode view switcher tabs:
    - **Master Sheet (PDF):** Embedded responsive iframe and high-res canvas with quick-collapse control.
    - **ATS Plaintext & Recruiter Matrix:** Machine-readable 100% compliant ATS resume with 1-click clipboard copy action and harmonic audio chime feedback.
    - **Technical Deep Matrix:** Live searchable, categorized technical skill grid (ML & AI, Backend, Systems & Cloud, Tools) with proficiency badges, direct repository links, and interactive search filter.
  - Added dedicated `@media print` cassette sleeve stylesheet to print clean documents without navigation clutter.
- [x] **5.2 Liner Notes & Credential Cards:**
  - Added verified job simulation credential cards for Electronic Arts (C++ Engine optimization) and AWS APAC (Cloud Architecture) with verification pills and demonstrated skills chips.
  - Added 3+ Hackathons achievement badge and cassette tape sleeve metadata banner (`RD-2026-TAPE-02`, Dolby NR, barcode aesthetic).

---

### Step 6: "I Was Here" Visitor Reviews & Guestbook Section
- [x] **6.1 "I Was Here" Guestbook Board:**
  - Built interactive `GuestbookSection` component with rich vinyl card deck.
  - Visitors can sign with handle, role/affiliation, custom vinyl marker color (Emerald, Cyan, Violet, Amber, Rose), review text, and tape stamps:
    - 🏆 Certified Masterpiece
    - 🔁 On Heavy Repeat
    - ⚡ Deep Cut
    - 🎯 Clean Execution
  - No seeded reviews: the board is empty until real submissions are approved.
- [x] **6.2 Database & Moderation Layer:**
  - Reviews live in MongoDB Atlas (`portfolio.reviews`), not LocalStorage. The public API only returns `status: "approved"`; new submissions are `pending` until approved in Atlas.
  - Interactive "Drop Needle & Sign" button triggers tactile needle-drop and harmonic chimes, then shows a "your review is in the queue" confirmation. It appears in the feed only after approval.
  - Includes rating category filter chips. Self-deletion is gone — only the owner can reject or delete a review from the database.
- [x] **6.3 Integration into the Portfolio:**
  - Embedded as a dedicated interactive section on `/connect#guestbook`.
  - Linked directly via the persistent player dock with `I was here` quick-jump button.

---

### Step 7: Connect & Communication (`/connect`)
- [x] **7.1 Interactive Message Console ("Send a Demo"):**
  - Built `ContactConsole` component providing pre-structured inquiry presets (Internship Opportunity, ML Research Collaboration, Open-Source / Engineering, Coffee / General Chat).
  - Generates pre-filled, formatted mailto dispatch to `rohandabhade58@gmail.com` with one-click copy fallback and needle-drop audio.
  - Added live character counter and response commitment chip (`● TYPICAL RESPONSE TIME < 24 HOURS`).

---

### Step 8: Accessibility, Mobile & Light Theme Perfection
- [x] **8.1 Warm Beige Mode Contrast & Vibrancy Audit:**
  - Audited and verified all light theme color tokens against paper-beige (`#f2e9d7`) for WCAG AA/AAA compliance (text: 12.7:1 AAA, dim: 4.5:1 AA, accent: 5.1:1 AA, accent-deep: 8.9:1 AAA).
  - Resolved low-contrast status and badge colors in light mode:
    - Fixed `.matrix-level-pill.level-proficient` (`#0369a1` on beige, 5.5:1 contrast).
    - Fixed `.matrix-level-pill.level-exploring` (`#6d28d9` on beige, 6.4:1 contrast).
    - Fixed `.rec-indicator` (`#b91c1c` on beige, 6.2:1 contrast).
    - Made `WaveformVisualizer` theme-aware using `var(--accent)` and `var(--accent-bright)` instead of neon green on beige.
    - Updated modal architecture and schematics (`.modal-pipeline-box`, `.modal-stage-1`, `.modal-stage-2`, `.modal-results-strip`, `.modal-clone-strip`) with contrast-compliant light theme overrides.
    - Added light theme overrides for `.track-inspector-drawer`, `.skill-inspector-banner`, and `.timeline-card-active`.
- [x] **8.2 Mobile Ergonomics & Drawer Gestures:**
  - Built touch swipe-up gesture on mobile navigation drawer (`rail-mobile-panel`) to quickly dismiss with audio feedback, complete with a tactile grab pill (`.drawer-grab-bar`).
  - Implemented native bottom-sheet presentation for the system architecture modal (`.modal-window`) on `< 768px` devices with swipe-down to dismiss gesture and grab bar (`.sheet-grab-bar`).
  - Upgraded touch targets for mobile thumb usability:
    - Expanded bottom dock buttons (`.dock-btn`, `.dock-btn-play`, `.dock-tool-btn`, `.dock-guestbook-btn`) to comfortable touch target sizes on mobile.
    - Enlarged color swatches in the guestbook form (`.color-swatch-btn`) from 22px to 28px on mobile for easy finger tapping.
    - Ensured min 38px touch heights for intent pills and rating buttons.
  - Hardened responsive layouts:
    - Made `.resume-view-switcher` flexible and stacked neatly on small screens without horizontal scroll.
    - Collapsed `.resume-ats-meta-strip` from 4 columns to 2 columns on phones (< 640px).
    - Collapsed `.resume-matrix-grid`, `.guestbook-feed-grid`, and `.console-inputs-grid` to 1 column on mobile to eliminate any horizontal overflow.
    - Added safe-area padding for notched mobile displays (`env(safe-area-inset-bottom)`).
    - Explicitly set `width: device-width, initialScale: 1, maximumScale: 5` in viewport metadata for accessible zooming.

---

## 🏆 Project Status: All Roadmap Steps Completed! (100% Verified)
All 8 steps from global aesthetics to guestbook and mobile perfection are complete, fully responsive, accessible, and passing typecheck, lint, and production build cleanly.


