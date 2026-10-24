# on repeat. — a portfolio, not a playlist

This is my personal portfolio. I wanted it to feel a little more like browsing a record collection than scrolling through a standard portfolio site, so projects are presented as albums and the files inside them as tracks.

It includes my projects, skills, experience, resume, notes, contact details, and a small music corner connected to Spotify.

## Built with

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS v4
* MongoDB for the guestbook
* Spotify Web API for music activity
* HTML Canvas API for the custom visuals

The UI, icons, and canvas effects are built in the project rather than using a component or animation library.

## Pages

| Route              | What's there                                   |
| ------------------ | ---------------------------------------------- |
| `/`                | Home page, interactive orb, and music activity |
| `/curiosity`       | About me, skills, and experience               |
| `/projects`        | Projects presented as a discography            |
| `/projects/[slug]` | Details for an individual project              |
| `/resume`          | Resume preview and download                    |
| `/notes`           | Certifications, hackathons, and other notes    |
| `/connect`         | Contact links and guestbook                    |

## Run locally

You'll need Node.js and npm installed.

```bash
git clone https://github.com/Roahncodes/portfolio.git
cd portfolio
npm install
npm run dev
```

Open the local URL printed in the terminal. If you need a specific port, you can run:

```bash
npx next dev -p 3000
```

## Environment variables

Some features need their own credentials. Create a `.env.local` file in the project root and add the values for the integrations you plan to use:

```env
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/spotify/callback

MONGODB_URI=
MONGODB_DB=portfolio

NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```



### Spotify

The home page can show currently playing or recently played music from Spotify. To set it up:

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add this redirect URI to the app settings: `http://127.0.0.1:3000/api/spotify/callback`.
3. Add your client ID and client secret to `.env.local`.
4. Start the development server and visit `http://127.0.0.1:3000/api/spotify/login` to authorize the app.
5. Add the refresh token from the callback flow to `.env.local`, then restart the server.

The app requests these scopes: `user-read-currently-playing`, `user-read-recently-played`, and `user-read-playback-state`.

Spotify isn't required to run the rest of the portfolio. Until it is configured, the music card shows a disconnected state.

### Guestbook

The guestbook uses MongoDB. New submissions are stored as pending and only approved entries are shown publicly. Set `MONGODB_URI` and, if needed, `MONGODB_DB` to enable it.

See [`REVIEWS.md`](REVIEWS.md) for setup and moderation details. Without a MongoDB connection, the guestbook displays a setup message instead of sample entries.

## Useful commands

| Command             | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run dev`       | Start the development server |
| `npm run build`     | Build for production         |
| `npm run start`     | Run the production build     |
| `npm run typecheck` | Check TypeScript types       |
| `npm run lint`      | Run ESLint                   |

## Adding a project

Project information lives in `src/content/albums.ts`. Add an album entry there and the project listing and detail pages use that data. The other main content files are:

* `src/content/profile.ts` — profile, skills, experience, certifications, and social links
* `src/content/soundtrack.ts` — soundtrack information and page mapping
* `src/content/reviews.ts` — guestbook-related settings

## Soundtrack

The site includes five instrumental tracks by Scott Buckley: **Petrichor**, **Luminance**, **Machina**, **Undertow**, and **Hiraeth**. They are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Playback starts only when the visitor presses Play. Please check [`SOUNDTRACK.md`](SOUNDTRACK.md) for the source links and required attribution before replacing or reusing any of the tracks.

## Deployment

The project can be deployed to a host that supports Next.js and server-side API routes. Vercel is one option.

When deploying, add the required Spotify and MongoDB values in the host's environment-variable settings. Set `NEXT_PUBLIC_SITE_URL` to the production URL and register the matching production callback URL in the Spotify dashboard if Spotify is enabled.

## Accessibility

The site includes keyboard focus indicators, labelled navigation controls, reduced-motion support, and fallback content for the canvas visuals. Audio doesn't autoplay, and the main heading remains real HTML rather than being replaced by a canvas effect.

## License and credits

The soundtrack has its own CC BY 4.0 licence and attribution requirements, documented in [`SOUNDTRACK.md`](SOUNDTRACK.md). Check the applicable licence terms for the source code and other assets before reusing them.

---

Built by Rohan Dabhade.
