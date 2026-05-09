/**
 * Coin disc sprite — Mario-style spinning gold coin, drawn pixel-perfect.
 * Inline-flow, default 24×24. Pass `spin` to animate.
 */
type Props = {
  size?: number
  className?: string
  spin?: boolean
}

export default function CoinDisc({ size = 28, className = '', spin = false }: Props) {
  return (
    <span
      className={`inline-block align-middle ${spin ? 'anim-coin-spin' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        role="img"
        aria-label="Coin"
        viewBox="0 0 16 16"
        width="100%"
        height="100%"
        shapeRendering="crispEdges"
        className="pixel block"
      >
        {/* Outer dark ring */}
        <rect x="5" y="0" width="6" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="3" y="1" width="2" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="11" y="1" width="2" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="2" y="2" width="1" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="13" y="2" width="1" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="1" y="3" width="1" height="2" fill="oklch(0.30 0.10 70)" />
        <rect x="14" y="3" width="1" height="2" fill="oklch(0.30 0.10 70)" />
        <rect x="0" y="5" width="1" height="6" fill="oklch(0.30 0.10 70)" />
        <rect x="15" y="5" width="1" height="6" fill="oklch(0.30 0.10 70)" />
        <rect x="1" y="11" width="1" height="2" fill="oklch(0.30 0.10 70)" />
        <rect x="14" y="11" width="1" height="2" fill="oklch(0.30 0.10 70)" />
        <rect x="2" y="13" width="1" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="13" y="13" width="1" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="3" y="14" width="2" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="11" y="14" width="2" height="1" fill="oklch(0.30 0.10 70)" />
        <rect x="5" y="15" width="6" height="1" fill="oklch(0.30 0.10 70)" />

        {/* Body — gold */}
        <rect x="5" y="1" width="6" height="1" fill="var(--coin-deep)" />
        <rect x="3" y="2" width="10" height="1" fill="var(--coin-deep)" />
        <rect x="2" y="3" width="12" height="1" fill="var(--coin-deep)" />
        <rect x="2" y="4" width="12" height="1" fill="var(--coin)" />
        <rect x="1" y="5" width="14" height="6" fill="var(--coin)" />
        <rect x="2" y="11" width="12" height="1" fill="var(--coin)" />
        <rect x="2" y="12" width="12" height="1" fill="var(--coin-deep)" />
        <rect x="3" y="13" width="10" height="1" fill="var(--coin-deep)" />
        <rect x="5" y="14" width="6" height="1" fill="var(--coin-deep)" />

        {/* Top highlight */}
        <rect x="5" y="2" width="3" height="1" fill="oklch(0.94 0.10 85)" />
        <rect x="4" y="3" width="2" height="1" fill="oklch(0.94 0.10 85)" />
        {/* Inner facet (the embossed center) */}
        <rect x="6" y="4" width="1" height="8" fill="var(--coin-deep)" />
        <rect x="9" y="4" width="1" height="8" fill="var(--coin-deep)" />
      </svg>
    </span>
  )
}
