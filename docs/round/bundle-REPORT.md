---
worktree: mario-bundle
branch: opt/bundle
status: pre-rebase (sibling branches not yet merged)
measured: 2026-05-10
---

# REPORT — `opt/bundle`

This report captures bundle-side findings before the lead rebases
`opt/bundle` onto the four sibling branches. Headline targets that
require sibling work (Lighthouse ≥ 95, `out/` ≤ 770 KB, `tsc --noEmit`
exits 0) get a second measurement pass after rebase — this file will
be updated then.

## Goal scorecard

| # | Goal | Status (pre-rebase) | Notes |
|---|---|---|---|
| 1 | Drop `ignoreBuildErrors` + `ignoreDuringBuilds` | ✅ done | Both removed from `next.config.js`. Build now type-checks. |
| 2 | Game mode code-split via `next/dynamic({ ssr: false })` | ✅ done | New chunk `53.*.js`, 35 KB raw / 6.8 KB gz, loaded only on game entry. |
| 3 | Content-mode first-load < 200 KB gzipped | ✅ done | **~182 KB gz** measured (modern browser, polyfills excluded — see §"Polyfills clarification"). |
| 4 | Lighthouse Performance ≥ 95 on `/` (mobile + desktop) | ⏸ deferred | Depends on perf agent's rAF fix and assets agent's font self-host. Re-measure post-rebase. |
| 5 | `out/` total ≤ 70% of pre-round (≤ 770 KB) | ⏸ deferred | Currently ~1.4 MB. The big drops come from perf's dead-code removal + assets' sound and font work. Bundle's own contribution: code-split saves ~32 KB raw / ~5.6 KB gz off the page chunk. Re-measure post-rebase. |
| 6 | `tsc --noEmit` exits 0 | ⏸ deferred | 26 errors in 9 files, **all** in files perf will delete. Self-resolves on perf merge. Triaged list below. |
| 7 | CI honors the type/lint check | ✅ done in code | `next.config.js` no longer silences. Runner-side fail-loud verification (deliberate type error → red CI) is a one-off the lead should perform after my branch merges, since I cannot push test branches without affecting other agents' visibility. Procedure below. |
| 8 | Tree-shaking audit | ✅ done | `PORTFOLIO_DATA` and `level_1_1` each appear in exactly one chunk. One *content* duplication found (parallel project descriptions in `lib/portfolio-data.ts` and `lib/level-data.ts`) — design issue, not tree-shake. Note for portfolio agent below. |

---

## Baseline (commit `d5215ce0`, mario-bundle worktree, before any item)

`GITHUB_PAGES=true npm run build` then `gzip -kf` on every `.js` in
`out/_next/static/chunks/`:

| Chunk | Raw | Gzipped |
|---|---:|---:|
| `polyfills-c67a75d1*.js` | 91 KB | 31.1 KB |
| `framework-c5181c94*.js` | 137 KB | 45.5 KB |
| `main-efad86ed*.js` | 122 KB | 35.5 KB |
| `fd9d1056-f2b96354*.js` (vendor) | 168 KB | 53.3 KB |
| `472-b5930000*.js` (vendor) | 122 KB | 32.6 KB |
| `webpack-a9ca4209*.js` | 4.2 KB | 1.8 KB |
| `main-app-9d26a5cb*.js` | 0.5 KB | 0.3 KB |
| `app/page-b7673c9d*.js` | 80 KB | 18.4 KB |
| `app/layout-44543c8e*.js` | 0.85 KB | 0.4 KB |
| **Content-mode first-load on modern browser (gz, sum, polyfills via `<script noModule>`)** | — | **~187 KB** |
| `out/` total | — | **~1.5 MB** |

### Polyfills clarification

The `polyfills-*.js` chunk (91 KB raw / 31 KB gz) ships under
`<script noModule>`. Modern browsers — every browser Next 14 supports —
skip it entirely. So when reporting "first-load" I exclude it; the
honest number on a modern browser was always ~187 KB gz, not ~218.

My initial PLAN claimed raising `tsconfig.target` would drop ~31 KB gz
of polyfills. That was wrong: SWC ignores `tsconfig.target` (it uses
`browserslist` from `package.json`, of which we have none, so it falls
back to the Next default), AND the polyfills are already excluded by
`<script noModule>` for modern browsers. The tsconfig change is
correctness only.

I tested adding a modern `browserslist` to `package.json` mid-session;
the build produced byte-identical chunks (same content hashes), so I
reverted that change.

---

## After (mario-bundle items applied; sibling branches not merged)

Same measurement procedure on `opt/bundle@504083a1` (item-4 commit) —
but with the type/lint scaffold temporarily disabled to produce a
build artifact, since 26 errors in dead code block the build until
`opt/perf` merges.

| Chunk | Raw | Gz | Δ vs baseline |
|---|---:|---:|---|
| `polyfills-*.js` | 91 KB | 31.1 KB | unchanged |
| `framework-*.js` | 137 KB | 45.5 KB | unchanged |
| `main-*.js` | 122 KB | 35.5 KB | unchanged |
| `fd9d1056-*.js` | 168 KB | 53.3 KB | unchanged |
| `472-*.js` | 122 KB | 32.6 KB | unchanged |
| `webpack-*.js` | 4.5 KB | 1.8 KB | +0.3 KB raw (dynamic-import boilerplate) |
| `main-app-*.js` | 0.5 KB | 0.3 KB | unchanged |
| **`app/page-*.js`** | **49 KB** | **12.6 KB** | **−32 KB raw / −5.8 KB gz** |
| `app/layout-*.js` | 0.85 KB | 0.4 KB | unchanged |
| **`53.*.js` (new game chunk, lazy)** | **35 KB** | **6.8 KB** | **+35 KB raw, lazy-loaded** |
| **Content-mode first-load (modern browser, gz)** | — | **~182 KB** | **−5 KB gz** |
| `out/` total | — | **~1.4 MB** | −0.1 MB |

The `app/page-*.js` reduction is the headline: content-mode visitors
download 32 KB raw / 5.8 KB gz less. The new `53.*.js` is fetched only
when a visitor clicks the pipe to enter game mode.

### Lighthouse + `out/` final

Both depend on sibling merges:
- Perf agent's rAF fix unlocks 60fps and a passing Performance score.
- Assets agent's font self-host kills render-blocking external CSS,
  major LCP win.
- Perf agent's dead-code deletion (`MarioGame.tsx`,
  `lib/game-engine/*`, `components/audio/*`, `components/sprites/*`,
  `components/game/*`) removes ~2000 LOC from source. Webpack already
  tree-shakes these out of the *bundle*, so the bundle delta from
  their deletion is small — but the source repo gets much cleaner.
- Assets agent's sound recompression drops `out/sounds/` from ~104 KB
  toward ≤ 60 KB.

Bundle's own contribution to `out/` size is bounded: the code-split
moved 32 KB raw between chunks and the `withBundleAnalyzer` wrapper
adds nothing to runtime output. Hitting the ≤ 770 KB target almost
entirely depends on assets agent's font and sound work (current
`out/_next/static/media/` font total: 360 KB).

---

## Bundle-analyzer audit (goal #8)

`npm run analyze` (gated behind `ANALYZE=true`) produces
`.next/analyze/{client,edge,nodejs}.html`. Manually grepping the
emitted chunks for distinctive strings from each large data module:

| Module | Distinctive string | Chunks containing it | Verdict |
|---|---|---|---|
| `lib/portfolio-data.ts` (`PORTFOLIO_DATA`) | `"Columbia, MD"` | `app/page-*.js` only | ✅ single chunk |
| `lib/portfolio-data.ts` | `"Full-Stack Developer"` | `app/page-*.js` only | ✅ single chunk |
| `lib/level-data.ts` (`level_1_1`) | game-only project descriptions | `53.*.js` (game chunk) only | ✅ single chunk, lazy |
| `lib/audio.ts` | `"AudioContext"`, `"block-hit"` | `app/page-*.js` AND `53.*.js` | ⚠ shipped to content-mode (see below) |

### Cross-cutting finding for `opt/portfolio` — duplicate project copy

`lib/portfolio-data.ts` and `lib/level-data.ts` both contain parallel
project descriptions. "AI Therapy Note Parser" appears in **both**
chunks because the *string* lives in **both source files**, not because
of a tree-shaking bug.

- `lib/portfolio-data.ts` lists the 4 projects for the content site.
- `lib/level-data.ts` `projects` array lists 4 question-block projects
  for the game with their own copies of title/description/links.

This means recruiter-facing copy edits (which the portfolio agent owns)
must be made twice or they drift. Fix is to consolidate into one source
of truth — likely `lib/portfolio-data.ts` exports project objects,
`lib/level-data.ts` references them by ID and adds only the game-only
fields (x position, projectId binding). Out of bundle's scope; flagging
for portfolio agent.

### Cross-cutting finding for `opt/assets` — `lib/audio.ts` ships to content-mode

`lib/audio.ts` is currently imported from:
- `app/game-mode/SimpleMarioGame.tsx` (game chunk — correct)
- `components/plain/Contact.tsx` (`playSound` for click feedback)
- `components/plain/PipeWarp.tsx` (`playSound` for warp transition)
- `lib/navigation.ts` (transitive into nav-using components)

So the audio module ships to the content-mode `app/page-*.js` chunk
even though it is not used until interaction. Your PLAN item 2 (lazy
`AudioContext` init) addresses runtime cost, but the module *bytes*
still ship at first-load.

A deeper fix would be to lazy-import `playSound` inside the click
handlers (`await import('@/lib/audio').then(m => m.playSound(…))`).
That removes `lib/audio.ts` from `app/page-*.js` entirely. Ask: do
you want to take this on, or punt to a future round? It's borderline
for the gz win (`lib/audio.ts` is ~5 KB, probably ~2 KB gz) and adds
async to a hot path.

---

## Type errors found (goal #6)

26 errors across 9 files; all in code perf will delete. Triaged in
`PLAN.md` under "Cross-cutting findings (post item 4)". No action
required from any agent — they self-resolve when `opt/perf` lands.

Live code (`SimpleMarioGame.tsx`, `app/page.tsx`, `app/layout.tsx`,
`app/content-mode/`, `components/plain/`, `lib/portfolio-data.ts`,
`lib/level-data.ts`, `lib/audio.ts`, `lib/mode-toggle.ts`,
`lib/navigation.ts`, `app/game-mode/GameMode.tsx`): **0 errors**.

---

## Deploy artifact smoke check (goal #7 / brief item 7)

```
GITHUB_PAGES=true npm run build
test -f out/.nojekyll      → present (committed in public/, copied automatically)
test -f out/index.html     → present
grep '/portfolio/_next' out/index.html → 2 matches, basePath OK
ls out/sounds/             → 13 mp3s + CREDITS.md, copied
```

`.github/workflows/deploy.yml` does `touch ./out/.nojekyll` after
build, but this is now redundant — `public/.nojekyll` is committed and
Next copies `public/` to `out/` automatically during static export.
The redundancy is harmless; bundle agent does not edit the workflow.

---

## CI fail-loud verification (goal #7 / brief item 10)

**Procedure for the lead** (or anyone with push rights post-merge):

```sh
# Fork a scratch branch off the integrated main
git checkout -b ci-fail-test main
# Introduce a deliberate type error in any TypeScript file:
#   app/page.tsx — replace const mode = useState<'content' | 'game'>('content')
#   with        : const mode: number = useState<'content' | 'game'>('content')
git add app/page.tsx
git commit -m "test: deliberate type error to verify CI fail-loud"
git push origin ci-fail-test
# Open a draft PR or watch the workflow run on push
# Expected: GitHub Actions deploy.yml → "Build static site" step exits non-zero
# Then:
git push origin :ci-fail-test  # delete remote
git checkout main
git branch -D ci-fail-test
```

I am not running this from `opt/bundle` because (a) my branch's CI is
already red on the dead-code errors documented above, so a fresh red
proves nothing extra; (b) pushing branches mid-round affects other
agents' visibility into status. The check is meaningful only against
the integrated main once perf has merged.

---

## Repo hygiene

- 4 untracked screenshots at `/Users/zafa/Desktop/portfolio/Screenshot
  *.png` → moved into this worktree at `docs/screenshots/`. After
  `opt/bundle` merges, the originals at the repo root are no longer
  needed; the lead can delete the residual untracked PNGs in main.
- `tsconfig.tsbuildinfo` at repo root → already gitignored
  (`.gitignore` line 23 `*.tsbuildinfo`). Brief was wrong about it
  being tracked; verified with `git ls-files | grep tsbuildinfo` → no
  matches. No action needed.
- `.eslintrc.json` → added `"root": true` so ESLint stops walking up
  to the parent worktree's identical config (otherwise produces a
  hard "Plugin @next/next was conflicted" error during local
  `next lint` from any sibling worktree).

---

## Dev-dependencies added

| Package | Version | Purpose | Approval |
|---|---|---|---|
| `tsx` | ^4.21.0 | TS executor for the gameplay agent's `lib/game-engine/input.test.ts` smoke test (their item #8) | lead pre-approved |
| `@next/bundle-analyzer` | ^16.2.6 | Tree-shake audit (goal #8). Gated behind `ANALYZE=true`; zero impact on default `npm run build` | lead pre-approved |

**No new runtime dependencies.** No edits to `react`, `react-dom`,
`next`, or any production dep.

---

## Files I touched this round

```
.eslintrc.json          (root: true; rule disable)
.gitignore              (no edits — *.tsbuildinfo already covered;
                         .claude/ already covered)
PLAN.md                 (planning + status board)
REPORT.md               (this file — new)
app/page.tsx            (single-line dynamic() conversion +
                         loading placeholder; perf-owned plumbing untouched)
docs/screenshots/*.png  (4 PNGs moved from repo root)
next.config.js          (drop type/lint silencing; add bundle-analyzer wrapper)
package.json            (scripts + 2 dev-deps)
package-lock.json       (regenerated by npm install -D)
tsconfig.json           (target es5 → es2020; lib es6 → es2020)
```

Everything else: unchanged. No files in `lib/`, `components/`,
`styles/`, `public/`, `app/game-mode/`, `app/content-mode/`,
`app/layout.tsx`, `app/globals.css`, `tailwind.config.js`,
`postcss.config.js`, `scripts/launch.sh` were edited.

---

## What needs to happen on rebase

When the lead rebases `opt/bundle` onto the integrated
`opt/perf+opt/assets+opt/gameplay+opt/portfolio` branch:

1. Run `npm install` (picks up tsx + @next/bundle-analyzer dev-deps).
2. Run `GITHUB_PAGES=true npm run build` → expected to be green now
   that perf has deleted the 9 dead files.
3. Run `du -sh out/` → expected ≤ 770 KB (assets agent's sound +
   font work is the biggest factor).
4. Run `npx serve out -l 3000 -s` and Lighthouse mobile + desktop on
   `/` and `/?mode=game` → expected ≥ 95 Performance.
5. Re-run `gzip -kf out/_next/static/chunks/*.js
   out/_next/static/chunks/app/*.js && du -shc *.gz` → expected
   content-mode first-load ≤ 145 KB gz once dead code is gone and
   audio module is no longer loaded into content-mode chunk
   (depending on whether assets agent takes the lazy-import suggestion).
6. Run the CI fail-loud verification per § above.
7. Update the "After" table and goal scorecard in this file with the
   final numbers.
