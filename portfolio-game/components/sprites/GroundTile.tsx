export interface GroundTileProps {
  x: number
  y: number
  width: number
  height: number
  type: 'grass' | 'dirt' | 'stone'
  pattern?: 'top' | 'middle' | 'bottom'
  className?: string
}

export default function GroundTile({
  x,
  y,
  width,
  height,
  type,
  pattern = 'middle',
  className = ''
}: GroundTileProps) {
  const getColor = () => {
    switch (type) {
      case 'grass': 
        return pattern === 'top' ? '#22C55E' : '#16A34A' // Green
      case 'dirt': 
        return pattern === 'top' ? '#A16207' : '#92400E' // Brown
      case 'stone': 
        return pattern === 'top' ? '#6B7280' : '#4B5563' // Gray
      default: return '#6B7280'
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case 'grass': return '#15803D'
      case 'dirt': return '#78350F'
      case 'stone': return '#374151'
      default: return '#374151'
    }
  }

  const style = {
    position: 'absolute' as const,
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: getColor(),
    border: `2px solid ${getBorderColor()}`,
    borderTop: pattern === 'top' ? `3px solid ${getBorderColor()}` : undefined,
  }

  // Add texture dots for realism
  const textureSpots = []
  if (pattern === 'top' && type === 'grass') {
    // Add grass blades
    for (let i = 0; i < 3; i++) {
      const spotX = (i + 1) * (width / 4)
      textureSpots.push(
        <div
          key={`grass-${i}`}
          style={{
            position: 'absolute',
            left: `${spotX}px`,
            top: '2px',
            width: '2px',
            height: '6px',
            backgroundColor: '#15803D',
            borderRadius: '1px',
          }}
        />
      )
    }
  } else if (type === 'dirt' || type === 'stone') {
    // Add texture spots
    for (let i = 0; i < 2; i++) {
      const spotX = (i + 1) * (width / 3)
      const spotY = pattern === 'top' ? height / 3 : height / 2
      textureSpots.push(
        <div
          key={`spot-${i}`}
          style={{
            position: 'absolute',
            left: `${spotX}px`,
            top: `${spotY}px`,
            width: '3px',
            height: '3px',
            backgroundColor: getBorderColor(),
            borderRadius: '50%',
            opacity: 0.6,
          }}
        />
      )
    }
  }

  return (
    <div 
      className={className}
      style={style}
      data-type={type}
      data-pattern={pattern}
    >
      {textureSpots}
    </div>
  )
}