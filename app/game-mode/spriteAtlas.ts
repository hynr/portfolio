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

const WALK1_RUNS: readonly Run[] = [
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
  [9, 2, 2, '#FFE0BC'],
  [9, 4, 5, '#228B22'],
  [9, 6, 6, '#F5DEB3'],
  [9, 7, 8, '#228B22'],
  [9, 9, 9, '#F5DEB3'],
  [9, 10, 11, '#228B22'],
  [10, 1, 2, '#FFE0BC'],
  [10, 3, 5, '#228B22'],
  [10, 6, 6, '#F5DEB3'],
  [10, 7, 8, '#228B22'],
  [10, 9, 9, '#F5DEB3'],
  [10, 10, 12, '#228B22'],
  [10, 13, 13, '#FFE0BC'],
  [11, 3, 4, '#228B22'],
  [11, 5, 6, '#F5DEB3'],
  [11, 7, 8, '#8B4513'],
  [11, 9, 10, '#F5DEB3'],
  [11, 11, 12, '#228B22'],
  [11, 13, 14, '#FFE0BC'],
  [12, 2, 4, '#F5DEB3'],
  [12, 5, 5, '#8B4513'],
  [12, 6, 6, '#F5DEB3'],
  [12, 7, 9, '#8B4513'],
  [12, 10, 13, '#F5DEB3'],
  [13, 3, 12, '#8B4513'],
  [14, 2, 6, '#8B4513'],
  [14, 9, 12, '#8B4513'],
  [15, 1, 4, '#8B4513'],
  [15, 10, 12, '#8B4513'],
  [16, 0, 3, '#FFE0BC'],
  [16, 11, 12, '#FFE0BC'],
  [17, 0, 2, '#FFE0BC'],
  [17, 11, 12, '#FFE0BC'],
  [18, 0, 2, '#2F4F4F'],
  [18, 10, 12, '#2F4F4F'],
  [19, 0, 3, '#2F4F4F'],
  [19, 10, 13, '#2F4F4F'],
  [20, 0, 3, '#2F4F4F'],
  [20, 10, 13, '#2F4F4F'],
]

const WALK2_RUNS: readonly Run[] = [
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
  [9, 13, 13, '#FFE0BC'],
  [10, 2, 2, '#FFE0BC'],
  [10, 3, 5, '#228B22'],
  [10, 6, 6, '#F5DEB3'],
  [10, 7, 8, '#228B22'],
  [10, 9, 9, '#F5DEB3'],
  [10, 10, 12, '#228B22'],
  [10, 13, 14, '#FFE0BC'],
  [11, 1, 2, '#FFE0BC'],
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
  [13, 3, 12, '#8B4513'],
  [14, 3, 6, '#8B4513'],
  [14, 9, 13, '#8B4513'],
  [15, 3, 5, '#8B4513'],
  [15, 11, 14, '#8B4513'],
  [16, 3, 4, '#FFE0BC'],
  [16, 12, 15, '#FFE0BC'],
  [17, 3, 4, '#FFE0BC'],
  [17, 13, 15, '#FFE0BC'],
  [18, 3, 5, '#2F4F4F'],
  [18, 13, 15, '#2F4F4F'],
  [19, 2, 5, '#2F4F4F'],
  [19, 12, 15, '#2F4F4F'],
  [20, 2, 5, '#2F4F4F'],
  [20, 12, 15, '#2F4F4F'],
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

export interface FrameRect {
  sx: number
  sy: number
  sw: number
  sh: number
}

export interface SpriteAtlas {
  canvas: HTMLCanvasElement | OffscreenCanvas
  frameMap: Record<SpriteState, FrameRect>
  width: number
  height: number
}

export function buildSpriteAtlas(): SpriteAtlas {
  const cols = FRAME_ORDER.length
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

  return { canvas, frameMap, width, height }
}
