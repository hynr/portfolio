# BRIEF — `opt/gameplay` (mario-gameplay)

You are one of five sibling Claude Code agents polishing a Mario-themed
Next.js 14 portfolio. The game already runs end-to-end. Your job is
*feel*: input, mobile/touch, accessibility, control polish, and the
dishonest "TIME 400" HUD lie. The perf agent is refactoring the loop in
parallel — your work plugs into the cleaned-up version.

Read `/Users/zafa/Desktop/portfolio/PLAN.md` and `DECISION.md` first for
context.

## Scope

You own these files. Everyone else is read-only on them.

- `app/game-mode/TouchControls.tsx` — **rewrite from scratch**. The
  perf agent will have deleted the dead version (which targeted the
  abandoned `lib/game-engine/input.ts`). You write a new one against
  the active `SimpleMarioGame.tsx`'s input layer.
- `lib/game-engine/input.ts` — **create**. The perf agent will have
  deleted the dead one. Write a small unified input layer (keyboard +
  touch) that both `SimpleMarioGame.tsx` and `TouchControls.tsx`
  share. Keep it tiny — under ~100 lines, no abstractions.
- `lib/level-data.ts` — tunables, hitbox sizing, `groundVariation`,
  any new platforms or interactives required to make a coin or block
  reachable on mobile.

You also coordinate with the perf agent on a small surface in
`app/game-mode/SimpleMarioGame.tsx`: the keyboard reads inside the
game loop. Once the perf agent lands its `useRef`-based refactor,
your `lib/game-engine/input.ts` exposes a `getInput(): InputSnapshot`
function that the loop calls each frame. Do **not** edit
`SimpleMarioGame.tsx` yourself — describe the integration in your
`PLAN.md` and post it to the perf agent's `PLAN.md` review thread for
them to apply during their refactor. Your ownership ends at the input
boundary.

## Goals (measurable)

1. **Touch controls work in the active game on iOS Safari and
   Android Chrome.** Today they are completely disconnected — the
   live `SimpleMarioGame` reads `keysRef.current` only, while the
   existing `TouchControls.tsx` writes to a different `InputHandler`
   instance from the dead engine. Mobile players cannot move at all.
   New `TouchControls` must offer at minimum: left, right, jump,
   "interact" (advance text bubble). Hit targets ≥ 44 × 44 CSS px,
   `touch-action: none` on the buttons, no scroll/zoom side effects.
2. **Reduced-motion respected inside game-mode.** The page-level
   toggle in `app/page.tsx` already blocks game *entry* under
   `prefers-reduced-motion`, but if a user toggles it mid-game (or
   if they enter via direct URL) animations still run. With reduced
   motion: disable squash, coin-spin sine, cloud drift, and snap the
   camera (no lerp). Keep the existing audio mute path that
   `lib/audio.ts:36-39` already handles.
3. **Keyboard accessibility.** Visible focus ring on the "Plain Mode"
   button (today it relies on default browser styling). `Esc` returns
   to content mode. `Tab` cycles between the in-game UI buttons in
   sane order. Add a single `aria-live="polite"` region for the
   text-bubble title so screen-readers announce project reveals.
4. **`TIME 400` is honest.** Either:
   (a) implement a real countdown that triggers a "time up" state
       (loops back to start, plays `game-over` sound), or
   (b) remove the HUD column.
   Pick one in your `PLAN.md`. (a) is more on-theme; (b) is cheaper.
   The HUD is rendered as React overlays at
   `SimpleMarioGame.tsx:957-989`; you describe the change, the perf
   agent applies it.
5. **Coyote time + variable jump survive the perf refactor.** Today's
   `PHYSICS` constants live inline at the top of `SimpleMarioGame
   .tsx` (lines 7-17). Move them into a `lib/level-data.ts` `PHYSICS`
   export so tuning them doesn't touch the game module. Keep numeric
   values identical to current at hand-off; tune only after the perf
   agent's refactor lands and you can re-feel them.
6. **Reachability audit of level 1-1.** Walk through every coin,
   question block, and pipe. Confirm with concrete coordinates that
   each is reachable from the spawn point given the current
   `JUMP_VELOCITY` / `MOVE_SPEED`. Any unreachable item: either move
   it, add a platform, or document why it's intentional. `lib/level-
   data.ts:97-127` is your editing target.
7. **Resume PDF or no resume pipe.** Today
   `SimpleMarioGame.tsx:200` does `window.open('/resume.pdf')` for
   the resume pipe, but `public/` has no `resume.pdf`. Coordinate
   with the portfolio agent: either they ship the PDF, or you remove
   the resume `linkTo` from `lib/level-data.ts:117-119`. Don't ship
   a 404.

## Out of scope — do not touch

- The rAF loop body, sprite drawing, canvas setup, camera math —
  perf agent owns those.
- Audio loading and `lib/audio.ts` — assets agent. You may *call*
  `playSound(…)` from new code paths (e.g. on time-up), just don't
  edit audio internals.
- Content components (`components/plain/*`), `lib/portfolio-data.ts`,
  `app/layout.tsx`, `app/content-mode/*` — portfolio agent.
- `next.config.js`, `tsconfig.json`, `tailwind.config.js`,
  `package.json` — bundle agent.
- `styles/*.css` — assets agent. If touch button styling needs CSS,
  inline it via Tailwind classes or a small inline `<style>` in your
  component, and flag it for the assets agent to migrate later.
- The six nested `portfolio-*/` directories and the four other
  `mario-*/` worktrees.

## Workflow

1. Read the repo, sketch the input-layer interface, run the game on
   localhost on an actual phone (or BrowserStack / Chrome device
   emulation as a fallback) to feel the gap. Then write a `PLAN.md`
   in this worktree (`mario-gameplay/PLAN.md`) listing the 5-10
   highest-leverage changes with **estimated impact** and **risk**.
   **Stop and wait for human approval** before touching code.
2. After approval, one commit per item: `opt(gameplay): <change> —
   <impact>`. Example: `opt(gameplay): wire TouchControls to active
   input layer — mobile players can now actually move`.
3. Write `REPORT.md` with: list of tested devices/browsers and the
   pass/fail per device, before/after a11y audit (axe DevTools or
   `pa11y`), screenshots of the new touch-control layout in
   portrait + landscape, and a short feel note (1 paragraph).
4. Do not merge to `main`.

## Live coordination

Five branches run in parallel; the lead integrates everyone at the end.
To keep merges painless:

- **Update this worktree's `PLAN.md` continuously.** Mark each item
  `pending → in-progress → done` with a one-line outcome note ("done —
  TouchControls now wired to live game on iPhone 13 Safari"). Commit
  those PLAN edits frequently — they cost nothing, and they are how
  every other agent and the lead see live status.
- **Before committing to any shared-ownership file** (for you, the
  recreated `app/game-mode/TouchControls.tsx` and the new
  `lib/game-engine/input.ts` only land *after* `opt/perf` deletes the
  old versions; `lib/level-data.ts` is shared-read with `opt/perf`,
  who reads platform/coin/block coordinates, and with `opt/portfolio`,
  who reads project IDs — don't rename any of those without notice),
  run `cat ../mario-<other>/PLAN.md` for each agent listed against
  that file. If another agent has the file marked in-progress, post a
  `## Cross-cutting note for opt/<other>` block at the bottom of your
  PLAN.md describing your intended change and wait for acknowledgement
  before committing.
- **Cross-cutting asks or findings** (e.g. "perf agent: please call
  `getInput()` from the rAF loop instead of reading `keysRef`
  directly — signature is `() => InputSnapshot`") go in a clearly-
  labeled section at the end of your PLAN.md, not buried in commit
  messages.
- **Don't rebase onto other `opt/*` branches yourself.** The lead
  handles integration. If you genuinely need a change another agent
  is making, ask in your PLAN.md.

The five `mario-*/PLAN.md` files are the live status board — readable
from any worktree by relative path. Treat them as a shared whiteboard:
read others, write to your own.

## Constraints

- **No new dependencies** without flagging. The input layer is
  small enough to write by hand. No game-engine libraries.
- **Public surface that must not break:**
  - Keyboard inputs already in use: WASD + arrows, Space, Shift, E,
    Enter (see `lib/game-engine/input.ts` lines 43-49 of the dead
    file for the existing mapping — preserve the active subset).
    The current `SimpleMarioGame` actively uses ArrowLeft/Right,
    KeyA/D, Space, ArrowUp, KeyW. Don't drop any.
  - Pipe-click → external link (GitHub, LinkedIn, mailto, resume)
    behavior is preserved.
  - Reduced-motion still blocks initial game entry from `app/page.tsx`.
  - Static export build still succeeds.
- Add a smoke test for the input layer: a tiny `lib/game-engine/
  input.test.ts` that simulates a `keydown` `keyup` cycle and a
  synthetic `pointerdown` `pointerup` and asserts the `InputSnapshot`
  flips correctly. No runner is installed; coordinate with bundle
  agent or guard with a runtime assertion in dev.

## Notes from the lead's discovery

- Active keyboard read: `SimpleMarioGame.tsx:97-130, 241-275`.
- Active hardcoded HUD: `SimpleMarioGame.tsx:957-989`.
- Dead `TouchControls`: 156 lines, drives the wrong `InputHandler`
  instance. Worth reading once to understand the touch-button layout
  the prior agent intended, then throw away.
- Mobile detection at `MarioGame.tsx:485` (`window.innerWidth >
  768`) is in the dead module — don't replicate that pattern;
  mobile detection should be feature-based (presence of touch events
  or pointer:coarse media query), not viewport-width.
- Level data is small: 14 coins, 15 blocks, 6 platforms, 2 pipes.
  Walk it on paper first.
