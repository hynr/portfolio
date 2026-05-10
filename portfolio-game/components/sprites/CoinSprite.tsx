export interface CoinSpriteProps {
  x: number
  y: number
  size: number       // Width and height (square)
  spinning?: boolean
  collected?: boolean
  className?: string
}

export default function CoinSprite({
  x,
  y,
  size,
  spinning = true,
  collected = false,
  className = ''
}: CoinSpriteProps) {
  if (collected) return null

  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: '#F59E0B', // Gold
    border: '2px solid #D97706',
    borderRadius: '50%',
    animation: spinning ? 'coin-spin 1s linear infinite' : 'none',
    boxShadow: '0 0 8px rgba(245, 158, 11, 0.5)',
  }

  return (
    <div 
      className={`${className} game-sprite`}
      style={style}
      data-spinning={spinning}
      data-collected={collected}
    />
  )
}