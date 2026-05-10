# `opt/perf` — REPORT

Branch: `opt/perf` (mario-perf worktree). Baseline: `d5215ce0` on `main`.
Seven commits land between baseline and HEAD; one commit per item per
the BRIEF, message format `opt(perf): <change> — <impact>`.

## What's empirical vs what's static-analysis

Browser-runtime metrics in the BRIEF (FPS curves, `drawPlayer` ms/frame,
JS heap KB/sec) require an interactive Chrome DevTools Performance
trace on M1 Safari and Chrome. **I did not capture those traces** —
they need a human to run a 30-second walkthrough of level 1-1 in a real
browser. The methodology and exact steps are listed below in
§ Methodology for in-browser measurement so the next person can drop
the captured numbers into the table at the bottom.

What this report does measure directly:
- **Line-count delta** across the worktree (precise).
- **`next build` static-export bundle size**, baseline vs HEAD
  (`du -sh out`, per-chunk `ls -lh`).
- **Per-frame algorithmic cost**, by reading the diff (work counted in
  CPU units rather than wall-clock; see § Per-frame work breakdown).

The static-analysis numbers establish the upper bound on what the
in-browser trace will measure. If the trace numbers come back worse,
something else is wrong — start there.

## Item-by-item summary

Each row links a goal in `BRIEF.md` § Goals to the commit that addresses
it and the measurable evidence.

| # | Item | Commit | Goal addressed | Evidence |
|---|---|---|---|---|
| 1 | Hoist game state to `useRef` | `34338550` | Goal 1 (rAF binds once) | rAF effect dep array `[]` (was 8 React states). Verified by inspection at `app/game-mode/SimpleMarioGame.tsx`. |
| 3 | Hoist static lookups | `efb3a725` | Goal 7 (question-block lookup precomputed) | `QUESTION_BLOCKS`, `QUESTION_INDEX_BY_XY`, `BUSH_DECORATIONS`, sky gradient — all built once. |
| 4 | Eliminate hot-path allocs | `a46cdd1a` | Goal 4 (heap < 200 KB/sec) | hits/collected → `Uint8Array`; animations → fixed pools (size 8); `forEach` → `for`. Zero `new`/`{}` per frame on steady-state path. |
| 2 | Sprite atlas + `drawImage` | `eb7ae1f0` | Goal 3 (`drawPlayer` < 0.3 ms/frame) | One `ctx.drawImage` per frame replaces ~250 `fillStyle = …; fillRect(…)` pairs. |
| 5 | DPR-aware canvas | `4bb4a671` | Goal 6 (DPR-aware) | `canvas.width = SCREEN_W * dpr; ctx.scale(dpr, dpr)` once at mount. Click handler converts CSS px → logical world units. |
| 6 | Delete dead code | `c040c6cd` | (BRIEF § Scope: deletes) | 17 files, 2,742 lines. Verified zero references from active source. |
| 7 | Sprite-atlas smoke test | `357e2a72` | (BRIEF § Constraints) | `spriteAtlas.test.ts`; dynamic-imported only when `NODE_ENV !== 'production'`; verified absent from `out/` chunks. |

## Line-count delta

Active game module:

```
                                  before   after   Δ
app/game-mode/SimpleMarioGame.tsx   1087    1016   −71
app/game-mode/spriteAtlas.ts          —      363  +363   (new — 73% auto-generated runs)
app/game-mode/spriteAtlas.test.ts     —       76   +76   (new — dev-only, dropped from prod bundle)
                                  ─────   ─────   ────
                                   1087    1455  +368
```

The active game itself shrank, and the new code is a tightly-scoped
data file plus a smoke test.

Dead-code removal (commit `c040c6cd`):

```
app/game-mode/MarioGame.tsx                    495
app/game-mode/TouchControls.tsx                156
lib/game-engine/game-loop.ts                    73
lib/game-engine/input.ts                        60
lib/game-engine/physics.ts                      88
lib/game-engine/collision.ts                   161
components/sprites/PlayerSprite.tsx            194
components/sprites/BlockSprite.tsx             211
components/sprites/CoinSprite.tsx              175
components/sprites/GroundTile.tsx              288
components/sprites/CloudSprite.tsx             207
components/sprites/BushSprite.tsx              185
components/sprites/PipeSprite.tsx              242
components/sprites/index.ts                     24
components/game/InteractivePipeSprite.tsx       79
components/audio/AudioManager.tsx               13
components/audio/MuteToggle.tsx                 91
                                            ─────
                                             2742
```

Plus four directories removed entirely: `components/audio/`,
`components/game/`, `components/sprites/`, `lib/game-engine/`.

**Net repo Δ:** `+368 − 2,742 = −2,374 lines.`

## Build size delta

`GITHUB_PAGES=true npx next build`, measured on the same machine, same
Node, same `node_modules`. Re-runnable.

```
                                      baseline   HEAD     Δ
out/ total (du -sh)                       1.3M    1.2M   ≈−100 KB
out/_next/static/chunks/app/page-*.js      80K     68K   −12 KB (−15%)
First Load JS shared by all              87.7 kB 87.7 kB   0   (shared chunks unchanged)
Page route reported size                 19.x kB 18.2 kB  ≈−0.8 kB
```

The `page-*.js` chunk holds the game module + sprite atlas + (in dev)
the smoke test. Despite adding `spriteAtlas.ts` (363 lines) and the
test, the chunk is 12 KB smaller — the ~250 inline pixel `drawPixel`
calls per state were that bulky, and run-length encoding into ~67
strips/state plus the production-stripped test more than pay for the
new module's overhead.

The shared chunks (`618f8807-…`, `835-…`, `main-…`, `webpack-…`) are
unchanged because the dead code never reached them — Next was already
tree-shaking those imports out. The win on dead-code removal is
**source-tree clarity**, not bundle bytes; bundle agent will hit those
bytes via code-splitting `app/game-mode` behind `next/dynamic`
(see `PLAN.md` § 5).

## Per-frame work breakdown (static analysis)

CPU work in the rAF loop, before vs after, using "operations per frame"
as a proxy. Numbers are exact for static work, conservative for dynamic
(I take the level 1-1 worst case: 4 question blocks, 0 active animations
in the steady state).

| Work | Before | After | Δ |
|---|---|---|---|
| `useEffect` rAF effect rebinds (per `setState`) | 1 per setState (~5–10/sec) | 0 (binds once at mount) | full |
| `setState({...prev})` for player (object spread) | 1/frame | 0 | full |
| `setState({...prev})` for camera | 1/frame | 0 | full |
| `setState(new Set([...prev, x]))` for hitBlocks | up to 1/event | 0 (`Uint8Array[i] = 1`) | full |
| `setState(new Set(...))` for collectedCoins | 1/frame (clones unconditionally) | only on coin pickup, batched as count | ≈0 in steady state |
| `setState([...prev.map().filter()])` blockAnims | 1/frame | 0 (mutate pool slot) | full |
| `setState([...prev.map().filter()])` coinAnims | 1/frame | 0 (mutate pool slot) | full |
| `level_1_1.blocks.filter(...).map(p => projects.find(...))` | 1/frame (4 elems × full project array scan) | 0 (precomputed at module load) | full |
| `level_1_1.decorations.filter(...)` for bushes | 1/frame | 0 (precomputed) | full |
| `ctx.createLinearGradient + 2 addColorStop` | 1/frame | 0 (cached at mount) | full |
| O(n²) findIndex inside `drawPlatforms` (per question block per frame) | 4 × full block-array scan | 4 × Map.get() | quadratic → constant |
| `drawPlayer` per-frame `fillStyle =`/`fillRect(…)` pairs | ~250 (2 ops × ~125 pixels) | 1 `drawImage` | ~250× |
| Hot-path `forEach` callback closures (closures-per-iter) | many | 0 (`for (let i = 0; ...)`) | full |

The "drawPlayer" line is the largest single win and the basis for
Goal 3 (< 0.3 ms/frame). One `drawImage` from a small (128×44) atlas
on M1 is sub-100µs; static-analysis bound says we're well under the
goal.

## Goal-by-goal verdict

| BRIEF goal | Status | Notes |
|---|---|---|
| 1. rAF effect re-attaches at most once per session | **met** (verified by inspection — dep array is `[]`). |
| 2. Sustained 60 fps on M1 Safari + Chrome over 30s walkthrough | **needs in-browser trace**, but the algorithmic Δ (eliminated rAF rebind + ~250× drop in `drawPlayer` ops + zero per-frame allocations) makes 60 fps the expected outcome. |
| 3. Player sprite draw cost < 0.3 ms/frame on M1 | **needs in-browser trace**, expected far below — single `drawImage` from 128×44 atlas vs 250+ `fillRect`s. |
| 4. Steady-state JS heap allocation < 200 KB/sec | **needs in-browser trace**, expected ~0 KB/sec on the hot path — every per-frame `setState`, spread, `new Set`, `prev.map`, and `prev.filter` is gone. |
| 5. Game-mode initial canvas paint < 100 ms after mount | **needs in-browser trace**. The mount work added: (a) sprite atlas build (~67 strips × 4 frames = ~270 fillRects on a 128×44 OffscreenCanvas — sub-millisecond), (b) DPR scale, (c) gradient cache. All trivial. |
| 6. Canvas is DPR-aware | **met** — `canvas.width = SCREEN_W × dpr`, `ctx.scale(dpr, dpr)`, `imageSmoothingEnabled = false`, `image-rendering: pixelated` preserved. Click handler correctly converts CSS px → world units. |
| 7. Question-block detection hoisted out of loop | **met** — `QUESTION_BLOCKS` precomputed at module scope; `QUESTION_INDEX_BY_XY` Map replaces O(n²) `findIndex` inside `drawPlatforms`. |

## Methodology for in-browser measurement

For Goals 2, 3, 4, 5: run on M1, Chrome 130+, Safari 17+. Repeat on
both browsers; report the worse number.

1. **Setup.** `npm run dev`. Navigate to `/`, click the pipe in the
   nav to enter game mode.
2. **DevTools Performance trace.** Cmd+Option+I → Performance →
   Settings: CPU "No throttling", Network "No throttling". Click
   record. Walk right (`ArrowRight` held) for 5 seconds. Jump on the
   first question block. Walk to the second pipe (~10 seconds total).
   Hit `Esc`-equivalent (or click "Plain Mode") to leave game mode.
   Stop recording. Total trace ~12–15 seconds; the BRIEF asks 30 — do
   a longer walkthrough if you want.
3. **Read FPS curve.** "Frames" track at the top. Expected: a flat
   green band at 60 fps (or 120 on a 120 Hz display — see
   "Cross-cutting note for opt/gameplay" in `PLAN.md` for why the
   physics constants will look half-speed in that case). Capture the
   median, the 5th percentile, and any drops below 50 fps. Drop a
   screenshot into `REPORT.md` after this section.
4. **Read `drawPlayer` cost.** "Bottom-Up" view → search "drawPlayer"
   or "drawImage". Self time per call. Average over 60 consecutive
   frames. Expected: well under 0.3 ms.
5. **Read heap allocation rate.** Memory tab → "Allocation
   instrumentation on timeline" → record while walking right for 5
   seconds (no events). Read the "Allocated size" delta. Divide by
   wall-clock seconds. Expected: well under 200 KB/sec, likely under
   30 KB/sec (the React state setters for `score`/`collectedCoinCount`
   are the only remaining allocators on the hot path, and they only
   fire on coin pickup).
6. **Read first canvas paint.** Lighthouse → mobile or desktop →
   Performance → "Largest Contentful Paint" or "First Meaningful
   Paint" of `/?mode=game`. Or: DevTools Performance → trace from
   reload, look for the first `paint` event after the canvas mounts.
   Expected: under 100 ms.

Drop the captured numbers into the table here:

| Goal | Target | M1 Chrome | M1 Safari |
|---|---|---|---|
| 2. Sustained FPS, 30s walk (median / p5) | 60 / 60 | _TBD_ / _TBD_ | _TBD_ / _TBD_ |
| 3. `drawPlayer` ms/frame (avg) | < 0.3 | _TBD_ | _TBD_ |
| 4. Heap allocation rate, walking | < 200 KB/sec | _TBD_ | _TBD_ |
| 5. Initial canvas paint, mount-to-paint | < 100 ms | _TBD_ | _TBD_ |

## Risks landed and risks deferred

**Landed.** Two intentional behavior changes worth flagging to the
gameplay agent (already in `PLAN.md`'s Cross-cutting note):

1. **Player position is now read at current-frame time.** Before, the
   coin and question-block collision checks read `player.*` from React
   state, which lagged by one frame because `setPlayer` is async. After
   item 1, the loop mutates `playerRef.current` and immediately reads
   it — collisions land at the visually-current position. This is
   strictly more correct, but a player who knew exactly when a coin
   "would" pick up under the old behavior may notice a 1-frame change.
2. **`Approx frame time = 16ms` constants now run at full rate.** In
   the original code the rAF rebind bug capped the loop well below
   60 fps, so the `squashTime`, `jumpHoldTime`, `MAX_JUMP_HOLD`, and
   `coin.lifetime` constants — all hard-coded to "16 ms per frame" —
   ran slow. After item 1, on a 60 Hz display the timing is now what
   the constants say. **On 120 Hz displays the `+= 16` constants will
   read as half-speed**, since the loop now actually delivers 120
   ticks/sec. Gameplay agent owns the fix (either switch the
   integration to a `performance.now()` delta or rescale the constants
   to per-tick under fixed-tick).

**Deferred (out of scope for `opt/perf`).** A real fixed-timestep
physics loop. Switching to `requestAnimationFrame(time => ...)` with
a delta would generalize the constants from "ticks" to "milliseconds"
and fix the 120 Hz issue in one shot. I left this for the gameplay
agent because the BRIEF puts physics tunables under their ownership.
The hook is in `PLAN.md`'s § Cross-cutting note for opt/gameplay.

## Public surface — sanity check

Per BRIEF § Constraints:

- **Mode toggle:** unchanged. `app/page.tsx` still owns the
  `useState<'content' | 'game'>` block; I touched only the
  `useGameProgress`-leaving comment in the cross-cutting note.
- **Pipe-click behavior:** unchanged. `handleCanvasClick` still
  switches on `pipe.linkTo` and dispatches to GitHub / LinkedIn /
  mailto / `/resume.pdf`. The CSS-pixel-to-world-unit math was
  updated for DPR (item 5) but the dispatch is the same.
- **HUD numbers:** unchanged in shape. `score` still updates on coin
  + block hit; the coin count display now reads
  `collectedCoinCount.toString().padStart(2, '0')` instead of
  `Array.from(collectedCoins).length.toString().padStart(2, '0')` —
  same render, smaller code.
- **Reduced-motion gating:** unchanged. `app/page.tsx` still blocks
  game entry under `prefers-reduced-motion`.
- **Static-export build:** `next build` with `output: 'export'`
  passes (verified after every commit).
- **No new dependencies.**

## Files changed

```
app/game-mode/SimpleMarioGame.tsx        modified  (1087 → 1016 lines)
app/game-mode/spriteAtlas.ts             added     (363 lines, run-length data)
app/game-mode/spriteAtlas.test.ts        added     (76 lines, dev-only)
PLAN.md                                  added
BRIEF.md                                 added (lead handoff, kept in worktree)
REPORT.md                                added (this file)
app/game-mode/MarioGame.tsx              deleted
app/game-mode/TouchControls.tsx          deleted
lib/game-engine/{game-loop,input,physics,collision}.ts  deleted
components/sprites/{Block,Bush,Cloud,Coin,Ground,Pipe,Player}*.tsx + index.ts  deleted
components/game/InteractivePipeSprite.tsx                deleted
components/audio/{AudioManager,MuteToggle}.tsx           deleted
```
