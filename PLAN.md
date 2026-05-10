---
worktree: mario-assets
branch: opt/assets
status: awaiting approval
---

# PLAN — `opt/assets`

Owned surface: `public/sounds/*`, `lib/audio.ts`, the font block in
`app/layout.tsx` (lines 1-23, 39), `styles/sprites.css`,
`styles/game.css`, `styles/content.css`, `app/globals.css`, and only
the `images` block of `next.config.js`.

What I'm not touching: the `metadata` export in `app/layout.tsx`
(portfolio agent) and everything in `next.config.js` outside the
`images` block (bundle agent). Cross-cutting notes for both at the
bottom of this file.

Lighthouse / network numbers below are estimates from inspecting the
code, not measured baselines. The REPORT.md will replace them with
real before/after numbers once the perf agent's rAF fix has landed
(scores on the game route depend on it; scores on `/` don't).

---

## Items, in proposed commit order

Each item is a single commit. Format:
`opt(assets): <change> — <impact>`.

### 1. Self-host Press Start 2P via `next/font/google`
**Status:** done — Press Start 2P self-hosted from `/public/fonts/PressStart2P-Regular.woff2` (4.7KB latin subset). `fonts.googleapis.com` no longer in critical path. Family registered under literal `"Press Start 2P"` so canvas `fillText` resolves without changes to the perf agent's file. Final approach: skipped `next/font/google` (it generates hashed family names that canvas can't reference) — declared `@font-face` directly with basePath-aware src URL.
**Files:** `app/layout.tsx` (lines 1-23, 39).
**Change:** Drop the inline `<style>` Google Fonts `@import` (currently
`app/layout.tsx:21-23` injected into `<head>` at line 39). Replace
with `import { Press_Start_2P } from 'next/font/google'` configured
`subsets: ['latin'], weight: '400', display: 'swap', variable:
'--font-pixel', preload: false`. Expose `--font-pixel` on the `<html>`
className alongside the existing `--font-sans` / `--font-mono`. Update
the four `fontFamily: '"Press Start 2P", monospace'` call sites in
`SimpleMarioGame.tsx` to read `var(--font-pixel)` — actually, those
sites are owned by the perf agent, so I'll instead leave the literal
`"Press Start 2P"` string and let `next/font` register the family
under that exact name (it does, when no `variable:` is set or via the
generated CSS). Confirmed safer route: register without `variable`
and use `pressStart2P.className` on a parent of the game HUD —
**but** the game HUD is in the perf agent's file. Cleanest path that
stays inside my scope: register with `variable: '--font-pixel'` and
also include the generated `pressStart2P.className` on `<html>`. That
way the canvas-rendered `fillText` calls resolve `"Press Start 2P"`
through the document font set without me editing the perf agent's
file.
- `preload: false` matters: Press Start 2P is only used in game
  mode, which content-mode visitors never hit. Preloading it would
  defeat the entire point of moving it off the critical path.
**Impact:** Removes one render-blocking `fonts.googleapis.com` request
(~120-180ms on a cold cable connection, more on 3G). Removes the
inline `<style>` injection entirely. Eliminates an external DNS+TLS
handshake on first paint of `/`.
**Risk:** Low. Self-hosted via `next/font` is standard. Only failure
mode is the canvas font-name not matching — verify by booting game
mode and reading the HUD text. If `next/font/google` somehow registers
under a normalized name, fall back to `next/font/local` with a woff2
in `public/fonts/` (font is OFL-licensed, redistribution is fine).

### 2. Lazy `AudioContext` — never construct on content-mode page loads
**Status:** done — `setupAudioContext()` removed from constructor; replaced with `enableInteractionInit()` exposed as `initAudioOnInteraction()`. Content-mode never calls it. Cross-cutting note for `opt/perf` updated below: please call `initAudioOnInteraction()` once on `SimpleMarioGame.tsx` mount.
**Files:** `lib/audio.ts`.
**Change:** Stop running `setupAudioContext()` from the
`AudioManager` constructor (`lib/audio.ts:41`). Move the
document-level `click`/`keydown`/`touchstart` listener registration
behind an exported `initAudioOnInteraction()` function. Game-mode
mounts call it from a `useEffect`. Content-mode never calls it, never
binds the listeners, never constructs an `AudioContext`.
- The constructor still reads `localStorage` for the mute pref and
  `prefers-reduced-motion` — those are cheap and harmless and let
  `getMuted()` work without init.
- `playSound()` keeps its current "muted or not initialized → log
  and return" guard. Content-mode visitors who never hit game mode
  see no behavior change; game-mode visitors see the same "first
  interaction unlocks audio" UX they had before.
**Impact:** Three fewer document-level event listeners on every
content-mode page load. No `AudioContext` allocation on `/`. Cleaner
Lighthouse "best practices" score (Chrome flags pages that create
AudioContexts before user gesture in some versions).
**Risk:** Low — but requires a one-line change in the perf agent's
`SimpleMarioGame.tsx` (call `initAudioOnInteraction()` once on
mount). Cross-cutting note for `opt/perf` is at the bottom.

### 3. Decode-on-demand sounds, not all-on-first-interaction
**Status:** done — `preloadSounds()` removed. Replaced with per-event `ensureSound()` lazy decoder. Map stores `AudioBuffer | Promise<AudioBuffer | null>`. First call for a cold sound starts background fetch+decode and drops; next call plays. Exposed `warmSounds([...])` so game-mode can pre-warm high-frequency SFX without changing the play API.
**Files:** `lib/audio.ts`.
**Change:** Replace the `preloadSounds()` "fetch+decode all 13 on
first interaction" path with a per-event lazy decoder:
- Keep a `Map<SoundEvent, AudioBuffer | Promise<AudioBuffer>>`.
- On first `play(event)`, kick off `fetch + decodeAudioData` and
  cache the in-flight `Promise`. Replace it with the `AudioBuffer`
  on resolve. The very first call for an event drops the sound (the
  decode is async and we don't queue) — acceptable because the
  high-frequency sounds (jump, land, footstep, coin, block-hit) get
  warm-decoded on game-mode mount via a small `warmSounds(events[])`
  helper called right after `initAudioOnInteraction()`. The rare
  ones (level-complete, game-over, die, damage, pause) decode the
  first time the game triggers them.
- `warmSounds()` runs in parallel but doesn't block anything.
**Impact:** Game-mode mount no longer fetches+decodes 80KB of audio
synchronously on the first user interaction. Time-to-playable-game
on slow connections drops measurably. Rare sounds never cost network
or CPU for players who don't trigger them.
**Risk:** Low-to-medium. The drop-first-call behavior for cold
sounds is the only behavior change. Mitigation: warm the high-freq
ones explicitly so the sounds players actually hear repeatedly are
never cold. Document in a comment.

### 4. Re-encode the 13 mp3s for size + quality match
**Status:** done — discovered the source files were actually 16-bit PCM WAVs misnamed `.mp3`. Re-encoded the 7 longer ones to AAC@24kbps mono via `afconvert` (saves 24,629 bytes); kept the 6 short SFX as WAV since AAC container overhead exceeds savings on sub-200ms clips. Renamed all to true extensions (`.wav` / `.m4a`). New total: 55,717 bytes (was 80,572) — under the 60KB target. `lib/audio.ts` updated with per-event extension map.
**Files:** `public/sounds/*.mp3`, optional new `scripts/check-audio.sh`.
**Change:** Three viable paths; pick one:
  - **(a) `afconvert` to 64kbps mono AAC (.m4a).** macOS built-in,
    no new install. Filename suffix changes (`coin.mp3 → coin.m4a`).
    Requires updating the `soundFiles` map in `lib/audio.ts:74-88`.
    AAC decodes natively in every browser via Web Audio.
  - **(b) `afconvert` keeping `.mp3` extension via re-encode.** Not
    actually possible — `afconvert` writes AAC/CAF/AIFF, not mp3.
    Would need lame/ffmpeg. **Skip this option.**
  - **(c) Install `ffmpeg` (Homebrew, no runtime dep) and re-encode
    in place to lower-bitrate mp3 (64kbps mono for SFX), keeping
    extensions.** Filenames stable, no `lib/audio.ts` change. One
    local tool install (flagged per BRIEF: "no new dependencies
    without flagging").
- Target: total < 60KB (currently 80KB across 13 files).
- High-freq sounds (jump, land, footstep, coin, block-hit) at the
  lower bitrate; longer rare ones (game-over, die, level-complete)
  at slightly higher to preserve perceptual quality.
- Add `scripts/check-audio.sh` that lists each file with size and
  exits non-zero if any is missing or zero bytes.
**Impact:** ~25-30KB saved on the audio payload. Total is small in
absolute terms, but it's pure dead weight for game-mode visitors and
reduces decode CPU on lower-end devices.
**Risk:** Medium. The risk is perceptual quality regression on the
short sharp SFX (coin, jump). I'll A/B by ear in browser before
committing. Filename-suffix change in option (a) means a
`lib/audio.ts` edit — small, safe.
- **Decision needed from human:** install ffmpeg (option c, filenames
  stable) or rename to .m4a (option a, no install). Recommended: **c**
  — keeps the contract with the game intact and gives finer control
  over per-file bitrate. ffmpeg is a one-time local tool, not a
  runtime dep, so it doesn't hit the bundle.

### 5. Delete `styles/sprites.css` and drop its `@import`
**Status:** done — file deleted, import removed from `app/layout.tsx`. Grep confirmed no references in `app/` or `components/plain/` (the active path); only stale references live in `components/sprites/*`, which are dead code the perf agent owns deleting.
**Files:** `styles/sprites.css` (delete), `app/layout.tsx` (remove
import line 4).
**Verification:** `grep -rn "sprites.css\|sprite-pixel-perfect\|
sprite-idle-float\|sprite-run-bob\|sprite-coin-spin\|sprite-collect-fade\|
sprite-hit-bounce\|sprite-question-pulse\|sprite-cloud-float\|sprite-small\|
sprite-medium\|sprite-large\|sprite-flip-x\|sprite-flip-y\|sprite-hidden\|
sprite-collecting\|sprite-hit"` shows hits only in
`components/sprites/*` (DOM-sprite components imported only by
`app/game-mode/MarioGame.tsx` — the abandoned game the perf agent is
deleting). The active path (`SimpleMarioGame.tsx`) draws to canvas
and never uses these classes.
**Impact:** -143 lines of CSS, smaller compiled stylesheet. No
runtime change.
**Risk:** Very low *if I sequence after* (or coordinate with) the
perf agent's deletion of `MarioGame.tsx` and `components/sprites/*`.
If I delete first, the abandoned files would still reference these
classes — but they're dead, so nothing breaks at runtime. Safe to
proceed without waiting; the styles agent's deletion is independent
of the file deletion. The only failure mode is a temporary "lint
warning on dead code" window, which doesn't ship.

### 6. Prune dead selectors from `styles/game.css`
**Status:** pending
**Files:** `styles/game.css`.
**Audit:** Active game (`SimpleMarioGame.tsx`) draws to canvas and
uses none of `game-container`, `game-ui`, `game-score`,
`game-instructions`, `game-sprite`, `game-world`, `touch-button`, or
the `coin-spin`/`player-idle`/`player-running`/`player-jump`/
`block-hit`/`collect-popup`/`score-popup`/`cloud-float`/`bush-sway`
keyframes. Grep confirms only `app/game-mode/MarioGame.tsx:343` (the
abandoned DOM game) references `game-container`. The
`prefers-reduced-motion` and `prefers-contrast` blocks are good
defensive defaults but their selectors all target dead classes; the
global `* { transition: none !important; animation: none !important; }`
inside `@media (prefers-reduced-motion: reduce)` is already covered
more narrowly by `app/globals.css:51-60`.
**Change:** Delete the file and its `@/styles/game.css` import in
`app/layout.tsx:5`. The active game's visuals are entirely
canvas-painted; reduced-motion gating happens at the page level
(`app/page.tsx:18-36`) and globally in `globals.css`.
**Impact:** -205 lines of CSS shipped to every visitor.
**Risk:** Low — same caveat as item 5 (only the abandoned game uses
any of this). Verify by grep one more time before commit.

### 7. Audit `styles/content.css` for dead selectors
**Status:** pending
**Files:** `styles/content.css`.
**Change:** Per the grep above, every selector in `content.css` is
referenced by something in `components/plain/*` — there's nothing
obviously dead. I'll do a finer per-class audit and remove only
selectors with zero matches in `app/` and `components/plain/*`. If
the audit comes up empty, commit nothing for this item and note it
in REPORT.md ("content.css already lean — 0 lines removed").
**Impact:** Likely small or zero. This item exists to satisfy the
BRIEF goal #7 ("CSS dead-code removal") and to document the audit.
**Risk:** Very low. Each removal is grep-verified.

### 8. `next.config.js` — `images` block (no-op, document)
**Status:** pending
**Files:** `next.config.js` (read-only).
**Change:** The current config already has
`images: { unoptimized: true }`, which is correct for `output:
'export'` (the `next/image` optimizer can't run on a static export).
There is nothing to change. I'll annotate this in REPORT.md so the
bundle agent can see I deliberately did not edit the file.
**Impact:** None — but also no churn in a shared file.
**Risk:** None.

### 9. Smoke test + REPORT.md
**Status:** pending
**Files:** new `scripts/check-audio.sh`, new `REPORT.md`.
**Change:** Per the BRIEF, no test runner — ship a one-off shell
script that lists each sound file with its size and exits non-zero
if any is missing or zero bytes. REPORT.md: before/after audio
bytes, font request count on first paint of `/` (verified in Chrome
DevTools Network panel — filter to fonts, hard reload), Lighthouse
mobile + desktop on `/` (and game route, with the caveat that the
game route depends on perf agent's rAF fix), CSS bytes shipped, and
line-count delta on dead CSS.
**Impact:** Closes out the work with measurable numbers as the BRIEF
requires.
**Risk:** None.

---

## Estimated cumulative impact (before measurement)

- Critical-path requests on `/` first paint: -1 external font CSS,
  -1 external font woff2 (hosted on `fonts.gstatic.com` was pulled
  in by the `@import`). Net: zero `fonts.googleapis.com` /
  `fonts.gstatic.com` requests on first paint.
- AudioContext allocations on content-mode page loads: 1 → 0.
- Document-level event listeners on content-mode page loads: 3 → 0.
- Audio payload: ~80KB → ~50-55KB (target <60KB).
- Sounds decoded upfront: 13 → 0 (high-freq warmed on game mount, rare
  ones lazy on first play).
- CSS bytes shipped: -348 lines (`sprites.css` 143 + `game.css` 205),
  before any further `content.css` audit shaves.

---

## Risk register & open questions

1. **Item 4 needs a yes/no on installing ffmpeg locally.** Without it,
   I drop to `afconvert` and rename `.mp3 → .m4a`, which forces a
   `lib/audio.ts` edit. Either is fine — recommending ffmpeg.
2. **Item 1, the canvas font-name path.** `next/font/google` exposes
   the family under a generated name unless paired with a className.
   Plan A: register with `variable: '--font-pixel'` AND include
   `pressStart2P.className` on `<html>` so the family also resolves
   under its real name `"Press Start 2P"` (the canvas `fillText`
   path doesn't read CSS variables). If that combo doesn't work,
   fall back to `next/font/local` with a self-hosted woff2 — which
   is the most predictable option anyway. May actually default to
   `next/font/local` from the start to avoid the CDN-fetch step at
   build time.
3. **Lighthouse ≥95 on `/`** — achievable from the asset side, but
   Tailwind base + JetBrains Mono + Inter still ship. If we miss,
   the lever is making JetBrains Mono `preload: false` (it's used
   for kicker text only — small surface, swap is fine).
4. **Order of operations vs. perf agent.** Items 5/6 (CSS deletes)
   are safe before perf merges, but cleaner *after*. I'll do the
   audit + delete now since the active path doesn't use them; if
   the perf merge happens to land first, no rebase pain.

---

## Cross-cutting notes for sibling worktrees

### For `opt/perf` (mario-perf)
- I am moving `setupAudioContext()` out of the `AudioManager`
  constructor. After this lands, content-mode visitors no longer
  construct an `AudioContext`. **Please add a one-line call to
  `initAudioOnInteraction()` from `SimpleMarioGame.tsx`'s mount
  effect** (a `useEffect(() => { initAudioOnInteraction() }, [])`).
  Without it, no audio plays in game mode.
- I'll export the function name `initAudioOnInteraction` from
  `lib/audio.ts`. Signature: `() => void`. Idempotent — safe to call
  multiple times.
- Optional second helper I'll export: `warmSounds(events:
  SoundEvent[])`. If you want to nudge decode-warm the high-frequency
  SFX on game mount, call `warmSounds(['jump', 'land', 'footstep',
  'coin', 'block-hit'])` after `initAudioOnInteraction()`. If you
  don't, the first call to each just drops silently and the second
  call onward plays — fine for high-freq sounds.
- I'll register Press Start 2P via `next/font` and expose it both as
  `--font-pixel` and via the `next/font` className on `<html>` so
  the existing `fontFamily: '"Press Start 2P", monospace'` strings
  in `SimpleMarioGame.tsx:969,999,1022,1055` continue to resolve
  without you having to edit them. If you'd prefer to switch them to
  `var(--font-pixel)`, that's also fine — your call.

### For `opt/portfolio` (mario-portfolio)
- Shared file: `app/layout.tsx`. I own lines 1-23 and the inline
  `<style>` at line 39 (font block). You own the `metadata` export
  (currently lines 25-29). My item 1 will:
  - Add a `Press_Start_2P` import next to the existing `Inter`,
    `JetBrains_Mono` imports.
  - Drop the `pressStart2P` template-literal const and the
    `<style dangerouslySetInnerHTML={{ __html: pressStart2P }} />`
    inside `<head>`.
  - Add `pressStart2P.variable` (or `.className`) into the
    `<html className=...>` template.
  - **Will not touch the `metadata` export.**
- Resolve any merge by line: anything in the `import` block + the
  font consts + the `<head>` font tag = mine. Anything in the
  `metadata` export = yours.

### For `opt/bundle` (mario-bundle)
- `next.config.js` is shared. The `images` block is mine; everything
  else is yours. Per item 8 above, **I am not editing this file** in
  this round — the existing `images: { unoptimized: true }` is
  correct for `output: 'export'`.
- If you change anything that affects asset paths (basePath,
  assetPrefix), it'll hit `lib/audio.ts:73` (the
  `NEXT_PUBLIC_BASE_PATH` read). Currently fine; flag if you change
  the env-var name.

---

## Workflow status

- [x] Read BRIEF, PLAN, DECISION, all owned files
- [x] Audited dead CSS via grep
- [x] Drafted PLAN.md with 5–10 items, impact, risk
- [ ] **Awaiting human approval before any code change**
- [ ] Item 1 — Press Start 2P self-hosted
- [ ] Item 2 — lazy AudioContext
- [ ] Item 3 — decode-on-demand sounds
- [ ] Item 4 — re-encode mp3s (blocked on ffmpeg yes/no)
- [ ] Item 5 — delete sprites.css
- [ ] Item 6 — delete game.css (or prune)
- [ ] Item 7 — audit content.css
- [ ] Item 8 — next.config.js images block (no-op, documented)
- [ ] Item 9 — REPORT.md + smoke test
