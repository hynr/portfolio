/**
 * Always-content-first while game-mode is being polished.
 *
 * Initial page load lands on `'content'` regardless of any saved preference.
 * Game mode is reachable only by clicking the pipe in the nav within a
 * session. Saving a preference is kept (so the toggle in game-mode flips
 * to 'game' and persists for the session, but a fresh load resets to
 * content).
 */
export function getModePreference(): 'content' | 'game' {
  return 'content'
}

export function setModePreference(mode: 'content' | 'game') {
  if (typeof window === 'undefined') return
  localStorage.setItem('portfolio-mode', mode)
}
