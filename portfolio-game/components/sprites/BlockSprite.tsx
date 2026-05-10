export interface BlockSpriteProps {
  x: number
  y: number
  width: number
  height: number
  type: 'brick' | 'question' | 'solid' | 'invisible'
  hit?: boolean      // Recently hit state
  empty?: boolean    // Question block exhausted
  className?: string
}

export default function BlockSprite({
  x,
  y,
  width,
  height,
  type,
  hit = false,
  empty = false,
  className = ''
}: BlockSpriteProps) {
  const getColor = () => {
    if (type === 'invisible') return 'transparent'
    if (empty) return '#8B5CF6' // Purple for empty
    
    switch (type) {
      case 'brick': return '#DC2626' // Red brick
      case 'question': return '#F59E0B' // Amber question
      case 'solid': return '#374151' // Gray solid
      default: return '#6B7280'
    }
  }

  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: getColor(),
    border: type !== 'invisible' ? '2px solid #000' : 'none',
    borderRadius: '2px',
    transform: hit ? 'translateY(-2px)' : 'translateY(0)',
    transition: 'all 0.1s ease',
  }

  const content = type === 'question' && !empty ? '?' : ''

  return (
    <div 
      className={className}
      style={style}
      data-type={type}
      data-hit={hit}
      data-empty={empty}
    >
      {content && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          fontSize: `${Math.min(width, height) * 0.6}px`,
          fontWeight: 'bold',
          color: '#000'
        }}>
          {content}
        </div>
      )}
    </div>
  )
}