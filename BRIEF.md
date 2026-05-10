# BRIEF — `opt/portfolio` (mario-portfolio)

You are one of five sibling Claude Code agents polishing a Mario-themed
Next.js 14 portfolio. The game already runs end-to-end. **Your work is
the one that gets Huzaifa hired.** Everyone else is making the toy
prettier; you're making the page that recruiters actually read,
recognize, and act on.

Read `/Users/zafa/Desktop/portfolio/PLAN.md` and `DECISION.md` first for
context.

## Scope

You own these files. Everyone else is read-only on them.

- `app/layout.tsx` — **only** the `metadata` export and any new
  `<head>` content (JSON-LD, OG tags). The assets agent owns the
  font-loading block above it.
- `app/page.tsx` — **only** the content↔game progress bridge state
  (a new `useGameProgress` hook surface, localStorage read/write,
  passing `discoveredProjects` / `coinsCollected` down to
  `ContentMode`). The perf agent owns the mode toggle / mount
  logic; don't change `setMode`, the reduced-motion handler, or the
  rAF mount.
- `app/content-mode/ContentMode.tsx`
- All of `components/plain/*` (13 files: Cloud, CoinDisc, Contact,
  Experience, GroundBand, Hero, Nav, PipeSprite, PipeWarp, Projects,
  QuestionBlock, Reveal, Skills).
- `lib/portfolio-data.ts` — single source of truth for projects,
  skills, bio, experience, links.
- `lib/navigation.ts`
- `lib/mode-toggle.ts` — extend this to host the `useGameProgress`
  hook plus the existing `setModePreference` / `getModePreference`.
- New files you may create:
  - `public/og-image.png` (1200 × 630)
  - `public/robots.txt`
  - `public/resume.pdf` — coordinate with the gameplay agent (see
    Constraints).

## Goals (measurable)

1. **Full SEO metadata.** A complete `metadata` export covering:
   `title`, `description`, `openGraph` (title, description, type:
   'website', url, siteName, image at 1200×630), `twitter` (card:
   'summary_large_image', title, description, image), `alternates.
   canonical`, `robots`, `keywords`, `authors`. Add a JSON-LD
   `Person` schema in the layout `<head>` with name, url, jobTitle,
   worksFor, sameAs (GitHub/LinkedIn). Pull values from
   `lib/portfolio-data.ts` so they don't drift.
2. **OG image at `public/og-image.png`** that reads well as a
   LinkedIn / Twitter share preview. Generate it from a 1200×630
   render — content can be a simple typographic card with name,
   title, "huzaifa478@gmail.com", and a hint of the Mario aesthetic
   (a pipe, a coin). Keep it under 100 KB. If you can render it
   from an HTML→image pipeline locally, fine; otherwise commit a
   hand-designed PNG.
3. **The bridge.** Game progress (coins collected, projects
   discovered via question blocks) persists to `localStorage` under
   keys `portfolio:coins`, `portfolio:projects`. Content mode reads
   them and **reveals**:
   - A small "you found N/4 projects in the Mario level" badge in
     the Projects section header.
   - Discovered project cards get a subtle visual treatment (a
     small coin icon, a `data-discovered="true"` attribute styled
     in Tailwind — don't ship a heavy effect; this should feel
     like an easter egg, not a billboard).
   - A "Your high score: NNNNNN" line in the footer, only if any
     score has been set.
   The hook lives in `lib/mode-toggle.ts` (rename the file if you
   want — it's already a settings/state module). The perf agent's
   game module *writes* via this hook on coin pickup / block hit /
   end-of-level; you write the hook + the reads. Coordinate by
   posting the hook signature to perf agent's `PLAN.md` review
   thread before they refactor.
4. **Privacy-respecting analytics, gated by env.** Add a Plausible
   or Umami `<script>` only when `process.env.NEXT_PUBLIC_ANALYTICS
   _DOMAIN` is set. Track three events at most: `pageview`, `mode
   _switch` (with `from`/`to` props), `pipe_click` (with `linkTo`
   prop). Local dev silent. No cookies.
5. **Contact form / mailto works and is keyboard-reachable.**
   Audit `components/plain/Contact.tsx` (220 lines): focus order,
   visible focus ring, `aria-label`s, working mailto fallback. No
   broken anchors anywhere — run `grep -n 'href=' components/plain/`
   and verify each.
6. **Resume PDF.** Either ship `public/resume.pdf` (coordinate with
   gameplay agent — they will keep the resume pipe in level-data) or
   notify gameplay agent in their PLAN.md review that you cannot
   provide one and they should remove the pipe. Don't leave a 404.
7. **Footer / copyright matches `lib/portfolio-data.ts`.** No
   hard-coded names, years, or social URLs anywhere in
   `components/plain/*`. Single source of truth.

## Out of scope — do not touch

- `app/game-mode/*` — perf and gameplay agents.
- `lib/audio.ts`, `lib/level-data.ts`, `lib/game-engine/*` — perf,
  assets, gameplay agents.
- `app/layout.tsx` font-loading block (lines 1-23 of current file)
  — assets agent.
- `next.config.js`, `tsconfig.json`, `tailwind.config.js`,
  `package.json`, `.eslintrc.json` — bundle agent.
- `public/sounds/*` — assets agent.
- `styles/sprites.css`, `styles/game.css` — assets agent. You may
  edit `styles/content.css` if a content-side change requires it,
  but prefer Tailwind classes.
- The six nested `portfolio-*/` directories and the four other
  `mario-*/` worktrees.

## Workflow

1. Read the repo and `lib/portfolio-data.ts` end-to-end. Check what
   the OG image needs to communicate (tip: open
   `linkedin.com/post-inspector` in your head — what message does
   "Huzaifa Naroo · Engineer" need to send in 1200×630 to a tired
   recruiter?). Then write a `PLAN.md` in this worktree
   (`mario-portfolio/PLAN.md`) listing the 5–10 highest-leverage
   changes with **estimated impact** and **risk**. **Stop and wait
   for human approval** before touching code.
2. After approval, one commit per item: `opt(portfolio): <change> —
   <impact>`. Example: `opt(portfolio): add full OG / Twitter / JSON-
   LD metadata — share previews now render correctly`.
3. Write `REPORT.md` with: a screenshot of the OG image rendered in
   `linkedin.com/post-inspector` (or saved as a PNG), Lighthouse
   "SEO" score before/after, the keyboard-tab order of the contact
   section, the bridge demo (game progress → content reveal) as a
   step-by-step.
4. Do not merge to `main`.

## Live coordination

Five branches run in parallel; the lead integrates everyone at the end.
To keep merges painless:

- **Update this worktree's `PLAN.md` continuously.** Mark each item
  `pending → in-progress → done` with a one-line outcome note ("done —
  bridge hook live; game-mode discovers four projects, badges render
  in Projects section"). Commit those PLAN edits frequently — they
  cost nothing, and they are how every other agent and the lead see
  live status.
- **Before committing to any shared-ownership file** (for you,
  `app/page.tsx` is shared with `opt/perf` — you own only the bridge-
  state plumbing, they own the mode toggle / mount; `app/layout.tsx`
  is shared with `opt/assets` — you own only `metadata` and any new
  `<head>` JSON-LD, they own font loading; `lib/mode-toggle.ts` is
  yours to extend but `opt/perf` reads it), run
  `cat ../mario-<other>/PLAN.md` for each agent listed against that
  file. If another agent has the file marked in-progress, post a
  `## Cross-cutting note for opt/<other>` block at the bottom of your
  PLAN.md describing your intended change and wait for acknowledgement
  before committing.
- **Cross-cutting asks or findings** (e.g. "gameplay agent: I'm
  shipping `public/resume.pdf` — keep the resume pipe in
  `lib/level-data.ts`"; "perf agent: the bridge hook signature is
  `useGameProgress(): { coinsCollected: number; discoveredProjects:
  string[]; recordCoin(): void; recordProject(id: string): void; high
  Score: number; setHighScore(n: number): void }` — please call the
  `record*` setters from the appropriate game events") go in a
  clearly-labeled section at the end of your PLAN.md, not buried in
  commit messages.
- **Don't rebase onto other `opt/*` branches yourself.** The lead
  handles integration. If you genuinely need a change another agent
  is making, ask in your PLAN.md.

The five `mario-*/PLAN.md` files are the live status board — readable
from any worktree by relative path. Treat them as a shared whiteboard:
read others, write to your own.

## Constraints

- **No new dependencies** without flagging. Plausible / Umami can
  be a `<script>` tag, no npm package needed. JSON-LD is just JSON
  in a `<script type="application/ld+json">` tag — don't pull in
  `schema-dts`.
- **Public surface that must not break:**
  - The content↔game mode toggle.
  - The static export build.
  - Project IDs in `lib/portfolio-data.ts` (`therasort`,
    `portfolio-mario`, `data-pipeline`, `react-dashboard`) — these
    map to question blocks in `lib/level-data.ts`. Don't rename.
  - The four projects must still all appear in the Projects
    section even before any are "discovered" — discovered just
    adds a badge; nothing is hidden.
- The bridge must be **graceful when localStorage is empty or
  unavailable** (Safari private mode, SSR, first-ever visit).
  Default state: zero coins, zero discovered projects, no high
  score banner. Do not throw, do not flash a "0/4 found" badge if
  no game session has happened (use `null` to mean "never played"
  vs `0` to mean "played but found nothing").
- Static export means no API routes, no SSR personalization. The
  bridge is purely client-side `localStorage` reads.

## Notes from the lead's discovery

- Existing metadata: `app/layout.tsx:25-29`. It's just `title` +
  `description`. Replace, don't append.
- The `<style dangerouslySetInnerHTML>` for Press Start 2P at
  layout.tsx:39 is the assets agent's territory; don't touch it
  even though it's in your file.
- `app/page.tsx` reduced-motion + mode-toggle plumbing is the
  perf agent's territory. The bridge state hook can live in
  `lib/mode-toggle.ts` and be called from `app/page.tsx`'s
  `<ContentMode />` invocation — that's where you plug in.
- Existing mode-toggle helpers: `lib/mode-toggle.ts` (17 lines,
  trivial). Extend, don't replace.
- Project data: `lib/portfolio-data.ts:104-179` is the source of
  truth for the four projects. The level data references project
  IDs at `lib/level-data.ts:84, 89, 90, 95`.
- Email: `huzaifa478@gmail.com`. GitHub: `hynr`. LinkedIn:
  `huzaifa-naroo`. Site: `huzaifa-naroo` builds at
  `hynr.github.io/portfolio/` (current canonical URL).
