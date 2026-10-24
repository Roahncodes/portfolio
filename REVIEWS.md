# The guestbook database

The `/connect#guestbook` board is backed by one MongoDB collection. There are no
accounts, no local storage and no seeded reviews.

- **Submit** — `POST /api/reviews` validates the form and inserts a document with
  `status: "pending"`.
- **Read** — `GET /api/reviews` returns **only** `status: "approved"` documents.
- **Approve** — you change that one field in the MongoDB Atlas Data Explorer.
  Pending reviews are never sent to a browser.

The code lives in [`src/lib/reviews.ts`](src/lib/reviews.ts),
[`src/app/api/reviews/route.ts`](src/app/api/reviews/route.ts) and
[`src/components/guestbook.tsx`](src/components/guestbook.tsx). The labels, limits
and colours are shared from [`src/content/reviews.ts`](src/content/reviews.ts).

---

## 1. Create the free cluster

1. Open the MongoDB Atlas setup page:
   <https://index.trygravity.com/go/95550f9f-3d5f-49f1-b97f-ba833709f047>
2. Create an account (or sign in) and choose **Build a Database → M0 / Free**.
3. Pick a cloud provider and a region near you, leave the cluster name as
   `Cluster0`, and click **Create**. The free tier needs no card.

## 2. Create a database user

1. In Atlas, go to **Database Access → Add New Database User**.
2. Use password authentication. Use a long, unique password and save it in a
   password manager.
3. Give it **Read and write to any database** (or a custom role limited to the
   `portfolio` database). It does not need admin rights.

## 3. Allow the app to connect

1. Go to **Network Access → Add IP Address**.
2. Add `0.0.0.0/0` with the comment `Vercel serverless`. Vercel has no fixed
   outbound IP on the Hobby plan, so the API cannot be allow-listed by address.
3. This is safe only with a strong database password and a limited database user.
   Never reuse the password elsewhere.

## 4. Copy the connection string

1. On the cluster, click **Connect → Drivers**.
2. Copy the `mongodb+srv://…` string.
3. Replace `<password>` with the database user's password. If the password
   contains `@`, `:`, `/` or `?`, percent-encode it first.
4. Add it to `.env.local` (never commit this file):

```env
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=portfolio
```

`MONGODB_DB` is optional and defaults to `portfolio`. The database, collection
and index are created automatically on the first read or submission — there is
no migration to run.

Restart `npm run dev` after changing `.env.local`.

## 5. Approve a review

1. Open the site at `/connect#guestbook` and submit a review. You should see
   *"Your review is in the queue"*, and the review should **not** appear yet.
2. In Atlas, open **Database → Browse Collections → portfolio → reviews**.
3. Filter for pending reviews:

   ```json
   { "status": "pending" }
   ```

4. Open the document and change:

   ```js
   status: "pending"   →   status: "approved"
   ```

   Optionally set `approvedAt` to the current date (BSON `Date`) so the board can
   order by approval time. Without it, the board uses `createdAt`.
5. Save, then refresh `/connect#guestbook`. The review is now public.

To hide a review again, set `status` to `"rejected"` (or delete the document). A
rejected review is never returned by the API.

### Document shape

```js
{
  _id: ObjectId("…"),
  name: "Alex",
  role: "ML Engineer, Bangalore",   // may be ""
  rating: "heavy-repeat",           // see below
  comment: "…",
  color: "#4ade80",
  status: "pending",                // pending | approved | rejected
  createdAt: ISODate("…"),
  approvedAt: null                  // ISODate when you approve, optional
}
```

Allowed `rating` values: `masterpiece`, `heavy-repeat`, `deep-cut`,
`clean-execution`.

Allowed `color` values: `#4ade80`, `#38bdf8`, `#c084fc`, `#fbbf24`, `#f43f5e`.

## 6. Deploying to Vercel

Add these under **Project → Settings → Environment Variables** for Production
(and Preview, if you want previews to have a working guestbook):

```env
MONGODB_URI=mongodb+srv://…
MONGODB_DB=portfolio
```

Then redeploy. `MONGODB_URI` is read only inside the Node.js API route; it is
never sent to the browser and never included in the client bundle. Do not prefix
it with `NEXT_PUBLIC_`.

### If the board says "being set up"

That means `MONGODB_URI` is missing in the running environment. Locally, check
`.env.local` and restart the dev server. On Vercel, add the variable and redeploy
— environment changes are not picked up by an already-running deployment.

### If the board says "offline right now"

The API reached the server but the database call failed. Check the Vercel
function log for `[reviews]`. The usual causes are a wrong password, a
percent-encoding mistake in the URI, or Atlas Network Access not allowing
`0.0.0.0/0`.

### Basic abuse guard

`POST /api/reviews` allows five submissions per IP per ten minutes. That counter
is in memory per serverless instance, so it is a speed bump for accidental
double-submits, not a guarantee against a distributed spammer. If the public
board ever attracts spam, add a CAPTCHA in front of the form and keep the
`pending` moderation step.
