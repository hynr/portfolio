# `opt/perf` — PLAN

Worktree: `mario-perf` (branch `opt/perf`).
Owner: perf agent. Status board for siblings — read freely, do not edit.

Workflow per `BRIEF.md`: **stopped, awaiting human approval** before code edits.
After approval, one commit per item, message format
`opt(perf): <change> — <impact>`.

## Verified findings (before planning)

- `app/game-mode/SimpleMarioGame.tsx:576` — rAF effect dep array lists 8
  pieces of `useState`, so every state set tears down + rebinds rAF.
- `SimpleMarioGame.tsx:775-927` — `drawPlayer` issues ~250–300
  `fillStyle = …; fillRect(…)` pairs per frame across 4 sprite states,
  inside a per-frame `ctx.save()/restore()` with translate+scale.
- `SimpleMarioGame.tsx:406-414` — `level_1_1.blocks.filter().map()` +
  `level_1_1.projects.find()` re-runs every frame against static data.
- `SimpleMarioGame.tsx:711` — same pattern again inside `drawPlatforms`
  (filter+findIndex per question block per frame).
- Hot-path allocation: `{ ...newPlayer }` per frame, `new Set([...prev,
  index])` for `hitBlocks`, and `setBlockAnimations(prev => prev.map())`
  + `setCoinAnimations(prev => prev.map())` clone arrays every frame even
  when empty.
- Canvas: 1024×576 logical, CSS-stretched to 100vw/100vh; no DPR scaling,
  so pixel art is downsampled on retina.
- Dead-code reference scan: every file in the BRIEF's delete list is
  reachable only from other files in the delete list (or
  `components/sprites/index.ts` re-exports). The live `PipeSprite` used
  by content-mode is a *separate* file at `components/plain/PipeSprite.tsx`,
  not the dead `components/sprites/PipeSprite.tsx`. Deletions are safe.
- Three directories will be empty after deletion and should also be
  removed: `components/audio/`, `components/game/`, `components/sprites/`.
- Sibling `PLAN.md` files do not yet exist — no cross-cutting blockers.

## Items (highest-leverage first)

Each item is one commit. Numbers are pre-implementation estimates;
`REPORT.md` will replace them with measured values.

### 1. Hoist mutable game state to `useRef`; bind rAF once per session

**Change.** Move `player`, `camera`, `hitBlocks`, `blockAnimations`,
`coinAnimations`, `lastFrameTime` into `useRef`. The rAF `useEffect`
gets a `[]` dep array so it mounts once. React state stays only for
what the HUD overlay and text bubble need to re-render: `score`,
`collectedCoins.size` (store as a number, not a Set in state), and
`showTextBubble` / `bubbleText` / `displayedText` /
`textAnimationIndex` / `textFullyDisplayed`. The loop reads/writes
refs, and calls `setScore` / `setCollectedCoinCount` only when those
values actually change.

**Impact.** Goal #1 directly. rAF effect rebinds 0 times after mount
instead of ~60×/sec. Removes the largest source of jank and the entire
class of "stale closure" bugs the dep-array was masking. Estimated
sustained FPS jump from ~30–45 to a stable 60 on M1 before any draw-cost
work lands.

**Risk.** Medium. Touches every `setState(prev => …)` in the file.
Have to be careful that the HUD overlay still updates — `score` and
the coin count must remain React state, not refs. The `keysRef`
pattern already shows the right shape. Spacebar text-bubble close
flow stays in React state. Camera and animations are pure-render
state and move to refs cleanly.

### 2. Build an offscreen-canvas sprite atlas once at mount; blit player with `drawImage`

**Change.** On mount, render each of the 8 player frames (4 states ×
2 facings) into one `OffscreenCanvas` (or fallback `<canvas>` for older
Safari) at native pixel size, using the existing `drawPixel` palette.
Replace the per-frame body of `drawPlayer` with one
`ctx.drawImage(atlas, sx, sy, sw, sh, dx, dy, sw, sh)`. The squash
effect stays as `ctx.scale(1, scaleY)` around that single blit. Facing
flip stays as `ctx.scale(-1, 1)` around the blit. Add a tiny
`spriteAtlas.test.ts` (per BRIEF constraint) that asserts
`atlas.width === expectedW`, `atlas.height === expectedH`, and that at
least one non-transparent pixel exists per frame's bounding box.

**Impact.** Goal #3. Player draw drops from ~2–4 ms/frame (250+
state-set + fillRect pairs) to a single `drawImage` call, ~0.05–0.15
ms/frame on M1. Frees ~2 ms of frame budget — the difference between
"60fps with stutter" and "60fps clean" once the rAF binding is fixed.

**Risk.** Low. Atlas builder is pure and deterministic from the
existing pixel data (extract the pixel arrays from the four `if`
branches into typed-pixel-record arrays first; both the atlas builder
and a future replacement renderer can share them). `OffscreenCanvas`
needs a `<canvas>` fallback for Safari < 16.4 — `if (typeof
OffscreenCanvas !== 'undefined')` guard. The smoke test runs without
a test runner; gate it with `if (process.env.NODE_ENV !== 'production')`
per BRIEF instructions.

### 3. Hoist all per-frame static lookups out of the loop

**Change.** Compute once at mount and stash in module-scope or a ref:
- The decorated question-block list with title/description joined
  (currently `SimpleMarioGame.tsx:406-414`).
- The bush list (`level_1_1.decorations.filter(d => d.type === 'bush')`,
  `:511`).
- The brick-platform list (`level_1_1.platforms`, `:687`).
- The question-block index lookup inside `drawPlatforms`
  (`:711`, the `filter+findIndex` is O(n²) per frame).
- The sky gradient (`createLinearGradient`, `:495-498`) — built once,
  reused.

**Impact.** Goal #7. Drops three full array iterations and two object
allocations from each frame. Visible mostly as steadier frame pacing
on lower-end hardware (Raspberry Pi-tier) and a small heap-allocation
reduction.

**Risk.** Very low. These are pure data transforms over static input.

### 4. Eliminate per-frame heap allocations on the hot path

**Change.** Building on items 1 and 3:
- Mutate the player object in place inside the loop (no `{...prev}`).
- `hitBlocks` becomes a `Uint8Array(questionBlocks.length)` ref; set
  `arr[i] = 1` instead of `new Set([...prev, i])`.
- `blockAnimations` and `coinAnimations` become fixed-capacity pools
  (`{ active: false, … }[]` with a small max — 8 each is plenty given
  the level has ~4 question blocks). Reuse slots; no `prev.map()`,
  no `prev.filter()`, no `[...prev, x]`.
- `collectedCoins` similarly becomes a `Uint8Array`; the HUD state
  `collectedCoinCount: number` is bumped only on transition.
- The sky gradient and any `createLinearGradient` call moves out
  (covered by item 3).

**Impact.** Goal #4. Per-frame steady-state allocations drop from
roughly 5–8 KB/frame (~300–500 KB/sec at 60fps) to <1 KB/frame
(<60 KB/sec) — well under the 200 KB/sec target. Removes the GC
pauses that show up as 100–200 ms hitches every 5–10 seconds.

**Risk.** Medium. This is the most invasive item — it's the
"everything that touches game state" item. Can land safely after
item 1 (refs mean no React fight) and item 3 (lookups precomputed).
Will keep the existing collision-detection logic and physics math
byte-for-byte to avoid any feel change.

### 5. DPR-aware canvas with preserved pixel-art upscale

**Change.** On mount: read `window.devicePixelRatio`, set
`canvas.width = SCREEN_WIDTH * dpr; canvas.height = SCREEN_HEIGHT * dpr`,
call `ctx.scale(dpr, dpr)` once. Keep the CSS `width: 100vw; height:
100vh; image-rendering: pixelated`. Also set
`ctx.imageSmoothingEnabled = false` for the sprite atlas blit so
nearest-neighbor wins on the upscale. Re-run on `window.resize` only
if DPR actually changed (very rare; cheap to gate).

**Impact.** Goal #6. Sprites stop looking soft on retina. No FPS cost
(we draw the same logical pixels), small VRAM cost (4× pixels). Big
visual win.

**Risk.** Low. The `ctx.scale(dpr, dpr)` approach is standard and
won't interact with the existing translate/scale calls in
`drawPlayer` because those happen *after* the DPR scale. One thing
to verify: the click-to-pipe coordinate math at `:167-176` uses
`canvas.width / rect.width`, which already accounts for backing-store
size, so it stays correct.

### 6. Delete ~2,247 lines of dead code (one commit)

**Change.** Remove (verified by grep — only intra-set references):

- `app/game-mode/MarioGame.tsx` (495)
- `app/game-mode/TouchControls.tsx` (156) — gameplay agent will write
  a fresh one against the new input layer.
- `lib/game-engine/game-loop.ts` (73)
- `lib/game-engine/input.ts` (60)
- `lib/game-engine/physics.ts` (88)
- `lib/game-engine/collision.ts` (161)
- `components/sprites/{Block,Bush,Cloud,Coin,Ground,Pipe,Player}*.tsx`
  + `index.ts` (1,522)
- `components/game/InteractivePipeSprite.tsx` (79)
- `components/audio/AudioManager.tsx` + `MuteToggle.tsx` (104)

Plus the now-empty directories `lib/game-engine/`, `components/audio/`,
`components/game/`, `components/sprites/`.

The live `PipeSprite` used by `components/plain/PipeWarp.tsx` is
`components/plain/PipeSprite.tsx`, a separate file owned by the
portfolio agent — untouched.

**Impact.** ~2,247 lines removed. Bundle agent will measure the
gzipped delta; static-export `out/` is expected to shrink ≥30%
(per the lead's `PLAN.md` § bundle goal 5). Removes the entire
"first-iteration" surface that future agents could accidentally
import.

**Risk.** Low — references already verified. The TypeScript build
will surface any miss; bundle agent has `ignoreBuildErrors: true`
disabled later, so this is the right window to do it.

### 7. Smoke test for the sprite-atlas builder

**Change.** A `app/game-mode/spriteAtlas.test.ts` next to the atlas
builder. Asserts (a) the atlas canvas dimensions match the expected
`frameW * cols × frameH * rows`, (b) the per-frame ImageData has at
least one non-transparent pixel inside the body bounding box, (c)
the frame index map (state → {sx, sy}) covers all 8 entries.

Per BRIEF: no test runner installed. Wrap in
`if (process.env.NODE_ENV !== 'production')` and call from a dev-only
import path, so it runs once at dev mount and short-circuits in the
production export. Coordinate with the bundle agent in their PLAN.md
once they pick a test framework, at which point this becomes a real
unit test.

**Impact.** Catches atlas regressions during the gameplay agent's
input refactor and the bundle agent's tree-shaking pass.

**Risk.** None.

## Items I considered and rejected (for now)

- **Fixed-timestep accumulator (`performance.now()` delta-time loop).**
  Would stabilize physics on 120Hz displays where the current
  `Approx frame time = 16ms` constants drift. But the gameplay agent
  owns physics tunables (per `PLAN.md` § 3 goal 4), and shifting the
  integration model under them mid-round invites a feel regression.
  Worth raising as a cross-cutting note, not unilaterally implementing.
  See § Cross-cutting note for opt/gameplay below.

- **Switch to `requestAnimationFrame(time => …)` to use the timestamp
  argument instead of `Date.now()`.** Same concern. Tracking only.

## Order of operations

```
1 → 3 → 4 → 2 → 5 → 6 → 7
```

Item 1 first because everything else relies on stable refs.
Item 3 next because item 4 needs the precomputed lookups.
Item 4 lands the alloc-elimination on the now-stable refs.
Item 2 (atlas) is independent of 1/3/4 but lands cleaner once
the loop is settled.
Item 5 (DPR) is a single small commit, low blast radius.
Item 6 (deletes) lands once the atlas has fully replaced the
inline draw functions and nothing in `app/`, `components/`, `lib/`
references the dead modules.
Item 7 (test) ships alongside item 2.

## Measurement plan (for `REPORT.md`)

For each before/after comparison:
- Chrome DevTools Performance trace, 30s walkthrough of level 1-1
  (right to first pipe, jump on first question block, return).
  Capture FPS curve summary (min / median / 95th percentile).
- DevTools Memory tab "Allocation instrumentation on timeline",
  steady-state walking sample, KB/sec.
- DevTools Performance "User timing" markers around `drawPlayer`
  start/end, averaged over 60 frames.
- `du -sh out` after `GITHUB_PAGES=true npm run build`, before vs after.
- `wc -l` on the deleted files (already captured above).

Targets per BRIEF:
- Goal 1: rAF effect mounts once (assert in dev with a `console.count`
  in the effect; remove before commit).
- Goal 2: 60fps sustained over 30s walk on M1 Safari + Chrome.
- Goal 3: `drawPlayer` < 0.3 ms/frame on M1.
- Goal 4: heap alloc < 200 KB/sec steady state.
- Goal 5: initial canvas paint < 100 ms after mount.
- Goal 6: canvas DPR-aware, sprites crisp on retina.
- Goal 7: question-block detection precomputed.

## Constraints honored

- No new dependencies.
- Public surface untouched: mode toggle, pipe-click external links
  (GitHub / LinkedIn / mailto / `/resume.pdf`), HUD numbers, reduced-
  motion gating in `app/page.tsx`.
- `next build` with `output: 'export'` continues to succeed.
- Out-of-scope files untouched: `lib/audio.ts`, `app/layout.tsx`,
  `components/plain/*`, `lib/portfolio-data.ts`, `lib/level-data.ts`,
  `lib/navigation.ts`, `lib/mode-toggle.ts`, `next.config.js`,
  `tsconfig.json`, `tailwind.config.js`, `package.json`, `styles/*`,
  `public/sounds/*`, the six `portfolio-*/` snapshot dirs, the four
  other `mario-*/` worktrees.

## Status

| # | Item | Status | Outcome |
|---|---|---|---|
| 1 | Hoist state to `useRef` | done | rAF effect dep array now `[]`; player/camera/hitBlocks/blockAnims/coinAnims/collectedCoins on refs; HUD reads `collectedCoinCount`. Static-export build passes (106 kB first-load JS, baseline). |
| 2 | Sprite atlas + `drawImage` | done | spriteAtlas.ts builds an OffscreenCanvas (with HTMLCanvasElement fallback) at mount; pixel data run-length encoded (~67 strips/frame × 4 frames). drawPlayer now does one drawImage. SimpleMarioGame.tsx 1112 → 998 lines (atlas data lives in 363 lines of mostly auto-generated runs). Page route 18.6 → 18.1 kB. |
| 3 | Hoist static lookups | done | QUESTION_BLOCKS / QUESTION_INDEX_BY_XY / BUSH_DECORATIONS hoisted to module scope; sky gradient cached in useEffect. drawPlatforms O(n²) findIndex replaced with O(1) Map lookup. |
| 4 | Eliminate hot-path allocs | done | hits/collected → Uint8Array; blockAnims/coinAnims → fixed pools (size 8); spawn/end mutate `active` flag instead of push/splice; hot-path forEach → for loops. |
| 5 | DPR-aware canvas | pending | — |
| 6 | Delete dead code | pending | — |
| 7 | Sprite-atlas smoke test | pending | — |

## Cross-cutting note for opt/gameplay

After item 1, `player` lives at `playerRef.current` inside
`SimpleMarioGame.tsx` (no longer React state). When you wire the new
`lib/game-engine/input.ts`, expect to read keyboard + touch into a
single `inputStateRef` and have the game loop consume it the same
way it currently consumes `keysRef`. I will leave a stable
`inputStateRef` shape — same `Set<string>` semantics as today's
`keysRef` — so your input layer can replace the listeners without
the loop changing. If you'd prefer a different shape (e.g. a
fixed-key boolean record for branch-prediction friendliness), say so
here and I'll align before committing item 1.

Separately: the BRIEF asks for sustained 60fps; on 120Hz displays the
current `Approx frame time = 16ms` constants for `squashTime`,
`jumpHoldTime`, `MAX_JUMP_HOLD`, and coin-anim `lifetime` will run at
half-speed once rAF actually delivers 120 ticks/sec (it doesn't today
because the dep-array bug caps us). I am NOT changing the integration
model — that's your domain — but flagging it so you can decide
whether to switch to a `performance.now()`-based delta or rescale
the constants once item 1 lands. Happy to coordinate.

## Cross-cutting note for opt/portfolio

I will not touch the `useState<'content' | 'game'>` / `setMode` block
in `app/page.tsx` after this PLAN is approved unless you ask. If a
`useGameProgress()` hook lands in `lib/mode-toggle.ts` and you wire
it into `app/page.tsx`, I'll read it from inside `SimpleMarioGame`
via the same hook (or via a write callback you expose) so coin/
project state propagates without the game owning the persistence.
Tell me here which interface you'd like before you ship.

## Cross-cutting note for opt/bundle

After item 6 lands, `lib/game-engine/`, `components/audio/`,
`components/game/`, and `components/sprites/` are gone entirely. Your
tree-shake pass should see a clean drop. The sprite atlas (item 2)
ships as a pure module that's only imported by `SimpleMarioGame`,
so it stays inside the `next/dynamic`-split game chunk you'll create.
