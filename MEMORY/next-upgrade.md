# MEMORY/next-upgrade.md — the Next.js upgrade runbook

Repeatable procedure for moving this app to a new **Next.js 16.4.x** patch (normally because
`npm audit` reports an advisory against the installed version). Written to be picked up cold
after a token reset: every step states where the previous session should have left a note.

Keep this file in sync with `PROGRESS.md` — the checklist there is the authoritative status,
this file is the method.

---

## 0. Before touching anything

| Fact | Value at time of writing |
| --- | --- |
| App root | `C:\Users\rohan\.config\freebuff-desktop\local-projects\portfolio\threads\fb1a78c4…46c` |
| IDE path (junction) | `C:\Users\rohan\portfolio` (same files, see `PROGRESS.md` STEP 17) |
| Package manager | npm 10.9.2, Node 22.15.0, `package-lock.json` v3, no `packageManager` field, no workspaces |
| Version pinning style | exact for `next` / `tailwindcss`; `^` for tooling |
| Git | **none.** `git rev-parse --show-toplevel` → `fatal: not a git repository`. Upgrade in place; no branch, worktree, commit or PR step exists to do. |

**Checkpoint:** if you are resuming mid-upgrade, read `PROGRESS.md` first. A previous session
should have left a `🔄` row plus a STEP entry saying which of steps 3–7 finished. Do not redo
a step whose verification already passed with the current files.

---

## 1. Check for duplicate work (before editing)

```bash
cd C:/Users/rohan/portfolio
grep -rn "next-upgrade:" --include="*.md" --include="*.ts" --include="*.tsx" --include="*.json" .
git rev-parse --show-toplevel          # expected: fatal — not a repository
gh pr list --state open --limit 100    # only if a remote exists
```

- A `<!-- next-upgrade: <type>; path="." -->` marker in tracked files means another session
  already claimed this upgrade — stop and report instead of duplicating.
- In this app the git and provider checks are **unavailable**, not merely empty. Report that
  work could not be checked and continue; do not invent a repository.
- Do not treat `node_modules` hits as markers (the Next CLI ships a source map containing the
  literal string).

---

## 2. Confirm the target version instead of trusting the prompt

```bash
npm view next@<target> version engines --json        # must print the exact target
npm audit --json | node -e "..."                     # whichever advisory / range it names
```

For `16.4.0 → 16.4.3` the registry still listed the installed version in a high-severity
advisory; `16.4.3` is a same-major patch, so **no codemod and no migration guide applies**.

---

## 3. Edit the two files (and nothing else)

1. `package.json` → `"next": "<target>"` (exact — the project pins exact).
2. `next.config.ts` → add, preserving every other key:

```ts
experimental: {
  agentUpgrade: "security",
},
```

`experimental.agentUpgrade` accepts `'security' | 'latest' | 'experimental-future' | false`
(see `node_modules/next/dist/server/config-schema.js`). It is **supported from 16.4.0 on**;
if a future target drops the key, skip it and say so rather than suppressing the schema error.

3. Keep the lint stack on the same release when it lags behind:

```bash
npm install --save-dev eslint-config-next@<target>
```

`eslint-config-next` does not export `package.json`, so verify it by reading the file, not by
`require('eslint-config-next/package.json')`.

**Checkpoint after this step:** `PROGRESS.md` row marked `🔄`, naming the target version.

---

## 4. Install

```bash
npm install                 # exit 0 expected; report the audit summary it prints
```

`npm install` keeps already-locked versions when the range still matches, which is why
`eslint-config-next` needed its own install command above.

---

## 5. Verify (all of it, before claiming success)

```bash
set -o pipefail
npx next --version                          # must equal the exact target
npm run lint       2>&1 | tail -5; echo "LINT=${PIPESTATUS[0]}"        # 0
npm run typecheck  2>&1 | tail -5; echo "TSC=${PIPESTATUS[0]}"         # 0
rm -rf .next && npm run build 2>&1 | tail -30; echo "BUILD=${PIPESTATUS[0]}"   # 0, 14 routes
```

Then prove the app actually serves, on the port the Spotify redirect URI needs (`PORT=0` is
set in this environment, so never rely on the default port):

```bash
npx next dev -p 3000 > .dev.log 2>&1 &      # or a BACKGROUND process tool
for p in / /connect /curiosity /notes /projects \
         /projects/jetnet-super-resolution /projects/python-sessions \
         /resume /robots.txt /sitemap.xml /icon.svg /opengraph-image \
         /api/spotify/now-playing; do
  printf "%-40s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' \
    --max-time 30 "http://127.0.0.1:3000$p")"
done
```

Every route must answer **200**, and the CSS served by the page must still contain the
design tokens — a passing build alone does not prove Tailwind ran:

```bash
curl -s http://127.0.0.1:3000/ | grep -o '/_next/static/[^"]*\.css' | head -1
# then fetch that URL and grep for --color-accent and f2e9d7
```

Then load <http://127.0.0.1:3000> in a browser and confirm the app is **interactive**, not
merely rendered — that is the STEP 16 trap, and a Next patch can bring it back:

```js
// console: "[HMR] connected", no hydration warning
document.querySelectorAll('.fx-host[data-fx="on"]').length   // > 0
document.documentElement.dataset.theme                       // 'dark' | 'light'
// click the other theme button → body flips rgb(5,7,6) ↔ rgb(242,233,215), meta follows
```

A canvas stuck at 300×150 with `data-fx="off"` means hydration is dead: check
`allowedDevOrigins` in `next.config.ts` before suspecting the code.

Finally stop the server you started, by its recorded PID.

### Known benign output — do not "fix" it

```
Warning: Parsing CSS source code failed
> 9 | @theme inline {
Unknown at rule: @theme
```

Turbopack's CSS parser does not know Tailwind v4's at-rule; the PostCSS step still expands it.
Proof it is cosmetic: the emitted `.css` contains the tokens (`--color-accent`) and the beige
background (`f2e9d7`). Build exit code is 0. The warning predates 16.4.3 and is not caused by
the upgrade.

### Audit leftovers

After this upgrade `npm audit` reports one remaining **high** in `zod <4.6.6`
(memory exhaustion while validating oversized constrained collections), pulled in by
`eslint-config-next → eslint-plugin-react-hooks → zod`. It is a lint-tool dev dependency, not a
runtime or Next finding. `npm audit fix` would clear it; that is a separate change and was not
made here.

---

## 6. Record the result

- Append `## STEP NN — Next.js <from> → <to>  (<date>)` to `MEMORY/step-log.md`
  (`Status`, `Files`, `Notes`, `Verify` — the format at the top of that file).
- Add the row to the checklist in `PROGRESS.md` and mark it ✅.
- Update `README.md` only if behaviour changed for whoever runs the app. A dependency bump
  does not need a README rewrite; mention the pin only if a reader would be surprised.

---

## 7. Report

Run the telemetry command exactly as the handoff prompt gave it, with nothing from the project
in it:

```bash
npx --yes next@16.5.0-canary.26 internal report-agent-upgrade <RUN_ID> success
# failure only if the upgrade is still broken after repair attempts
# nothing at all for duplicate work, cancellation, or a missing prerequisite
```

Then report to the user, separately: installed version before/after, files changed, the exact
checks run with their exit codes, anything that failed or could not run, and whether a PR was
possible (here: no repository, so changes are local only).

---

## 8. Rollback

No git history exists, so rollback is a two-line edit:

```bash
npm install next@<previous-version> --save-exact
npm install --save-dev eslint-config-next@<previous-version>
```

`next.config.ts`'s `experimental.agentUpgrade` can stay — it is valid on every 16.4.x.

---

## Threat model note

This runbook is deliberately not a `npm audit fix` loop. Pinning the exact patch, reading the
emitted CSS, and hitting every route catches the failure modes that a green build hides: a
Tailwind at-rule that stops expanding, a route that starts 500-ing on a dynamic segment, or an
`/api` route that silently changes caching.
