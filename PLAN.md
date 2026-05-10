# PLAN — `opt/gameplay`

Status legend: `pending` → `in-progress` → `done`. Items ordered by leverage. Each carries an estimated impact and risk. **No code lands until human approval.** After approval, one commit per item per the brief, message format `opt(gameplay): <change> — <impact>`.

Two items (#5 HUD edit, #4 reduced-motion in the loop) require touching `app/game-mode/SimpleMarioGame.tsx`, which is `opt/perf`'s file. I do **not** edit it. I describe the change here and post it to perf's `PLAN.md` review thread (see *Cross-cutting note for opt/perf* at the bottom). Perf applies during their `useRef` refactor.

---

## Context snapshot (verified by reading)

- Active keyboard read: `SimpleMarioGame.tsx:97-130, 241-275`. Used codes: `ArrowLeft`, `ArrowRight`, `KeyA`, `KeyD`, `Space`, `ArrowUp`, `KeyW`. Space is overloaded — both jumps *and* advances/closes the text bubble.
- Active hardcoded HUD lie: `SimpleMarioGame.tsx:985-988` (`<div>TIME</div><div>400</div>`).
- PHYSICS constants inline at `SimpleMarioGame.tsx:7-17` (8 numbers — must move to `lib/level-data.ts`).
- Resume pipe: **does not exist** in `lib/level-data.ts`. Only `github` (x=800) and `linkedin` (x=1600). The `case 'resume'` in `SimpleMarioGame.tsx:199-201` is dead code — never reached today. Brief goal #7 is moot for the current level; flagging anyway so we don't accidentally re-add the pipe before a PDF lands. See cross-cutting note for opt/portfolio.
- Reduced-motion pieces in-game: squash (`SimpleMarioGame.tsx:228-237, 352-355, 369-373`), coin spin sine (`SimpleMarioGame.tsx:627-629`), camera lerp (`SimpleMarioGame.tsx:486`). **Cloud drift does NOT exist** — clouds are static in world space at `SimpleMarioGame.tsx:501-508`, only camera scroll moves them. Brief is mildly off on this; nothing to disable for clouds.
- Reduced-motion entry block in `app/page.tsx:37-46` already alerts and refuses content→game when reduced-motion is set, *and* live-toggles game→content if the OS pref flips mid-session. So the only remaining gap is what happens *inside* a running game, which addresses goal #2.
- Audio mute: `lib/audio.ts:32-39` mutes only at `AudioSingleton` construction time; does not respond to live toggle. Out of scope for me — note for assets agent if they want it.
- Dead `TouchControls.tsx` writes to `InputHandler.setTouchState(...)`. I throw it away after perf deletes it; new TouchControls writes to the new input layer.
- Mobile detection: brief flags `MarioGame.tsx:485` (`window.innerWidth > 768`) as the wrong pattern. I will use `window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window` instead, evaluated once on mount, with a media-query listener for live changes (e.g. plugging in a keyboard).

---

## Items

### 1. Create `lib/game-engine/input.ts` — unified input layer (`done`)
> outcome: file written; `getInput()` / `setTouch()` / `initInput()` exported. Includes a `_resetForTest()` hook and a deprecated `InputHandler` class shim so the dead `MarioGame.tsx` keeps building until perf deletes it.
**Impact:** unblocks every other gameplay item; prerequisite for touch and the future `getInput()` seam in the rAF loop. **Risk:** low — surface is tiny.

Surface (target ~70 lines):

```ts
export interface InputSnapshot {
  left: boolean
  right: boolean
  jump: boolean      // held
  interact: boolean  // held — used by touch only; keyboard bubble-advance keeps its own listener
}

export type TouchButton = 'left' | 'right' | 'jump' | 'interact'

// Idempotent: safe to call twice. Returns a cleanup that removes listeners
// and resets touch state. Caller (SimpleMarioGame mount effect) owns lifetime.
export function initInput(): () => void

// Cheap: called every frame from the rAF loop. Returns a fresh object
// (immutable snapshot) so React refs / equality checks work predictably.
export function getInput(): InputSnapshot

// TouchControls calls this on pointerdown/pointerup. Multiple keys can be
// down concurrently (left + jump) — each tracked independently.
export function setTouch(button: TouchButton, pressed: boolean): void
```

Keyboard mappings (preserves the active subset, *plus* adds `KeyE` and `Enter` so a future a11y interact path is keyboard-reachable without overloading Space; today the bubble-advance keydown handler keeps Space as it does now):
- `left` ← `ArrowLeft`, `KeyA`
- `right` ← `ArrowRight`, `KeyD`
- `jump` ← `Space`, `ArrowUp`, `KeyW`
- `interact` ← `KeyE`, `Enter` (keyboard) + touch interact button

Implementation notes:
- Module-level `Set<string>` for keys; module-level `Record<TouchButton, boolean>` for touch.
- Keyboard listeners attach in `initInput()` and detach in the returned cleanup. SSR-safe: guard with `typeof window !== 'undefined'`.
- `e.preventDefault()` on Space and the arrow keys to suppress page scroll while game-mode is mounted (matches today's line 101 behavior, just centralized).

### 2. Rewrite `app/game-mode/TouchControls.tsx` against the new input layer (`done — pending perf-side mount`)
> outcome: component rewritten; renders only when `(pointer: coarse)` matches or `'ontouchstart' in window`. 64×64 pointer-event buttons with `setPointerCapture`. Mount point in `SimpleMarioGame.tsx` is perf-side per cross-cutting note.
**Impact:** mobile players can move. Today they cannot. **Risk:** medium — must not block canvas pointer events for pipes; must render only when appropriate.

Design:
- Render only when `(pointer: coarse)` matches OR `'ontouchstart' in window` (feature-based, per brief). Re-evaluated via media-query listener.
- Layout: bottom-left D-pad (`←`, `→`), bottom-right action stack (`A` / interact, `B` / jump). Hit targets **64 × 64 CSS px** (above the 44px floor), `touch-action: none` on each button, `user-select: none`.
- Pointer events (`pointerdown`, `pointerup`, `pointercancel`, `pointerleave`) so dev mouse + stylus + finger all work. Each handler calls `setTouch(button, true|false)`.
- Wrapper `<div>` is `pointer-events: none`; only the buttons opt back in with `pointer-events: auto`. The canvas underneath stays clickable for pipes (which the buttons are *not* layered over — they live in the corners).
- Interact button accepts an `onInteract: () => void` prop from `SimpleMarioGame`. Parent runs the same logic as today's Space-keydown bubble handler (skip-to-full → close). Keeps the bubble state machine in one place.
- Tailwind is unavailable in this component path historically; I use inline styles + a small inline `<style>` block for `:active`/`:focus-visible` pseudostates. Flagged for assets agent to migrate later (per brief constraint).
- Mounted as a sibling overlay inside `SimpleMarioGame.tsx`'s root `<div>`. The actual mount-point edit is described in the cross-cutting note for opt/perf.

### 3. Move `PHYSICS` constants from `SimpleMarioGame.tsx:7-17` into `lib/level-data.ts` (`done — pending perf-side import swap`)
> outcome: `PHYSICS` exported from `lib/level-data.ts` with values **identical** to current. Import-side replacement in `SimpleMarioGame.tsx` is perf-side per cross-cutting note.
**Impact:** tunables co-located with level data; satisfies brief goal #5; future tuning doesn't require touching the game module. **Risk:** zero (mechanical move).

- Export `PHYSICS` from `lib/level-data.ts` with **identical numeric values** (no tuning yet — that comes after perf's refactor lands so I can re-feel them on M1).
- The actual import-swap edit in `SimpleMarioGame.tsx` is described in the cross-cutting note for opt/perf.

### 4. Reduced-motion handling inside game-mode (`done — pending perf-side gates`)
> outcome: `lib/game-engine/use-reduced-motion.ts` shipped — live-updating boolean. Three gate-points (squash, coin spin, camera lerp) are perf-side per cross-cutting note. Cloud drift confirmed absent.
**Impact:** a11y goal #2; matches existing entry-time behavior; covers the direct-URL and mid-session-toggle gaps. **Risk:** low.

- Reduced-motion is read by the same `prefers-reduced-motion` media query already used by `app/page.tsx`. I add a small hook in this worktree: `lib/game-engine/use-reduced-motion.ts` (or inline; I'll decide while implementing). Returns `boolean`, live.
- When true, the game loop:
  - Skips squash: `squashTime` stays 0, `scaleY` stays 1.
  - Skips coin spin sine at `SimpleMarioGame.tsx:627-629`: `scale = 1` (just draw a static coin).
  - Snaps camera at `SimpleMarioGame.tsx:486`: `newCamera.x = clampedTargetX` (no lerp).
- Cloud drift: confirmed absent — no work needed.
- Audio mute on reduced-motion: already handled at construction time in `lib/audio.ts:36-39`; out of my scope.
- The actual edits to the game module are described in the cross-cutting note for opt/perf.

### 5. Honest TIME column (`described — pending perf-side JSX deletion`)
> outcome: decision recorded as **option (b) — remove**. Single-block deletion at `SimpleMarioGame.tsx:985-988` is perf-side per cross-cutting note.
**Impact:** removes a UI lie; satisfies brief goal #4. **Risk:** zero.

**Decision: option (b) — remove the column.**

Rationale: option (a) (real countdown + game-over loop) needs another `setState` source plus a death/respawn state machine plus a play-test pass for whether 400 is the right number. None of that is on-theme for a 2-minute portfolio walkthrough — a recruiter reading the page does not want their Mario session ending under them. (b) is one JSX deletion at `SimpleMarioGame.tsx:985-988` and the lie is gone.

Edit described in the cross-cutting note for opt/perf.

### 6. Plain Mode button focus + `Esc` shortcut + `aria-live` for the text bubble (`described — pending perf-side edits`)
> outcome: all three changes live in `SimpleMarioGame.tsx` and are perf-side per cross-cutting note. CSS for the focus ring is included verbatim there.
**Impact:** a11y goal #3. **Risk:** low.

- Plain Mode button at `SimpleMarioGame.tsx:1008-1039` currently has only browser-default focus. Add `:focus-visible` outline (visible white-on-purple ring, `2px solid #fff`, `outline-offset: 2px`). Implemented via inline `<style>` block since the component uses inline styles, not Tailwind.
- `Esc` keyboard shortcut: when game-mode is active, pressing `Esc` triggers the same flow as the Plain Mode button (`localStorage.setItem('displayMode', 'plain')`; `window.location.href = '/'`). I'll wire this through the input layer's keyboard listener — adds a `subscribe(key, fn)` micro-API or, simpler, a separate one-shot `useEffect` in the game module just for Esc. Probably the latter to keep the input layer minimal.
- `aria-live="polite"` region for the text bubble title at `SimpleMarioGame.tsx:1061-1068`. Screen-readers announce project reveals. Description block stays as visual text only (the title is the screen-reader payload — description is long enough that announcing it would be noisy).
- Tab order: today there is exactly one in-game button (Plain Mode), so Tab order is trivial. If items #1-#5 add the touch buttons, those should not be tab-focusable on desktop (visibility is `(pointer: coarse)`-gated). I'll set `tabIndex={-1}` on the touch buttons since they're touch-only.
- Edits to the Plain Mode button styling and the `aria-live` attribute are described in the cross-cutting note for opt/perf.

### 7. Reachability audit of level 1-1 (`done`)
> outcome: walked all 17 coins / 4 question blocks / 2 pipes analytically. Every item is reachable from spawn; no level edits needed. Full per-item table in `REPORT.md`. Found `groundVariation` is dead data (declared in level but never consumed by `SimpleMarioGame`'s ground collision) — flagged for opt/perf, not in my scope to wire.
**Impact:** satisfies brief goal #6; ensures every coin / question block is reachable. **Risk:** low — I edit `lib/level-data.ts` only, which I own.

Quick analytical bound (to be verified by foot in-game after perf's refactor):
- `JUMP_VELOCITY = -18`, `GRAVITY = 1.0`, `GRAVITY_REDUCED = 0.5`, `MAX_JUMP_HOLD = 250ms` (~15 frames at 60fps).
- Naive max jump height with full hold: roughly 18²/(2·0.5) ≈ 324px upper bound (full reduced-gravity rise). Realistic ~180-220px given the hold cap and frame timing.
- Player is 32×64. Ground at y=450 → player top at y=386 standing.
- 4 question blocks: y=350 (one), y=250 (two), y=300 (one). All within naive jump reach from ground.
- Coins span y=270–380. Coin clusters at x=900-1110 trace an arc up to y=270, which requires reaching player-top ≈ 254 from the ground — within reach but tight. The 900 platform at (x=900, y=250, w=128) gives a stepping stone, so the cluster is ridable from above as well.
- Question block at x=2200 (y=300) needs the 1900 platform (y=280, w=160) or the 2100 brick (y=300) as a stepping stone. Currently both exist — passable.

I will walk the level on paper, then in-engine, list every item with `(x, y, reachable: yes|no, from: <coordinates>)`, and:
- Move any unreachable item, OR
- Add a small platform / use `groundVariation` to bridge it, OR
- Document in `lib/level-data.ts` why it's intentional (e.g., a high-difficulty bonus coin — none currently warranted).

Output goes in `REPORT.md`, not in code comments.

### 8. Smoke test for the input layer: `lib/game-engine/input.test.ts` (`done`)
> outcome: 14 assertions covering keyboard (Arrow/WASD/Space/E/Enter), touch via `setTouch`, concurrent left+right, and blur-clears-all. Runs via `node --experimental-strip-types lib/game-engine/input.test.ts` — confirmed PASS on Node 26. Bundle-agent ask for a `package.json` script remains.
**Impact:** catches regressions if perf or a future agent re-touches the input seam. **Risk:** low.

- Synthetic `KeyboardEvent('keydown', { code: 'ArrowLeft' })` → assert `getInput().left === true`. Then `keyup` → assert `false`. Repeat for jump and interact.
- Synthetic `setTouch('jump', true)` → assert `getInput().jump === true`. `setTouch('jump', false)` → assert `false`.
- Brief notes "no runner is installed". Two paths:
  1. Coordinate with bundle agent to add `tsx`/`vitest` (one-line `package.json` script). Marginal cost; preferred if bundle agent is open.
  2. Fallback: a runtime `assert()` block inside `input.ts` that runs once in dev mode (`process.env.NODE_ENV === 'development'`) and `console.error`s on failure. Ugly but self-contained.

I'll ask bundle agent in this PLAN's coordination section. If they say no, I take the fallback.

### 9. Resume pipe coordination (`pending — awaiting opt/portfolio decision`)
> outcome: cross-cutting note posted. Default to (b) — leave dead switch arm; no `level-data.ts` change. If portfolio agent later ships `public/resume.pdf`, I'll add a third pipe at integration time.
**Impact:** stops a future 404; clarifies dead code. **Risk:** zero.

- `lib/level-data.ts` has no resume pipe today. The `case 'resume'` switch arm at `SimpleMarioGame.tsx:199-201` is unreachable.
- I will *not* remove the switch arm (perf's file). I will *not* add a resume pipe to `level-data.ts` until portfolio agent confirms a `public/resume.pdf` ships.
- Cross-cutting ask logged below.

---

## Cross-cutting note for opt/perf

You own `app/game-mode/SimpleMarioGame.tsx`. I need the following surface changes during your `useRef`-based refactor. None of these change physics or render logic — they are seams I plug into.

1. **Replace the keyboard-driven movement reads at lines 241-275 with `getInput()`** from `@/lib/game-engine/input.ts` (file I create). Signature: `() => InputSnapshot` where `InputSnapshot = { left, right, jump, interact: boolean }`. The bubble-advance keydown handler at lines 97-117 should remain as a one-time `useEffect`-attached listener on `Space` only — that path is event-driven, not per-frame, and doesn't belong in the unified snapshot.

2. **Mount lifecycle:** in your top mount effect (the one that survives state churn after your refactor), call `initInput()` and store the returned cleanup. Run cleanup on unmount.

3. **Render `<TouchControls onInteract={...}/>` as a sibling of the canvas** inside the root `<div>` at `SimpleMarioGame.tsx:937` (or wherever it lands post-refactor). I will provide the component; you provide the mount point and the `onInteract` callback (it should run the same logic as the existing Space-bubble handler at lines 102-115).

4. **Import `PHYSICS` from `@/lib/level-data`** instead of defining it inline at lines 7-17. Drop the inline block. I land the export in `lib/level-data.ts` — when both branches merge, the import resolves cleanly.

5. **Reduced-motion gate:** read `prefers-reduced-motion` once on mount (or via the small hook I'll ship in `lib/game-engine/use-reduced-motion.ts` — your call whether to import it or inline a `matchMedia` read). Pass the boolean into the loop; gate three things on it:
   - line 230: skip the squash decrement and the `scaleY` assignment
   - line 486: replace `prevCamera.x + diff * 0.1` with `clampedTargetX`
   - line 629 (inside `drawCoin` or wherever `Math.sin(time)` lives): use `scale = 1`

6. **Remove the TIME HUD column** at `SimpleMarioGame.tsx:985-988`. Just delete the `<div>` flex column. The other two HUD columns (`HUZAIFA`/score, `WORLD 1-1`/coins) stay.

7. **Plain Mode button styling** at lines 1008-1039: add `onFocus`/`onBlur` to mirror the `onMouseEnter`/`onMouseLeave` scale/shadow, plus a `:focus-visible` outline via an inline `<style>` block. The exact CSS is in my item #6 above; I'll send the patch as a comment on this note when you're ready.

8. **`aria-live="polite"`** on the text bubble title `<div>` at `SimpleMarioGame.tsx:1061-1068`.

9. **`Esc` keyboard shortcut**: add a one-shot `useEffect` that listens on `keydown` for `Escape` and runs the same body as the Plain Mode button's `onClick`.

10. **Resume switch arm** at `SimpleMarioGame.tsx:199-201`: leave it alone for now. If portfolio agent ships `public/resume.pdf`, I'll add the pipe to `level-data.ts` and the existing arm Just Works. If they don't, the arm stays as harmless dead code until a future cleanup pass.

If any of the above clashes with your refactor shape, post back here.

## Cross-cutting note for opt/portfolio

The resume pipe (`SimpleMarioGame.tsx:199-201`) currently 404s if it ever fires, but no level data routes to it today, so it's dormant. Two options — please pick:
- (a) You ship `public/resume.pdf`, I add a third pipe to `lib/level-data.ts` (probably at x≈2300, linkTo: 'resume'). The case wires up.
- (b) You don't ship the PDF; I leave `level-data.ts` alone. The dead switch arm stays — perf or bundle agent removes it later.

Either is fine for me. Default to (b) unless you actively want a third pipe.

## Cross-cutting note for opt/bundle

For item #8 (smoke test), I'd like a tiny test runner. Cheapest is `tsx` (already-on-path TS executor) plus a `package.json` script `"test:input": "tsx lib/game-engine/input.test.ts"`. No `vitest`/`jest`. Acceptable? If not, I fall back to a dev-only runtime assert inside `input.ts` itself.

## Cross-cutting note for opt/assets

Two informational pings, no asks:
- `lib/audio.ts:32-39` mutes on `prefers-reduced-motion` only at construction time. If you want it to live-respond to OS toggles, that's your call — I'm not going to plumb it.
- My new TouchControls uses inline styles + a small inline `<style>` block for `:focus-visible` and `:active`. Flagging so you can migrate to a stylesheet during your CSS pass if desired.

## Cross-cutting note for opt/perf (compactness)

If your `useRef` refactor lands first (as planned per merge order), I'll rebase my work onto it. The seams above (input layer, PHYSICS import, reduced-motion gate, TouchControls mount point) are designed to be additive — no shape conflict expected. If your refactor moves the rAF loop or `setPlayer` mutator into its own module, point me to the new file path so I can update the integration list.
