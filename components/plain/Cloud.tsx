/**
 * NES-style pixel cloud, single tile.
 * Inline component used for ambient hero corner decoration.
 */
type Props = {
  size?: number
  className?: string
}

export default function Cloud({ size = 56, className = '' }: Props) {
  return (
    <svg
      role="img"
      aria-label="Cloud"
      width={size}
      height={(size * 16) / 32}
      viewBox="0 0 32 16"
      shapeRendering="crispEdges"
      className={`pixel ${className}`}
    >
      {/* Outline (bluish-grey, very low chroma to read 'sky-cartridge') */}
      <rect x="6"  y="2"  width="4"  height="1" fill="var(--sky-deep)" />
      <rect x="4"  y="3"  width="8"  height="1" fill="var(--sky-deep)" />
      <rect x="2"  y="4"  width="2"  height="1" fill="var(--sky-deep)" />
      <rect x="12" y="4"  width="2"  height="1" fill="var(--sky-deep)" />
      <rect x="14" y="3"  width="6"  height="1" fill="var(--sky-deep)" />
      <rect x="20" y="2"  width="6"  height="1" fill="var(--sky-deep)" />
      <rect x="26" y="3"  width="3"  height="1" fill="var(--sky-deep)" />
      <rect x="29" y="4"  width="1"  height="1" fill="var(--sky-deep)" />
      <rect x="1"  y="5"  width="1"  height="3" fill="var(--sky-deep)" />
      <rect x="30" y="5"  width="1"  height="3" fill="var(--sky-deep)" />
      <rect x="0"  y="8"  width="1"  height="3" fill="var(--sky-deep)" />
      <rect x="31" y="8"  width="1"  height="3" fill="var(--sky-deep)" />
      <rect x="1"  y="11" width="2"  height="1" fill="var(--sky-deep)" />
      <rect x="29" y="11" width="2"  height="1" fill="var(--sky-deep)" />
      <rect x="3"  y="12" width="26" height="1" fill="var(--sky-deep)" />

      {/* Body — soft sky tint, almost white */}
      <rect x="6"  y="3"  width="4"  height="1"  fill="oklch(0.97 0.02 240)" />
      <rect x="4"  y="4"  width="8"  height="1"  fill="oklch(0.97 0.02 240)" />
      <rect x="14" y="4"  width="6"  height="1"  fill="oklch(0.97 0.02 240)" />
      <rect x="20" y="3"  width="6"  height="1"  fill="oklch(0.97 0.02 240)" />
      <rect x="2"  y="5"  width="28" height="6"  fill="oklch(0.98 0.015 240)" />
      <rect x="3"  y="11" width="26" height="1"  fill="oklch(0.97 0.02 240)" />
      <rect x="1"  y="8"  width="1"  height="3"  fill="oklch(0.97 0.02 240)" />
      <rect x="30" y="8"  width="1"  height="3"  fill="oklch(0.97 0.02 240)" />

      {/* Soft underside shadow */}
      <rect x="3"  y="10" width="26" height="1"  fill="var(--sky-soft)" />
    </svg>
  )
}
