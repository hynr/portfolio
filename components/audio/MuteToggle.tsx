'use client'

import React, { useState, useEffect } from 'react'
import { getMuted, setMuted, playSound } from '@/lib/audio'

interface MuteToggleProps {
  className?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export default function MuteToggle({ 
  className = '', 
  position = 'top-right' 
}: MuteToggleProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    setIsMuted(getMuted())
  }, [])
  
  const handleToggle = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    setMuted(newMutedState)
    
    if (!newMutedState) {
      setTimeout(() => {
        playSound('coin')
      }, 100)
    }
  }
  
  const positionStyles = {
    'top-left': { top: '1rem', left: '1rem' },
    'top-right': { top: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' },
  }
  
  const buttonStyle: React.CSSProperties = {
    position: 'fixed',
    ...positionStyles[position],
    zIndex: 9999,
    backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
    boxShadow: isHovered 
      ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
      : '0 2px 8px rgba(0, 0, 0, 0.3)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    userSelect: 'none',
  }
  
  const iconStyle: React.CSSProperties = {
    fontSize: '24px',
    display: 'inline-block',
  }
  
  const textStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
  }
  
  return (
    <button
      className={className}
      style={buttonStyle}
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
      title={isMuted ? 'Click to unmute' : 'Click to mute'}
    >
      <span style={iconStyle} role="img" aria-hidden="true">
        {isMuted ? '🔇' : '🔊'}
      </span>
      <span style={textStyle}>
        {isMuted ? 'Muted' : 'Sound'}
      </span>
    </button>
  )
}