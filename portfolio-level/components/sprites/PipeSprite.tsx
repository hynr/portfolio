import React from 'react';

export interface PipeSpriteProps {
  x: number;
  y: number;
  width: number;
  height: number;
  variant: 'small' | 'medium' | 'large';
  direction?: 'up' | 'down' | 'left' | 'right';
  enterable?: boolean;
  className?: string;
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
  const getPipeStyles = () => {
    const baseStyles = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    };

    // Apply rotation based on direction
    const rotationMap = {
      up: '0deg',
      right: '90deg',
      down: '180deg',
      left: '270deg'
    };

    const transform = `rotate(${rotationMap[direction]})`;

    return {
      ...baseStyles,
      transform,
      transformOrigin: 'center center',
    };
  };

  const getSizeMultiplier = () => {
    switch (variant) {
      case 'small':
        return 0.75;
      case 'medium':
        return 1;
      case 'large':
        return 1.5;
      default:
        return 1;
    }
  };

  const renderPipeSVG = () => {
    const sizeMultiplier = getSizeMultiplier();
    const pipeColor = '#32cd32';
    const darkPipeColor = '#228b22';
    const rimColor = '#90EE90';
    
    // Adjust dimensions based on size
    const pipeWidth = width;
    const pipeHeight = height;
    const rimHeight = Math.max(8, pipeHeight * 0.15); // Top rim height
    const pipeBodyHeight = pipeHeight - rimHeight;

    return (
      <svg
        width={pipeWidth}
        height={pipeHeight}
        viewBox={`0 0 ${pipeWidth} ${pipeHeight}`}
        style={{
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges',
        }}
      >
        {/* Main pipe body */}
        <rect 
          x="0" 
          y={rimHeight} 
          width={pipeWidth} 
          height={pipeBodyHeight} 
          fill={pipeColor} 
          stroke="#000" 
          strokeWidth="2"
        />
        
        {/* Pipe body shading */}
        <rect 
          x="2" 
          y={rimHeight + 2} 
          width="4" 
          height={pipeBodyHeight - 4} 
          fill={rimColor}
        />
        <rect 
          x={pipeWidth - 6} 
          y={rimHeight + 2} 
          width="4" 
          height={pipeBodyHeight - 4} 
          fill={darkPipeColor}
        />
        
        {/* Vertical highlight lines on pipe body */}
        {Array.from({length: 3}, (_, i) => {
          const xPos = pipeWidth * (0.25 + i * 0.25);
          return (
            <line 
              key={i}
              x1={xPos} 
              y1={rimHeight + 4} 
              x2={xPos} 
              y2={pipeHeight - 4} 
              stroke={i === 1 ? rimColor : darkPipeColor} 
              strokeWidth="1"
            />
          );
        })}
        
        {/* Top rim (wider than pipe body) */}
        <rect 
          x={-pipeWidth * 0.1} 
          y="0" 
          width={pipeWidth * 1.2} 
          height={rimHeight} 
          fill={pipeColor} 
          stroke="#000" 
          strokeWidth="2"
        />
        
        {/* Rim shading and highlights */}
        <rect 
          x={-pipeWidth * 0.1 + 2} 
          y="2" 
          width="6" 
          height={rimHeight - 4} 
          fill={rimColor}
        />
        <rect 
          x={pipeWidth * 1.1 - 8} 
          y="2" 
          width="6" 
          height={rimHeight - 4} 
          fill={darkPipeColor}
        />
        
        {/* Top rim surface (elliptical) */}
        <ellipse 
          cx={pipeWidth * 0.5} 
          cy="2" 
          rx={pipeWidth * 0.55} 
          ry="3" 
          fill={rimColor}
          stroke={darkPipeColor}
          strokeWidth="1"
        />
        
        {/* Pipe opening (dark interior) */}
        <ellipse 
          cx={pipeWidth * 0.5} 
          cy={rimHeight - 2} 
          rx={pipeWidth * 0.4} 
          ry="4" 
          fill="#000"
        />
        
        {/* Interior shadow gradient effect */}
        <ellipse 
          cx={pipeWidth * 0.5} 
          cy={rimHeight - 2} 
          rx={pipeWidth * 0.35} 
          ry="3" 
          fill="#111"
        />
        
        {enterable && (
          <>
            {/* Enterable indicator - glowing effect */}
            <ellipse 
              cx={pipeWidth * 0.5} 
              cy={rimHeight - 2} 
              rx={pipeWidth * 0.45} 
              ry="5" 
              fill="none"
              stroke="#ffff00"
              strokeWidth="2"
              opacity="0.7"
            >
              <animate 
                attributeName="opacity" 
                values="0.3;0.8;0.3" 
                dur="2s" 
                repeatCount="indefinite"
              />
            </ellipse>
            
            {/* Down arrow indicator */}
            <g transform={`translate(${pipeWidth * 0.5}, ${rimHeight + pipeBodyHeight * 0.3})`}>
              <path 
                d="M-4,-6 L0,0 L4,-6 Z" 
                fill="#ffff00"
                opacity="0.8"
              >
                <animateTransform 
                  attributeName="transform" 
                  type="translate"
                  values="0,-2; 0,2; 0,-2" 
                  dur="1.5s" 
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </>
        )}
        
        {/* Additional texture lines for larger pipes */}
        {variant === 'large' && (
          <>
            <line x1="0" y1={rimHeight + pipeBodyHeight * 0.3} x2={pipeWidth} y2={rimHeight + pipeBodyHeight * 0.3} stroke={darkPipeColor} strokeWidth="1"/>
            <line x1="0" y1={rimHeight + pipeBodyHeight * 0.6} x2={pipeWidth} y2={rimHeight + pipeBodyHeight * 0.6} stroke={darkPipeColor} strokeWidth="1"/>
          </>
        )}
      </svg>
    );
  };

  return (
    <div
      className={`sprite sprite-pixel-perfect ${className}`}
      style={getPipeStyles()}
    >
      {renderPipeSVG()}
    </div>
  );
}