import React from 'react';

export interface BushSpriteProps {
  x: number;
  y: number;
  width: number;
  height: number;
  variant: 'single' | 'double' | 'triple';
  className?: string;
}

export default function BushSprite({
  x,
  y,
  width,
  height,
  variant,
  className = ''
}: BushSpriteProps) {
  const getBushStyles = () => {
    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  const getBushConfig = () => {
    switch (variant) {
      case 'single':
        return { bushCount: 1, spacing: 0 };
      case 'double':
        return { bushCount: 2, spacing: width * 0.1 };
      case 'triple':
        return { bushCount: 3, spacing: width * 0.05 };
      default:
        return { bushCount: 1, spacing: 0 };
    }
  };

  const renderSingleBush = (bushX: number, bushWidth: number, bushHeight: number, key?: string | number) => {
    const bushColor = '#228b22';
    const darkBushColor = '#006400';
    const lightBushColor = '#32cd32';
    
    return (
      <g key={key} transform={`translate(${bushX}, 0)`}>
        {/* Main bush body - rounded rectangle */}
        <rect 
          x="0" 
          y={bushHeight * 0.3} 
          width={bushWidth} 
          height={bushHeight * 0.7} 
          fill={bushColor}
          stroke={darkBushColor}
          strokeWidth="2"
          rx={bushWidth * 0.3}
          ry={bushHeight * 0.2}
        />
        
        {/* Bush bumps/foliage clusters */}
        {Array.from({length: 5}, (_, i) => {
          const bumpX = bushWidth * 0.1 + (bushWidth * 0.8 / 4) * i;
          const bumpY = bushHeight * 0.2 + Math.sin((i / 4) * Math.PI) * bushHeight * 0.1;
          const bumpSize = bushWidth * 0.15 + (i === 2 ? bushWidth * 0.05 : 0); // Center bump slightly larger
          
          return (
            <ellipse 
              key={i}
              cx={bumpX} 
              cy={bumpY} 
              rx={bumpSize} 
              ry={bumpSize * 0.8} 
              fill={i % 2 === 0 ? lightBushColor : bushColor}
              stroke={darkBushColor}
              strokeWidth="1"
            />
          );
        })}
        
        {/* Leaves/texture details */}
        {Array.from({length: 6}, (_, i) => {
          const leafX = bushWidth * 0.15 + Math.random() * bushWidth * 0.7;
          const leafY = bushHeight * 0.35 + Math.random() * bushHeight * 0.4;
          const leafAngle = Math.random() * 360;
          
          return (
            <g key={`leaf-${i}`} transform={`translate(${leafX}, ${leafY}) rotate(${leafAngle})`}>
              <ellipse 
                cx="0" 
                cy="0" 
                rx="2" 
                ry="4" 
                fill={darkBushColor}
                opacity="0.6"
              />
            </g>
          );
        })}
        
        {/* Highlights for 3D effect */}
        <ellipse 
          cx={bushWidth * 0.3} 
          cy={bushHeight * 0.35} 
          rx={bushWidth * 0.1} 
          ry={bushHeight * 0.08} 
          fill={lightBushColor}
          opacity="0.7"
        />
        
        <ellipse 
          cx={bushWidth * 0.7} 
          cy={bushHeight * 0.4} 
          rx={bushWidth * 0.08} 
          ry={bushHeight * 0.06} 
          fill={lightBushColor}
          opacity="0.5"
        />
        
        {/* Shadow at base */}
        <ellipse 
          cx={bushWidth * 0.5} 
          cy={bushHeight * 0.95} 
          rx={bushWidth * 0.4} 
          ry={bushHeight * 0.05} 
          fill={darkBushColor}
          opacity="0.4"
        />
      </g>
    );
  };

  const renderBushSVG = () => {
    const { bushCount, spacing } = getBushConfig();
    const bushWidth = (width - spacing * (bushCount - 1)) / bushCount;
    
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges',
        }}
      >
        {Array.from({length: bushCount}, (_, i) => {
          const bushX = i * (bushWidth + spacing);
          // Vary heights slightly for natural look
          const heightVariation = i % 2 === 0 ? 1 : 0.9;
          const adjustedHeight = height * heightVariation;
          const yOffset = height - adjustedHeight;
          
          return (
            <g key={i} transform={`translate(0, ${yOffset})`}>
              {renderSingleBush(bushX, bushWidth, adjustedHeight, i)}
            </g>
          );
        })}
        
        {/* Ground connection for multiple bushes */}
        {bushCount > 1 && (
          <rect 
            x="0" 
            y={height * 0.85} 
            width={width} 
            height={height * 0.15} 
            fill="#228b22"
            opacity="0.3"
          />
        )}
      </svg>
    );
  };

  return (
    <div
      className={`sprite sprite-pixel-perfect ${className}`}
      style={getBushStyles()}
    >
      {renderBushSVG()}
    </div>
  );
}