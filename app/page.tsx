'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import ContentMode from './content-mode/ContentMode'
import { setModePreference } from '@/lib/mode-toggle'

const GameMode = dynamic(() => import('./game-mode/GameMode'), {
  ssr: false,
  loading: () => (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#5C94FC] text-white"
      style={{ fontFamily: '"Press Start 2P", monospace' }}
      aria-busy="true"
      aria-label="Loading game mode"
    >
      <div className="text-xs tracking-widest">LOADING…</div>
    </div>
  ),
})

export default function Page() {
  // Always start on content. Game mode is reachable only by clicking the
  // pipe within a session — never sticky across reloads.
  const [mode, setMode] = useState<'content' | 'game'>('content')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // One-shot setup: read reduced-motion preference and listen for changes.
  // Mode is intentionally NOT a dependency — re-running this on every mode
  // change would tear down the freshly mounted GameMode.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
      if (e.matches) {
        setMode((current) => {
          if (current === 'game') {
            setModePreference('content')
            return 'content'
          }
          return current
        })
      }
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const toggleMode = () => {
    if (prefersReducedMotion && mode === 'content') {
      alert('Game mode disabled while prefers-reduced-motion is enabled.')
      return
    }
    const newMode = mode === 'content' ? 'game' : 'content'
    setMode(newMode)
    setModePreference(newMode)
  }

  return (
    <div className="min-h-screen">
      {/* Game-mode shows a small return-to-content toggle.
          Content-mode owns its own pipe link in <Nav />. */}
      {mode === 'game' && (
        <button
          onClick={toggleMode}
          className="fixed top-4 right-4 z-50 px-3 py-2 bg-surface text-ink text-xs font-mono uppercase tracking-[0.12em] border border-rule rounded shadow-sm hover:bg-surface-soft transition-colors"
          aria-label="Switch to content mode"
        >
          Content mode
        </button>
      )}

      {mode === 'content' ? (
        <ContentMode onSwitchMode={toggleMode} />
      ) : (
        <GameMode />
      )}
    </div>
  )
}
