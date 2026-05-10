# Mario portfolio — optimization plan

## What this site is

A static Next.js 14 site (App Router, `output: 'export'`) deployed to GitHub Pages at `hynr.github.io/portfolio`. It's a recruiter-facing portfolio for Huzaifa Naroo with two modes: a quiet typographic content site (`/app/content-mode`) and a Mario-themed Canvas2D platformer (`/app/game-mode/SimpleMarioGame.tsx`, 1087 lines, the one actually wired up). A "pipe" link in the content nav warps you into the game; a button in the game returns you. Game mode renders into a single `<canvas>` via inline `useEffect` + `requestAnimationFrame`. Audio (13 mp3s, ~80KB total) plays via Web Audio. Build output is ~1.1MB total static, with a ~497KB first-load JS bundle. There is no test framework, no CI beyond a Pages deploy, and no analytics. **The game already runs end-to-end** — this round is polish, not rescue: smoother frame pacing, an actual mobile experience, the missing game→content bridge, SEO, and a bundle that doesn't haul around the abandoned first-iteration code.

Six nested directories at the repo root (`portfolio-game/`, `portfolio-feel/`, `portfolio-sprites/`, `portfolio-content/`, `portfolio-level/`, `portfolio-audio-nav/`) are intentional snapshots from the prior parallel-agent build that produced the merged `main`. They are off-limits to every agent in this round — do not read, edit, or delete them.

## Three.js decision

**No.** See `DECISION.md`. The 5th worktree slot becomes `mario-bundle`, not `mario-3d`. A future 3D easter egg can ship as a code-split optional scene later.

## Five worktrees

Order chosen so that perf and dead-code removal land first (safe foundations), then assets (visual quality / load time), then gameplay (feel — depends on a working perf baseline), then portfolio (the bridge — depends on game state being clean), then bundle (final pass — measures everyone else's wins).

### 1. `mario-perf` (branch: `opt/perf`)

**Owns:**
- `app/game-mode/SimpleMarioGame.tsx`
- `app/game-mode/GameMode.tsx`
- `app/page.tsx` *(only the mode plumbing; do not change content rendering)*

**Removes (dead code, perf agent does the deletion since it touches the game module):**
- `app/game-mode/MarioGame.tsx`
- `lib/game-engine/{game-loop,input,physics,collision}.ts`
- `app/game-mode/TouchControls.tsx` *(rewritten by gameplay agent against new input layer; perf agent only deletes the legacy version that depends on `lib/game-engine/input`)*

**Goals (measurable):**
1. Stable 60fps sustained on M1 Safari & Chrome over a 30s walkthrough of level 1-1 (currently drops well below — to be measured).
2. rAF effect re-attaches **at most once** per game session, not once per frame. (Currently re-attaches on every `setState`, see `SimpleMarioGame.tsx:576`.)
3. JS heap allocations during steady-state gameplay < 200KB/sec (Chrome DevTools Performance > Memory).
4. Player sprite draw cost < 0.3ms/frame on M1 (currently ~2-4ms via raw `fillRect` loops). Achieve via offscreen-canvas sprite atlas built once.
5. Game-mode initial canvas paint < 100ms after mount.
6. No `setState` calls inside the rAF loop; mutable refs (`useRef`) for `player`, `camera`, `score`, `collectedCoins`, `hitBlocks`, `blockAnimations`, `coinAnimations`. React state used only for UI overlays (HUD numbers, text bubble).

**Out of scope:** No new sprites, no new sound calls, no level-data edits, no SEO, no Tailwind config. Do not edit any file owned by the other four agents (see § Collisions).

---

### 2. `mario-assets` (branch: `opt/assets`)

**Owns:**
- `public/sounds/*` (compression / format)
- `lib/audio.ts`
- `app/layout.tsx` *(font loading only — Press Start 2P)*
- `styles/sprites.css`, `styles/game.css`, `styles/content.css`
- `next.config.js` *(only the `images` and asset prefix — bundle agent owns the rest)*

**Goals:**
1. Press Start 2P self-hosted via `next/font/google` (or `next/font/local`), eliminate the inline `<style>` Google Fonts import in `app/layout.tsx:21-23` (currently render-blocking).
2. Audio: lazily initialise the `AudioContext` only when game-mode mounts (currently the singleton constructor binds three document-level listeners on every page including content mode — see `lib/audio.ts:60-64`).
3. Sound files: convert the 13 mp3s to opus or aac/m4a at matching perceptual quality, target total audio payload < 60KB (currently ~80KB) and decode-on-demand rather than upfront on first interaction.
4. Critical-path: zero render-blocking external CSS or font requests on first paint of `/`.
5. Lighthouse "best practices" + "performance" scores ≥ 95 on a clean run, both on `/` and `/?mode=game` *(perf agent ships the rAF fix that makes this passable; assets agent ensures the asset side doesn't block it)*.

**Out of scope:** Game logic, level data, content components, bundle config (chunking, splitting), SEO/meta. Do not touch any file in `app/game-mode/`, `components/`, `lib/level-data.ts`, `lib/portfolio-data.ts`, `lib/navigation.ts`, `lib/mode-toggle.ts`.

---

### 3. `mario-gameplay` (branch: `opt/gameplay`)

**Owns:**
- `app/game-mode/TouchControls.tsx` *(rewrite — currently dead, drives the abandoned `lib/game-engine/input.ts`)*
- `lib/level-data.ts`
- A new file: `lib/game-engine/input.ts` *(this branch will create a small input layer used by both keyboard and touch — replaces the dead one perf agent deleted)*

**Goals:**
1. Touch controls work in the active game on iOS Safari and Android Chrome (currently completely disconnected — `SimpleMarioGame` reads `keysRef.current` only and the existing `TouchControls.tsx` writes to a different `InputHandler` instance from the dead engine).
2. Reduced-motion respected in game-mode: when `prefers-reduced-motion`, disable squash, coin-spin sine, cloud drift, and slow camera lerp (snap camera). Currently the page-level toggle blocks entry only — once in game, animations run anyway.
3. Keyboard accessibility: visible focus on the "Plain Mode" button and an `Esc` shortcut to return to content mode.
4. Coyote time + variable jump already present — verify they survive the perf refactor and document tunables in a `PHYSICS` constants block at the top of the level data file.
5. Mid-air horizontal control feels right (M1 + iPhone touch) — no audit-by-feel; pick concrete numbers and lock them.
6. Fix the "TIME 400" HUD: either implement a real timer or remove it. Currently it's a static lie.

**Out of scope:** Rendering / canvas / draw functions / rAF loop / sprite atlas (perf owns those). Audio loading. Content components. Bundle config. SEO.

---

### 4. `mario-portfolio` (branch: `opt/portfolio`)

**Owns:**
- `app/layout.tsx` *(metadata block only — assets agent owns font loading)*
- `app/page.tsx` *(content/game mode bridge state only — perf agent owns the rest)*
- `components/plain/*` (all 13 components)
- `lib/portfolio-data.ts`
- `lib/navigation.ts`
- `lib/mode-toggle.ts`
- A new file: `public/og-image.png` (or generated SVG)
- A new file: `public/robots.txt`
- The site root `<head>` content via `metadata` export

**Goals:**
1. SEO: full `metadata` export with `description`, `openGraph` (title, description, image, url), `twitter` (card, title, description, image), canonical URL, `robots`, JSON-LD `Person` schema. Currently only `title` + `description` exist.
2. OG image at 1200×630 that reads well as a LinkedIn share preview.
3. The bridge: game progress (coins collected, projects "discovered" via question blocks) persists to `localStorage` and **reveals** something in content mode — minimum bar is a small "you found N/4 projects in the game" badge in the Projects section, with discovered projects subtly highlighted. Without this, the dual-mode conceit is a marketing line, not a feature.
4. Analytics: privacy-respecting (Plausible script tag, or a self-hosted equivalent) — gated by an env flag so local dev is silent. Track only: page view, mode switch (content→game, game→content), pipe click target.
5. Contact form / mailto link works and is keyboard-reachable; no broken anchors. Resume PDF link in the game (`/resume.pdf`) currently 404s — either ship the PDF in `public/` or remove the pipe.
6. Footer year, copyright, social links all match `lib/portfolio-data.ts` (single source of truth).

**Out of scope:** Game internals, level data, audio, Tailwind config, font loading (assets owns), build/bundle config.

---

### 5. `mario-bundle` (branch: `opt/bundle`)

**Owns:**
- `next.config.js` *(non-asset side: code splitting, output, headers if any)*
- `tsconfig.json`
- `.eslintrc.json`
- `package.json` (scripts only — no new deps without flagging)
- `tailwind.config.js`
- `postcss.config.js`
- `scripts/launch.sh`

**Goals:**
1. Drop `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` from `next.config.js`. Either fix the errors or document and gate them. Currently the type system is silently off.
2. Code-split game mode behind a `next/dynamic` import with `ssr: false`. Content-mode visitors should not download the canvas/game code at all.
3. Main JS bundle (everything content-mode needs) < 200KB gzipped. Currently the static export ships ~497KB first-load JS uncompressed; need to measure gzipped.
4. Lighthouse Performance ≥ 95 on the content `/` route.
5. Ensure `out/` size shrinks by ≥ 30% after dead-code removal (perf agent's work) flows through. Measure before/after with `du -sh out`.
6. Tree-shake `PORTFOLIO_DATA` so `category` strings, etc. don't leak full object literals into multiple chunks.
7. Repo hygiene: the 6 stale prunable git worktrees (`feat/*` branches) have already been pruned by the lead. `.gitignore` the 4 untracked screenshots. **Do not touch the 6 nested `portfolio-*` directories at the repo root** — they are intentional snapshots of prior parallel-agent worktrees and are off-limits to every agent in this round.

**Out of scope:** Game logic, content text, SEO copy, sprite drawing, level data, asset compression. No new dependencies without raising them in `PLAN.md` of this worktree first.

---

## Merge order

1. **`opt/perf`** first — rebases everyone else onto a working game loop, removes the dead code other branches must avoid touching, establishes the `useRef`-based state model the gameplay branch will plug into.
2. **`opt/assets`** second — independent of perf for the most part; can run in parallel but merge after.
3. **`opt/gameplay`** third — depends on `opt/perf` for the input refactor.
4. **`opt/portfolio`** fourth — depends on nothing structurally, but final content polish lands cleanest after the game side is stable.
5. **`opt/bundle`** last — measures everyone else's wins, kills dead-code flagged by them, locks in the size targets.

## Known scope collisions

| File | Owner | Notes |
|---|---|---|
| `app/page.tsx` | perf (mode plumbing) + portfolio (content bridge state) | perf only edits the mode toggle / mount logic; portfolio only edits the persisted-state bridge. Coordinate via a shared `useGameProgress` hook in `lib/mode-toggle.ts`. |
| `app/layout.tsx` | assets (fonts) + portfolio (metadata) | Disjoint concerns, but the file is small. Resolve by line: lines 1-23 (fonts) → assets, lines 25-29 (metadata) → portfolio. |
| `next.config.js` | assets (`images`) + bundle (everything else) | Single config. Bundle owns the file; assets sends a patch via PR comment / ping. |
| `lib/audio.ts` | assets | Sole owner — no collision. |
| `app/game-mode/TouchControls.tsx` | perf (deletes the dead version) + gameplay (writes the new one) | Sequence: perf merges first (deletion), gameplay writes the new file from scratch. |
| `lib/game-engine/input.ts` | perf (deletes) + gameplay (recreates) | Same sequencing. |
| `lib/portfolio-data.ts` | portfolio | Single owner. Bundle agent only re-exports for splitting; does not edit. |

## What every worktree-agent will be told (common contract)

- Each agent first writes its own `PLAN.md` in its worktree (5-10 highest-leverage changes, impact + risk per item) and **stops** for human approval before implementing.
- After approval, one commit per item, message format: `opt(<area>): <change> — <impact>`.
- A `REPORT.md` with before/after metrics on completion.
- Do not merge to main.
- No new dependencies without raising them in their `PLAN.md`.
- Public surface that must not break:
  - GitHub Pages deploy (`/portfolio` basePath under `GITHUB_PAGES=true`)
  - Content/game mode toggle and pipe-link UX
  - All four projects in `lib/portfolio-data.ts` keep their IDs (URLs may include them)
  - The static-export build (`next build` with `output: 'export'`) must succeed
- Tests: there is no test framework currently. Each agent should add minimal smoke tests (a single `*.test.ts` checked by `tsc --noEmit`, or a Playwright smoke if they introduce e2e) for any non-trivial new code path.
