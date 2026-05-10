// Smoke test for the unified input layer. No test runner is wired up — run
// directly with `npx tsx lib/game-engine/input.test.ts`. The file shapes its
// own jsdom-lite via globalThis so it works under Node without extra deps.

type Listener = (e: unknown) => void

const listeners: Record<string, Set<Listener>> = {}

function ensureFakeWindow(): void {
  if (typeof (globalThis as { window?: unknown }).window !== 'undefined') return
  const fakeWindow = {
    addEventListener: (type: string, fn: Listener) => {
      if (!listeners[type]) listeners[type] = new Set()
      listeners[type].add(fn)
    },
    removeEventListener: (type: string, fn: Listener) => {
      listeners[type]?.delete(fn)
    },
    matchMedia: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  }
  ;(globalThis as { window?: unknown }).window = fakeWindow
}

function dispatch(type: string, event: unknown): void {
  listeners[type]?.forEach((fn) => fn(event))
}

ensureFakeWindow()

// Imports must come after the window shim so the input module sees the fake.
// The explicit `.ts` extension lets Node's ESM loader resolve this directly
// when the file is run via `node --experimental-strip-types ...`. tsc itself
// rejects this without `allowImportingTsExtensions`, but the project ships
// with `typescript.ignoreBuildErrors: true` (bundle agent owns flipping
// that). When bundle flips the flag, they can either add the option or
// rename this file to `.mts`.
// @ts-expect-error -- TS5097 until allowImportingTsExtensions is enabled.
import { initInput, getInput, setTouch, _resetForTest } from './input.ts'

const failures: string[] = []

function check(cond: boolean, msg: string): void {
  if (cond) {
    // eslint-disable-next-line no-console
    console.log('PASS:', msg)
  } else {
    failures.push(msg)
    // eslint-disable-next-line no-console
    console.log('FAIL:', msg)
  }
}

function fakeKeyEvent(code: string): { code: string; preventDefault: () => void } {
  return { code, preventDefault: () => {} }
}

export function runInputSmokeTests(): void {
  _resetForTest()
  const cleanup = initInput()

  dispatch('keydown', fakeKeyEvent('ArrowLeft'))
  check(getInput().left === true, 'ArrowLeft keydown -> left=true')
  dispatch('keyup', fakeKeyEvent('ArrowLeft'))
  check(getInput().left === false, 'ArrowLeft keyup -> left=false')

  dispatch('keydown', fakeKeyEvent('KeyD'))
  check(getInput().right === true, 'KeyD keydown -> right=true')
  dispatch('keyup', fakeKeyEvent('KeyD'))
  check(getInput().right === false, 'KeyD keyup -> right=false')

  dispatch('keydown', fakeKeyEvent('Space'))
  check(getInput().jump === true, 'Space keydown -> jump=true')
  dispatch('keyup', fakeKeyEvent('Space'))
  check(getInput().jump === false, 'Space keyup -> jump=false')

  dispatch('keydown', fakeKeyEvent('ArrowUp'))
  check(getInput().jump === true, 'ArrowUp keydown -> jump=true')
  dispatch('keyup', fakeKeyEvent('ArrowUp'))

  dispatch('keydown', fakeKeyEvent('KeyE'))
  check(getInput().interact === true, 'KeyE keydown -> interact=true')
  dispatch('keyup', fakeKeyEvent('KeyE'))
  check(getInput().interact === false, 'KeyE keyup -> interact=false')

  setTouch('jump', true)
  check(getInput().jump === true, 'setTouch(jump, true) -> jump=true')
  setTouch('jump', false)
  check(getInput().jump === false, 'setTouch(jump, false) -> jump=false')

  setTouch('right', true)
  check(getInput().right === true, 'setTouch(right, true) -> right=true')
  setTouch('left', true)
  check(getInput().left === true, 'setTouch(left, true) -> left=true (concurrent with right)')
  setTouch('right', false)
  setTouch('left', false)

  setTouch('left', true)
  dispatch('keydown', fakeKeyEvent('ArrowRight'))
  dispatch('blur', {})
  check(
    getInput().left === false && getInput().right === false,
    'blur clears both keyboard and touch state'
  )

  cleanup()
  _resetForTest()

  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error(`\n${failures.length} test(s) failed:`)
    failures.forEach((f) => console.error('  -', f))
    if (typeof process !== 'undefined' && process.exit) process.exit(1)
  } else {
    // eslint-disable-next-line no-console
    console.log('\nAll input smoke tests passed.')
  }
}

// Auto-run when this file is the script entrypoint.
const isDirectRun =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv.some((a) => a.endsWith('input.test.ts') || a.endsWith('input.test.js'))

if (isDirectRun) {
  runInputSmokeTests()
}
