'use client'

import { useState, useEffect } from 'react'
import ContentMode from './content-mode/ContentMode'
import GameMode from './game-mode/GameMode'
import { getModePreference, setModePreference } from '@/lib/mode-toggle'

export default function Page() {
  const [mode, setMode] = useState<'content' | 'game'>('game')
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Load saved preference
    setMode(getModePreference())
    
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
      if (e.matches && mode === 'game') {
        setMode('content')
        setModePreference('content')
      }
    }
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [mode])

  const toggleMode = () => {
    if (prefersReducedMotion && mode === 'content') {
      // Don't allow game mode with reduced motion
      alert('Game mode disabled: prefers-reduced-motion is enabled')
      return
    }
    
    const newMode = mode === 'content' ? 'game' : 'content'
    setMode(newMode)
    setModePreference(newMode)
  }

  return (
    <div className="min-h-screen">
      {/* Mode toggle button - always visible */}
      <button
        onClick={toggleMode}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-lg"
        aria-label={`Switch to ${mode === 'content' ? 'game' : 'content'} mode`}
        disabled={prefersReducedMotion && mode === 'content'}
      >
        {mode === 'content' ? '🎮 Game Mode' : '📄 Content Mode'}
      </button>

      {/* Render active mode */}
      {mode === 'content' ? <ContentMode /> : <GameMode />}
    </div>
  )
}