'use client'

import { useEffect, useState } from 'react'
import { trackEvent } from './analytics'

const MODE_KEY = 'portfolio-mode'

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
  let from: 'content' | 'game' = 'content'
  try {
    const prev = localStorage.getItem(MODE_KEY)
    if (prev === 'game' || prev === 'content') from = prev
    localStorage.setItem(MODE_KEY, mode)
  } catch {
    // Safari private mode throws on setItem — silent.
  }
  if (from !== mode) {
    trackEvent('mode_switch', { from, to: mode })
  }
}

// ---------------------------------------------------------------------------
// Game ↔ content bridge
//
// The Mario level writes coin pickups, project discoveries, and the
// session high score to localStorage. Content mode reads them and reveals
// subtle treatments (a "you found N/4" badge, per-card discovered styling,
// a footer high-score line). All localStorage access is guarded so SSR
// and Safari private mode degrade silently.
// ---------------------------------------------------------------------------

const KEYS = {
  coins: 'portfolio:coins',
  projects: 'portfolio:projects',
  highScore: 'portfolio:highScore',
  hasPlayed: 'portfolio:hasPlayed',
} as const

const PROGRESS_EVENT = 'portfolio:progress'

export type GameProgress = {
  coinsCollected: number
  discoveredProjects: string[]
  highScore: number | null
  hasPlayed: boolean
}

const EMPTY: GameProgress = {
  coinsCollected: 0,
  discoveredProjects: [],
  highScore: null,
  hasPlayed: false,
}

function readNumber(key: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const n = Number.parseInt(raw, 10)
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function readJsonArray(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

function readBool(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function readProgress(): GameProgress {
  return {
    coinsCollected: readNumber(KEYS.coins),
    discoveredProjects: readJsonArray(KEYS.projects),
    highScore: (() => {
      if (typeof window === 'undefined') return null
      try {
        const raw = localStorage.getItem(KEYS.highScore)
        if (!raw) return null
        const n = Number.parseInt(raw, 10)
        return Number.isFinite(n) ? n : null
      } catch {
        return null
      }
    })(),
    hasPlayed: readBool(KEYS.hasPlayed),
  }
}

function emitChange() {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT))
  } catch {
    // CustomEvent unavailable — silent.
  }
}

function markPlayed() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEYS.hasPlayed, '1')
  } catch {
    // Safari private mode — silent.
  }
}

/**
 * Reads game progress from localStorage. Subscribes to changes within
 * the current tab (custom event) and across tabs (`storage` event).
 *
 * Returns `EMPTY` on first render so SSR markup matches client first
 * paint; the real values arrive after the mount `useEffect`.
 */
export function useGameProgress(): GameProgress {
  const [progress, setProgress] = useState<GameProgress>(EMPTY)

  useEffect(() => {
    setProgress(readProgress())

    const handler = () => setProgress(readProgress())
    window.addEventListener(PROGRESS_EVENT, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(PROGRESS_EVENT, handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return progress
}

/**
 * Increment the persisted coin count by 1. Idempotency is the caller's
 * responsibility (the game already dedupes via its `collectedCoins` set,
 * so it should call this once per unique pickup).
 */
export function recordCoin(): void {
  if (typeof window === 'undefined') return
  try {
    const current = readNumber(KEYS.coins)
    localStorage.setItem(KEYS.coins, String(current + 1))
    markPlayed()
    emitChange()
  } catch {
    // Safari private mode — silent.
  }
}

/**
 * Mark a project as discovered. Safe to call repeatedly with the same
 * id — duplicates are dropped.
 */
export function recordProject(id: string): void {
  if (typeof window === 'undefined') return
  if (!id) return
  try {
    const current = readJsonArray(KEYS.projects)
    if (current.includes(id)) {
      markPlayed()
      return
    }
    const next = [...current, id]
    localStorage.setItem(KEYS.projects, JSON.stringify(next))
    markPlayed()
    emitChange()
  } catch {
    // Safari private mode — silent.
  }
}

/**
 * Persist a high score. Only writes when `n` exceeds the stored value
 * (or no value is stored yet). Negative or non-finite inputs are ignored.
 */
export function setHighScore(n: number): void {
  if (typeof window === 'undefined') return
  if (!Number.isFinite(n) || n < 0) return
  try {
    const raw = localStorage.getItem(KEYS.highScore)
    const current = raw ? Number.parseInt(raw, 10) : -Infinity
    if (n > current) {
      localStorage.setItem(KEYS.highScore, String(Math.floor(n)))
      markPlayed()
      emitChange()
    } else {
      markPlayed()
    }
  } catch {
    // Safari private mode — silent.
  }
}
