import React from 'react';

export interface CoinSpriteProps {
  x: number;
  y: number;
  size: number;
  spinning?: boolean;
  collected?: boolean;
  className?: string;
}

export default function CoinSprite({
  x,
  y,
  size,
  spinning = true,
  collected = false,
  className = ''
}: CoinSpriteProps) {
  const getCoinStyles = () => {
    const baseStyles = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
    };

    let animation = 'none';
    if (collected) {
      animation = 'sprite-collect-fade var(--sprite-collect-fade) ease-out forwards';
    } else if (spinning) {
      animation = 'sprite-coin-spin var(--sprite-coin-spin) linear infinite';
    }

    return {
      ...baseStyles,
      animation,
    };
  };

  const renderCoinSVG = () => {
    const coinColor = '#ffd700';
    const coinHighlight = '#ffff99';
    const coinShadow = '#b8860b';
    const coinDark = '#daa520';
    
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges',
        }}
      >
        {/* Drop shadow */}
        <ellipse 
          cx={size * 0.5 + 2} 
          cy={size * 0.5 + 2} 
          rx={size * 0.45} 
          ry={size * 0.45} 
          fill="rgba(0,0,0,0.3)"
        />
        
        {/* Main coin body */}
        <ellipse 
          cx={size * 0.5} 
          cy={size * 0.5} 
          rx={size * 0.45} 
          ry={size * 0.45} 
          fill={coinColor}
          stroke={coinShadow}
          strokeWidth="2"
        />
        
        {/* Outer rim highlight */}
        <ellipse 
          cx={size * 0.5} 
          cy={size * 0.5} 
          rx={size * 0.4} 
          ry={size * 0.4} 
          fill="none"
          stroke={coinHighlight}
          strokeWidth="1"
        />
        
        {/* Inner rim shadow */}
        <ellipse 
          cx={size * 0.5} 
          cy={size * 0.5} 
          rx={size * 0.35} 
          ry={size * 0.35} 
          fill="none"
          stroke={coinDark}
          strokeWidth="1"
        />
        
        {/* Center symbol - Mario-style star */}
        <g transform={`translate(${size * 0.5}, ${size * 0.5}) scale(${size * 0.015})`}>
          <path
            d="M0,-12 L3.5,-3.5 L12,0 L3.5,3.5 L0,12 L-3.5,3.5 L-12,0 L-3.5,-3.5 Z"
            fill={coinShadow}
            stroke={coinDark}
            strokeWidth="1"
          />
          {/* Inner star highlight */}
          <path
            d="M0,-8 L2.5,-2.5 L8,0 L2.5,2.5 L0,8 L-2.5,2.5 L-8,0 L-2.5,-2.5 Z"
            fill={coinHighlight}
          />
        </g>
        
        {/* Coin surface highlights for 3D effect */}
        <ellipse 
          cx={size * 0.35} 
          cy={size * 0.35} 
          rx={size * 0.15} 
          ry={size * 0.1} 
          fill={coinHighlight}
          opacity="0.7"
        />
        
        {/* Additional small highlights */}
        <ellipse 
          cx={size * 0.7} 
          cy={size * 0.3} 
          rx={size * 0.05} 
          ry={size * 0.03} 
          fill={coinHighlight}
          opacity="0.5"
        />
        
        <ellipse 
          cx={size * 0.25} 
          cy={size * 0.7} 
          rx={size * 0.03} 
          ry={size * 0.03} 
          fill={coinHighlight}
          opacity="0.6"
        />
        
        {/* Coin edge ridges for texture */}
        {Array.from({length: 8}, (_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const x1 = size * 0.5 + Math.cos(angle) * size * 0.4;
          const y1 = size * 0.5 + Math.sin(angle) * size * 0.4;
          const x2 = size * 0.5 + Math.cos(angle) * size * 0.45;
          const y2 = size * 0.5 + Math.sin(angle) * size * 0.45;
          
          return (
            <line 
              key={i}
              x1={x1} 
              y1={y1} 
              x2={x2} 
              y2={y2} 
              stroke={coinDark} 
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div
      className={`sprite sprite-pixel-perfect ${collected ? 'sprite-collecting' : ''} ${className}`}
      style={getCoinStyles()}
    >
      {renderCoinSVG()}
    </div>
  );
}