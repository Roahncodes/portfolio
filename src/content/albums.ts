/**
 * Albums = GitHub repositories. Tracks = real files inside them.
 * Slugs, file paths and descriptions were verified against the GitHub API
 * (see MEMORY/step-log.md, STEP 00).
 */

export type Track = {
  /** zero-padded track number, e.g. "01" */
  index: string;
  title: string;
  description: string;
  /** where the row links — normally the source file on GitHub */
  href: string;
  /** shown as a mono chip on the row's right side */
  kind?: string;
  /** the single track used for the "now playing" state on the album page */
  highlight?: boolean;
};

export type Album = {
  slug: string;
  /** the mono code burned into the cover, e.g. "J / 01" */
  code: string;
  /** short code used in listings, e.g. "J/01" */
  shortCode: string;
  title: string;
  /** one-line genre line under the title */
  subtitle: string;
  /** the small mono credit above the title on the album page */
  kicker: string;
  credit: string;
  year: string;
  /** `ROHANCODES / ORIGINAL WORK` */
  imprint: string;
  /**
   * `[core, highlight]` — the light this album's Photon Knot is made of, and the
   * tint of its cover. Every project gets its own pair so the discography reads
   * as separate records rather than one repeated template.
   */
  palette: [string, string];
  language: string;
  repo: string;
  /** status pill, e.g. "GSoC 2026" */
  status?: string;
  /** the "Behind this album" prose */
  notes: string;
  /** mono chips at the bottom of the notes panel */
  stack: string[];
  /** headline numbers rendered on the album page */
  stats: { label: string; value: string }[];
  tracks: Track[];
};

const JETNET = "https://github.com/Roahncodes/JetNet-SuperRes-PFlow";
const PY = "https://github.com/Roahncodes/Python-Projects";

export const albums: Album[] = [
  {
    slug: "jetnet-super-resolution",
    code: "J / 01",
    shortCode: "J/01",
    title: "JetNet Super-Resolution",
    subtitle: "Machine learning · 2-stage pipeline",
    kicker: "PROJECT ALBUM",
    credit: "Rohan Dabhade · Original code",
    year: "2026",
    imprint: "ROHANCODES / ORIGINAL WORK",
    palette: ["#6d3dff", "#ff9be1"],
    language: "Python",
    repo: JETNET,
    status: "ML4SCI · GSoC 2026",
    notes:
      "A fast-simulation alternative for CMS jet reconstruction at the LHC. Stage one uses Generative Flow Matching to upsample sparse calorimeter deposits. Stage two uses a Set-to-Set Transformer and Hungarian Matching to reconstruct particles. The README reports 30/30 matched particles on the JetNet test set — every ground-truth particle found its predicted partner.",
    stack: ["Python", "PyTorch", "PyTorch Lightning", "JetNet", "NVIDIA GPU"],
    stats: [
      { label: "Particles matched", value: "30 / 30" },
      { label: "Best val loss", value: "0.0524" },
      { label: "Epochs trained", value: "50" },
      { label: "Stages", value: "02" },
    ],
    tracks: [
      {
        index: "01",
        title: "Generative Flow Matching",
        description: "Super-resolution training for sparse energy deposits.",
        href: `${JETNET}/blob/main/project/train.py`,
        kind: "TRAIN",
        highlight: true,
      },
      {
        index: "02",
        title: "Particle Flow Transformer",
        description: "Particle reconstruction with permutation-invariant matching.",
        href: `${JETNET}/blob/main/project/train_pf.py`,
        kind: "TRAIN",
      },
      {
        index: "03",
        title: "Graph Dataset",
        description: "JetNet loading, low-resolution input and 30-particle targets.",
        href: `${JETNET}/blob/main/project/dataset.py`,
        kind: "DATA",
      },
      {
        index: "04",
        title: "Set-to-Set Model",
        description: "The transformer that maps deposits onto individual particles.",
        href: `${JETNET}/blob/main/project/model.py`,
        kind: "MODEL",
      },
      {
        index: "05",
        title: "Super-Resolution Inference",
        description: "Stage-one inference with event visualisations and prediction tensors.",
        href: `${JETNET}/blob/main/project/inference.py`,
        kind: "EVAL",
      },
      {
        index: "06",
        title: "Particle Flow Inference",
        description: "Stage-two inference and residual plots from the trained checkpoint.",
        href: `${JETNET}/blob/main/project/inference_pf.py`,
        kind: "EVAL",
      },
    ],
  },
  {
    slug: "python-sessions",
    code: "P / 02",
    shortCode: "P/02",
    title: "Python Sessions",
    subtitle: "Practical tools · 7 code experiments",
    kicker: "PROJECT ALBUM",
    credit: "Rohan Dabhade · Original code",
    year: "2025 — 2026",
    imprint: "ROHANCODES / ORIGINAL WORK",
    palette: ["#9b1b30", "#ffc08a"],
    language: "Python",
    repo: PY,
    status: "Learning in public",
    notes:
      "A collection of experiments in practical tools and machine learning: speech recognition, basic cryptography, game logic and randomisation. Each track is a small, finished program — the point was to understand the concept by shipping something that runs. Pick an album card to open the repository, or a track to read its source.",
    stack: ["Python", "Standard library", "Speech recognition", "Randomisation", "Game logic"],
    stats: [
      { label: "Tracks", value: "07" },
      { label: "External deps", value: "01" },
      { label: "Focus", value: "Fundamentals" },
      { label: "Language", value: "Python" },
    ],
    tracks: [
      {
        index: "01",
        title: "Voice Assistant — Jarvis",
        description: "Speech recognition and text-to-speech assistant prototype.",
        href: `${PY}/tree/main/Jarvis`,
        kind: "JARVIS",
        highlight: true,
      },
      {
        index: "02",
        title: "Message Encryption",
        description: "Substitution-cipher encryption and decryption exercise.",
        href: `${PY}/blob/main/Mini%20Projects/encrypt.py`,
        kind: "CRYPTO",
      },
      {
        index: "03",
        title: "Dice Roller",
        description: "A randomised dice simulation built on the random module.",
        href: `${PY}/blob/main/Mini%20Projects/Dice_roller.py`,
        kind: "GAME",
      },
      {
        index: "04",
        title: "Rock Paper Scissors",
        description: "A command-line game against a randomised opponent.",
        href: `${PY}/blob/main/Mini%20Projects/Project1.py`,
        kind: "GAME",
      },
      {
        index: "05",
        title: "Countdown Timer",
        description: "A countdown timer with hours, minutes and seconds.",
        href: `${PY}/blob/main/Mini%20Projects/Timer.py`,
        kind: "TOOL",
      },
      {
        index: "06",
        title: "Slot Machine",
        description: "A 3×3 slot simulation with balance and bet validation.",
        href: `${PY}/blob/main/Mini%20Projects/main.py`,
        kind: "GAME",
      },
      {
        index: "07",
        title: "Number Guessing",
        description: "Guess a random number with higher and lower hints.",
        href: `${PY}/blob/main/Mini%20Projects/project2.py`,
        kind: "GAME",
      },
    ],
  },
];

export function getAlbum(slug: string): Album | undefined {
  return albums.find((album) => album.slug === slug);
}

export function getAlbumSlugs(): string[] {
  return albums.map((album) => album.slug);
}

export type FlattenedTrack = Track & {
  albumSlug: string;
  albumTitle: string;
  albumCode: string;
};

/** Every track across every album, in discography order. */
export function allTracks(): FlattenedTrack[] {
  return albums.flatMap((album) =>
    album.tracks.map((track) => ({
      ...track,
      albumSlug: album.slug,
      albumTitle: album.title,
      albumCode: album.code,
    }))
  );
}
