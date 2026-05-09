/**
 * Pixel-perfect ? block sprite. Inline-flow, sized in pixels.
 * 16x16 logical grid, scaled by `size`.
 */
type Props = {
  size?: number
  className?: string
  empty?: boolean
}

export default function QuestionBlock({ size = 28, className = '', empty = false }: Props) {
  return (
    <svg
      role="img"
      aria-label={empty ? 'Empty block' : 'Question block'}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      className={`pixel inline-block align-middle ${className}`}
    >
      {/* Outer dark border */}
      <rect x="0" y="0" width="16" height="16" fill={empty ? 'oklch(0.42 0.012 30)' : 'oklch(0.30 0.10 70)'} />
      {/* Body */}
      <rect x="1" y="1" width="14" height="14" fill={empty ? 'oklch(0.62 0.008 30)' : 'var(--coin)'} />
      {/* Top highlight */}
      <rect x="1" y="1" width="14" height="2" fill={empty ? 'oklch(0.78 0.005 30)' : 'oklch(0.92 0.10 85)'} />
      {/* Bottom shadow */}
      <rect x="1" y="13" width="14" height="2" fill={empty ? 'oklch(0.34 0.012 30)' : 'var(--coin-deep)'} />
      {/* Side highlights */}
      <rect x="1" y="1" width="2" height="14" fill={empty ? 'oklch(0.78 0.005 30)' : 'oklch(0.88 0.13 85)'} />
      <rect x="13" y="1" width="2" height="14" fill={empty ? 'oklch(0.34 0.012 30)' : 'var(--coin-deep)'} />
      {/* Question mark / dimmed when empty */}
      {!empty ? (
        <>
          {/* Top of ? */}
          <rect x="6" y="3" width="4" height="2" fill="oklch(0.18 0.012 30)" />
          <rect x="5" y="4" width="1" height="2" fill="oklch(0.18 0.012 30)" />
          <rect x="10" y="4" width="1" height="3" fill="oklch(0.18 0.012 30)" />
          {/* Curve down */}
          <rect x="9" y="6" width="1" height="2" fill="oklch(0.18 0.012 30)" />
          <rect x="8" y="7" width="1" height="2" fill="oklch(0.18 0.012 30)" />
          <rect x="7" y="8" width="1" height="2" fill="oklch(0.18 0.012 30)" />
          {/* Dot */}
          <rect x="7" y="11" width="2" height="2" fill="oklch(0.18 0.012 30)" />
        </>
      ) : (
        <rect x="6" y="6" width="4" height="4" fill="oklch(0.42 0.012 30)" />
      )}
      {/* Center inner highlight */}
      <rect x="3" y="3" width="2" height="2" fill={empty ? 'oklch(0.70 0.008 30)' : 'oklch(0.94 0.06 85)'} opacity="0.6" />
    </svg>
  )
}
