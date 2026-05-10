export interface PipeSpriteProps {
  x: number
  y: number
  width: number
  height: number
  variant: 'small' | 'medium' | 'large'
  direction?: 'up' | 'down' | 'left' | 'right'
  enterable?: boolean
  className?: string
}

export default function PipeSprite({
  x,
  y,
  width,
  height,
  variant,
  direction = 'up',
  enterable = false,
  className = ''
}: PipeSpriteProps) {
  const getColor = () => {
    switch (variant) {
      case 'small': return '#059669' // Emerald
      case 'medium': return '#047857' // Emerald dark
      case 'large': return '#065F46' // Emerald darker
      default: return '#10B981'
    }
  }

  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: getColor(),
    border: '3px solid #064E3B',
    borderRadius: direction === 'up' || direction === 'down' ? '8px 8px 0 0' : '8px 0 0 8px',
    transform: `rotate(${
      direction === 'down' ? '180deg' :
      direction === 'left' ? '270deg' :
      direction === 'right' ? '90deg' : '0deg'
    })`,
    boxShadow: enterable ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none',
  }

  return (
    <div 
      className={className}
      style={style}
      data-variant={variant}
      data-direction={direction}
      data-enterable={enterable}
    >
      {/* Pipe opening highlight */}
      <div style={{
        position: 'absolute',
        top: '4px',
        left: '4px',
        right: '4px',
        height: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '4px 4px 0 0',
      }} />
    </div>
  )
}