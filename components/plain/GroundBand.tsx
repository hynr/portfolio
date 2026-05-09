/**
 * Mario-style ground band: grass strip on top, brick courses below.
 * Renders as a single SVG with a horizontally-tiling pattern so it crisp-edges
 * at any width. Use as a section divider or hero foot.
 */
type Props = {
  height?: number
  className?: string
}

export default function GroundBand({ height = 24, className = '' }: Props) {
  return (
    <div
      aria-hidden
      className={`w-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 32 24"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        className="pixel block"
      >
        <defs>
          <pattern id="ground-tile" x="0" y="0" width="32" height="24" patternUnits="userSpaceOnUse">
            {/* Grass top — 6px */}
            <rect x="0" y="0" width="32" height="4" fill="var(--pipe)" />
            <rect x="3" y="2" width="2" height="2" fill="oklch(0.78 0.1 145)" />
            <rect x="11" y="3" width="2" height="1" fill="oklch(0.82 0.09 145)" />
            <rect x="19" y="2" width="2" height="2" fill="oklch(0.78 0.1 145)" />
            <rect x="27" y="3" width="2" height="1" fill="oklch(0.82 0.09 145)" />
            {/* Grass-to-brick shadow */}
            <rect x="0" y="4" width="32" height="2" fill="var(--pipe-deep)" />
            {/* Brick row 1 (course offset 0) */}
            <rect x="0" y="6" width="32" height="6" fill="var(--brick)" />
            <rect x="0" y="6" width="32" height="1" fill="oklch(0.40 0.16 30)" />
            <rect x="15" y="6" width="2" height="6" fill="oklch(0.40 0.16 30)" />
            <rect x="0" y="11" width="32" height="1" fill="oklch(0.34 0.14 30)" />
            {/* Brick row 2 (course offset half-tile) */}
            <rect x="0" y="12" width="32" height="6" fill="var(--brick)" />
            <rect x="0" y="12" width="32" height="1" fill="oklch(0.40 0.16 30)" />
            <rect x="-1" y="12" width="2" height="6" fill="oklch(0.40 0.16 30)" />
            <rect x="31" y="12" width="2" height="6" fill="oklch(0.40 0.16 30)" />
            <rect x="0" y="17" width="32" height="1" fill="oklch(0.34 0.14 30)" />
            {/* Bottom shadow */}
            <rect x="0" y="18" width="32" height="2" fill="oklch(0.30 0.13 30)" />
            <rect x="0" y="20" width="32" height="4" fill="oklch(0.24 0.10 30)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ground-tile)" />
      </svg>
    </div>
  )
}
