# BRIEF — `opt/assets` (mario-assets)

You are one of five sibling Claude Code agents polishing a Mario-themed
Next.js 14 portfolio. The game already runs end-to-end. Your job is the
asset side: fonts, audio, and CSS — make the page paint fast and look
crisp without dragging in render-blocking external resources.

Read `/Users/zafa/Desktop/portfolio/PLAN.md` and `DECISION.md` first for
context.

## Scope

You own these files. Everyone else is read-only on them.

- `public/sounds/*` — 13 mp3 files, ~80 KB total.
- `lib/audio.ts` — Web Audio singleton.
- `app/layout.tsx` — **only** the font-loading block (the
  `Inter`, `JetBrains_Mono` `next/font/google` imports and the
  inline `<style>` Google Fonts import for Press Start 2P at lines
  21-23). The portfolio agent owns the `metadata` export in the
  same file. Don't touch that.
- `styles/sprites.css`
- `styles/game.css`
- `styles/content.css`
- `app/globals.css`
- `next.config.js` — **only** the `images` block. The bundle
  agent owns the rest (output, basePath, ignoreBuildErrors).
  Coordinate via comment in your `PLAN.md`.

## Goals (measurable)

1. **Press Start 2P self-hosted via `next/font/google`** (or
   `next/font/local` with woff2 in `public/`). Eliminate the
   render-blocking inline `<style>` Google Fonts import in
   `app/layout.tsx:21-23`. Verify with Chrome DevTools Network
   panel that no `fonts.googleapis.com` request fires on first
   paint.
2. **No render-blocking external CSS or font requests on first
   paint** of `/`. Inter and JetBrains Mono are already loaded via
   `next/font/google` with `display: 'swap'` — keep that.
3. **`AudioContext` is created lazily, only when game-mode mounts.**
   Today `lib/audio.ts:60-64` binds `click`, `keydown`, `touchstart`
   listeners on `document` at module-load time, on every page load
   (including content-mode visitors who never enter the game). Move
   the singleton's `setupAudioContext()` invocation behind a function
   the game-mode component calls on mount. Content-mode visitors
   should never construct an `AudioContext`.
4. **Audio total payload < 60 KB** (currently ~80 KB). Convert the 13
   mp3s to opus or aac/m4a at matching perceptual quality. If you keep
   mp3, re-encode at a lower bitrate where SFX won't suffer (jump,
   land, footstep, coin can all live at 64-96 kbps mono). Keep
   filenames stable; the game references them by name.
5. **Sounds decode on demand, not all upfront.** Today
   `preloadSounds()` (`lib/audio.ts:67-106`) fetches and decodes all
   13 sounds the moment the user first clicks/types/touches anywhere
   on the page. Decode the small high-frequency ones on first use
   (jump, land, footstep, coin, block-hit) and lazy-decode the rare
   ones (level-complete, game-over, die, damage, pause).
6. **Lighthouse Performance ≥ 95** on the content `/` route, both
   mobile and desktop. The perf agent's rAF fix is what makes this
   passable on the game route; on the content route the asset side
   is the bottleneck.
7. **CSS dead-code removal.** `styles/sprites.css` was written for
   the abandoned DOM-sprite first iteration; the active game does not
   use it. Verify with `grep -rn` that nothing in the active path
   imports it, then delete. Same for any selectors in `game.css` /
   `content.css` that no longer match anything in `app/` or
   `components/plain/`.

## Out of scope — do not touch

- `app/game-mode/SimpleMarioGame.tsx` and any other file the perf
  agent owns. The `playSound(...)` call sites stay where they are;
  you change only what's behind them.
- `app/layout.tsx` `metadata` export, `app/page.tsx` (portfolio +
  perf own those).
- `components/plain/*` (portfolio agent).
- `lib/portfolio-data.ts`, `lib/level-data.ts`, `lib/navigation.ts`,
  `lib/mode-toggle.ts`.
- `next.config.js` outside the `images` block.
- `tsconfig.json`, `package.json` (bundle agent).
- The `out/` and `.next/` directories — those are build artifacts.
- The six nested `portfolio-*/` directories and the four other
  `mario-*/` worktrees at the repo root.

## Workflow

1. Read the repo. Then write a `PLAN.md` in this worktree
   (`mario-assets/PLAN.md`) listing the 5–10 highest-leverage changes
   with **estimated impact** (e.g. "Press Start 2P self-host saves
   one render-blocking request, ~120 ms on a cold cable connection")
   and **risk** per item. **Stop and wait for human approval** before
   touching code.
2. After approval, one commit per item: `opt(assets): <change> —
   <impact>`. Example: `opt(assets): self-host Press Start 2P via
   next/font/local — drops fonts.googleapis.com from critical path`.
3. Write `REPORT.md` with before/after metrics: total audio bytes,
   font request count on first paint, Lighthouse scores (mobile +
   desktop), CSS bytes shipped, line-count delta on dead CSS.
4. Do not merge to `main`.

## Live coordination

Five branches run in parallel; the lead integrates everyone at the end.
To keep merges painless:

- **Update this worktree's `PLAN.md` continuously.** Mark each item
  `pending → in-progress → done` with a one-line outcome note ("done —
  Press Start 2P self-hosted, fonts.googleapis.com gone from critical
  path"). Commit those PLAN edits frequently — they cost nothing, and
  they are how every other agent and the lead see live status.
- **Before committing to any shared-ownership file** (for you,
  `app/layout.tsx` is shared with `opt/portfolio` — you own the font
  block, they own `metadata`; `next.config.js` is shared with
  `opt/bundle` — you own only the `images` block), run
  `cat ../mario-<other>/PLAN.md` for each agent listed against that
  file. If another agent has the file marked in-progress, post a
  `## Cross-cutting note for opt/<other>` block at the bottom of your
  PLAN.md describing your intended change and wait for acknowledgement
  before committing.
- **Cross-cutting asks or findings** (e.g. "perf agent: I'm moving
  `setupAudioContext()` behind a function — please call it from the
  game-mode mount") go in a clearly-labeled section at the end of
  your PLAN.md, not buried in commit messages.
- **Don't rebase onto other `opt/*` branches yourself.** The lead
  handles integration. If you genuinely need a change another agent
  is making, ask in your PLAN.md.

The five `mario-*/PLAN.md` files are the live status board — readable
from any worktree by relative path. Treat them as a shared whiteboard:
read others, write to your own.

## Constraints

- **No new dependencies** without flagging. `next/font` ships with
  Next 14 already; you don't need a separate font lib. For audio
  re-encoding use `ffmpeg` locally and commit the converted files —
  don't add a runtime audio library.
- **Public surface that must not break:**
  - All 13 sound events still play correctly when the game triggers
    them. Test list: jump, land, coin, block-hit, block-reveal,
    footstep, pipe-enter, enemy-stomp, damage, die, game-over,
    level-complete, pause.
  - Press Start 2P still renders in the game HUD ("HUZAIFA",
    score, "WORLD 1-1", "TIME", controls hint, text bubble).
  - Inter / JetBrains Mono still render in content mode.
  - The `GITHUB_PAGES=true npm run build` produces an `out/` that
    deploys cleanly under the `/portfolio` basePath — sound URLs
    must continue to honor `process.env.NEXT_PUBLIC_BASE_PATH`
    (see `lib/audio.ts:73`).
  - `prefers-reduced-motion` still mutes audio (see
    `lib/audio.ts:36-39`).
- Tests: no test runner installed. If you ship audio re-encoding,
  add a one-off `scripts/check-audio.sh` that lists each sound file
  with its size and confirms it's non-zero — this is your smoke test.

## Notes from the lead's discovery

- Inline Google Fonts import: `app/layout.tsx:21-23, 39`.
- AudioManager constructor side-effect path: `lib/audio.ts:31-43,
  46-65`. Content-mode users hit this even though they never need
  audio.
- Sound files & sizes:
  ```
  block-hit.mp3      3.2K
  block-reveal.mp3   6.3K
  coin.mp3           4.7K
  damage.mp3         4.7K
  die.mp3           12.5K
  enemy-stomp.mp3    3.9K
  footstep.mp3       1.6K
  game-over.mp3     15.7K
  jump.mp3           3.2K
  land.mp3           2.4K
  level-complete.mp3 9.4K
  pause.mp3          3.2K
  pipe-enter.mp3     7.9K
  ```
- `styles/sprites.css` (143 lines) targets the dead DOM sprites. Safe
  to delete after grep-confirmation.
