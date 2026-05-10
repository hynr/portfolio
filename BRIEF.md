# BRIEF — `opt/perf` (mario-perf)

You are one of five sibling Claude Code agents polishing a Mario-themed
Next.js 14 portfolio. The game already runs end-to-end; your job is to
make it feel framerate-stable and to clear the dead first-iteration code
that the other agents will trip over.

Read `/Users/zafa/Desktop/portfolio/PLAN.md` and `DECISION.md` first for
the wider context. Treat them as ground truth.

## Scope

You own these files. Everyone else is read-only on them.

- `app/game-mode/SimpleMarioGame.tsx` — the live game, 1087 lines.
- `app/game-mode/GameMode.tsx` — wrapper around the live game.
- `app/page.tsx` — **only** the mode toggle / mount logic (the
  `useState<'content' | 'game'>` and `setMode` block). The portfolio
  agent will edit this same file for the content↔game progress bridge;
  coordinate by leaving any `useGameProgress` hook alone once it appears.

You also delete the following dead code (your responsibility, since
it's transitively wired into modules you own):

- `app/game-mode/MarioGame.tsx` (496 lines, abandoned DOM-based
  first iteration; not imported anywhere except itself).
- `lib/game-engine/game-loop.ts`
- `lib/game-engine/input.ts`
- `lib/game-engine/physics.ts`
- `lib/game-engine/collision.ts`
- `app/game-mode/TouchControls.tsx` — the current version is wired
  to the dead `lib/game-engine/input.ts`. Delete it. The gameplay
  agent (`opt/gameplay`) will write a fresh `TouchControls.tsx` and
  a new `lib/game-engine/input.ts` against your refactored game.
- `components/sprites/PlayerSprite.tsx`
- `components/sprites/BlockSprite.tsx`
- `components/sprites/CoinSprite.tsx`
- `components/sprites/GroundTile.tsx`
- `components/sprites/CloudSprite.tsx`
- `components/sprites/BushSprite.tsx`
- `components/sprites/PipeSprite.tsx`
- `components/sprites/index.ts`
- `components/game/InteractivePipeSprite.tsx`
- `components/audio/AudioManager.tsx`
- `components/audio/MuteToggle.tsx`

Verify with `grep -rn '<filename>'` that nothing in `app/`, `components/`,
`lib/`, or `styles/` references each module before you delete it. The
active game inlines its own physics; the dead `lib/game-engine/*` is
only referenced by the dead `MarioGame.tsx` and the dead
`TouchControls.tsx`. `components/audio/*` is not referenced anywhere.

## Goals (measurable)

1. **rAF effect re-attaches at most once per game session.** Today's
   dependency array at `app/game-mode/SimpleMarioGame.tsx:576` lists
   `[player, camera, score, collectedCoins, hitBlocks, blockAnimations,
   coinAnimations, showTextBubble]` so every `setState` tears down and
   rebinds rAF. Hold mutable state in `useRef` and drive the loop off
   refs. React state stays only for what the UI overlay (HUD, text
   bubble) needs to re-render.
2. **Sustained 60 fps on M1 Safari and Chrome** through a 30-second
   walkthrough of level 1-1. Capture a Chrome DevTools Performance
   trace before and after; attach the FPS curve summary to `REPORT.md`.
3. **Player sprite draw cost < 0.3 ms/frame** on M1. The current
   `drawPlayer` (`SimpleMarioGame.tsx:775-927`) issues thousands of
   `ctx.fillStyle = …; ctx.fillRect(…)` calls per frame for each of
   four states. Build a one-time offscreen-canvas sprite atlas at
   mount (idle, walk1, walk2, jump × facing) and `ctx.drawImage` from
   it each frame.
4. **Steady-state JS heap allocation < 200 KB/sec** during gameplay.
   No new objects in the per-frame hot path: reuse the player object
   via mutation (you control it now — refs, not `setState`), avoid
   `{ ...prev }` spreads, avoid `new Set([...prev, x])` for `hitBlocks`.
5. **Game-mode initial canvas paint < 100 ms** after mount.
6. **Canvas is DPR-aware.** Today the canvas is 1024×576 logical pixels
   CSS-stretched to 100vw/100vh, so on a retina display the pixel art
   is *down*-sampled and looks soft. Set `canvas.width = SCREEN_WIDTH
   * dpr; canvas.height = SCREEN_HEIGHT * dpr` and `ctx.scale(dpr, dpr)`
   once on mount, with `image-rendering: pixelated` preserved. Keep
   the upscale nearest-neighbor — pixel-art look is the goal.
7. **Question-block detection is hoisted out of the loop.**
   `SimpleMarioGame.tsx:406-414` runs `filter().map().find()` every
   frame against static level data. Compute once at mount, look up by
   index.

## Out of scope — do not touch

- `lib/audio.ts` (assets agent owns).
- `app/layout.tsx` (assets agent owns font loading; portfolio agent
  owns `metadata`).
- `components/plain/*` (portfolio agent).
- `lib/portfolio-data.ts`, `lib/level-data.ts`, `lib/navigation.ts`,
  `lib/mode-toggle.ts` (portfolio + gameplay agents).
- `next.config.js`, `tsconfig.json`, `tailwind.config.js`,
  `package.json` scripts (bundle agent).
- `styles/*.css` (assets agent).
- `public/sounds/*` (assets agent).
- The six nested `portfolio-*/` directories at the repo root and the
  four other `mario-*/` worktrees — they are other agents' working
  copies. Read them only if you genuinely need cross-reference; never
  edit.
- The new `lib/game-engine/input.ts` and the new
  `app/game-mode/TouchControls.tsx` that the gameplay agent will
  write — don't pre-author them.

## Workflow

1. Read the repo. Then write a `PLAN.md` in this worktree
   (`mario-perf/PLAN.md`) listing the 5–10 highest-leverage changes
   with **estimated impact** (e.g. "drops per-frame heap allocation
   from ~5MB/s to ~50KB/s") and **risk** per item. **Stop and wait
   for human approval** before touching code.
2. After approval, implement one commit per item, message format:
   `opt(perf): <change> — <impact>`. Example:
   `opt(perf): hoist player state to useRef — rAF effect now binds
   once, not per frame`.
3. Write `REPORT.md` with before/after metrics: FPS curves, heap
   allocation rate, sprite draw time, dead-line-count delta, build
   size delta.
4. Do not merge to `main`. Do not rebase onto other `opt/*` branches.

## Live coordination

Five branches run in parallel; the lead integrates everyone at the end.
To keep merges painless:

- **Update this worktree's `PLAN.md` continuously.** Mark each item
  `pending → in-progress → done` with a one-line outcome note ("done —
  sprite atlas blits in 0.18ms/frame on M1"). Commit those PLAN edits
  frequently — they cost nothing, and they are how every other agent
  and the lead see live status.
- **Before committing to any shared-ownership file** (re-read your
  Scope and Out-of-scope sections for which files those are — for you,
  `app/page.tsx` is shared with `opt/portfolio`; deletions of
  `app/game-mode/TouchControls.tsx` and `lib/game-engine/input.ts`
  must precede `opt/gameplay`'s recreates), run
  `cat ../mario-<other>/PLAN.md` for each agent listed against that
  file. If another agent has the file marked in-progress, post a
  `## Cross-cutting note for opt/<other>` block at the bottom of your
  PLAN.md describing your intended change and wait for acknowledgement
  before committing.
- **Cross-cutting asks or findings** (e.g. "portfolio agent: I will
  expose a `useGameProgress()` write surface at line X — please align
  your hook signature") go in a clearly-labeled section at the end of
  your PLAN.md, not buried in commit messages.
- **Don't rebase onto other `opt/*` branches yourself.** The lead
  handles integration. If you genuinely need a change another agent
  is making, ask in your PLAN.md.

The five `mario-*/PLAN.md` files are the live status board — readable
from any worktree by relative path. Treat them as a shared whiteboard:
read others, write to your own.

## Constraints

- **No new dependencies** without flagging in your `PLAN.md`. The
  refactor should not need any.
- **Public surface that must not break:**
  - The content↔game mode toggle and pipe-link UX in `app/page.tsx`.
  - The static export build (`GITHUB_PAGES=true npm run build`) must
    succeed and produce a working `out/`.
  - Pipe-click external-link behavior (GitHub, LinkedIn, mailto,
    `/resume.pdf`).
  - HUD numbers (score, coin count) keep updating visibly.
  - Reduced-motion gating from `app/page.tsx` still blocks game entry.
- `next build` with `output: 'export'` must continue to succeed.
  Don't introduce new TS errors (the build silences them via
  `next.config.js`; that's the bundle agent's problem, not yours).
- Add a smoke test for the sprite-atlas builder if you ship one (a
  tiny `*.test.ts` that verifies the atlas has the expected number of
  frames and non-zero pixel data). No test runner is installed —
  coordinate with the bundle agent or guard with `if (process.env
  .NODE_ENV !== 'production')` for now.

## Notes from the lead's discovery

- Active loop reference: `SimpleMarioGame.tsx:208-576`.
- Dependency-array bug: line 576.
- drawPixel hotspot: lines 775-927.
- The HUD overlay (`<div>`s outside the canvas) is fine where it is;
  it only needs to re-render when `score`, `collectedCoins`, or the
  text bubble change. Keep those as React state with selective updates.
- "TIME 400" in the HUD is hardcoded — gameplay agent owns the fix.
