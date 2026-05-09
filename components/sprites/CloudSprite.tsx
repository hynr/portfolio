import React from 'react';

export interface CloudSpriteProps {
  x: number;
  y: number;
  width: number;
  height: number;
  variant: 'small' | 'medium' | 'large';
  opacity?: number;
  className?: string;
}

export default function CloudSprite({
  x,
  y,
  width,
  height,
  variant,
  opacity = 1,
  className = ''
}: CloudSpriteProps) {
  const getCloudStyles = () => {
    const baseStyles = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      opacity: opacity,
    };

    return {
      ...baseStyles,
      animation: 'sprite-cloud-float 8s ease-in-out infinite',
    };
  };

  const getCloudComplexity = () => {
    switch (variant) {
      case 'small':
        return { bumps: 3, scale: 0.8 };
      case 'medium':
        return { bumps: 4, scale: 1 };
      case 'large':
        return { bumps: 5, scale: 1.2 };
      default:
        return { bumps: 4, scale: 1 };
    }
  };

  const renderCloudSVG = () => {
    const { bumps, scale } = getCloudComplexity();
    const cloudColor = '#f8f8ff';
    const cloudShadow = '#e6e6fa';
    const cloudHighlight = '#ffffff';
    
    // Generate cloud bumps based on variant
    const generateCloudPath = () => {
      const cloudWidth = width * scale;
      const cloudHeight = height * scale;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Base cloud shape coordinates
      const baseRadius = Math.min(cloudWidth, cloudHeight) * 0.15;
      
      let pathData = `M ${centerX - cloudWidth * 0.3} ${centerY}`;
      
      // Generate rounded bumps across the top
      for (let i = 0; i < bumps; i++) {
        const bumpX = centerX - cloudWidth * 0.3 + (cloudWidth * 0.6 / (bumps - 1)) * i;
        const bumpY = centerY - cloudHeight * 0.2 - Math.sin((i / (bumps - 1)) * Math.PI) * cloudHeight * 0.15;
        const radius = baseRadius + (variant === 'large' ? baseRadius * 0.3 : 0);
        
        if (i === 0) {
          pathData += ` Q ${bumpX} ${bumpY - radius} ${bumpX + radius} ${bumpY}`;
        } else {
          pathData += ` Q ${bumpX} ${bumpY - radius} ${bumpX + radius} ${bumpY}`;
        }
      }
      
      // Close the cloud shape with a curved bottom
      pathData += ` Q ${centerX + cloudWidth * 0.3} ${centerY - cloudHeight * 0.1} ${centerX + cloudWidth * 0.25} ${centerY + cloudHeight * 0.1}`;
      pathData += ` Q ${centerX} ${centerY + cloudHeight * 0.2} ${centerX - cloudWidth * 0.25} ${centerY + cloudHeight * 0.1}`;
      pathData += ` Q ${centerX - cloudWidth * 0.3} ${centerY - cloudHeight * 0.1} ${centerX - cloudWidth * 0.3} ${centerY}`;
      
      return pathData;
    };

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
        {/* Cloud shadow */}
        <g transform="translate(2, 2)">
          <path
            d={generateCloudPath()}
            fill="rgba(0,0,0,0.1)"
          />
        </g>
        
        {/* Main cloud body */}
        <path
          d={generateCloudPath()}
          fill={cloudColor}
          stroke={cloudShadow}
          strokeWidth="1"
        />
        
        {/* Cloud highlights for 3D effect */}
        <g>
          {Array.from({length: bumps}, (_, i) => {
            const centerX = width / 2;
            const bumpX = centerX - width * 0.3 + (width * 0.6 / (bumps - 1)) * i;
            const bumpY = height / 2 - height * 0.2 - Math.sin((i / (bumps - 1)) * Math.PI) * height * 0.15;
            const highlightSize = variant === 'large' ? 8 : variant === 'medium' ? 6 : 4;
            
            return (
              <ellipse 
                key={i}
                cx={bumpX - highlightSize * 0.5} 
                cy={bumpY - highlightSize * 0.3} 
                rx={highlightSize} 
                ry={highlightSize * 0.6} 
                fill={cloudHighlight}
                opacity="0.6"
              />
            );
          })}
        </g>
        
        {/* Additional small cloud puffs for larger variants */}
        {variant === 'large' && (
          <>
            <ellipse 
              cx={width * 0.2} 
              cy={height * 0.3} 
              rx="8" 
              ry="6" 
              fill={cloudColor}
              stroke={cloudShadow}
              strokeWidth="1"
            />
            <ellipse 
              cx={width * 0.8} 
              cy={height * 0.4} 
              rx="6" 
              ry="5" 
              fill={cloudColor}
              stroke={cloudShadow}
              strokeWidth="1"
            />
            
            {/* Small highlight on additional puffs */}
            <ellipse cx={width * 0.18} cy={height * 0.27} rx="3" ry="2" fill={cloudHighlight} opacity="0.5"/>
            <ellipse cx={width * 0.78} cy={height * 0.37} rx="2" ry="2" fill={cloudHighlight} opacity="0.5"/>
          </>
        )}
        
        {/* Medium variant extra detail */}
        {variant === 'medium' && (
          <ellipse 
            cx={width * 0.75} 
            cy={height * 0.6} 
            rx="5" 
            ry="4" 
            fill={cloudColor}
            stroke={cloudShadow}
            strokeWidth="1"
          />
        )}
        
        {/* Subtle texture lines for depth */}
        <g opacity="0.3">
          <path 
            d={`M ${width * 0.2} ${height * 0.5} Q ${width * 0.5} ${height * 0.45} ${width * 0.8} ${height * 0.5}`}
            fill="none"
            stroke={cloudShadow}
            strokeWidth="1"
          />
          {variant !== 'small' && (
            <path 
              d={`M ${width * 0.25} ${height * 0.65} Q ${width * 0.4} ${height * 0.6} ${width * 0.7} ${height * 0.65}`}
              fill="none"
              stroke={cloudShadow}
              strokeWidth="1"
            />
          )}
        </g>
      </svg>
    );
  };

  return (
    <div
      className={`sprite sprite-pixel-perfect ${className}`}
      style={getCloudStyles()}
    >
      {renderCloudSVG()}
    </div>
  );
}