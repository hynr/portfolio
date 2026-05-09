'use client'

import React, { useState } from 'react'
import PipeSprite, { PipeSpriteProps } from '@/components/sprites/PipeSprite'
import { handlePipeClick, getPipeLinkLabel, PipeLink } from '@/lib/navigation'

interface InteractivePipeSpriteProps extends PipeSpriteProps {
  linkTo?: PipeLink
}

export default function InteractivePipeSprite({
  linkTo,
  ...pipeSpriteProps
}: InteractivePipeSpriteProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const isClickable = Boolean(linkTo)
  const ariaLabel = linkTo ? getPipeLinkLabel(linkTo) : undefined
  
  const handleClick = () => {
    if (linkTo) {
      handlePipeClick(linkTo)
    }
  }
  
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: pipeSpriteProps.x,
    top: pipeSpriteProps.y,
    width: pipeSpriteProps.width,
    height: pipeSpriteProps.height,
    cursor: isClickable ? 'pointer' : 'default',
    transform: isHovered && isClickable ? 'scale(1.05)' : 'scale(1)',
    transformOrigin: 'center bottom',
    transition: 'transform 0.2s ease-out',
  }
  
  return (
    <div
      style={containerStyle}
      onClick={isClickable ? handleClick : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <PipeSprite {...pipeSpriteProps} />
        {isHovered && isClickable && (
          <div
            style={{
              position: 'absolute',
              bottom: '110%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 1000,
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {getPipeLinkLabel(linkTo)}
          </div>
        )}
      </div>
    </div>
  )
}