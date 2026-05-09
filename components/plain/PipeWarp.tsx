'use client'

import { useState } from 'react'
import PipeSprite from './PipeSprite'
import { playSound } from '@/lib/audio'

type Props = {
  onSwitch: () => void
  className?: string
}

/**
 * Pipe sprite link that triggers the warp transition then switches mode.
 * Reduced-motion path is short-circuited by globals.css forcing animation
 * durations to ~0ms; the green panel is still present but covers/uncovers
 * instantly.
 */
export default function PipeWarp({ onSwitch, className = '' }: Props) {
  const [warping, setWarping] = useState(false)

  const handleClick = () => {
    if (warping) return
    setWarping(true)
    try {
      playSound('pipe-enter')
    } catch {}
    // Match the 350ms warp-cover duration from content.css
    window.setTimeout(() => {
      onSwitch()
    }, 350)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`group inline-flex items-center gap-2 text-ink hover:text-pipe-deep transition-colors duration-200 ease-out-quart ${className}`}
        aria-label="Switch to game mode"
      >
        <span className="anim-bob">
          <PipeSprite size={28} compact />
        </span>
        <span className="font-mono text-[0.78rem] uppercase tracking-[0.12em] text-ink-soft group-hover:text-pipe-deep transition-colors">
          Try the Mario mode
        </span>
        <span aria-hidden className="text-pipe-deep transition-transform duration-200 group-hover:translate-x-0.5">
          →
        </span>
      </button>

      {warping && (
        <div
          aria-hidden
          className="fixed inset-0 z-[100] anim-warp-cover"
          style={{ background: 'var(--pipe)' }}
        >
          <div className="flex h-full items-center justify-center">
            <PipeSprite size={96} />
          </div>
        </div>
      )}
    </>
  )
}
