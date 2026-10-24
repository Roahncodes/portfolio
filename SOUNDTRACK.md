# The soundtrack

Five instrumental pieces, one per part of the site. All five are by **Scott Buckley**
and released under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)
(CC BY 4.0). The licence was checked on the artist's own page for each track, not inferred
from a mirror; those pages are the `artistUrl` values in
[`src/content/soundtrack.ts`](src/content/soundtrack.ts).

| # | Track | Plays on | Length | Licence | Source |
| - | ----- | -------- | ------ | ------- | ------ |
| 01 | Petrichor | `/` — Artist home | 4:31 | [CC BY 4.0](https://www.scottbuckley.com.au/library/petrichor/) | [Commons](https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Petrichor.oga) |
| 02 | Luminance | `/curiosity` | 4:53 | [CC BY 4.0](https://www.scottbuckley.com.au/library/luminance/) | [Commons](https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Luminance.oga) |
| 03 | Machina | `/projects`, both project detail pages | 4:51 | [CC BY 4.0](https://www.scottbuckley.com.au/library/machina/) | [Commons](https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Machina.oga) |
| 04 | Undertow | `/notes` | 4:10 | [CC BY 4.0](https://www.scottbuckley.com.au/library/undertow/) | [Commons](https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Undertow.oga) |
| 05 | Hiraeth | `/resume`, `/connect` | 5:46 | [CC BY 4.0](https://www.scottbuckley.com.au/library/hiraeth/) | [Commons](https://commons.wikimedia.org/wiki/File:Scott_Buckley_-_Hiraeth.oga) |

## How it plays

- The **Play** button in the dock starts the current page's song and the auto-scroll at
  the same time. **Pause** stops both. A wheel or touch scroll on the page pauses both.
- **Next / Previous / Shuffle** move between pages; if the record was playing, the next
  page's song starts with it.
- The **Loop** button loops the track and the page pass.
- When the page reaches the bottom, the scroll stops but the record keeps playing until
  the track ends. Pause or a manual scroll stops it sooner.
- Clicking the top hairline still scrubs the *page*; the time readout is the song's
  position. The song and the scroll are separate clocks.
- The audio is 55% volume, because it is a soundtrack rather than the content.

## Attribution (required by CC BY 4.0)

The player credits the artist in three places:

- the dock's `CC BY 4.0` link in the time readout (desktop);
- a footer line on every page, linking to `/connect#soundtrack`;
- the full **“The music behind the scroll”** credits section on `/connect`, with the
  licence link and each track's artist page.

The exact attribution format requested by the artist is:

```
'Petrichor' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
'Luminance' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
'Machina' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
'Undertow' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
'Hiraeth' by Scott Buckley - released under CC-BY 4.0. www.scottbuckley.com.au
```

Do not remove those credits while these files are in `public/audio/`. If you replace the
music, update the credit with the new licence.

## Changes made to the source files

The downloads from Wikimedia Commons are Ogg Vorbis (~160–173 kbps). Each was re-encoded
once, without trimming, to a **160 kbps MP3 at 44.1 kHz**, with single-pass loudness
normalisation (`loudnorm=I=-18:TP=-1.5:LRA=11`) so the five pieces sit at a similar level.
This is declared in the credit line on `/connect` and in the MP3 metadata. CC BY 4.0 asks
for an indication of changes; re-encoding and normalising is that change.

The original files were verified with `ffprobe`; they are the full-length pieces, not
previews. The MP3s are 4.8–6.7 MB each (28 MB total).

## Swapping a track

1. Put the new MP3 in `public/audio/` (keep it small — 128–160 kbps is plenty).
2. Open [`src/content/soundtrack.ts`](src/content/soundtrack.ts) and update `src`,
   `durationSeconds`, `year`, `mood`, `artistUrl` and `sourceUrl` for that entry.
3. If the page mapping changes, update the `byRoute` record at the bottom of the same
   file. A missing route falls back to the home track.
4. Update the table and attribution above, and the credits on `/connect` if the artist
   changed.
5. Run `npm run typecheck`, `npm run lint` and `npm run build`.

Only add audio you have the right to serve from a public site. Owning a CD or downloading
a commercial track is not a licence to redistribute it; the CC BY 4.0 pieces above are.
