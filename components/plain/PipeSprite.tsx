type Props = {
  size?: number
  className?: string
  /** When true, render only the pipe-mouth band (no shaft) — for nav use. */
  compact?: boolean
}

/**
 * Pixel-perfect green pipe sprite, drawn as SVG.
 * 16-bit grid: 16 columns × 16 rows (or 16 × 8 in compact form).
 * Hue mapped to var(--pipe). No anti-aliasing.
 */
export default function PipeSprite({ size = 32, className = '', compact = false }: Props) {
  const w = 16
  const h = compact ? 8 : 16

  return (
    <svg
      role="img"
      aria-label="Warp pipe"
      width={size}
      height={size * (h / w)}
      viewBox={`0 0 ${w} ${h}`}
      className={`pixel ${className}`}
      shapeRendering="crispEdges"
    >
      {/* Outer dark border */}
      <rect x="0" y="0" width="16" height="2" fill="var(--pipe-deep)" />
      {/* Mouth top — light highlight band */}
      <rect x="0" y="2" width="16" height="2" fill="var(--pipe)" />
      <rect x="2" y="2" width="2" height="2" fill="oklch(0.78 0.1 145)" />
      {/* Mouth body */}
      <rect x="0" y="4" width="16" height="2" fill="var(--pipe-deep)" />
      <rect x="2" y="4" width="2" height="2" fill="var(--pipe)" />
      {/* Mouth lower lip */}
      <rect x="0" y="6" width="16" height="2" fill="var(--pipe)" />
      <rect x="14" y="6" width="2" height="2" fill="var(--pipe-deep)" />

      {/* Shaft (skip in compact) */}
      {!compact && (
        <>
          <rect x="2" y="8" width="12" height="2" fill="var(--pipe-deep)" />
          <rect x="2" y="8" width="2" height="2" fill="var(--pipe)" />
          <rect x="4" y="8" width="2" height="2" fill="oklch(0.78 0.1 145)" />

          <rect x="2" y="10" width="12" height="2" fill="var(--pipe)" />
          <rect x="4" y="10" width="2" height="2" fill="oklch(0.78 0.1 145)" />
          <rect x="12" y="10" width="2" height="2" fill="var(--pipe-deep)" />

          <rect x="2" y="12" width="12" height="2" fill="var(--pipe-deep)" />
          <rect x="4" y="12" width="2" height="2" fill="var(--pipe)" />

          <rect x="2" y="14" width="12" height="2" fill="var(--pipe)" />
          <rect x="12" y="14" width="2" height="2" fill="var(--pipe-deep)" />
        </>
      )}
    </svg>
  )
}
