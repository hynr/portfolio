# Three.js decision: NO

## Verdict

The current Canvas2D approach is **not** what's holding this portfolio back. A Three.js port would add ~600KB of runtime, a WebGL/GPU compatibility surface, and weeks of redesign for a side-scroller that already lives in pixel-art aesthetic. It would not move the needle on the thing that matters — recruiters reading the content site and being charmed by a snappy game easter egg.

The portfolio's real problems are:

1. The game runs the entire `useEffect` rAF loop with a dependency array that includes every piece of `useState` in the component (`[player, camera, score, collectedCoins, hitBlocks, blockAnimations, coinAnimations, showTextBubble]`, see `app/game-mode/SimpleMarioGame.tsx:576`). Every frame's `setState` tears down and re-binds rAF. This is *the* bug — fixing it alone is worth more than any 3D upgrade.
2. The player sprite is drawn with thousands of `ctx.fillRect` calls per frame for each state (idle / walk1 / walk2 / jump), each preceded by a `ctx.fillStyle =` assignment. No offscreen canvas, no `drawImage`. See `SimpleMarioGame.tsx:803-924`.
3. ~2000 lines of dead code: an entire abandoned DOM-based game (`MarioGame.tsx`, `lib/game-engine/*`, `components/sprites/*`, `components/game/InteractivePipeSprite.tsx`, `components/audio/*`, `TouchControls.tsx`) that never made it into the active path but still ships in the bundle.
4. The "bridge" between game and content is missing. Coins collected and projects discovered live entirely inside the canvas state — they never reveal anything in content-mode. The whole conceit of "play the game and unlock the portfolio" is unimplemented.
5. SEO is nonexistent: title only, no OG tags, no description meta, no analytics.
6. `next.config.js` ships with `typescript.ignoreBuildErrors: true` AND `eslint.ignoreDuringBuilds: true`. Type system is off.
7. Touch controls aren't wired to the active game; mobile players cannot move.
8. Press Start 2P is loaded via render-blocking inline `<style>` Google Fonts import in `app/layout.tsx:21-23`.

None of those are 2D-vs-3D problems. They are React, asset, and content-bridge problems.

## When Three.js *would* be warranted

If, after the perf/asset/gameplay/portfolio/bundle pass, you want a separately-loaded "easter egg" 3D scene (e.g. a one-off "world 1-2" pipe that warps to a 3D castle), it can ship as a code-split route loaded only on demand, with no impact on the main game-mode bundle. That is a **future, optional** path — not part of this round.

## Replacement for the 5th worktree slot

The optimization plan therefore replaces the proposed `mario-3d` slot with `mario-bundle`: Vite-style code splitting in Next, dropping the dead code, tree-shaking, Lighthouse pass, and tightening the deploy artifact.
