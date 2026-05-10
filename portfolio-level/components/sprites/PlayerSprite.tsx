import React from 'react';

export interface PlayerSpriteProps {
  x: number;
  y: number;
  width: number;
  height: number;
  state: 'idle' | 'running' | 'jumping' | 'falling' | 'crouching';
  direction: 'left' | 'right';
  frame?: number;
  className?: string;
}

export default function PlayerSprite({
  x,
  y,
  width,
  height,
  state,
  direction,
  frame = 0,
  className = ''
}: PlayerSpriteProps) {
  const getPlayerStyles = () => {
    const baseStyles = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
    };

    const stateAnimation = (() => {
      switch (state) {
        case 'idle':
          return 'sprite-idle-float var(--sprite-idle-cycle) ease-in-out infinite';
        case 'running':
          return 'sprite-run-bob var(--sprite-run-cycle) ease-in-out infinite';
        case 'jumping':
          return 'none';
        case 'falling':
          return 'none';
        case 'crouching':
          return 'none';
        default:
          return 'none';
      }
    })();

    return {
      ...baseStyles,
      animation: stateAnimation,
    };
  };

  const renderPlayerSVG = () => {
    const adjustedHeight = state === 'crouching' ? height * 0.67 : height;
    const hatColor = '#ff6b6b';
    const shirtColor = '#4ecdc4';
    const overallsColor = '#0066cc';
    const skinColor = '#ffdbac';
    const shoeColor = '#8b4513';

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
        {/* Character body based on state */}
        {state === 'crouching' ? (
          // Crouched pose
          <>
            {/* Hat */}
            <rect x="6" y="2" width="20" height="8" fill={hatColor} stroke="#000" strokeWidth="1"/>
            <rect x="4" y="6" width="24" height="4" fill={hatColor} stroke="#000" strokeWidth="1"/>
            
            {/* Head */}
            <rect x="8" y="10" width="16" height="12" fill={skinColor} stroke="#000" strokeWidth="1"/>
            
            {/* Eyes */}
            <rect x="11" y="14" width="2" height="2" fill="#000"/>
            <rect x="19" y="14" width="2" height="2" fill="#000"/>
            
            {/* Nose */}
            <rect x="15" y="17" width="2" height="2" fill="#000"/>
            
            {/* Body (compressed) */}
            <rect x="6" y="22" width="20" height="16" fill={shirtColor} stroke="#000" strokeWidth="1"/>
            <rect x="8" y="24" width="16" height="12" fill={overallsColor} stroke="#000" strokeWidth="1"/>
            
            {/* Arms */}
            <rect x="2" y="24" width="6" height="8" fill={shirtColor} stroke="#000" strokeWidth="1"/>
            <rect x="24" y="24" width="6" height="8" fill={shirtColor} stroke="#000" strokeWidth="1"/>
            
            {/* Legs (bent) */}
            <rect x="8" y="36" width="6" height="8" fill={overallsColor} stroke="#000" strokeWidth="1"/>
            <rect x="18" y="36" width="6" height="8" fill={overallsColor} stroke="#000" strokeWidth="1"/>
          </>
        ) : (
          // Standing poses
          <>
            {/* Hat */}
            <rect x="6" y="2" width="20" height="8" fill={hatColor} stroke="#000" strokeWidth="1"/>
            <rect x="4" y="6" width="24" height="4" fill={hatColor} stroke="#000" strokeWidth="1"/>
            
            {/* Head */}
            <rect x="8" y="10" width="16" height="12" fill={skinColor} stroke="#000" strokeWidth="1"/>
            
            {/* Eyes */}
            <rect x="11" y="14" width="2" height="2" fill="#000"/>
            <rect x="19" y="14" width="2" height="2" fill="#000"/>
            
            {/* Nose */}
            <rect x="15" y="17" width="2" height="2" fill="#000"/>
            
            {/* Mustache */}
            <rect x="13" y="19" width="6" height="2" fill="#8b4513"/>
            
            {/* Body */}
            <rect x="6" y="22" width="20" height="20" fill={shirtColor} stroke="#000" strokeWidth="1"/>
            <rect x="8" y="26" width="16" height="16" fill={overallsColor} stroke="#000" strokeWidth="1"/>
            
            {/* Buttons */}
            <circle cx="16" cy="30" r="1" fill="#ffd700"/>
            <circle cx="16" cy="36" r="1" fill="#ffd700"/>
            
            {/* Arms */}
            {state === 'running' && frame % 2 === 1 ? (
              <>
                <rect x="1" y="26" width="7" height="12" fill={shirtColor} stroke="#000" strokeWidth="1"/>
                <rect x="24" y="22" width="7" height="12" fill={shirtColor} stroke="#000" strokeWidth="1"/>
              </>
            ) : (
              <>
                <rect x="2" y="24" width="6" height="14" fill={shirtColor} stroke="#000" strokeWidth="1"/>
                <rect x="24" y="24" width="6" height="14" fill={shirtColor} stroke="#000" strokeWidth="1"/>
              </>
            )}
            
            {/* Legs */}
            {state === 'running' && frame % 2 === 1 ? (
              <>
                <rect x="8" y="42" width="6" height="6" fill={overallsColor} stroke="#000" strokeWidth="1"/>
                <rect x="18" y="38" width="6" height="10" fill={overallsColor} stroke="#000" strokeWidth="1"/>
              </>
            ) : state === 'jumping' ? (
              <>
                <rect x="6" y="40" width="6" height="8" fill={overallsColor} stroke="#000" strokeWidth="1"/>
                <rect x="20" y="40" width="6" height="8" fill={overallsColor} stroke="#000" strokeWidth="1"/>
              </>
            ) : state === 'falling' ? (
              <>
                <rect x="8" y="42" width="6" height="6" fill={overallsColor} stroke="#000" strokeWidth="1"/>
                <rect x="18" y="42" width="6" height="6" fill={overallsColor} stroke="#000" strokeWidth="1"/>
              </>
            ) : (
              <>
                <rect x="10" y="42" width="6" height="6" fill={overallsColor} stroke="#000" strokeWidth="1"/>
                <rect x="16" y="42" width="6" height="6" fill={overallsColor} stroke="#000" strokeWidth="1"/>
              </>
            )}
            
            {/* Shoes */}
            {state === 'running' && frame % 2 === 1 ? (
              <>
                <rect x="6" y="46" width="10" height="4" fill={shoeColor} stroke="#000" strokeWidth="1"/>
                <rect x="16" y="46" width="10" height="4" fill={shoeColor} stroke="#000" strokeWidth="1"/>
              </>
            ) : (
              <>
                <rect x="8" y="46" width="8" height="4" fill={shoeColor} stroke="#000" strokeWidth="1"/>
                <rect x="16" y="46" width="8" height="4" fill={shoeColor} stroke="#000" strokeWidth="1"/>
              </>
            )}
          </>
        )}
      </svg>
    );
  };

  return (
    <div
      className={`sprite sprite-pixel-perfect ${className}`}
      style={getPlayerStyles()}
    >
      {renderPlayerSVG()}
    </div>
  );
}