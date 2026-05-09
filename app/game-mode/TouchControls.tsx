'use client'

import { InputHandler } from '@/lib/game-engine/input'

interface TouchControlsProps {
  inputHandler: InputHandler | null
}

export default function TouchControls({ inputHandler }: TouchControlsProps) {
  if (!inputHandler) return null

  const buttonStyle = {
    position: 'absolute' as const,
    width: '60px',
    height: '60px',
    border: '2px solid #fff',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none' as const,
    touchAction: 'manipulation' as const,
  }

  const handleTouchStart = (input: string) => {
    switch (input) {
      case 'left':
        inputHandler.setTouchState({ left: true })
        break
      case 'right':
        inputHandler.setTouchState({ right: true })
        break
      case 'jump':
        inputHandler.setTouchState({ jump: true })
        break
      case 'run':
        inputHandler.setTouchState({ run: true })
        break
    }
  }

  const handleTouchEnd = (input: string) => {
    switch (input) {
      case 'left':
        inputHandler.setTouchState({ left: false })
        break
      case 'right':
        inputHandler.setTouchState({ right: false })
        break
      case 'jump':
        inputHandler.setTouchState({ jump: false })
        break
      case 'run':
        inputHandler.setTouchState({ run: false })
        break
    }
  }

  return (
    <>
      {/* Left movement button */}
      <div
        style={{
          ...buttonStyle,
          bottom: '20px',
          left: '20px',
        }}
        onTouchStart={() => handleTouchStart('left')}
        onTouchEnd={() => handleTouchEnd('left')}
        onMouseDown={() => handleTouchStart('left')}
        onMouseUp={() => handleTouchEnd('left')}
      >
        ←
      </div>

      {/* Right movement button */}
      <div
        style={{
          ...buttonStyle,
          bottom: '20px',
          left: '100px',
        }}
        onTouchStart={() => handleTouchStart('right')}
        onTouchEnd={() => handleTouchEnd('right')}
        onMouseDown={() => handleTouchStart('right')}
        onMouseUp={() => handleTouchEnd('right')}
      >
        →
      </div>

      {/* Jump button */}
      <div
        style={{
          ...buttonStyle,
          bottom: '20px',
          right: '100px',
          fontSize: '16px',
        }}
        onTouchStart={() => handleTouchStart('jump')}
        onTouchEnd={() => handleTouchEnd('jump')}
        onMouseDown={() => handleTouchStart('jump')}
        onMouseUp={() => handleTouchEnd('jump')}
      >
        JUMP
      </div>

      {/* Run button */}
      <div
        style={{
          ...buttonStyle,
          bottom: '20px',
          right: '20px',
          fontSize: '16px',
        }}
        onTouchStart={() => handleTouchStart('run')}
        onTouchEnd={() => handleTouchEnd('run')}
        onMouseDown={() => handleTouchStart('run')}
        onMouseUp={() => handleTouchEnd('run')}
      >
        RUN
      </div>

      {/* D-pad style container for left/right */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          width: '180px',
          height: '80px',
          pointerEvents: 'none',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '10px',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
      />

      {/* Action buttons container */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          width: '180px',
          height: '80px',
          pointerEvents: 'none',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '10px',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
      />
    </>
  )
}