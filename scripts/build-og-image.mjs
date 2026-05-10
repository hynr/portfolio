#!/usr/bin/env node
/**
 * Generates public/og-image.jpg from a self-contained SVG.
 *
 * Pipeline: write SVG to /tmp, convert via macOS `sips`. No npm deps.
 * Re-run only when the design or PORTFOLIO_DATA bio changes.
 *
 *   node scripts/build-og-image.mjs
 *
 * Output is JPEG (not PNG) because anti-aliased typography compresses
 * to ~84 KB as JPEG vs ~220 KB as PNG, and the brief's hard constraint
 * is "under 100 KB". Open Graph and Twitter cards both accept JPEG.
 *
 * The output is committed; this script is documentation, not
 * infrastructure. Skip on CI.
 */

import { writeFileSync, readFileSync, statSync, unlinkSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(__dirname, '..')
const OUT = join(REPO_ROOT, 'public', 'og-image.jpg')

// Pulled in by hand to keep the script dep-free. Cross-check against
// lib/portfolio-data.ts on every regen.
const NAME = 'Huzaifa Naroo'
const TITLE = 'Engineer · AI + Product'
const LOCATION = 'Columbia, MD'
const EMAIL = 'huzaifa478@gmail.com'

// Colors map to styles/content.css tokens.
const SURFACE = '#f7e9b3'    // warm sandy
const INK = '#1a1a1a'
const INK_SOFT = '#3d3d3d'
const INK_MUTE = '#6f6f6f'
const BRICK = '#c44832'
const PIPE = '#3d8f3d'
const PIPE_DEEP = '#2d6b2d'
const COIN = '#f4c430'
const COIN_DEEP = '#d49b1f'

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SURFACE}"/>
      <stop offset="100%" stop-color="#f0dca0"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#sky)"/>

  <!-- Top kicker rule + tag -->
  <line x1="80" y1="100" x2="148" y2="100" stroke="${INK_SOFT}" stroke-width="2"/>
  <text x="168" y="106" font-family="Helvetica Neue, Arial, sans-serif" font-size="20" font-weight="500"
    letter-spacing="3" fill="${INK_SOFT}" text-transform="uppercase">
    ENGINEER · COLUMBIA, MD · EST. HZSR
  </text>

  <!-- Name -->
  <text x="80" y="270" font-family="Helvetica Neue, Arial, sans-serif" font-size="128" font-weight="600"
    fill="${INK}" letter-spacing="-3">
    ${NAME}<tspan fill="${BRICK}">.</tspan>
  </text>

  <!-- Subtitle -->
  <text x="80" y="345" font-family="Helvetica Neue, Arial, sans-serif" font-size="36" font-weight="400"
    fill="${INK_SOFT}">
    ${TITLE}
  </text>

  <!-- Description -->
  <text x="80" y="420" font-family="Helvetica Neue, Arial, sans-serif" font-size="24" font-weight="400"
    fill="${INK_SOFT}">
    Six years shipping clinical AI, real-time analytics, and serverless
  </text>
  <text x="80" y="455" font-family="Helvetica Neue, Arial, sans-serif" font-size="24" font-weight="400"
    fill="${INK_SOFT}">
    pipelines reaching 100K+ users.
  </text>

  <!-- Email pinned bottom-left -->
  <text x="80" y="555" font-family="Menlo, Consolas, monospace" font-size="22" font-weight="500"
    fill="${INK}">
    ${EMAIL}
  </text>
  <text x="80" y="585" font-family="Menlo, Consolas, monospace" font-size="16" font-weight="400"
    fill="${INK_MUTE}" letter-spacing="2">
    HYNR.GITHUB.IO/PORTFOLIO
  </text>

  <!-- ===== Mario glyphs, bottom-right ===== -->

  <!-- Coin disc, ~80px circle, sitting above the pipe -->
  <g transform="translate(960, 380)">
    <circle cx="40" cy="40" r="40" fill="${COIN_DEEP}"/>
    <circle cx="40" cy="40" r="34" fill="${COIN}"/>
    <rect x="35" y="20" width="10" height="40" fill="${COIN_DEEP}"/>
    <rect x="32" y="22" width="3" height="36" fill="#fff" opacity="0.6"/>
  </g>

  <!-- Green pipe, classic Mario silhouette, anchored to the right edge -->
  <g transform="translate(1040, 470)">
    <!-- Pipe rim (wider than the body) -->
    <rect x="0" y="0" width="120" height="36" fill="${PIPE_DEEP}"/>
    <rect x="6" y="6" width="108" height="24" fill="${PIPE}"/>
    <rect x="12" y="10" width="12" height="16" fill="#5fb35f"/>
    <rect x="96" y="10" width="12" height="16" fill="${PIPE_DEEP}" opacity="0.6"/>
    <!-- Pipe body (narrower than the rim) -->
    <rect x="14" y="36" width="92" height="124" fill="${PIPE_DEEP}"/>
    <rect x="20" y="36" width="80" height="124" fill="${PIPE}"/>
    <rect x="26" y="40" width="8" height="116" fill="#5fb35f"/>
    <rect x="86" y="40" width="14" height="116" fill="${PIPE_DEEP}" opacity="0.6"/>
  </g>

  <!-- Brick-red bottom band -->
  <rect x="0" y="618" width="1200" height="12" fill="${BRICK}"/>
</svg>`

const tmpSvg = join(tmpdir(), `og-image-${Date.now()}.svg`)
writeFileSync(tmpSvg, svg, 'utf8')

try {
  execSync(`sips -s format jpeg -s formatOptions high "${tmpSvg}" --out "${OUT}"`, {
    stdio: 'inherit',
  })
  const { size } = statSync(OUT)
  console.log(`\n✓ wrote ${OUT} — ${(size / 1024).toFixed(1)} KB`)
  if (size > 100 * 1024) {
    console.warn(`⚠ Larger than the 100 KB budget — consider compressing.`)
  }
} finally {
  try { unlinkSync(tmpSvg) } catch {}
}
