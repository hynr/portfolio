import React from 'react';

export interface GroundTileProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'grass' | 'dirt' | 'stone';
  pattern?: 'top' | 'middle' | 'bottom';
  className?: string;
}

export default function GroundTile({
  x,
  y,
  width,
  height,
  type,
  pattern = 'top',
  className = ''
}: GroundTileProps) {
  const getTileStyles = () => {
    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  const getTypeColors = () => {
    switch (type) {
      case 'grass':
        return {
          primary: '#228b22',
          secondary: '#32cd32',
          accent: '#006400',
          highlight: '#90ee90'
        };
      case 'dirt':
        return {
          primary: '#8b7355',
          secondary: '#a0522d',
          accent: '#654321',
          highlight: '#deb887'
        };
      case 'stone':
        return {
          primary: '#696969',
          secondary: '#808080',
          accent: '#2f4f4f',
          highlight: '#a9a9a9'
        };
      default:
        return {
          primary: '#228b22',
          secondary: '#32cd32',
          accent: '#006400',
          highlight: '#90ee90'
        };
    }
  };

  const renderGrassPattern = (colors: any) => {
    return (
      <>
        {/* Base grass layer */}
        <rect x="0" y="0" width={width} height={height} fill={colors.primary}/>
        
        {/* Grass blades on top surface */}
        {pattern === 'top' && Array.from({length: 8}, (_, i) => {
          const bladeX = (width / 7) * i + Math.random() * 4 - 2;
          const bladeHeight = 4 + Math.random() * 4;
          
          return (
            <g key={i}>
              <rect 
                x={bladeX} 
                y={-bladeHeight} 
                width="2" 
                height={bladeHeight} 
                fill={colors.secondary}
              />
              <rect 
                x={bladeX} 
                y={-bladeHeight} 
                width="1" 
                height={bladeHeight * 0.7} 
                fill={colors.highlight}
              />
            </g>
          );
        })}
        
        {/* Soil texture */}
        {Array.from({length: 6}, (_, i) => {
          const dotX = Math.random() * width;
          const dotY = Math.random() * height;
          return (
            <circle 
              key={i} 
              cx={dotX} 
              cy={dotY} 
              r="1" 
              fill={colors.accent}
              opacity="0.6"
            />
          );
        })}
      </>
    );
  };

  const renderDirtPattern = (colors: any) => {
    return (
      <>
        {/* Base dirt layer */}
        <rect x="0" y="0" width={width} height={height} fill={colors.primary}/>
        
        {/* Dirt clumps and texture */}
        {Array.from({length: 8}, (_, i) => {
          const clumpX = Math.random() * width;
          const clumpY = Math.random() * height;
          const clumpSize = 2 + Math.random() * 3;
          
          return (
            <ellipse 
              key={i} 
              cx={clumpX} 
              cy={clumpY} 
              rx={clumpSize} 
              ry={clumpSize * 0.7} 
              fill={i % 2 === 0 ? colors.secondary : colors.accent}
              opacity="0.8"
            />
          );
        })}
        
        {/* Horizontal sediment layers */}
        {Array.from({length: 3}, (_, i) => {
          const layerY = (height / 3) * (i + 1) + Math.random() * 4 - 2;
          return (
            <line 
              key={i} 
              x1="0" 
              y1={layerY} 
              x2={width} 
              y2={layerY} 
              stroke={colors.accent} 
              strokeWidth="1" 
              opacity="0.5"
            />
          );
        })}
        
        {/* Small rocks */}
        {Array.from({length: 4}, (_, i) => {
          const rockX = Math.random() * width;
          const rockY = Math.random() * height;
          return (
            <rect 
              key={i} 
              x={rockX} 
              y={rockY} 
              width="3" 
              height="2" 
              fill={colors.accent}
            />
          );
        })}
      </>
    );
  };

  const renderStonePattern = (colors: any) => {
    return (
      <>
        {/* Base stone layer */}
        <rect x="0" y="0" width={width} height={height} fill={colors.primary}/>
        
        {/* Stone block pattern */}
        {pattern === 'top' ? (
          // Top pattern - larger stones
          <>
            <rect x="0" y="0" width={width * 0.6} height={height * 0.5} fill={colors.secondary} stroke={colors.accent} strokeWidth="1"/>
            <rect x={width * 0.6} y="0" width={width * 0.4} height={height * 0.5} fill={colors.primary} stroke={colors.accent} strokeWidth="1"/>
            <rect x="0" y={height * 0.5} width={width * 0.4} height={height * 0.5} fill={colors.primary} stroke={colors.accent} strokeWidth="1"/>
            <rect x={width * 0.4} y={height * 0.5} width={width * 0.6} height={height * 0.5} fill={colors.secondary} stroke={colors.accent} strokeWidth="1"/>
          </>
        ) : (
          // Middle/bottom pattern - smaller uniform blocks
          Array.from({length: 4}, (_, i) => {
            const blockWidth = width / 4;
            const blockX = blockWidth * i;
            return (
              <rect 
                key={i} 
                x={blockX} 
                y="0" 
                width={blockWidth} 
                height={height} 
                fill={i % 2 === 0 ? colors.secondary : colors.primary} 
                stroke={colors.accent} 
                strokeWidth="1"
              />
            );
          })
        )}
        
        {/* Stone texture details */}
        {Array.from({length: 5}, (_, i) => {
          const crackX = Math.random() * width;
          const crackY = Math.random() * height;
          const crackLength = 8 + Math.random() * 8;
          const crackAngle = Math.random() * 360;
          
          return (
            <line 
              key={i} 
              x1={crackX} 
              y1={crackY} 
              x2={crackX + Math.cos(crackAngle * Math.PI / 180) * crackLength} 
              y2={crackY + Math.sin(crackAngle * Math.PI / 180) * crackLength} 
              stroke={colors.accent} 
              strokeWidth="1" 
              opacity="0.7"
            />
          );
        })}
        
        {/* Highlight edges based on pattern */}
        {pattern === 'top' && (
          <rect x="0" y="0" width={width} height="2" fill={colors.highlight} opacity="0.6"/>
        )}
      </>
    );
  };

  const renderTileSVG = () => {
    const colors = getTypeColors();
    
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
        {/* Main tile background */}
        <rect x="0" y="0" width={width} height={height} fill={colors.primary}/>
        
        {/* Pattern based on type */}
        {type === 'grass' && renderGrassPattern(colors)}
        {type === 'dirt' && renderDirtPattern(colors)}
        {type === 'stone' && renderStonePattern(colors)}
        
        {/* Border outline for tiling */}
        <rect 
          x="0" 
          y="0" 
          width={width} 
          height={height} 
          fill="none" 
          stroke={colors.accent} 
          strokeWidth="0.5" 
          opacity="0.3"
        />
        
        {/* Pattern-specific effects */}
        {pattern === 'bottom' && (
          <rect x="0" y={height - 2} width={width} height="2" fill={colors.accent} opacity="0.4"/>
        )}
      </svg>
    );
  };

  return (
    <div
      className={`sprite sprite-pixel-perfect ${className}`}
      style={getTileStyles()}
    >
      {renderTileSVG()}
    </div>
  );
}