---
worktree: mario-bundle
branch: opt/bundle
status: in-progress
---

## Decisions (lead, 2026-05-10)

- Plan **approved**, all 10 items.
- Screenshots: **move to `docs/screenshots/` and commit**.
- `@next/bundle-analyzer` dev-dep: **approved**.
- Test runner: **`tsx` + `npm test` alias approved**. I'll add the
  script in item 6; gameplay agent owns the test file.

# PLAN — `opt/bundle`

Owned surface: `next.config.js` (everything except the `images` block —
assets agent has already confirmed they will not edit it),
`tsconfig.json`, `.eslintrc.json`, `package.json` (scripts only),
`tailwind.config.js`, `postcss.config.js`, `scripts/launch.sh`,
`.gitignore`. Plus repo-hygiene tail (screenshots,
`tsconfig.tsbuildinfo`).

I merge **last**. Numbers below are pre-implementation estimates against
the `d5215ce0` baseline I just measured (see "Baseline measured" below);
`REPORT.md` will replace them with the post-merge measured values once
the four sibling branches have integrated.

---

## Baseline measured (commit d5215ce0, mario-bundle worktree)

`GITHUB_PAGES=true npm run build` then `gzip -kf` on every chunk:

| Chunk | Raw | Gzipped |
|---|---|---|
| `polyfills-*.js` | 91 KB | 31.1 KB |
| `framework-*.js` | 137 KB | 45.5 KB |
| `main-*.js` | 122 KB | 35.5 KB |
| `fd9d1056-*.js` (vendor) | 168 KB | 53.3 KB |
| `472-*.js` (vendor) | 122 KB | 32.6 KB |
| `webpack-*.js` | 4.2 KB | 1.8 KB |
| `main-app-*.js` | 0.5 KB | 0.3 KB |
| `app/page-*.js` | 80 KB | 18.4 KB |
| `app/layout-*.js` | 0.85 KB | 0.4 KB |
| **Content-mode first-load on modern browser (gz)** | — | **~187 KB** |
| `out/` total | — | **1.5 MB** |

**Polyfill clarification (post-baseline):** the polyfills chunk ships
in `out/` but is loaded via `<script noModule>` and skipped by every
modern browser. So 31 KB gz was never on the modern-browser first-load
path. My original PLAN line 49 ("polyfills are the single biggest win
available to me") was wrong. Item 2 is now a correctness-only change,
not a size win. Real wins: code-splitting game-mode (~13 KB gz off
content-mode page chunk).

(Brief quoted ~1.1 MB for `out/`; my measurement on this machine reads
1.5 MB at the same commit. Likely a `du -sh` block-size difference; I'll
use my own number as the baseline so before/after is apples-to-apples.)

Polyfills are the single biggest win available to me: `tsconfig.json`
currently targets `es5`, which forces Next to ship a 91 KB → 31 KB-gz
polyfill chunk to every visitor on every modern browser. Goal #3
(`< 200 KB` first-load gzipped) is comfortably reachable just by raising
the target *and* code-splitting the game.

---

## Items, in proposed commit order

Each item is a single commit. Format: `opt(bundle): <change> — <impact>`.
Status legend: `pending` → `in-progress` → `done` (with one-line outcome).

### 1. Repo hygiene — gitignore + screenshots
**Status:** pending
**Files:** `.gitignore` (this worktree), and at the repo root via the
main worktree: move 4 screenshots into `docs/screenshots/` (lead's
choice — see decision question below).
**Change:**
- Add `tsconfig.tsbuildinfo` to `.gitignore` (currently `*.tsbuildinfo`
  already covers it via line 24 — verified — but the file at
  `/Users/zafa/Desktop/portfolio/tsconfig.tsbuildinfo` (76 KB) is
  tracked from before that line existed; it needs `git rm --cached`).
- Add `docs/screenshots/` to `.gitignore` *or* commit the screenshots
  there as repo documentation. **My recommendation: gitignore them** —
  they're dated PNG captures, not part of the product; recruiters won't
  see them and they bloat clones.
- Confirm `.claude/` is already in `.gitignore` (yes, line 30).
**Impact:** clean working tree, no 76 KB tsbuildinfo blob in future
commits, no surprise PNG diffs.
**Risk:** none — these are repo metadata, not runtime.
**Note:** I cannot edit the main worktree's working tree from here, but
I can land the `.gitignore` change on `opt/bundle`. The lead's
integration of `opt/bundle` will then make `git rm --cached
tsconfig.tsbuildinfo` and the screenshot decision actionable in main.
I'll list the exact commands in REPORT.md so the lead doesn't have to
reverse-engineer them.

### 2. Raise `tsconfig.target` to `es2020` (correctness only)
**Status:** done
**Files:** `tsconfig.json`.
**Change:** `target: "es5"` → `target: "es2020"`, `lib: ["es6"]` →
`lib: ["es2020"]`.
**Impact:** correctness — TS code can use ES2020 syntax (optional
chaining, nullish coalescing, BigInt) without down-leveling. **Zero
bundle-size impact** — Next.js uses SWC with its own browserslist
config, ignoring tsconfig.target for emit. The polyfills chunk also
ships via `<script noModule>` and is skipped by modern browsers
regardless. I tested adding a modern `browserslist` to `package.json`
in the same iteration; it produced byte-identical chunks (same
content hashes), so I reverted that change.
**Risk:** none.
**Verify:** chunks unchanged (confirmed); site still builds.

### 3. Code-split game-mode behind `next/dynamic`
**Status:** done — page chunk 81→49 KB raw / 18.4→12.6 KB gz; new
chunk `53.*.js` 35 KB raw / 6.8 KB gz, loaded only on game entry.
Goal #3 (`< 200 KB` content-mode first-load gz) hit at ~182 KB.
**Files:** `app/page.tsx` (4 lines — same lines perf agent owns for
"mode plumbing"). **Coordination:** perf has not flagged any plan to
restructure these lines, but I will post a cross-cutting note before
committing (see bottom).
**Change:** replace
`import GameMode from './game-mode/GameMode'` with
`const GameMode = dynamic(() => import('./game-mode/GameMode'), { ssr: false, loading: () => <GameLoadingPlaceholder /> })`.
The placeholder is a single full-screen `<div>` with the brand
background colour and the same "Press Start 2P" "Loading…" text the
game already uses, sized to the canvas viewport so there is no layout
shift.
**Impact:** removes `SimpleMarioGame.tsx` (53 KB raw, ~13 KB gz) from
the content-mode first-load chunk. After perf's dead-code deletion
lands, the dynamic chunk will be even smaller. Together with item 2,
content-mode first-load gz drops from ~187 KB to ~145 KB — well under
goal #3's 200 KB.
**Risk:** brief loading flash on first game-mode entry (warm cache:
zero; cold cache on a fast connection: < 1 frame per the brief's own
acceptance criterion). The placeholder absorbs it visually.
**Verify:** in `out/_next/static/chunks/` the game logic now lives in
its own `app/game-mode/SimpleMarioGame-*.js` (or webpack-named) chunk
that is *not* requested when the user lands on `/`. Network panel:
zero requests for game chunks until the pipe link is clicked.

### 4. Re-enable type-check and lint at build time
**Status:** pending — **highest blast radius, save for later in commit
order**
**Files:** `next.config.js` (lines 18–22).
**Change:** delete the entire `typescript: { ignoreBuildErrors: true }`
and `eslint: { ignoreDuringBuilds: true }` blocks. Then run
`npm run build`. Three sub-outcomes are possible per file with errors:
1. Error in code I own (config / scripts): I fix it in the same commit.
2. Error in another agent's owned file: I leave the error visible, do
   **not** silence it, and (a) post a `## Cross-cutting findings` block
   to my own PLAN.md listing each error with file:line and a one-line
   description, and (b) before final integration, ping the lead so the
   relevant agent fixes it on their branch. Until then, the unsilenced
   build will fail — which is the correct CI behaviour, not a regression.
3. Error introduced by another agent's pending work I don't see yet
   (because their branch hasn't merged): same as (2), tracked in
   PLAN.md so it's not lost.
**Coordination:** I cannot deliver goal #6 ("`tsc --noEmit` exits 0")
single-handedly — it depends on whether the four sibling branches
introduce or fix errors in their owned code. I will:
- Run `npx tsc --noEmit` *now*, on the d5215ce0 baseline, against this
  worktree, to enumerate the existing errors. (Done as discovery; the
  list goes into the next PLAN.md edit after approval.)
- Re-run after every sibling merge once the lead rebases.
- The final fix-list / punt-list lands in REPORT.md.
**Impact:** type system stops silently failing; CI gate restored;
goal #1 satisfied.
**Risk:** the build will fail until errors are addressed. This is a
*correctness* risk, not a regression — the type system was off, not
green. Sibling agents will see CI fail on their PRs the moment my
branch lands; the lead's merge order should put `opt/bundle` last so
each sibling has already cleared their own errors locally.

### 5. Tighten `.eslintrc.json`
**Status:** pending — **after item 4 is green**
**Files:** `.eslintrc.json`.
**Change:** keep `extends: ["next/core-web-vitals"]` and add:
- `"rules": { "@next/next/no-img-element": "warn", "react/no-unescaped-entities": "off" }`
  (the unescaped-entities rule is famously noisy on copy text; the
  portfolio agent's content edits will trip it constantly otherwise).
**Impact:** modest — the preset already covers the high-leverage rules.
This just tunes for the specific copy patterns this site uses.
**Risk:** none if item 4 is green first; `npm run lint` will surface any
new warnings before they block the build.

### 6. Add `npm run typecheck`, `npm run analyze` scripts (no new deps)
**Status:** pending
**Files:** `package.json` (scripts only).
**Change:**
```json
"typecheck": "tsc --noEmit",
"analyze": "ANALYZE=true GITHUB_PAGES=true next build",
"build:gh": "GITHUB_PAGES=true next build"
```
Plus `next.config.js` already wraps in a no-op `withBundleAnalyzer`
guard if the dep is installed (see item 8 dev-dep flag).
**Impact:** convenience; CI can call `npm run typecheck` separately
from `npm run build` if useful; the bundle analyzer is opt-in.
**Risk:** none — additive scripts.
**Cross-cutting:** `package.json` scripts are not owned by anyone else,
so no coordination needed *unless* the gameplay agent's `test:input`
script lands here too. They asked. See "Decisions needed" below.

### 7. Smoke check the deploy artifact
**Status:** pending
**Files:** `scripts/launch.sh` is unrelated; this is a one-shot manual
verification, not a new script.
**Change:** after each item lands, run:
```
GITHUB_PAGES=true npm run build
test -f out/.nojekyll && echo "nojekyll OK"
test -f out/index.html && echo "index OK"
grep -q "/portfolio/_next" out/index.html && echo "basePath OK"
```
Capture in REPORT.md. Item is process, not code.
**Impact:** confirms public-surface guarantees from the brief
(GitHub Pages basePath, .nojekyll, static export works).
**Risk:** none — read-only verification.

### 8. Bundle-analyzer audit (optional dev-dep — flagging now)
**Status:** pending — **decision required before I add the dep**
**Files:** `package.json` (`devDependencies`), `next.config.js`.
**Change:** add `@next/bundle-analyzer` as a `devDependency`, gated
behind `ANALYZE=true`. Use it once to confirm:
- `PORTFOLIO_DATA` is in exactly one chunk, not duplicated.
- `level_1_1` from `lib/level-data.ts` is in the dynamic game chunk
  only.
- `lib/audio.ts` is in the dynamic game chunk only (after item 3).
- No surprise `react`/`react-dom` duplication.
**Impact:** evidence for goal #8 (tree-shaking audit). Without the
analyzer, "verify with `next build` analyzer" in the brief is hand-
wavy.
**Risk:** zero runtime impact; adds one dev-dep.
**Alternative if the dev-dep is rejected:** `gunzip -c
out/_next/static/chunks/*.js.gz | grep -c "PORTFOLIO_DATA"` — crude
but works. I'll fall back to this if the lead vetoes the dev-dep.

### 9. Lighthouse measurement
**Status:** pending — **after items 1–7 land and after the lead rebases
sibling work onto this branch**
**Files:** none (process).
**Change:** run Lighthouse mobile + desktop on `/` (content) and
`/?mode=game` (game), serving the static `out/` via `npx serve out -l
3000` since the production deploy lives at GitHub Pages basePath.
Capture scores into REPORT.md.
**Impact:** evidence for goal #4 (Performance ≥ 95).
**Risk:** Lighthouse depends on perf and assets agents' wins (rAF fix,
font self-host, audio compression). If their branches haven't merged,
my number is meaningless. Hence the ordering note.

### 10. CI fail-loud verification (one-off, not committed)
**Status:** pending
**Files:** none committed; throwaway local branch.
**Change:** per brief goal #7, on a scratch branch off `opt/bundle`,
introduce a deliberate type error (e.g. `const x: number = 'string'`
in `app/page.tsx`), push, observe CI fails on `npm run build`, then
delete the branch without merging.
**Impact:** proves the CI gate is actually live.
**Risk:** none — never lands in `main`.

---

## Items I am explicitly NOT doing

- **`tailwind.config.js`** — already concise; no obvious wins. Tailwind
  v3 already tree-shakes unused classes via the `content` glob, which
  is correct (`./app/**`, `./components/**`, `./pages/**`).
- **`postcss.config.js`** — minimal; no changes warranted.
- **`scripts/launch.sh`** — references the *old* worktree directory
  names (`portfolio-level`, `portfolio-feel`, etc.) which the lead
  marked off-limits. Those names are wrong for this round
  (`mario-perf` etc.) but the script is dev-tool only — never runs in
  CI, never ships. Updating it would be churn for no user-visible
  impact, and rewriting it might step on the lead's own conventions.
  Leaving alone unless you say otherwise.
- **`.gitignore` for the four sibling `mario-*/` worktree dirs** —
  per brief, those are intentional and the lead removes them after the
  round. Not gitignoring.
- **The six nested `portfolio-*/` directories** — explicitly off-limits.
- **New runtime deps** — none. Even the bundle analyzer (item 8) is a
  dev-dep flagged for approval.
- **Touching `lib/`, `app/game-mode/`, `app/content-mode/`,
  `components/`, `styles/`, `public/`, `app/layout.tsx`,
  `app/globals.css`** — all owned by other agents.

---

## Decisions needed from the lead before I commit

1. **Screenshots:** gitignore them, or commit them under
   `docs/screenshots/`? Recommend: gitignore.
2. **Bundle analyzer dev-dep:** approve `@next/bundle-analyzer`, or
   require I use the gunzip-grep fallback?
3. **Gameplay agent's smoke test runner:** they want `tsx` as a
   devDep + a `npm run test:input` script. Three options:
   (a) approve `tsx` (lightweight, no transitive bloat — recommend);
   (b) require `vitest` instead (heavier but real test framework that
       the portfolio + perf agents could also use);
   (c) deny — gameplay falls back to inline runtime asserts.
   Recommend (a) for this round; (b) is overkill for one input layer.
4. **`launch.sh`:** leave alone, or rewrite for the new
   `mario-*/` worktree names? Leaving alone unless you push back.

---

## Cross-cutting findings (will be appended after item 4 lands)

(Empty until I run `tsc --noEmit` on a working build. Will list every
type error by `file:line — message` with the suspected owning agent.)

---

## Cross-cutting note for opt/perf

Item 3 (code-split) edits 1–2 lines in `app/page.tsx` (the import +
the `<GameMode />` site). Per the lead's collision table, perf owns the
"mode plumbing" in this file and portfolio owns the "content bridge
state". My edit is purely the import shape (`import` →
`dynamic(() => import(...))`) and adding a `loading` placeholder.
- I do **not** touch the `useState`/`useEffect`/`toggleMode` logic.
- I do **not** touch the `<ContentMode>` site or the `setModePreference`
  call.

If your `useRef` refactor moves `<GameMode />` into a wrapper component
or restructures the conditional render, ping me here and I will rebase
my one-line change onto whatever shape you land. No conflict expected.

## Cross-cutting note for opt/assets

`next.config.js` is shared. Per your PLAN item 8, you've confirmed you
will not edit it this round (`images: { unoptimized: true }` is correct
for `output: 'export'`). I will leave the `images` block alone in
every commit. Acknowledged: no coordination needed unless you change
your mind.

If your font self-host (item 1) or audio change-detection (item 2)
introduces any TS errors, they'll surface when item 4 here lands. I'll
list them in the cross-cutting findings block above and ping you, not
silently fix in your file.

## Cross-cutting note for opt/portfolio

When you ship the `metadata` export expansion, no `next.config.js`
changes are needed for static export — `metadata` is purely an App
Router export. If you add `metadataBase`, just confirm the URL is
right for the GitHub Pages basePath (`https://hynr.github.io/portfolio`).

I do not touch `app/layout.tsx` at all.

## Cross-cutting note for opt/gameplay

See "Decisions needed" #3 above re: your smoke test runner. I'm
inclined to approve `tsx` and add the `test:input` script to
`package.json` (item 6) once the lead signs off. If that lands, I'll
also add `npm test` as an alias that runs `test:input` so CI can call a
single canonical script.

---

## Status board

- [x] Item 1 — repo hygiene — moved 4 screenshots to docs/screenshots/; tsbuildinfo already gitignored (brief was wrong about it being tracked)
- [x] Item 2 — tsconfig target es2020 — done; correctness only, byte-identical chunks (Next ignores tsconfig.target)
- [x] Item 3 — code-split game-mode — done; page chunk 81→49 KB raw / 18.4→12.6 KB gz; new game chunk 35 KB raw / 6.8 KB gz, loaded only on game entry. Content-mode first-load gz now ~182 KB (well under 200 KB target).
- [ ] Item 4 — re-enable type/lint
- [ ] Item 5 — eslint config tighten
- [ ] Item 6 — package.json scripts
- [ ] Item 7 — deploy artifact smoke check
- [ ] Item 8 — bundle analyzer (pending decision)
- [ ] Item 9 — Lighthouse measurement (pending sibling merges)
- [ ] Item 10 — CI fail-loud verification

**STOP.** Awaiting human approval before any code edits.
