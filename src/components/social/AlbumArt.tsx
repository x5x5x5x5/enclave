import { useId } from 'react'
import { fnv1a } from '../../lib/hash'
import { cx } from '../../lib/cx'
import type { Hue } from '../../mock/types'

/**
 * A record sleeve.
 *
 * "Now playing" with a music glyph is a placeholder wearing a costume; the
 * thing people recognise is the jacket. Six sleeve layouts in the visual
 * language actual covers use — a horizon, a sun, a split field, concentric
 * rings, a bar score, a lone shape — picked deterministically from the title,
 * so the same track always has the same cover.
 */
export function AlbumArt({
  seed,
  hue = 'clay',
  size = 56,
  radius = 8,
  className,
}: {
  seed: string
  hue?: Hue
  size?: number
  radius?: number
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const h = fnv1a(seed)
  const pick = (n: number, salt: number) => (fnv1a(seed + salt) >>> 3) % n
  const variant = h % 6

  const rgb = `var(--hue-${hue}-vivid-rgb)`
  const tint = (a: number) => `rgb(${rgb} / ${a})`
  const ink = (a: number) => `rgb(var(--ink-0-rgb) / ${a})`
  const light = (a: number) => `rgb(var(--text-hi-rgb) / ${a})`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      data-imagery="true"
      className={cx('block shrink-0', className)}
    >
      <defs>
        <linearGradient id={`a${uid}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor={tint(0.85)} />
          <stop offset="100%" stopColor="var(--ink-1)" />
        </linearGradient>
        <clipPath id={`m${uid}`}>
          <rect width="64" height="64" rx={(radius / size) * 64} />
        </clipPath>
      </defs>

      <g clipPath={`url(#m${uid})`}>
        <rect width="64" height="64" fill={`url(#a${uid})`} />

        {variant === 0 && (
          <>
            <circle cx="32" cy="26" r="13" fill={light(0.9)} />
            <rect x="0" y="39" width="64" height="25" fill={ink(0.65)} />
          </>
        )}

        {variant === 1 && (
          <>
            <path d="M0 44 22 20l14 15 12-11 16 20v20H0z" fill={ink(0.6)} />
            <circle cx="48" cy="16" r="6" fill={light(0.85)} />
          </>
        )}

        {variant === 2 && (
          <>
            <rect x="0" y="0" width="32" height="64" fill={ink(0.55)} />
            <rect x="32" y="0" width="32" height="64" fill={light(0.14)} />
            <rect x="26" y="0" width="12" height="64" fill={light(0.85)} />
          </>
        )}

        {variant === 3 &&
          [26, 19, 12, 5].map((r, i) => (
            <circle
              key={r}
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke={i % 2 ? light(0.75) : ink(0.6)}
              strokeWidth="4"
            />
          ))}

        {variant === 4 && (
          <g>
            {Array.from({ length: 9 }).map((_, i) => {
              const bh = 8 + pick(38, i * 7)
              return (
                <rect
                  key={i}
                  x={4 + i * 6.6}
                  y={58 - bh}
                  width="4.4"
                  height={bh}
                  rx="1"
                  fill={i % 3 === 0 ? light(0.85) : ink(0.55)}
                />
              )
            })}
          </g>
        )}

        {variant === 5 && (
          <>
            <rect x="0" y="0" width="64" height="64" fill={ink(0.45)} />
            <path d="M32 10 54 50H10z" fill={light(0.9)} />
            <circle cx="32" cy="40" r="7" fill={tint(1)} />
          </>
        )}
      </g>
      <rect
        width="64"
        height="64"
        rx={(radius / size) * 64}
        fill="none"
        stroke={ink(0.5)}
        strokeWidth="1.5"
      />
    </svg>
  )
}
