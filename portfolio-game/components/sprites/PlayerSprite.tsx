export interface PlayerSpriteProps {
  x: number          // X position in pixels
  y: number          // Y position in pixels  
  width: number      // Sprite width
  height: number     // Sprite height
  state: 'idle' | 'running' | 'jumping' | 'falling' | 'crouching'
  direction: 'left' | 'right'
  frame?: number     // Animation frame index
  className?: string
}

export default function PlayerSprite({ 
  x, 
  y, 
  width, 
  height, 
  state, 
  direction,
  frame = 0,
  className = ''
}: PlayerSpriteProps) {
  const getColor = () => {
    switch (state) {
      case 'idle': return '#3B82F6' // Blue
      case 'running': return '#10B981' // Green
      case 'jumping': return '#F59E0B' // Amber
      case 'falling': return '#EF4444' // Red
      case 'crouching': return '#8B5CF6' // Purple
      default: return '#6B7280' // Gray
    }
  }

  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: getColor(),
    transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
    borderRadius: '4px',
    border: '2px solid #000',
    transition: 'background-color 0.1s ease',
  }

  return (
    <div 
      className={className}
      style={style}
      data-state={state}
      data-direction={direction}
      data-frame={frame}
    />
  )
}