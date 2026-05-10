export interface CloudSpriteProps {
  x: number
  y: number
  width: number
  height: number
  variant: 'small' | 'medium' | 'large'
  opacity?: number   // 0-1
  className?: string
}

export default function CloudSprite({
  x,
  y,
  width,
  height,
  variant,
  opacity = 0.8,
  className = ''
}: CloudSpriteProps) {
  const getSize = () => {
    switch (variant) {
      case 'small': return 0.7
      case 'medium': return 1.0
      case 'large': return 1.3
      default: return 1.0
    }
  }

  const sizeMultiplier = getSize()
  const cloudWidth = width * sizeMultiplier
  const cloudHeight = height * sizeMultiplier

  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    width: `${cloudWidth}px`,
    height: `${cloudHeight}px`,
    opacity,
  }

  return (
    <div 
      className={className}
      style={style}
      data-variant={variant}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 100 60"
        style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' }}
      >
        <path
          d="M20,40 Q10,25 25,25 Q20,10 35,10 Q50,5 65,10 Q80,10 75,25 Q90,25 80,40 Z"
          fill="#FFFFFF"
          stroke="#E5E7EB"
          strokeWidth="1"
        />
        {/* Cloud highlights */}
        <ellipse cx="30" cy="25" rx="8" ry="6" fill="rgba(255,255,255,0.8)" />
        <ellipse cx="50" cy="20" rx="10" ry="7" fill="rgba(255,255,255,0.6)" />
        <ellipse cx="65" cy="25" rx="7" ry="5" fill="rgba(255,255,255,0.7)" />
      </svg>
    </div>
  )
}