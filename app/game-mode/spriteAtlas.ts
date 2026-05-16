// Auto-generated from the inline drawPixel data that used to live inside
// SimpleMarioGame.drawPlayer. Each frame is encoded as runs of
// [y, xStart, xEnd, '#hexcolor'] so the atlas builder fills horizontal
// strips in one fillRect each instead of per-pixel rects.

const PIXEL = 2 // logical pixel size in source canvas units
const FRAME_W_LOGICAL = 16
const FRAME_H_LOGICAL = 22

export const FRAME_W = FRAME_W_LOGICAL * PIXEL // 32
export const FRAME_H = FRAME_H_LOGICAL * PIXEL // 44

export type SpriteState = 'idle' | 'walk1' | 'walk2' | 'jump'

type Run = readonly [y: number, x0: number, x1: number, color: string]

const IDLE_RUNS: readonly Run[] = [
  [0, 5, 10, '#FF8C00'],
  [1, 4, 11, '#FF8C00'],
  [2, 4, 4, '#FF8C00'],
  [2, 5, 10, '#FFA500'],
  [2, 11, 11, '#FF8C00'],
  [3, 4, 4, '#8B4513'],
  [3, 5, 7, '#FFE0BC'],
  [3, 8, 8, '#000000'],
  [3, 9, 9, '#FFE0BC'],
  [3, 10, 10, '#000000'],
  [3, 11, 11, '#8B4513'],
  [4, 3, 3, '#8B4513'],
  [4, 4, 7, '#FFE0BC'],
  [4, 8, 8, '#000000'],
  [4, 9, 11, '#FFE0BC'],
  [4, 12, 12, '#8B4513'],
  [5, 3, 3, '#8B4513'],
  [5, 4, 11, '#FFE0BC'],
  [5, 12, 12, '#8B4513'],
  [6, 3, 4, '#8B4513'],
  [6, 5, 6, '#FFE0BC'],
  [6, 7, 8, '#000000'],
  [6, 9, 10, '#FFE0BC'],
  [6, 11, 12, '#8B4513'],
  [7, 5, 7, '#8B4513'],
  [7, 8, 8, '#000000'],
  [7, 9, 10, '#8B4513'],
  [8, 4, 11, '#8B4513'],
  [9, 4, 5, '#228B22'],
  [9, 6, 6, '#F5DEB3'],
  [9, 7, 8, '#228B22'],
  [9, 9, 9, '#F5DEB3'],
  [9, 10, 11, '#228B22'],
  [10, 3, 5, '#228B22'],
  [10, 6, 6, '#F5DEB3'],
  [10, 7, 8, '#228B22'],
  [10, 9, 9, '#F5DEB3'],
  [10, 10, 12, '#228B22'],
  [11, 3, 4, '#228B22'],
  [11, 5, 6, '#F5DEB3'],
  [11, 7, 8, '#8B4513'],
  [11, 9, 10, '#F5DEB3'],
  [11, 11, 12, '#228B22'],
  [12, 2, 4, '#F5DEB3'],
  [12, 5, 5, '#8B4513'],
  [12, 6, 6, '#F5DEB3'],
  [12, 7, 9, '#8B4513'],
  [12, 10, 13, '#F5DEB3'],
  [13, 2, 13, '#8B4513'],
  [14, 2, 13, '#8B4513'],
  [15, 2, 3, '#FFE0BC'],
  [15, 4, 11, '#8B4513'],
  [15, 12, 13, '#FFE0BC'],
  [16, 2, 5, '#FFE0BC'],
  [16, 6, 9, '#8B4513'],
  [16, 10, 13, '#FFE0BC'],
  [17, 2, 5, '#FFE0BC'],
  [17, 6, 9, '#8B4513'],
  [17, 10, 13, '#FFE0BC'],
  [18, 1, 5, '#2F4F4F'],
  [18, 10, 14, '#2F4F4F'],
  [19, 0, 5, '#2F4F4F'],
  [19, 10, 15, '#2F4F4F'],
  [20, 0, 5, '#2F4F4F'],
  [20, 10, 15, '#2F4F4F'],
  [21, 0, 5, '#2F4F4F'],
  [21, 10, 15, '#2F4F4F'],
]

// walk1 — LEFT foot lifted off ground (raised + bent up), RIGHT foot planted
// firmly at the bottom. Head/torso identical to idle so the eye reads the
// leg motion as a step rather than a body wobble.
const WALK1_RUNS: readonly Run[] = [
  // Head / hat (same as idle)
  [0, 5, 10, '#FF8C00'],
  [1, 4, 11, '#FF8C00'],
  [2, 4, 4, '#FF8C00'], [2, 5, 10, '#FFA500'], [2, 11, 11, '#FF8C00'],
  [3, 4, 4, '#8B4513'], [3, 5, 7, '#FFE0BC'], [3, 8, 8, '#000000'], [3, 9, 9, '#FFE0BC'], [3, 10, 10, '#000000'], [3, 11, 11, '#8B4513'],
  [4, 3, 3, '#8B4513'], [4, 4, 7, '#FFE0BC'], [4, 8, 8, '#000000'], [4, 9, 11, '#FFE0BC'], [4, 12, 12, '#8B4513'],
  [5, 3, 3, '#8B4513'], [5, 4, 11, '#FFE0BC'], [5, 12, 12, '#8B4513'],
  [6, 3, 4, '#8B4513'], [6, 5, 6, '#FFE0BC'], [6, 7, 8, '#000000'], [6, 9, 10, '#FFE0BC'], [6, 11, 12, '#8B4513'],
  [7, 5, 7, '#8B4513'], [7, 8, 8, '#000000'], [7, 9, 10, '#8B4513'],
  [8, 4, 11, '#8B4513'],
  // Overalls + arms (same as idle, body intentionally still)
  [9, 4, 5, '#228B22'], [9, 6, 6, '#F5DEB3'], [9, 7, 8, '#228B22'], [9, 9, 9, '#F5DEB3'], [9, 10, 11, '#228B22'],
  [10, 3, 5, '#228B22'], [10, 6, 6, '#F5DEB3'], [10, 7, 8, '#228B22'], [10, 9, 9, '#F5DEB3'], [10, 10, 12, '#228B22'],
  [11, 3, 4, '#228B22'], [11, 5, 6, '#F5DEB3'], [11, 7, 8, '#8B4513'], [11, 9, 10, '#F5DEB3'], [11, 11, 12, '#228B22'],
  [12, 2, 4, '#F5DEB3'], [12, 5, 5, '#8B4513'], [12, 6, 6, '#F5DEB3'], [12, 7, 9, '#8B4513'], [12, 10, 13, '#F5DEB3'],
  [13, 2, 13, '#8B4513'],
  [14, 2, 13, '#8B4513'],
  // Pant legs — left bent up, right straight down
  [15, 4, 6, '#8B4513'],          // left thigh (pulled in/up)
  [15, 9, 11, '#8B4513'],         // right thigh
  [16, 4, 6, '#8B4513'],
  [16, 9, 11, '#8B4513'],
  [17, 3, 6, '#FFE0BC'],          // LEFT ankle/leg skin showing (foot up)
  [17, 9, 11, '#8B4513'],         // right pant continues
  // LEFT shoe RAISED — sits at y=18-19, leaving y=20-21 empty on the left
  [18, 2, 6, '#2F4F4F'],
  [19, 1, 6, '#2F4F4F'],
  // RIGHT shoe PLANTED — reaches the bottom row so the player isn't floating
  [18, 9, 12, '#2F4F4F'],
  [19, 9, 13, '#2F4F4F'],
  [20, 9, 13, '#2F4F4F'],
  [21, 9, 14, '#2F4F4F'],
]

// walk2 — mirror of walk1: RIGHT foot raised, LEFT foot planted.
const WALK2_RUNS: readonly Run[] = [
  // Head / hat (same as idle)
  [0, 5, 10, '#FF8C00'],
  [1, 4, 11, '#FF8C00'],
  [2, 4, 4, '#FF8C00'], [2, 5, 10, '#FFA500'], [2, 11, 11, '#FF8C00'],
  [3, 4, 4, '#8B4513'], [3, 5, 7, '#FFE0BC'], [3, 8, 8, '#000000'], [3, 9, 9, '#FFE0BC'], [3, 10, 10, '#000000'], [3, 11, 11, '#8B4513'],
  [4, 3, 3, '#8B4513'], [4, 4, 7, '#FFE0BC'], [4, 8, 8, '#000000'], [4, 9, 11, '#FFE0BC'], [4, 12, 12, '#8B4513'],
  [5, 3, 3, '#8B4513'], [5, 4, 11, '#FFE0BC'], [5, 12, 12, '#8B4513'],
  [6, 3, 4, '#8B4513'], [6, 5, 6, '#FFE0BC'], [6, 7, 8, '#000000'], [6, 9, 10, '#FFE0BC'], [6, 11, 12, '#8B4513'],
  [7, 5, 7, '#8B4513'], [7, 8, 8, '#000000'], [7, 9, 10, '#8B4513'],
  [8, 4, 11, '#8B4513'],
  // Overalls + arms
  [9, 4, 5, '#228B22'], [9, 6, 6, '#F5DEB3'], [9, 7, 8, '#228B22'], [9, 9, 9, '#F5DEB3'], [9, 10, 11, '#228B22'],
  [10, 3, 5, '#228B22'], [10, 6, 6, '#F5DEB3'], [10, 7, 8, '#228B22'], [10, 9, 9, '#F5DEB3'], [10, 10, 12, '#228B22'],
  [11, 3, 4, '#228B22'], [11, 5, 6, '#F5DEB3'], [11, 7, 8, '#8B4513'], [11, 9, 10, '#F5DEB3'], [11, 11, 12, '#228B22'],
  [12, 2, 4, '#F5DEB3'], [12, 5, 5, '#8B4513'], [12, 6, 6, '#F5DEB3'], [12, 7, 9, '#8B4513'], [12, 10, 13, '#F5DEB3'],
  [13, 2, 13, '#8B4513'],
  [14, 2, 13, '#8B4513'],
  // Legs swapped: left straight down, right bent up
  [15, 4, 6, '#8B4513'],
  [15, 9, 11, '#8B4513'],
  [16, 4, 6, '#8B4513'],
  [16, 9, 11, '#8B4513'],
  [17, 4, 6, '#8B4513'],          // left pant continues
  [17, 9, 12, '#FFE0BC'],         // RIGHT ankle/leg skin showing (foot up)
  // LEFT shoe PLANTED — reaches the bottom row
  [18, 3, 6, '#2F4F4F'],
  [19, 2, 6, '#2F4F4F'],
  [20, 2, 6, '#2F4F4F'],
  [21, 1, 6, '#2F4F4F'],
  // RIGHT shoe RAISED — sits at y=18-19, leaving y=20-21 empty on right
  [18, 9, 13, '#2F4F4F'],
  [19, 9, 14, '#2F4F4F'],
]

const JUMP_RUNS: readonly Run[] = [
  [0, 5, 10, '#FF8C00'],
  [1, 4, 11, '#FF8C00'],
  [2, 4, 4, '#FF8C00'],
  [2, 5, 10, '#FFA500'],
  [2, 11, 11, '#FF8C00'],
  [3, 4, 4, '#8B4513'],
  [3, 5, 7, '#FFE0BC'],
  [3, 8, 8, '#000000'],
  [3, 9, 9, '#FFE0BC'],
  [3, 10, 10, '#000000'],
  [3, 11, 11, '#8B4513'],
  [4, 3, 3, '#8B4513'],
  [4, 4, 7, '#FFE0BC'],
  [4, 8, 8, '#000000'],
  [4, 9, 11, '#FFE0BC'],
  [4, 12, 12, '#8B4513'],
  [5, 3, 3, '#8B4513'],
  [5, 4, 11, '#FFE0BC'],
  [5, 12, 12, '#8B4513'],
  [6, 3, 4, '#8B4513'],
  [6, 5, 6, '#FFE0BC'],
  [6, 7, 8, '#000000'],
  [6, 9, 10, '#FFE0BC'],
  [6, 11, 12, '#8B4513'],
  [7, 5, 7, '#8B4513'],
  [7, 8, 8, '#000000'],
  [7, 9, 10, '#8B4513'],
  [8, 4, 11, '#8B4513'],
  [9, 1, 2, '#FFE0BC'],
  [9, 4, 5, '#228B22'],
  [9, 6, 6, '#F5DEB3'],
  [9, 7, 8, '#228B22'],
  [9, 9, 9, '#F5DEB3'],
  [9, 10, 11, '#228B22'],
  [9, 13, 14, '#FFE0BC'],
  [10, 0, 1, '#FFE0BC'],
  [10, 3, 5, '#228B22'],
  [10, 6, 6, '#F5DEB3'],
  [10, 7, 8, '#228B22'],
  [10, 9, 9, '#F5DEB3'],
  [10, 10, 12, '#228B22'],
  [10, 14, 15, '#FFE0BC'],
  [11, 3, 4, '#228B22'],
  [11, 5, 6, '#F5DEB3'],
  [11, 7, 8, '#8B4513'],
  [11, 9, 10, '#F5DEB3'],
  [11, 11, 12, '#228B22'],
  [12, 3, 4, '#F5DEB3'],
  [12, 5, 5, '#8B4513'],
  [12, 6, 6, '#F5DEB3'],
  [12, 7, 9, '#8B4513'],
  [12, 10, 12, '#F5DEB3'],
  [13, 3, 6, '#8B4513'],
  [13, 9, 12, '#8B4513'],
  [14, 2, 5, '#8B4513'],
  [14, 10, 13, '#8B4513'],
  [15, 1, 3, '#8B4513'],
  [15, 12, 14, '#8B4513'],
  [16, 0, 2, '#FFE0BC'],
  [16, 13, 15, '#FFE0BC'],
  [17, 0, 1, '#FFE0BC'],
  [17, 14, 15, '#FFE0BC'],
  [18, 0, 1, '#2F4F4F'],
  [18, 14, 15, '#2F4F4F'],
  [19, 0, 1, '#2F4F4F'],
  [19, 14, 15, '#2F4F4F'],
]

const FRAME_ORDER: readonly SpriteState[] = ['idle', 'walk1', 'walk2', 'jump']
const FRAMES: Record<SpriteState, readonly Run[]> = {
  idle: IDLE_RUNS,
  walk1: WALK1_RUNS,
  walk2: WALK2_RUNS,
  jump: JUMP_RUNS,
}

export type GoombaState = 'gWalk1' | 'gWalk2' | 'gDead'

// Goomba pixel data lives in the top 16 logical rows of a player-sized
// slot. The FrameRect we expose for goombas clips to those rows (sh = 32
// not 44), so the game draws a 32x32 sprite. Colors:
//   B = body brown, X = dark outline, E = darker brow shadow,
//   W = eye white, K = pupil, F = feet tan
const G_BODY = '#A0522D'      // lighter sienna so eyes pop
const G_BODY_DARK = '#8B4513' // shading under the cap
const G_OUTLINE = '#2C1607'   // hard outline
const G_BROW = '#4A2410'      // darker than body, lighter than outline
const G_WHITE = '#FFFFFF'
const G_PUPIL = '#000000'
const G_FEET = '#5C2C0C'      // dark brown feet, distinct from body

// gWalk1 — feet spread wide (left foot to far-left, right to far-right)
const G_WALK1_RUNS: readonly Run[] = [
  // Cap silhouette (rows 0-3): wide rounded mushroom top
  [0, 4, 11, G_OUTLINE],
  [1, 2, 3, G_OUTLINE], [1, 4, 11, G_BODY], [1, 12, 13, G_OUTLINE],
  [2, 1, 2, G_OUTLINE], [2, 3, 12, G_BODY], [2, 13, 14, G_OUTLINE],
  [3, 0, 1, G_OUTLINE], [3, 2, 13, G_BODY], [3, 14, 15, G_OUTLINE],
  // Brow band — slanted toward center, gives the angry expression
  [4, 0, 0, G_OUTLINE],
  [4, 1, 2, G_BODY],
  [4, 3, 4, G_BROW],     // left brow (outer→inner descent)
  [4, 5, 5, G_OUTLINE],
  [4, 6, 9, G_BODY],
  [4, 10, 10, G_OUTLINE],
  [4, 11, 12, G_BROW],   // right brow
  [4, 13, 14, G_BODY],
  [4, 15, 15, G_OUTLINE],
  // Eyes upper edge
  [5, 0, 0, G_OUTLINE],
  [5, 1, 2, G_BODY],
  [5, 3, 5, G_WHITE],
  [5, 6, 9, G_BODY],
  [5, 10, 12, G_WHITE],
  [5, 13, 14, G_BODY],
  [5, 15, 15, G_OUTLINE],
  // Eyes — pupils placed toward inner corner for the menacing inward stare
  [6, 0, 0, G_OUTLINE],
  [6, 1, 2, G_BODY],
  [6, 3, 3, G_WHITE], [6, 4, 5, G_PUPIL],
  [6, 6, 9, G_BODY],
  [6, 10, 11, G_PUPIL], [6, 12, 12, G_WHITE],
  [6, 13, 14, G_BODY],
  [6, 15, 15, G_OUTLINE],
  // Eyes lower lid
  [7, 0, 0, G_OUTLINE],
  [7, 1, 2, G_BODY],
  [7, 3, 5, G_WHITE],
  [7, 6, 9, G_BODY],
  [7, 10, 12, G_WHITE],
  [7, 13, 14, G_BODY],
  [7, 15, 15, G_OUTLINE],
  // Body mid (rows 8-10): rounded under the cap, with subtle shading
  [8, 0, 0, G_OUTLINE], [8, 1, 14, G_BODY], [8, 15, 15, G_OUTLINE],
  [9, 1, 1, G_OUTLINE], [9, 2, 13, G_BODY_DARK], [9, 14, 14, G_OUTLINE],
  [10, 2, 2, G_OUTLINE], [10, 3, 12, G_BODY_DARK], [10, 13, 13, G_OUTLINE],
  [11, 3, 3, G_OUTLINE], [11, 4, 11, G_BODY_DARK], [11, 12, 12, G_OUTLINE],
  // Feet (walk1 — spread WIDE, planted firmly)
  [12, 0, 4, G_FEET],
  [12, 5, 10, G_OUTLINE],
  [12, 11, 15, G_FEET],
  [13, 1, 4, G_FEET],
  [13, 11, 14, G_FEET],
  [14, 2, 4, G_OUTLINE],
  [14, 11, 13, G_OUTLINE],
]

// gWalk2 — feet pulled IN (one mid-step look), and the body tilts down 1px
const G_WALK2_RUNS: readonly Run[] = [
  // Cap silhouette
  [0, 4, 11, G_OUTLINE],
  [1, 2, 3, G_OUTLINE], [1, 4, 11, G_BODY], [1, 12, 13, G_OUTLINE],
  [2, 1, 2, G_OUTLINE], [2, 3, 12, G_BODY], [2, 13, 14, G_OUTLINE],
  [3, 0, 1, G_OUTLINE], [3, 2, 13, G_BODY], [3, 14, 15, G_OUTLINE],
  // Brow band
  [4, 0, 0, G_OUTLINE],
  [4, 1, 2, G_BODY],
  [4, 3, 4, G_BROW],
  [4, 5, 5, G_OUTLINE],
  [4, 6, 9, G_BODY],
  [4, 10, 10, G_OUTLINE],
  [4, 11, 12, G_BROW],
  [4, 13, 14, G_BODY],
  [4, 15, 15, G_OUTLINE],
  // Eyes (same expression as walk1)
  [5, 0, 0, G_OUTLINE], [5, 1, 2, G_BODY], [5, 3, 5, G_WHITE], [5, 6, 9, G_BODY], [5, 10, 12, G_WHITE], [5, 13, 14, G_BODY], [5, 15, 15, G_OUTLINE],
  [6, 0, 0, G_OUTLINE], [6, 1, 2, G_BODY], [6, 3, 3, G_WHITE], [6, 4, 5, G_PUPIL], [6, 6, 9, G_BODY], [6, 10, 11, G_PUPIL], [6, 12, 12, G_WHITE], [6, 13, 14, G_BODY], [6, 15, 15, G_OUTLINE],
  [7, 0, 0, G_OUTLINE], [7, 1, 2, G_BODY], [7, 3, 5, G_WHITE], [7, 6, 9, G_BODY], [7, 10, 12, G_WHITE], [7, 13, 14, G_BODY], [7, 15, 15, G_OUTLINE],
  // Body mid
  [8, 0, 0, G_OUTLINE], [8, 1, 14, G_BODY], [8, 15, 15, G_OUTLINE],
  [9, 1, 1, G_OUTLINE], [9, 2, 13, G_BODY_DARK], [9, 14, 14, G_OUTLINE],
  [10, 2, 2, G_OUTLINE], [10, 3, 12, G_BODY_DARK], [10, 13, 13, G_OUTLINE],
  [11, 3, 3, G_OUTLINE], [11, 4, 11, G_BODY_DARK], [11, 12, 12, G_OUTLINE],
  // Feet (walk2 — pulled IN tight; clear contrast to walk1's wide stance)
  [12, 2, 6, G_FEET],
  [12, 7, 8, G_OUTLINE],
  [12, 9, 13, G_FEET],
  [13, 3, 6, G_FEET],
  [13, 9, 12, G_FEET],
  [14, 4, 6, G_OUTLINE],
  [14, 9, 11, G_OUTLINE],
]

// Dead (stomp squish) — flat pancake, eyes closed crosshatches
const G_DEAD_RUNS: readonly Run[] = [
  [12, 1, 14, G_OUTLINE],
  [13, 1, 14, G_BODY],
  [13, 4, 5, G_OUTLINE],   // X marks for eyes
  [13, 10, 11, G_OUTLINE],
  [14, 0, 15, G_BODY],
  [14, 3, 6, G_OUTLINE],
  [14, 9, 12, G_OUTLINE],
  [15, 1, 14, G_OUTLINE],
]

const GOOMBA_FRAME_ORDER: readonly GoombaState[] = ['gWalk1', 'gWalk2', 'gDead']
const GOOMBA_FRAMES: Record<GoombaState, readonly Run[]> = {
  gWalk1: G_WALK1_RUNS,
  gWalk2: G_WALK2_RUNS,
  gDead: G_DEAD_RUNS,
}

// Goomba sprites are 16 logical rows tall — half the player's 22 — so we
// expose a tighter sh on the FrameRect. The atlas slot itself stays the
// player's full height; the unused bottom rows are just transparent.
export const GOOMBA_FRAME_W = FRAME_W
export const GOOMBA_FRAME_H = 16 * PIXEL // 32

export interface FrameRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

export interface SpriteAtlas {
  canvas: HTMLCanvasElement | OffscreenCanvas
  frameMap: Record<SpriteState, FrameRect>
  goombaFrameMap: Record<GoombaState, FrameRect>
  width: number
  height: number
}

export function buildSpriteAtlas(): SpriteAtlas {
  const cols = FRAME_ORDER.length + GOOMBA_FRAME_ORDER.length
  const width = FRAME_W * cols
  const height = FRAME_H

  let canvas: HTMLCanvasElement | OffscreenCanvas
  if (typeof OffscreenCanvas !== 'undefined') {
    canvas = new OffscreenCanvas(width, height)
  } else {
    const c = document.createElement('canvas')
    c.width = width
    c.height = height
    canvas = c
  }

  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null
  if (!ctx) {
    throw new Error('Failed to get 2D context for sprite atlas')
  }
  ctx.imageSmoothingEnabled = false

  const frameMap = {} as Record<SpriteState, FrameRect>
  for (let i = 0; i < FRAME_ORDER.length; i++) {
    const state = FRAME_ORDER[i]
    const sx = i * FRAME_W
    const sy = 0
    frameMap[state] = { sx, sy, sw: FRAME_W, sh: FRAME_H }

    const runs = FRAMES[state]
    for (let r = 0; r < runs.length; r++) {
      const [y, x0, x1, color] = runs[r]
      ctx.fillStyle = color
      ctx.fillRect(
        sx + x0 * PIXEL,
        sy + y * PIXEL,
        (x1 - x0 + 1) * PIXEL,
        PIXEL,
      )
    }
  }

  const goombaFrameMap = {} as Record<GoombaState, FrameRect>
  for (let i = 0; i < GOOMBA_FRAME_ORDER.length; i++) {
    const state = GOOMBA_FRAME_ORDER[i]
    const sx = (FRAME_ORDER.length + i) * FRAME_W
    const sy = 0
    goombaFrameMap[state] = { sx, sy, sw: GOOMBA_FRAME_W, sh: GOOMBA_FRAME_H }

    const runs = GOOMBA_FRAMES[state]
    for (let r = 0; r < runs.length; r++) {
      const [y, x0, x1, color] = runs[r]
      ctx.fillStyle = color
      ctx.fillRect(
        sx + x0 * PIXEL,
        sy + y * PIXEL,
        (x1 - x0 + 1) * PIXEL,
        PIXEL,
      )
    }
  }

  return { canvas, frameMap, goombaFrameMap, width, height }
}
