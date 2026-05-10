// Dev-only smoke test for the sprite-atlas builder.
// No test runner installed yet — wired into SimpleMarioGame's mount via a
// dynamic import gated by `process.env.NODE_ENV !== 'production'`, so this
// file is excluded from the production bundle (bundle agent: confirm in
// the chunk graph after your code-split lands).
//
// Asserts:
//   1. Atlas dimensions match FRAME_W * 4 by FRAME_H.
//   2. frameMap covers all four states with the expected per-frame rect.
//   3. Each frame has at least one opaque pixel inside its rect.
// Throws on failure so the violation is loud in the dev console.

import {
  buildSpriteAtlas,
  FRAME_H,
  FRAME_W,
  type SpriteAtlas,
  type SpriteState,
} from './spriteAtlas'

const STATES: readonly SpriteState[] = ['idle', 'walk1', 'walk2', 'jump']

export function runSpriteAtlasSmokeTest(
  atlas: SpriteAtlas = buildSpriteAtlas(),
): void {
  const expectedW = FRAME_W * STATES.length
  const expectedH = FRAME_H

  if (atlas.width !== expectedW) {
    throw new Error(
      `spriteAtlas: width ${atlas.width} != expected ${expectedW}`,
    )
  }
  if (atlas.height !== expectedH) {
    throw new Error(
      `spriteAtlas: height ${atlas.height} != expected ${expectedH}`,
    )
  }

  for (const state of STATES) {
    const frame = atlas.frameMap[state]
    if (!frame) {
      throw new Error(`spriteAtlas: missing frame for state "${state}"`)
    }
    if (frame.sw !== FRAME_W || frame.sh !== FRAME_H) {
      throw new Error(
        `spriteAtlas: frame "${state}" has size ${frame.sw}x${frame.sh}, expected ${FRAME_W}x${FRAME_H}`,
      )
    }
  }

  const ctx = atlas.canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null
  if (!ctx) {
    throw new Error('spriteAtlas: no 2d context available for verification')
  }

  for (const state of STATES) {
    const frame = atlas.frameMap[state]
    const data = ctx.getImageData(frame.sx, frame.sy, frame.sw, frame.sh).data
    let opaque = 0
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) opaque++
    }
    if (opaque === 0) {
      throw new Error(`spriteAtlas: frame "${state}" is fully transparent`)
    }
  }

  // eslint-disable-next-line no-console
  console.info(
    `[spriteAtlas.test] OK — ${atlas.width}×${atlas.height}, ${STATES.length} frames, all non-empty`,
  )
}
