# REPORT — `opt/gameplay`

## Scope reminder

This worktree owns `app/game-mode/TouchControls.tsx`, `lib/game-engine/input.ts`, and `lib/level-data.ts`. Per BRIEF, the rAF loop, sprite drawing, and HUD JSX in `SimpleMarioGame.tsx` belong to `opt/perf`. Items that require editing the game module are described in `PLAN.md` for opt/perf to apply during their `useRef` refactor and are marked `pending — perf-side` here.

## Files added / changed in this branch

| File | Change | Lines |
|---|---|---|
| `lib/game-engine/input.ts` | rewrote: now exports `getInput()`, `setTouch()`, `initInput()`, `_resetForTest()`, plus a deprecated `InputHandler` shim | 117 |
| `app/game-mode/TouchControls.tsx` | rewrote against new input layer; pointer-event d-pad + interact button; `(pointer: coarse)`-gated | 159 |
| `lib/level-data.ts` | added `PHYSICS` export with values identical to inline block previously in `SimpleMarioGame.tsx:7-17` | +14 |
| `lib/game-engine/use-reduced-motion.ts` | new hook: live `prefers-reduced-motion` boolean | 26 |
| `lib/game-engine/input.test.ts` | new smoke test: 14 assertions, runs via `node --experimental-strip-types` | 124 |
| `PLAN.md` | continuously updated (status board) | — |

No edits to `SimpleMarioGame.tsx` per ownership boundary.

## Build / type / smoke

- `npx next build` → ✓ Compiled successfully; static export prerendered 4 pages. First Load JS shared by all: 87.6 kB. Route `/`: 18.2 kB / 106 kB First Load.
- `npx tsc --noEmit` → my files clean. Pre-existing errors remain in `app/game-mode/MarioGame.tsx`, `components/game/InteractivePipeSprite.tsx`, `components/sprites/*` — all dead modules in opt/perf's deletion list, all silenced today by `next.config.js`'s `typescript.ignoreBuildErrors: true` (bundle agent's flag).
- `node --experimental-strip-types lib/game-engine/input.test.ts` → 14/14 PASS.

## Reachability audit — level 1-1

Player physics: `JUMP_VELOCITY = -18`, `GRAVITY = 1.0`, `GRAVITY_REDUCED = 0.5`, `MAX_JUMP_HOLD = 250 ms`, `MOVE_SPEED = 6`. Player is 32×64; ground at y=450; standing player top at y=386. No-hold jump rise ≈ 171 px; with full variable-jump hold the apex sits roughly 220–260 px above ground. Reachability budget is therefore ~250 px of vertical clearance from any surface.

| Item | Position | Required rise from nearest surface | Reachable? | Evidence |
|---|---|---:|:-:|---|
| coin | (150, 380) | ~6 px | ✓ | walk-collect at ground level |
| coin | (180, 360) | ~26 px | ✓ | tiny hop |
| coin | (210, 340) | ~46 px | ✓ | small jump from ground; or run-on-bricks |
| coin | (240, 320) | platform-overlap | ✓ | inside player bbox when standing on bricks at y=350 |
| coin | (270, 320) | platform-overlap | ✓ | same; on bricks/question-block at y=350 |
| coin | (900, 380) | ~6 px | ✓ | walk-collect |
| coin | (930, 350) | ~36 px | ✓ | tiny hop |
| coin | (960, 320) | ~66 px | ✓ | small jump |
| coin | (990, 290) | ~96 px | ✓ | running jump from ground; alt: drop from 900-platform (y=250) |
| coin | (1020, 270) | ~116 px | ✓ | apex of running jump; alt: drop from 900-platform |
| coin | (1050, 270) | ~116 px | ✓ | mirror |
| coin | (1080, 290) | ~96 px | ✓ | descending arc |
| coin | (1110, 320) | ~66 px | ✓ | descending arc |
| coin | (1800, 380) | ~6 px | ✓ | walk-collect |
| coin | (1850, 360) | ~26 px | ✓ | tiny hop |
| coin | (1900, 360) | ~26 px | ✓ | tiny hop |
| coin | (1950, 380) | ~6 px | ✓ | walk-collect |
| ?-block | (300, 350) | ~36 px | ✓ | jump-from-below from ground; immediately right of brick row |
| ?-block | (1200, 250) | ~136 px | ✓ | jump-from-below from ground; the 900-platform (y=250) is to the left if a ride-up is preferred, then run-jump rightward |
| ?-block | (1400, 250) | ~136 px | ✓ | small hop from the (1300, 350) platform; the row at 1432, 1464 (y=250) flanks right |
| ?-block | (2200, 300) | ~86 px from bricks at 2132 (y=300) | ✓ | run-jump from bricks at 2100/2132; reachable from 1900 platform via stepping |
| pipe | (800, 386) | ground-level | ✓ | walk to it; click target spans 800-840 × 386-450 |
| pipe | (1600, 386) | ground-level | ✓ | walk to it |

**Verdict: all 23 collectibles/interactives are reachable.** No moves, additions, or removals to `lib/level-data.ts` beyond the `PHYSICS` export. Mobile players: same physics, same reachability — the variable-jump hold is timing-sensitive but the touch B button supports hold-then-release.

### Side observation

`level_1_1.groundVariation` is declared (3 segments at x∈[400,500], [1100,1200], [1500,1600] with reduced ground heights 430/420/410) but **never read** by the active `SimpleMarioGame`'s ground-collision code at `SimpleMarioGame.tsx:365` — that line uses the constant `WORLD.GROUND_HEIGHT`. Dead data, not in my scope to wire (game-loop logic is opt/perf). Flagged so it can be either implemented or removed later.

## Accessibility audit (preliminary)

The brief asks for an axe / pa11y before/after. I don't have those installed and can't add a dev dep without bundle agent's nod, and three of the four a11y items live in `SimpleMarioGame.tsx` (perf's file) and aren't applied yet. So this is a static reasoning pass, not a runtime audit.

| Concern | Status (this branch) | Status (after perf integration) |
|---|---|---|
| Plain Mode button focus ring | unchanged (browser default) | new `:focus-visible` outline (described in PLAN cross-cutting note) |
| `Esc` returns to content mode | unchanged | added (perf-side) |
| `aria-live="polite"` on bubble title | unchanged | added on `SimpleMarioGame.tsx:1061-1068` |
| Touch buttons have `aria-label` | ✓ in this branch | (visible after mount) |
| Touch buttons not in tab order | ✓ `tabIndex={-1}` | unchanged |
| Reduced-motion hook honored in-game | hook shipped | wired (perf-side) |
| Reduced-motion blocks game entry | already in `app/page.tsx` | unchanged |
| Pipe-link external `target="_blank"` | unchanged (uses `window.open`) | unchanged — out of my scope |

A proper axe run after perf merges + bundle adds the runner is deferred to integration.

## Device test plan (deferred)

The new `TouchControls` is not yet mounted in the active game (perf-side change). Once perf lands the mount, the BRIEF-required device matrix should be exercised:

| Device / browser | Mode | Status |
|---|---|---|
| iPhone 13, iOS Safari | portrait + landscape | not yet — pending mount |
| Pixel 6, Android Chrome | portrait + landscape | not yet — pending mount |
| MacBook M1, Safari + Chrome | desktop keyboard | input layer verified via smoke test; integration-test pending |

Things I can verify without integration:
- TouchControls renders nothing on `(pointer: coarse) === false` (verified via dev-tools "Toggle device toolbar" + reading the conditional `isTouchCapable()` check).
- Component compiles, types are clean.
- `setPointerCapture` + `pointercancel` together handle finger-slide-off without sticking.

I'd rather report device pass/fail honestly than claim success on un-integrated code. The PLAN cross-cutting note asks perf for the mount; once that lands, I'll re-run on a physical iPhone 13 / Pixel 6 and update this section.

## Screenshots

Pending integration. The component file is reviewable as code; visual verification requires the perf-side mount point (`<TouchControls onInteract={...}/>` adjacent to the canvas in `SimpleMarioGame.tsx`'s root `<div>`). After integration:
- portrait layout: d-pad at bottom-left (`←` `→` 64×64 + 16px gap, 96px from bottom), action stack at bottom-right (`B` jump on the left, `A` interact stacked above)
- landscape layout: same — buttons are anchored to viewport corners, not a fixed canvas-relative position

## Feel note (1 paragraph, deferred-honest)

I cannot deliver a "feel" verdict for the touch path until perf mounts the controls and I run it on a phone — guessing would just be optimism dressed up. What I *can* say from reading the loop and shipping the input layer: the keyboard physics are already pretty good (acceleration via `targetVelX`, coyote 80ms, variable jump up to 250ms) — the main risk on touch is that holding "B" for variable jump while simultaneously holding `→` requires two fingers, which iPhone-Safari handles fine but can produce awkward thumb positions on smaller devices. If feel testing shows that bothers people, the cheapest fix is to make `JUMP_VELOCITY` slightly more punchy (e.g., -19 or -20) and shrink `MAX_JUMP_HOLD` to ~180ms so the mid-jump release window is more forgiving — both numeric tweaks in `PHYSICS` (now in `lib/level-data.ts`), no code changes. I'll reach a verdict during the post-perf-integration test pass.

## Open coordination items (carried forward)

- **opt/perf**: 10 numbered integration points in `PLAN.md` § *Cross-cutting note for opt/perf*. Mount, `getInput()` seam, `PHYSICS` import, reduced-motion gates, TIME removal, focus/Esc/aria-live, resume switch arm.
- **opt/portfolio**: pick (a) ship `public/resume.pdf` + I add a third pipe, or (b) leave the dead switch arm (default).
- **opt/bundle**: add a `"test:input": "node --experimental-strip-types lib/game-engine/input.test.ts"` script to `package.json`. Optional: enable `allowImportingTsExtensions` in `tsconfig.json` so `tsc --noEmit` accepts the test file's import (currently silenced by `// @ts-expect-error`).
- **opt/assets**: informational only — `lib/audio.ts:32-39` mutes only at construction; new TouchControls uses inline styles (flagged for future stylesheet migration).

## Deferred until integration

- Live device matrix (iPhone 13, Pixel 6, M1)
- axe DevTools / pa11y before-after
- Screenshots (portrait + landscape)
- Feel note verdict
- Re-tune `PHYSICS` numerics
