'use client'

import { useEffect, useState } from 'react'
import { setTouch, type TouchButton } from '@/lib/game-engine/input'

interface TouchControlsProps {
  // Required for active callers. Optional only because the dead
  // `MarioGame.tsx` (deleted by opt/perf) doesn't pass it; once that file
  // is gone, tighten this to required.
  onInteract?: () => void
  // Accepted-but-ignored. Same back-compat reason as above.
  inputHandler?: unknown
}

const HIT_PX = 64

const styleSheet = `
  .tc-btn:focus { outline: none; }
  .tc-btn:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
  .tc-btn:active, .tc-btn[data-pressed='true'] {
    transform: scale(0.92);
    background: rgba(255, 255, 255, 0.25);
  }
`

function isTouchCapable(): boolean {
  if (typeof window === 'undefined') return false
  if ('ontouchstart' in window) return true
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true
  return false
}

function holdHandlers(button: TouchButton) {
  return {
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      e.currentTarget.dataset.pressed = 'true'
      setTouch(button, true)
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {}
      e.currentTarget.dataset.pressed = 'false'
      setTouch(button, false)
    },
    onPointerCancel: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.dataset.pressed = 'false'
      setTouch(button, false)
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  }
}

export default function TouchControls({ onInteract }: TouchControlsProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(isTouchCapable())
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: coarse)')
    const onChange = () => setShow(isTouchCapable())
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (!show) return null

  const baseBtn: React.CSSProperties = {
    width: HIT_PX,
    height: HIT_PX,
    border: '2px solid rgba(255, 255, 255, 0.85)',
    borderRadius: HIT_PX / 2,
    background: 'rgba(0, 0, 0, 0.45)',
    color: '#fff',
    fontFamily: '"Press Start 2P", monospace',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'none',
    pointerEvents: 'auto',
    transition: 'transform 80ms ease-out, background 80ms ease-out',
    padding: 0,
  }

  const wrapper: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1500,
  }

  return (
    <>
      <style>{styleSheet}</style>
      <div style={wrapper} aria-hidden>
        {/* D-pad: left + right at bottom-left */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Move left"
          className="tc-btn"
          style={{ ...baseBtn, position: 'absolute', left: 24, bottom: 96 }}
          {...holdHandlers('left')}
        >
          ←
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Move right"
          className="tc-btn"
          style={{ ...baseBtn, position: 'absolute', left: 24 + HIT_PX + 16, bottom: 96 }}
          {...holdHandlers('right')}
        >
          →
        </button>

        {/* Action stack: jump (B) + interact (A) at bottom-right */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Jump"
          className="tc-btn"
          style={{
            ...baseBtn,
            position: 'absolute',
            right: 24 + HIT_PX + 16,
            bottom: 96,
            fontSize: 14,
          }}
          {...holdHandlers('jump')}
        >
          B
        </button>
        <button
          type="button"
          tabIndex={-1}
          aria-label="Advance text"
          className="tc-btn"
          style={{
            ...baseBtn,
            position: 'absolute',
            right: 24,
            bottom: 96 + HIT_PX + 16,
            fontSize: 14,
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            e.currentTarget.setPointerCapture(e.pointerId)
            e.currentTarget.dataset.pressed = 'true'
            setTouch('interact', true)
            onInteract?.()
          }}
          onPointerUp={(e) => {
            e.preventDefault()
            try {
              e.currentTarget.releasePointerCapture(e.pointerId)
            } catch {}
            e.currentTarget.dataset.pressed = 'false'
            setTouch('interact', false)
          }}
          onPointerCancel={(e) => {
            e.currentTarget.dataset.pressed = 'false'
            setTouch('interact', false)
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          A
        </button>
      </div>
    </>
  )
}
