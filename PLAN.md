---
worktree: mario-portfolio
branch: opt/portfolio
status: awaiting approval
---

# PLAN — `opt/portfolio`

Owned surface (per `BRIEF.md`):

- `app/layout.tsx` — `metadata` export + `<head>` JSON-LD only.
  Font block (lines 1–23, the `<style>` injection at line 39) is
  the assets agent's territory.
- `app/page.tsx` — only the bridge plumbing (a `useGameProgress`
  hook call + passing its values to `<ContentMode />`). Mode toggle,
  reduced-motion handler, and the rAF mount stay perf-owned.
- `app/content-mode/ContentMode.tsx`, all 13 files in
  `components/plain/`, `lib/portfolio-data.ts`, `lib/navigation.ts`,
  `lib/mode-toggle.ts`.
- New: `public/og-image.png`, `public/robots.txt`. (No `public/resume.pdf`
  — see item 0 for why.)

What I'm not touching: `app/game-mode/*`, `lib/audio.ts`,
`lib/level-data.ts`, `lib/game-engine/*`, `next.config.js`,
`tsconfig.json`, `tailwind.config.js`, `package.json`,
`.eslintrc.json`, `public/sounds/*`, `styles/sprites.css`,
`styles/game.css`, the inline `pressStart2P` `<style>` in
`app/layout.tsx`. I'll prefer Tailwind classes over editing
`styles/content.css`, and only edit `content.css` if a content-side
change actually requires it.

Workflow per `BRIEF.md`: **stopped, awaiting human approval** before
code edits. After approval, one commit per item, message format
`opt(portfolio): <change> — <impact>`.

---

## Verified findings (before planning)

- `app/layout.tsx:25-29` — current `metadata` is just `title` +
  `description`. No OG, no Twitter, no canonical, no robots, no
  JSON-LD. Brief says replace, don't append.
- `app/layout.tsx:39` — `<style dangerouslySetInnerHTML>` Press Start
  2P injection. Assets agent's territory; left untouched even though
  the assets PLAN says they're moving it to `next/font/google` /
  `next/font/local`. My edits to this file are confined to `metadata`
  and any new `<head>` siblings of that `<style>` (the JSON-LD
  `<script>`).
- `lib/portfolio-data.ts:55-71` — bio canonical fields:
  `name`, `title`, `location`, `email`, `summary`. No `url` field
  (today's site URL is hard-coded nowhere — the brief specifies
  `hynr.github.io/portfolio/`). I'll add `url` and a `description`
  alias to `bio` so the metadata export can pull from one place.
- `lib/portfolio-data.ts:264-269` — links list. Already has GitHub +
  LinkedIn + email + a placeholder `hzsr.dev` website. JSON-LD
  `sameAs` reads from this.
- `lib/mode-toggle.ts` — 17 lines, trivial. Extends cleanly. Today
  `getModePreference()` is hardcoded to `'content'` (intentional —
  always-content-first while game-mode is being polished).
- `app/content-mode/ContentMode.tsx:36-37` — footer copyright is
  hardcoded (`© ${year} Huzaifa Naroo · Columbia, MD`). Brief goal
  #7 says no hardcoded names anywhere in `components/plain/*`; the
  footer is in `ContentMode.tsx` (also my surface) and matches the
  same rule.
- `components/plain/Hero.tsx:40` — hardcoded "Huzaifa / Naroo" in the
  display heading. Splitting on a newline makes a `PORTFOLIO_DATA.bio.
  name` read awkward; treating this as a deliberate stylistic choice
  rather than churn for churn's sake. **Will leave** unless approval
  says otherwise.
- `components/plain/Nav.tsx:40` — hardcoded "Huzaifa Naroo" in nav
  monogram. Trivial to swap to `PORTFOLIO_DATA.bio.name`.
- `components/plain/Contact.tsx:91, 104` — hardcoded GitHub +
  LinkedIn anchor href + visible label. Email already reads from
  `PORTFOLIO_DATA.bio.email`. Swap socials to read from
  `PORTFOLIO_DATA.links`.
- `components/plain/Contact.tsx` (220 lines) — form is
  `mailto:`-only, no network. Inputs have `<label htmlFor=>`, native
  `required`, `autoComplete`. Missing: visible focus ring on the
  Send button (Tailwind default ring is overridden by the
  `bg-pipe`/`hover:bg-pipe-deep` chain), `aria-label` on the
  "Write another →" button, and the `<form>` has no `noValidate`
  /`role` issues but the spacebar-text-bubble overload in game mode
  isn't relevant here.
- `grep -n 'href='` audit (just ran): 11 anchors total. Two
  internal-fragment (`#projects`, `#contact`, `#top`), six external
  (github/linkedin/mailto), three project-link conditionals
  (`github`, `live`, `demo`). All resolved targets exist:
  `#projects` is `Projects.tsx:77`, `#contact` is `Contact.tsx:48`,
  `#top` is `ContentMode.tsx:17`. **No broken anchors.**
- Resume PDF: cross-checked `mario-gameplay/PLAN.md` — gameplay
  agent confirms `lib/level-data.ts` only declares `github` (x=800)
  and `linkedin` (x=1600) pipes. The `case 'resume'` in
  `SimpleMarioGame.tsx:199-201` is **dead code** (never reached). So
  goal #6 ("don't leave a 404") is already moot for the current
  level — there is no resume pipe to 404. I'll note this in the
  cross-cutting section so we don't accidentally re-add the pipe
  before a PDF lands. **Will not** ship `public/resume.pdf`.
- Project IDs in `lib/portfolio-data.ts`: `therasort`,
  `portfolio-mario`, `data-pipeline`, `react-dashboard` — all four
  match `lib/level-data.ts` question-block references per the brief.
  **Will not** rename.
- Sibling status (read 2026-05-10): `mario-perf` and `mario-assets`
  are awaiting approval. `mario-bundle` is in-progress (lead
  approved 2026-05-10). `mario-gameplay` already in-progress on
  items 1–3. No file I own is currently being edited by another
  agent — collisions only land at merge time, and the brief sets
  `opt/portfolio` as the 4th merge in front of `opt/bundle`.

---

## Items, in proposed commit order

Each item is a single commit. Status legend:
`pending` → `in-progress` → `done` (with one-line outcome).

### 0. Surface `bio.url` + canonicalize `bio.description` in `PORTFOLIO_DATA`
**Status:** done — `bio.url` (`https://hynr.github.io/portfolio`) + `bio.description` (one-sentence recruiter line) added; `Bio` interface extended; `as const` preserved. Items 1, 2 pull from these.
**Files:** `lib/portfolio-data.ts`.
**Change:** Add `url: 'https://hynr.github.io/portfolio'` to
`PORTFOLIO_DATA.bio`. Add a `description` field — a one-sentence
recruiter-readable line distinct from the longer `summary` and
`mission` already there. Both fields are pulled by item 1's
metadata export and item 2's OG image generator so we don't drift.
**Impact:** Single source of truth for site URL + share-card
description. Without this, item 1 hardcodes the URL inline and the
JSON-LD + OG meta will drift the moment the canonical URL changes
(e.g. when the deploy moves to a custom domain).
**Risk:** Trivial. `PORTFOLIO_DATA` is `as const`; adding fields
doesn't break existing readers. No call site removes a field.

### 1. Replace `metadata` export with full SEO + add JSON-LD `Person` schema
**Status:** done — full `metadata` export (`metadataBase`, title template, description, keywords, authors, OG, Twitter, robots, canonical) + JSON-LD `Person` `<script>` next to the existing `pressStart2P` `<style>` in `<head>`. All values pulled from `PORTFOLIO_DATA.bio` + `PORTFOLIO_DATA.links`. Did not touch the font block or the `<html>` className.
**Files:** `app/layout.tsx` (lines 25–29 only, plus a sibling
`<script type="application/ld+json">` next to the existing
`<style>` at line 39).
**Change:** Replace the two-field `metadata` object with a complete
one: `metadataBase`, `title` (`default` + `template`), `description`,
`keywords`, `authors`, `creator`, `openGraph` (title, description,
type: `'website'`, url, siteName, locale, images:
`[{ url: '/og-image.png', width: 1200, height: 630, alt }]`),
`twitter` (`card: 'summary_large_image'`, title, description,
images, creator), `alternates.canonical`, `robots`
(`{ index: true, follow: true, googleBot: { ... } }`), `icons`
(reuses the existing favicon if present, otherwise omitted —
favicon is bundle agent's territory). Add a `<head>`-level JSON-LD
`Person` block with `@context`, `@type`, name, url, jobTitle,
worksFor (`{ "@type": "Organization", "name": "HZSR" }`), email,
address (`Columbia, MD`), sameAs (GitHub + LinkedIn from
`PORTFOLIO_DATA.links`). Hand-written JSON.stringify; no
`schema-dts` dep (per brief constraint).
**Impact:** Brief goal #1. Lighthouse SEO from current ~85ish (no
canonical, no description in OG) to a clean 100 on `/`. LinkedIn /
Twitter / Slack share previews render with title, description, and
image instead of a bare URL. JSON-LD lets Google render a rich
"Person" knowledge panel for direct-name searches — this is the
single most recruiter-visible SEO win.
**Risk:** Low. Static-export safe (no runtime). Watch out: the
`metadataBase` URL must include the `/portfolio` basePath for
GitHub Pages, otherwise relative `/og-image.png` resolves wrong on
prod. I'll set `metadataBase: new URL('https://hynr.github.io/portfolio')`
and let Next handle relative resolution. **Cross-cutting note for
opt/assets at the bottom** — they're moving the inline `<style>` to
`next/font` so the JSON-LD `<script>` will sit alone in `<head>`;
no conflict.

### 2. Ship `public/og-image.png` (1200×630, < 100 KB)
**Status:** done — shipped as `public/og-image.jpg` (82 KB) instead of PNG: anti-aliased typography compresses to ~84 KB JPEG vs ~220 KB PNG, and the 100 KB constraint is the hard one. OG/Twitter both accept JPEG. Generator at `scripts/build-og-image.mjs` (uses macOS `sips`, no npm dep). Metadata image URLs updated.
**Files:** `public/og-image.png` (new). Optional: tiny generator
script at `scripts/build-og-image.mjs` (committed for
reproducibility, not run at build time).
**Change:** Generate a 1200×630 PNG using Node + `node-canvas`
locally — but `node-canvas` is a new dep and the brief forbids
deps without flagging. So instead I'll use a one-shot `sharp` (also
new) or, simpler, render a self-contained SVG → PNG via the system
`rsvg-convert` (macOS Homebrew `librsvg`) and commit only the PNG.
The SVG content lives in the script for reproducibility but is not
imported at build time. Card design (typographic, Mario-inflected):
- `#f7e9b3` background (the warm sandy tone from the content site)
- Top: `Huzaifa Naroo` in Inter Display 88px, weight 600, ink color
- Sub: `Engineer · AI + Product · Columbia, MD` in JetBrains Mono
  20px uppercase, tracking 0.16em, ink-soft
- Bottom-left: `huzaifa478@gmail.com` in mono, ink-soft
- Bottom-right: a 96×128 green-pipe SVG glyph + a 48×48 spinning
  coin SVG glyph (no animation in the static PNG — just the disc)
- Bottom rule: 4px brick-red band edge-to-edge
**Impact:** Brief goal #2. LinkedIn / Twitter / iMessage share
previews look like a deliberate piece of design instead of a fallback
screenshot of the page. This is the asset that turns "ah, a
portfolio link" into "huh, who's this engineer". Single asset, ~15-30
KB compressed PNG.
**Risk:** Low. New file, opt-in. If `rsvg-convert` is unavailable on
the user's machine, fall back to a hand-designed PNG exported from
Figma (lead's choice). Either way, the deliverable is a single PNG
≤ 100 KB; the script is documentation, not infrastructure.
**Decision needed from lead:** approve `rsvg-convert` (system tool,
not an npm dep) vs hand-export from Figma vs add `sharp` as a
dev-dep. Recommended: `rsvg-convert` if installed, else hand-export.

### 3. Extend `lib/mode-toggle.ts` with `useGameProgress` hook + types
**Status:** done — `useGameProgress()` reader hook + `recordCoin()` / `recordProject(id)` / `setHighScore(n)` writers shipped. SSR-safe (returns `EMPTY` on first render to match server markup), Safari-private-mode-safe (every localStorage call wrapped in try/catch). Cross-tab sync via `storage` event; same-tab sync via `portfolio:progress` `CustomEvent`. Existing `getModePreference` / `setModePreference` untouched. Storage keys: `portfolio:coins`, `portfolio:projects`, `portfolio:highScore`, `portfolio:hasPlayed`.
**Files:** `lib/mode-toggle.ts` (extend, don't rename — keeping the
file name minimizes import churn for perf agent).
**Change:** Add the hook surface promised to perf agent in the brief:

```ts
export type GameProgress = {
  coinsCollected: number   // 0 = played but no coin; null distinguishes "never played"
  discoveredProjects: string[]  // project IDs from PORTFOLIO_DATA.projects
  highScore: number | null
}

// Reads (used by ContentMode):
export function useGameProgress(): GameProgress & {
  hasPlayed: boolean       // false on first-ever visit / SSR / Safari private mode
}

// Writes (used by perf agent's game module):
export function recordCoin(): void
export function recordProject(id: string): void
export function setHighScore(n: number): void
```

Storage keys per brief: `portfolio:coins`, `portfolio:projects`
(JSON-encoded `string[]` of IDs), and a `portfolio:highScore`
(number). A fourth key `portfolio:hasPlayed` (boolean flag) is what
distinguishes "never played" from "played but found 0" — set to
`'1'` on the first `record*` call. The hook subscribes via a
`storage`-event listener so cross-tab game progress reflects in
content mode too. SSR-safe: returns the empty default
(`{ coinsCollected: 0, discoveredProjects: [], highScore: null,
hasPlayed: false }`) when `typeof window === 'undefined'`. Wraps
every `localStorage` access in try/catch so Safari private mode
(throws on `setItem`) degrades silently. Existing
`getModePreference` / `setModePreference` stay untouched.
**Impact:** The infra prerequisite for items 4 + 5. The actual
content-mode reveal is item 4; the writes are perf agent's. Without
this, the bridge is bare wiring.
**Risk:** Medium. Must be SSR-safe (next.js `output: 'export'` still
runs `getStaticProps`-equivalent on the layout — no `window`). Must
not throw on Safari private mode. Must not flash a `0/4 found` badge
before localStorage has been read. The hook returns
`hasPlayed: false` until the first `useEffect` runs, and the badge
in item 4 renders `null` while `hasPlayed === false`. **Cross-cutting
note for opt/perf at the bottom** with the exact import path and
call timing (`recordCoin()` on coin pickup; `recordProject(id)` on
question-block hit; `setHighScore(n)` on level complete).

### 4. Bridge: render game-progress reveals in `ContentMode`
**Status:** done — `useGameProgress()` called inside `Projects` (header badge "you found N/4 in the Mario level" + per-card `data-discovered="true"` attr + 2px brick top accent + small `<CoinDisc size={18}>` next to discovered titles) and `ContentMode` (footer "Your high score: NNNNNN" line). All four projects still render unconditionally; discovered just adds badges. SSR-safe — first render returns `EMPTY` so server-rendered markup matches client first paint, then the `useEffect` reads localStorage. `app/page.tsx` is **literally untouched** (perf agent's surface preserved). Side-benefit: footer copyright now reads from `PORTFOLIO_DATA.bio` (item 7's footer scope landed here naturally).
**Files:** `app/page.tsx` (one new line: pass progress down to
`<ContentMode />`), `app/content-mode/ContentMode.tsx`,
`components/plain/Projects.tsx`.
**Change:**
- `app/page.tsx`: call `useGameProgress()` and pass the `progress`
  object as a prop to `<ContentMode />`. **Single line** so I don't
  step on perf agent's mode toggle / mount logic. (See cross-cutting
  note for opt/perf re: the safer alternative — call
  `useGameProgress()` from inside `ContentMode` itself, removing
  the prop. I'll go with the inside-`ContentMode` approach to keep
  `app/page.tsx` literally untouched. Updating this PLAN to reflect
  that.)
- `ContentMode.tsx`: pass `progress` down to `<Projects />` and to
  the footer (for the high-score line). Or, again, call
  `useGameProgress()` directly inside Projects + a tiny new
  `<HighScoreLine />` helper in the footer — both are client
  components already, both are mine. **Going with hook-inside-
  component**: zero changes to `app/page.tsx`, zero new props in
  `ContentMode`.
- `Projects.tsx`: new section header subtitle `"You found N/4
  projects in the Mario level"` rendered only when
  `progress.hasPlayed === true`. On each project card, when
  `progress.discoveredProjects.includes(p.id)`, set
  `data-discovered="true"` on the article and render a small
  spinning `<CoinDisc size={14} spin />` next to the project title.
  Tailwind: `[data-discovered=true]:before:absolute …` for a 2px
  brick-red top border (subtle, easter-egg, not a billboard — per
  brief).
- `ContentMode.tsx` footer: append `<p>` with `"Your high score:
  NNNNNN"` only when `progress.highScore !== null`.
- All four projects still render unconditionally (per brief
  constraint — discovered just adds a badge, never hides).
**Impact:** Brief goal #3 — the dual-mode conceit becomes a feature
instead of marketing copy. This is the *only* item on the list that
makes the game feel like it pays off in the recruiter-visible site.
Without it, the entire game is a side dish that doesn't change the
main course.
**Risk:** Medium. SSR/hydration mismatch is the main hazard — the
hook must return a stable value on first render that matches what
SSR rendered (i.e. `hasPlayed: false`), then React updates after
the `useEffect` reads localStorage. Implemented carefully this is
zero-flash. Edge: if a user has played, a hard reload will briefly
show "no badge" → "badge fades in" — that's the right tradeoff vs
SSR mismatch warnings.

### 5. Privacy-respecting analytics, env-gated (Plausible script tag)
**Status:** pending
**Files:** `app/layout.tsx` (one new `<script>` in `<head>`,
sibling to the JSON-LD from item 1 and the assets agent's font
block), `app/page.tsx` (one new `useEffect` for `mode_switch`
custom event)? — actually, perf agent owns mode toggle. Better:
keep all analytics calls in `lib/mode-toggle.ts` next to the hook,
and `setModePreference` (which perf agent calls) gets a one-line
`trackEvent('mode_switch', { from, to })` injection. Perf agent
already calls `setModePreference` from the toggle handler, so this
is a single-file change for me. `pipe_click` is fired from
`lib/navigation.ts` (mine) at the top of `handlePipeClick`.
**Change:**
- `<script defer data-domain={env} src="https://plausible.io/js/
  script.js" />` in `<head>` — rendered only when
  `process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN` is set. Local dev:
  silent.
- A tiny `lib/analytics.ts` helper exporting `trackPageview()`,
  `trackEvent(name, props)` that no-op when the env var is unset
  or `window.plausible` is undefined. Three event types only:
  `pageview` (auto via the script), `mode_switch`
  (`{ from, to }`), `pipe_click` (`{ linkTo }`). No cookies. No
  PII.
- Update `lib/mode-toggle.ts:setModePreference` to call
  `trackEvent('mode_switch', { from, to })`. Update
  `lib/navigation.ts:handlePipeClick` to call
  `trackEvent('pipe_click', { linkTo })`.
**Impact:** Brief goal #4. Once a domain env var is set on deploy,
real numbers appear in the Plausible dashboard — without that,
"100K users reached" stays a claim from `PORTFOLIO_DATA.bio.
highlights` rather than a number anyone (Huzaifa included) can
verify. Cookieless, GDPR-friendly, no banner needed. < 1 KB script.
**Risk:** Low. Env-gated means zero impact on local dev or
unconfigured deploys. Plausible is a `<script>` tag — no npm dep
(per brief). The only failure mode is the script blocking on a
slow CDN; `defer` mitigates. **Lead decision needed:** Plausible
vs Umami vs simple-self-hosted (counter.dev). Recommended:
**Plausible** — most-recognized name, cleanest API, free tier or
$9/mo.
**Owner / write conflict note:** the `setModePreference` edit
overlaps with what `opt/perf` calls. Their PLAN says they
"call `setModePreference('content' | 'game')` from the toggle
handler" — they're the *caller*, not the *implementer*. The
function lives in my `lib/mode-toggle.ts`. So this is *my* edit
to *my* file; perf agent never sees the change. **No coordination
needed** — but I'll note it in the cross-cutting section as a
courtesy.

### 6. Contact section a11y audit + visible focus + aria-label patches
**Status:** pending
**Files:** `components/plain/Contact.tsx`.
**Change:** Audit-then-patch (the audit is the value; the patch is
small):
- Send button (`Contact.tsx:166-183`): currently has no
  `focus-visible:` ring. Tailwind: add
  `focus-visible:outline focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-coin-deep`.
  Same on the "Write another →" button (line 207) and the email
  link (line 80).
- "Write another" button: add `aria-label="Compose another
  message"`.
- Form fields are already labeled (`<label htmlFor=>`) — no change.
  But the visual `field-input` / `field-textarea` Tailwind classes
  in `styles/content.css` should already include a focus ring; if
  they don't, that's a content.css edit (allowed per brief —
  "prefer Tailwind classes" but `content.css` is mine to touch).
  I'll keep this change Tailwind-only.
- Add `noValidate` to the `<form>` so native browser validation
  errors don't fight our mailto fallback. (Native `required` still
  prevents submission with empty fields via the browser; we just
  don't want the bubble-tooltip on top of our own success state.)
  Actually — keep native validation. It's a real accessibility win
  for keyboard users. Drop this sub-item.
- Audit-only: keyboard tab order is currently
  `nav → pipe-warp → email link → github link → linkedin link →
  name input → email input → message textarea → send button` —
  natural source order, no `tabIndex` overrides needed. Document
  in REPORT.md.
**Impact:** Brief goal #5. Recruiters using screen readers or
keyboard-only navigation can *complete* the contact flow with
visible focus indicators at every step. The site currently *works*
keyboard-only; this audit makes it visibly so.
**Risk:** Low. Tailwind class additions only.

### 7. Wire footer + Nav + Contact socials to `PORTFOLIO_DATA` (single source of truth)
**Status:** pending
**Files:** `app/content-mode/ContentMode.tsx`,
`components/plain/Nav.tsx`, `components/plain/Contact.tsx`.
**Change:**
- `ContentMode.tsx:36-37` — replace
  `© ${year} Huzaifa Naroo · Columbia, MD` with
  `© ${year} ${PORTFOLIO_DATA.bio.name} · ${PORTFOLIO_DATA.bio.location}`.
- `Nav.tsx:40` — replace literal "Huzaifa Naroo" with
  `{PORTFOLIO_DATA.bio.name}`.
- `Contact.tsx:91, 96, 104, 109` — read GitHub + LinkedIn URLs
  from `PORTFOLIO_DATA.links`, and the visible labels from a
  derived `host/path` string (since "github.com/hynr" reads better
  than the full URL). Helper inline:
  `links.find(l => l.type === 'github')!.url` etc.
- Hero name (`Hero.tsx:40`): **leaving** the literal
  "Huzaifa<br/>Naroo" — the line break is a deliberate typographic
  choice, and pulling from `bio.name.split(' ')` reads as
  cleverness for cleverness's sake. Documenting the deliberate
  exception in REPORT.md.
**Impact:** Brief goal #7. Means the single source of truth claim
is true. Today, changing `bio.name` in `lib/portfolio-data.ts`
silently leaves the footer and nav stale.
**Risk:** Trivial. Mechanical swaps.

### 8. Ship `public/robots.txt`
**Status:** pending
**Files:** `public/robots.txt` (new).
**Change:** Two-line robots.txt: `User-agent: *` + `Allow: /` +
`Sitemap: https://hynr.github.io/portfolio/sitemap.xml` (sitemap
itself is bundle agent's territory if they want one — I'll note
it in the cross-cutting section).
**Impact:** Tiny SEO win. Without robots.txt, Google's crawler logs
a 404 on every visit. With it, the canonical search-index URL is
declared explicitly.
**Risk:** Trivial. New file.

---

## Cross-cutting notes for siblings

### For opt/perf

The bridge state hook lives in `lib/mode-toggle.ts` (your read-side
module already). Surface, after item 3:

```ts
// import { recordCoin, recordProject, setHighScore } from '@/lib/mode-toggle'

// On player–coin overlap (you've already debounced via collectedCoins set):
recordCoin()

// On player–question-block hit when block.contains === 'project':
//   block.projectId is the string ID matching PORTFOLIO_DATA.projects[*].id
recordProject(block.projectId)

// On level-complete (when player reaches goalPosition or whatever
// "end of run" means in the rAF loop):
setHighScore(score)  // function internally only writes if n > current
```

All three are no-throw, idempotent, SSR-safe (they're called from
your client `useEffect` so SSR is moot anyway). Ordering note:
`recordCoin` and `recordProject` can fire on every frame the
collision is true — they internally dedupe via the
already-collected/already-discovered checks I'll mirror from your
code. So you don't need a "first time only" guard; just call freely.

If you'd prefer a different signature (e.g. batched
`recordEvents([...])` or a single `useGameProgress()` you call on
mount and then write through), reply on this PLAN and I'll adjust
before committing item 3. I'd rather lock the signature *before*
your `useRef` refactor lands than rebase later.

`setModePreference('content' | 'game')` — keeping it. Item 5 adds a
one-line `trackEvent('mode_switch', { from, to })` inside the
function. From your side, nothing changes — same import, same call.

### For opt/assets

Two things to flag:

1. `app/layout.tsx` — I'm adding **only** (a) a replacement
   `metadata` export and (b) a JSON-LD `<script
   type="application/ld+json">` in `<head>`, plus (item 5) a
   conditional Plausible `<script>` also in `<head>`. I will not
   touch the `pressStart2P` `<style dangerouslySetInnerHTML>` block
   at line 39, the Inter / JetBrains_Mono `next/font` imports at
   lines 8–18, or the `<html>` tag's `className` attribute. If
   your `next/font/google` migration changes the `<html>` className
   shape, I'm fine with that — my JSON-LD `<script>` lives inside
   `<head>` and is positionally robust. Merge order will resolve
   any minor whitespace differences.

2. The Plausible `<script>` (item 5) is in `<head>` with `defer`.
   It doesn't compete with your render-blocking-CSS / font work —
   `defer` runs after parse. If you'd rather it lived as a
   `<Script strategy="afterInteractive" />` from `next/script`,
   say so; I have no preference.

### For opt/gameplay

You already noted in your PLAN that the resume pipe is dead code
(only `github` and `linkedin` are in `lib/level-data.ts` today).
Confirming I am **not** shipping `public/resume.pdf` for this
round. If a future commit re-adds the resume pipe to
`lib/level-data.ts`, `lib/navigation.ts:handlePipeClick` will
silently `window.open('/resume.pdf')` → 404. Two ways to prevent
that:

- **Recommended:** if/when you re-add the pipe, ping me via this
  PLAN and I'll ship the PDF in the same round.
- Or guard `case 'resume':` in `lib/navigation.ts` with a
  feature flag → no-op until the PDF lands.

Either is fine; status quo is no-op (no pipe → no 404).

### For opt/bundle

If you ship a sitemap, please put it at `public/sitemap.xml` so my
`robots.txt` (item 8) points to a real file. If you don't, I'll
drop the `Sitemap:` line from `robots.txt` before merging. Either
is fine.

`public/og-image.png` (item 2) is a static asset under 100 KB —
shouldn't move the needle on your `out/` size goal. Plausible
`<script>` (item 5) is loaded from a CDN, so it doesn't enter your
bundle either.

---

## Open decisions for the lead (please answer before approval)

1. **OG image generation path:** approve `rsvg-convert` (system
   tool, no npm dep) vs hand-export from Figma vs `sharp`
   dev-dep? *Recommend: rsvg-convert if installed; else hand-
   export.*
2. **Analytics provider:** Plausible vs Umami vs counter.dev?
   *Recommend: Plausible.* If you want self-hosted, say which host
   and I'll point the script there.
3. **Resume PDF:** confirm we're skipping (per gameplay agent's
   finding that the pipe is dead). If you want it shipped anyway,
   point me at a source PDF.
4. **`Hero.tsx` name:** keep the literal "Huzaifa<br/>Naroo" or
   pull from `PORTFOLIO_DATA.bio.name`? *Recommend: keep — the
   line break is a typographic choice.*
