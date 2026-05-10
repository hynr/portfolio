import React from 'react';

export interface BlockSpriteProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'brick' | 'question' | 'solid' | 'invisible';
  hit?: boolean;
  empty?: boolean;
  className?: string;
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
  const getBlockStyles = () => {
    const baseStyles = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    };

    let animation = 'none';
    if (hit) {
      animation = 'sprite-hit-bounce var(--sprite-hit-bounce) ease-out';
    } else if (type === 'question' && !empty) {
      animation = 'sprite-question-pulse 2s ease-in-out infinite';
    }

    return {
      ...baseStyles,
      animation,
      opacity: type === 'invisible' ? 0.1 : 1,
    };
  };

  const renderBlockSVG = () => {
    const blockSize = Math.min(width, height);
    const tileSize = blockSize / 4; // 4x4 grid for detail

    switch (type) {
      case 'brick':
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
            {/* Main brick background */}
            <rect x="0" y="0" width={width} height={height} fill="#8b4513" stroke="#000" strokeWidth="2"/>
            
            {/* Brick pattern - horizontal lines */}
            <line x1="0" y1={height/4} x2={width} y2={height/4} stroke="#654321" strokeWidth="1"/>
            <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#654321" strokeWidth="1"/>
            <line x1="0" y1={3*height/4} x2={width} y2={3*height/4} stroke="#654321" strokeWidth="1"/>
            
            {/* Brick pattern - vertical lines (staggered) */}
            <line x1={width/3} y1="0" x2={width/3} y2={height/4} stroke="#654321" strokeWidth="1"/>
            <line x1={2*width/3} y1="0" x2={2*width/3} y2={height/4} stroke="#654321" strokeWidth="1"/>
            
            <line x1={width/6} y1={height/4} x2={width/6} y2={height/2} stroke="#654321" strokeWidth="1"/>
            <line x1={width/2} y1={height/4} x2={width/2} y2={height/2} stroke="#654321" strokeWidth="1"/>
            <line x1={5*width/6} y1={height/4} x2={5*width/6} y2={height/2} stroke="#654321" strokeWidth="1"/>
            
            <line x1={width/3} y1={height/2} x2={width/3} y2={3*height/4} stroke="#654321" strokeWidth="1"/>
            <line x1={2*width/3} y1={height/2} x2={2*width/3} y2={3*height/4} stroke="#654321" strokeWidth="1"/>
            
            <line x1={width/6} y1={3*height/4} x2={width/6} y2={height} stroke="#654321" strokeWidth="1"/>
            <line x1={width/2} y1={3*height/4} x2={width/2} y2={height} stroke="#654321" strokeWidth="1"/>
            <line x1={5*width/6} y1={3*height/4} x2={5*width/6} y2={height} stroke="#654321" strokeWidth="1"/>
            
            {/* Highlight edge */}
            <rect x="2" y="2" width={width-4} height="2" fill="#a0522d"/>
            <rect x="2" y="2" width="2" height={height-4} fill="#a0522d"/>
          </svg>
        );

      case 'question':
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
            {/* Main block background */}
            <rect x="0" y="0" width={width} height={height} fill={empty ? "#8b4513" : "#ffd700"} stroke="#000" strokeWidth="2"/>
            
            {empty ? (
              // Empty question block (just brown like brick)
              <>
                <line x1="0" y1={height/4} x2={width} y2={height/4} stroke="#654321" strokeWidth="1"/>
                <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#654321" strokeWidth="1"/>
                <line x1="0" y1={3*height/4} x2={width} y2={3*height/4} stroke="#654321" strokeWidth="1"/>
              </>
            ) : (
              // Active question block
              <>
                {/* Corner rivets */}
                <circle cx="4" cy="4" r="2" fill="#ffff99"/>
                <circle cx={width-4} cy="4" r="2" fill="#ffff99"/>
                <circle cx="4" cy={height-4} r="2" fill="#ffff99"/>
                <circle cx={width-4} cy={height-4} r="2" fill="#ffff99"/>
                
                {/* Question mark */}
                <g transform={`translate(${width/2}, ${height/2})`}>
                  {/* Question mark top curve */}
                  <path d="M-6,-8 Q-6,-12 -2,-12 Q2,-12 2,-8 Q2,-4 -2,-2" 
                        fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                  {/* Question mark vertical line */}
                  <line x1="-2" y1="-2" x2="-2" y2="2" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
                  {/* Question mark dot */}
                  <circle cx="-2" cy="6" r="1.5" fill="#000"/>
                </g>
                
                {/* Highlight edges */}
                <rect x="2" y="2" width={width-4} height="2" fill="#ffff99"/>
                <rect x="2" y="2" width="2" height={height-4} fill="#ffff99"/>
              </>
            )}
          </svg>
        );

      case 'solid':
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
            {/* Main solid block */}
            <rect x="0" y="0" width={width} height={height} fill="#666666" stroke="#000" strokeWidth="2"/>
            
            {/* Stone texture pattern */}
            <rect x="2" y="2" width={width-4} height={height-4} fill="#777777"/>
            
            {/* Darker spots for texture */}
            <rect x="4" y="6" width="4" height="4" fill="#555555"/>
            <rect x={width-12} y="4" width="6" height="3" fill="#555555"/>
            <rect x="6" y={height-8} width="3" height="4" fill="#555555"/>
            <rect x={width-8} y={height-6} width="4" height="2" fill="#555555"/>
            <rect x={width/2-2} y={height/2-2} width="4" height="4" fill="#555555"/>
            
            {/* Highlight edge */}
            <rect x="2" y="2" width={width-4} height="2" fill="#888888"/>
            <rect x="2" y="2" width="2" height={height-4} fill="#888888"/>
          </svg>
        );

      case 'invisible':
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
            {/* Barely visible outline */}
            <rect 
              x="0" 
              y="0" 
              width={width} 
              height={height} 
              fill="none" 
              stroke="rgba(255,255,255,0.2)" 
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`sprite sprite-pixel-perfect ${className}`}
      style={getBlockStyles()}
    >
      {renderBlockSVG()}
    </div>
  );
}