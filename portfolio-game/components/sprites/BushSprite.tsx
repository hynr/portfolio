export interface BushSpriteProps {
  x: number
  y: number  
  width: number
  height: number
  variant: 'single' | 'double' | 'triple'
  className?: string
}

export default function BushSprite({
  x,
  y,
  width,
  height,
  variant,
  className = ''
}: BushSpriteProps) {
  const getColor = () => '#22C55E' // Green

  const getBushCount = () => {
    switch (variant) {
      case 'single': return 1
      case 'double': return 2
      case 'triple': return 3
      default: return 1
    }
  }

  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  }

  const bushCount = getBushCount()
  const bushWidth = width / bushCount
  const bushes = []

  for (let i = 0; i < bushCount; i++) {
    const bushX = i * bushWidth
    bushes.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${bushX}px`,
          top: '0',
          width: `${bushWidth}px`,
          height: `${height}px`,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 60 40">
          <ellipse 
            cx="30" 
            cy="35" 
            rx="28" 
            ry="15" 
            fill={getColor()}
            stroke="#16A34A"
            strokeWidth="2"
          />
          {/* Bush texture */}
          <ellipse cx="20" cy="30" rx="8" ry="6" fill="#16A34A" />
          <ellipse cx="40" cy="28" rx="10" ry="8" fill="#16A34A" />
          <ellipse cx="30" cy="25" rx="12" ry="9" fill="#15803D" />
          {/* Highlights */}
          <ellipse cx="25" cy="22" rx="4" ry="3" fill="#4ADE80" />
          <ellipse cx="38" cy="24" rx="5" ry="4" fill="#4ADE80" />
        </svg>
      </div>
    )
  }

  return (
    <div 
      className={className}
      style={style}
      data-variant={variant}
    >
      {bushes}
    </div>
  )
}