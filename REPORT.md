---
worktree: mario-assets
branch: opt/assets
status: complete — awaiting integration
---

# REPORT — `opt/assets`

Before/after metrics for the seven shipped commits on `opt/assets`. The
goal of this worktree was to take the asset side off the critical path:
self-host fonts, lazy-init audio, lazy-decode sounds, shrink the audio
payload, and drop dead CSS.

## Commits

```
a43324be opt(assets): drop two zero-match selectors from content.css
e560180e opt(assets): delete styles/game.css — abandoned-game classes, none on the active path
53bee0fa opt(assets): delete styles/sprites.css — DOM-sprite leftovers, unused on the active path
14f5a247 opt(assets): re-encode audio — long sounds → AAC, short SFX kept as WAV. 80KB → 54KB
4fa6ef9b opt(assets): decode sounds on demand — drop the 13-file upfront preload
e7be6e4e opt(assets): lazy AudioContext — content-mode never constructs one
6cfd02c7 opt(assets): self-host Press Start 2P from /public/fonts/ — drops fonts.googleapis.com from critical path
```

## Headline numbers

| Metric | Before | After | Δ |
|---|---:|---:|---:|
| Audio payload (13 files) | 80,572 B | 55,717 B | **−30.8%** (-24,855 B) |
| `fonts.googleapis.com` requests on first paint of `/` | 1 | **0** | -1 |
| `fonts.gstatic.com` requests on first paint of `/` | 1 (woff2 fetch) | **0** | -1 |
| External CSS requests on first paint of `/` | 1 | **0** | -1 |
| `AudioContext` allocations on content-mode page load | 1 | **0** | -1 |
| Document-level interaction listeners on content-mode page load | 3 | **0** | -3 |
| Sounds decoded upfront on first interaction | 13 | **0** (per-event lazy) | -13 |
| CSS files shipped via `app/layout.tsx` imports | 4 | **2** | -2 |
| CSS lines removed (sprites.css + game.css + content.css trim) | — | — | **-351 lines** |
| Production CSS bytes shipped (`out/_next/static/css/*.css`) | n/a (baseline not measured) | 23,711 B | — |

## Detailed verification

### Fonts on first paint of `/`

Examined `out/index.html` after `npx next build` and after
`GITHUB_PAGES=true npx next build`. Both contain:

- 2× `<link rel="preload" as="font">` for Inter and JetBrains Mono
  (self-hosted, served from `/_next/static/media/...`).
- 1× inline `<style>` declaring `@font-face` for Press Start 2P
  pointing at `/fonts/PressStart2P-Regular.woff2` (or
  `/portfolio/fonts/...` under GitHub Pages).
- **Zero** `fonts.googleapis.com` or `fonts.gstatic.com` requests in
  the HTML.

`grep -E "fonts\.|@import|gstatic" out/_next/static/css/*.css` → empty.
The two `fonts.googleapis.com` string occurrences in the runtime JS
(`out/_next/static/chunks/main-*.js`) are internal Next.js head-management
constants — not requests. The browser does not contact Google Fonts on
first paint.

The Press Start 2P woff2 (4,704 B latin subset) is declared with
`font-display: swap` and no `<link rel="preload">`, so the browser only
fetches it when a layout actually paints with the family — i.e. when
game-mode mounts and the canvas HUD calls `fillText`. Content-mode
visitors never trigger the fetch.

### Audio payload

`./scripts/check-audio.sh`:

```
EVENT              EXT      BYTES
------------------ ----- --------
jump               wav       3244
land               wav       2444
block-hit          wav       3244
pause              wav       3244
enemy-stomp        wav       4044
footstep           wav       1644
damage             wav       4844
coin               m4a       4759
block-reveal       m4a       4953
pipe-enter         m4a       5284
level-complete     m4a       5336
die                m4a       6120
game-over          m4a       6557

Total: 55717 bytes (54.4 KB)
OK
```

Methodology: discovered the source files were 16-bit PCM mono 8000Hz
WAVs misnamed as `.mp3` (`file public/sounds/*.mp3` → `WAVE audio,
Microsoft PCM, 16 bit, mono 8000 Hz`). Re-encoded the seven longer
sounds to AAC@24kbps mono via `afconvert -f m4af -d aac@22050 -c 1
-b 24000` (sample-rate-converted to 22050 Hz to clear AAC's minimum-rate
requirement). Kept the six short SFX as WAV — AAC container overhead
exceeds the per-file savings on sub-200ms clips. `damage` was a
borderline AAC case (came out ~5% larger), kept WAV.

Both formats decode through Web Audio `decodeAudioData` on every modern
browser. No new runtime dependency added; `afconvert` is part of macOS.

### AudioContext / interaction listeners

`lib/audio.ts` `AudioManager` constructor no longer calls
`setupAudioContext()`. The constructor still reads `localStorage` for
the mute pref and `prefers-reduced-motion`, but those are cheap.

The interaction-init listeners (`click`, `keydown`, `touchstart`) are
now bound only when `initAudioOnInteraction()` is called — game-mode
mount calls it once. Content-mode never does, so content-mode visitors
never bind those listeners and never construct an `AudioContext`.

### Decode-on-demand sounds

`preloadSounds()` (which fetched + decoded all 13 files in parallel on
first user interaction) is gone. Replaced by per-event `ensureSound()`:

- Map stores `AudioBuffer | Promise<AudioBuffer | null>`.
- First call to `play(event)` for an unfetched sound starts the
  fetch + decode in the background and drops the play.
- Next call lands.
- Optional `warmSounds(events[])` exported for game-mode mount to
  pre-warm the high-frequency SFX (`jump`, `land`, `footstep`, `coin`,
  `block-hit`) so the first heard play of each is never cold.

Rare sounds (`level-complete`, `game-over`, `die`, `damage`, `pause`)
never cost network or CPU for players who don't trigger them.

### Dead CSS

Two files deleted, one trimmed:

| File | Lines removed | Notes |
|---|---:|---|
| `styles/sprites.css` | -143 | DOM-sprite leftovers from the abandoned game iteration. Active path uses canvas. |
| `styles/game.css` | -205 | `.game-container`, `.game-ui`, etc. — none referenced on the active path. |
| `styles/content.css` | -3 | `.col-reading`, `.col-wide` — zero matches across `app/` and `components/plain/`. |
| **Total** | **-351 lines** | |

Both `app/layout.tsx` imports were removed in the same commits as the
file deletions, so the build never had a window where it referenced a
missing file.

### Lighthouse

**Not measured in this report.** Lighthouse on `/` depends on the perf
agent's rAF fix (`opt/perf`) for the game-route score and on the
bundle agent's code-split (`opt/bundle`) for the content-route JS
shrink. Running Lighthouse here would measure the baseline, not the
integrated state. The lead's integration pass should re-run Lighthouse
after merging all five `opt/*` branches.

What I can confirm: the asset side is no longer the limiting factor
on `/`. Critical path on first paint of `/`:

- 2 self-hosted woff2 (Inter, JetBrains Mono)
- 2 self-hosted CSS files (Tailwind base + content.css, total 23.7 KB)
- 4 self-hosted JS chunks (106 KB First Load JS)
- 0 external font/CSS/font-face requests

### Build verification

Both `npx next build` and `GITHUB_PAGES=true npx next build` succeed:

```
Route (app)                              Size     First Load JS
┌ ○ /                                    18.3 kB         106 kB
└ ○ /_not-found                          882 B          88.5 kB
+ First Load JS shared by all            87.6 kB
```

GitHub Pages build prefixes everything correctly under `/portfolio/`,
including the Press Start 2P font URL (`/portfolio/fonts/...`) and
sound URLs (via `lib/audio.ts:soundUrl()` reading
`process.env.NEXT_PUBLIC_BASE_PATH`). `du -sh out/` → 1.4M.

## Public surface preserved

Per the BRIEF's "must not break" list:

- All 13 sound events resolve through `lib/audio.ts:soundUrl()` →
  smoke-test passes (`scripts/check-audio.sh` exit 0).
- Press Start 2P registered under literal family name
  `'Press Start 2P'` so the four `fillText` call sites in
  `SimpleMarioGame.tsx` (perf agent's file) resolve without changes
  there.
- Inter and JetBrains Mono still served via `next/font/google`,
  unchanged.
- `prefers-reduced-motion` muting in `lib/audio.ts:46-49` preserved
  inside the constructor (the only side effect that survived the
  lazy-init refactor).
- `NEXT_PUBLIC_BASE_PATH` honored in both font and sound URLs.

## `next.config.js`

I did not edit this file. The `images` block (`images: { unoptimized:
true }`) is correct for `output: 'export'` — `next/image` cannot run
its optimizer in a static export. The bundle agent (`opt/bundle`) owns
everything else in this file. No coordination required.

## Known limitations / handoffs

1. **Cross-cutting handoff to `opt/perf`**: `SimpleMarioGame.tsx`'s
   mount effect must call `initAudioOnInteraction()` (and optionally
   `warmSounds(['jump','land','footstep','coin','block-hit'])`) once
   after my changes integrate. Without it, no audio plays in game
   mode. Documented in PLAN.md.
2. **Cross-cutting note for `opt/portfolio`**: I rewrote the inline
   `<style>` block in `app/layout.tsx` for Press Start 2P (lines
   20-26 of the new file). The `metadata` export (lines 28-32) is
   untouched. Resolve any merge by line.
3. **Audio re-encode used `afconvert`** (macOS-built-in) rather than
   `ffmpeg`. That kept things zero-install but limited me to AAC
   (no Opus); the 60KB target was met without needing Opus, so this
   was the right call. If a future round wants <40KB, install
   `ffmpeg` and try Opus.
4. **Lighthouse scores not in this report** — see "Lighthouse"
   section above.

## Smoke test

`./scripts/check-audio.sh` — exits 0 on success, non-zero if any of
the 13 sound files is missing or zero bytes. Run it before any
deploy:

```bash
./scripts/check-audio.sh
```

It is the only test artifact in this worktree (no test runner is
installed; per the BRIEF, this script is the smoke check the BRIEF
called for).
