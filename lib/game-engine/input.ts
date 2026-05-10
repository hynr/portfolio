// Unified keyboard + touch input layer for the active SimpleMarioGame.
// The rAF loop calls `getInput()` each frame for movement/jump.
// `TouchControls` calls `setTouch()` from pointer handlers. The mount-time
// effect calls `initInput()` once and runs the returned cleanup on unmount.

export interface InputSnapshot {
  left: boolean
  right: boolean
  jump: boolean
  interact: boolean
}

export type TouchButton = 'left' | 'right' | 'jump' | 'interact'

const keys = new Set<string>()
const touch: Record<TouchButton, boolean> = {
  left: false,
  right: false,
  jump: false,
  interact: false,
}

const PREVENT_DEFAULT_CODES = new Set([
  'Space',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
])

let installed = false

function onKeyDown(e: KeyboardEvent): void {
  keys.add(e.code)
  if (PREVENT_DEFAULT_CODES.has(e.code)) e.preventDefault()
}

function onKeyUp(e: KeyboardEvent): void {
  keys.delete(e.code)
}

function onBlur(): void {
  // Drop all held inputs when the window loses focus, otherwise a key held
  // while alt-tabbing stays "down" forever.
  keys.clear()
  touch.left = touch.right = touch.jump = touch.interact = false
}

export function initInput(): () => void {
  if (typeof window === 'undefined' || installed) return () => {}
  installed = true
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
    keys.clear()
    touch.left = touch.right = touch.jump = touch.interact = false
    installed = false
  }
}

export function getInput(): InputSnapshot {
  return {
    left: touch.left || keys.has('ArrowLeft') || keys.has('KeyA'),
    right: touch.right || keys.has('ArrowRight') || keys.has('KeyD'),
    jump:
      touch.jump ||
      keys.has('Space') ||
      keys.has('ArrowUp') ||
      keys.has('KeyW'),
    interact: touch.interact || keys.has('KeyE') || keys.has('Enter'),
  }
}

export function setTouch(button: TouchButton, pressed: boolean): void {
  touch[button] = pressed
}

// Test-only reset hook. Lets the smoke test isolate cases without leaking
// state between assertions. Not part of the runtime contract.
export function _resetForTest(): void {
  keys.clear()
  touch.left = touch.right = touch.jump = touch.interact = false
}

// Legacy compatibility shim — matches the surface of the old `InputHandler`
// class so the dead `app/game-mode/MarioGame.tsx` still compiles in this
// worktree. opt/perf removes both the dead module and this stub during their
// cleanup pass; nothing in the active path uses this class.
/** @deprecated kept only so MarioGame.tsx (deleted by opt/perf) builds. */
export class InputHandler {
  private cleanupFn: (() => void) | null = null

  constructor() {
    this.cleanupFn = initInput()
  }

  getInputState(): InputSnapshot & { up: boolean; down: boolean; run: boolean } {
    const snap = getInput()
    return {
      ...snap,
      up: snap.jump,
      down: false,
      run: false,
    }
  }

  setTouchState(state: Partial<Record<TouchButton, boolean>>): void {
    if (state.left !== undefined) setTouch('left', state.left)
    if (state.right !== undefined) setTouch('right', state.right)
    if (state.jump !== undefined) setTouch('jump', state.jump)
    if (state.interact !== undefined) setTouch('interact', state.interact)
  }

  cleanup(): void {
    this.cleanupFn?.()
    this.cleanupFn = null
  }
}
