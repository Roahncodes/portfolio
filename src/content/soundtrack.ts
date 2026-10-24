/**
 * The soundtrack: five instrumental pieces, one for each part of the site.
 *
 * Every track is by Scott Buckley and released under Creative Commons
 * Attribution 4.0. The licence was checked on the artist's own page for each
 * piece (linked below), not inferred from a mirror. The files in
 * `public/audio/` are 160 kbps MP3s rendered from the artist's Ogg Vorbis
 * downloads, loudness-normalised for background listening; both changes are
 * declared in the credits on `/connect#soundtrack`.
 *
 * Swapping a track is deliberately boring: drop the new file in `public/audio`
 * and change `src`, `durationSeconds`, `sourceUrl` and `artistUrl` here.
 */

export type SoundtrackTrack = {
  title: string;
  artist: string;
  /** public path of the MP3 */
  src: string;
  /** playing time of the file above, in seconds */
  durationSeconds: number;
  year: number;
  /** short description shown in the credits */
  mood: string;
  /** the page this track scores */
  page: string;
  pageLabel: string;
  /** the artist's page for this track — also where the licence is stated */
  artistUrl: string;
  /** the Commons file the MP3 was rendered from */
  sourceUrl: string;
};

export const license = {
  name: "CC BY 4.0",
  url: "https://creativecommons.org/licenses/by/4.0/",
  attribution: "www.scottbuckley.com.au",
  changes:
    "Re-encoded from the artist's Ogg Vorbis download to a 160 kbps MP3 and loudness-normalised for background listening.",
} as const;

const petrichor: SoundtrackTrack = {
  title: "Petrichor",
  artist: "Scott Buckley",
  src: "/audio/01-petrichor.mp3",
  durationSeconds: 271,
  year: 2019,
  mood: "Ambient synth pads and soft piano",
  page: "/",
  pageLabel: "Artist home",
  artistUrl: "https://www.scottbuckley.com.au/library/petrichor/",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Petrichor.oga",
};

const luminance: SoundtrackTrack = {
  title: "Luminance",
  artist: "Scott Buckley",
  src: "/audio/02-luminance.mp3",
  durationSeconds: 293,
  year: 2020,
  mood: "Bright 7/8 piano, strings and synth",
  page: "/curiosity",
  pageLabel: "Curiosity",
  artistUrl: "https://www.scottbuckley.com.au/library/luminance/",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Luminance.oga",
};

const machina: SoundtrackTrack = {
  title: "Machina",
  artist: "Scott Buckley",
  src: "/audio/03-machina.mp3",
  durationSeconds: 291,
  year: 2019,
  mood: "Glitchy electronic ambience",
  page: "/projects",
  pageLabel: "Projects & discography",
  artistUrl: "https://www.scottbuckley.com.au/library/machina/",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Machina.oga",
};

const undertow: SoundtrackTrack = {
  title: "Undertow",
  artist: "Scott Buckley",
  src: "/audio/04-undertow.mp3",
  durationSeconds: 250,
  year: 2019,
  mood: "Sombre, ebbing piano and strings",
  page: "/notes",
  pageLabel: "Liner notes",
  artistUrl: "https://www.scottbuckley.com.au/library/undertow/",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Undertow.oga",
};

const hiraeth: SoundtrackTrack = {
  title: "Hiraeth",
  artist: "Scott Buckley",
  src: "/audio/05-hiraeth.mp3",
  durationSeconds: 346,
  year: 2020,
  mood: "Calm pads, strings and solo cello",
  page: "/resume",
  pageLabel: "The paperwork (resume)",
  artistUrl: "https://www.scottbuckley.com.au/library/hiraeth/",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Hiraeth.oga",
};

/** The five pieces, in the order they play across the site. */
export const soundtrack: SoundtrackTrack[] = [
  petrichor,
  luminance,
  machina,
  undertow,
  hiraeth,
];

/**
 * Every route that has a song. The two deep-dive project pages share the
 * projects track, and the contact page closes on the same piece as the
 * resume — one record side, not five unrelated previews.
 */
const byRoute: Record<string, SoundtrackTrack> = {
  "/": petrichor,
  "/curiosity": luminance,
  "/projects": machina,
  "/projects/jetnet-super-resolution": machina,
  "/projects/python-sessions": machina,
  "/notes": undertow,
  "/resume": hiraeth,
  "/connect": hiraeth,
};

export function songForPath(pathname: string): SoundtrackTrack {
  const exact = byRoute[pathname];
  if (exact) return exact;

  // A nested route should inherit the closest section, longest prefix first.
  const prefix = Object.keys(byRoute)
    .filter((route) => route !== "/" && pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length)[0];

  return prefix ? byRoute[prefix] : petrichor;
}

/** `4:31`, for the credits list. */
export function formatTrackTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
