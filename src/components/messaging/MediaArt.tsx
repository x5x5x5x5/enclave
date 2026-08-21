import { useMemo } from 'react'
import { fnv1a } from '../../lib/hash'
import { cx } from '../../lib/cx'
import { HUES } from '../../mock/world'

/**
 * The prototype paints its own media. Every attachment gets a deterministic
 * abstract composition from its seed, so screenshots read as photographs of a
 * real product rather than a grid of grey rectangles — and nothing is fetched.
 */
export function MediaArt({
  seed,
  className,
  rounded = true,
}: {
  seed: string
  className?: string
  rounded?: boolean
}) {
  const art = useMemo(() => {
    const h = fnv1a(seed)
    const pick = (n: number, salt: number) => (fnv1a(seed + salt) >>> 3) % n
    const hueA = HUES[pick(HUES.length, 1)]
    const hueB = HUES[pick(HUES.length, 7)]
    const variant = h % 5
    const angle = 20 + (pick(140, 3) || 0)
    const bands = 3 + pick(4, 11)
    return { hueA, hueB, variant, angle, bands, pick }
  }, [seed])

  const { hueA, hueB, variant, angle, bands, pick } = art

  return (
    <svg
      viewBox="0 0 160 120"
      preserveAspectRatio="xMidYMid slice"
      className={cx('block h-full w-full', rounded && 'rounded-[8px]', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`g-${seed}`} gradientTransform={`rotate(${angle})`}>
          <stop offset="0%" stopColor={`rgb(var(--hue-${hueA}-rgb) / .55)`} />
          <stop offset="100%" stopColor={`rgb(var(--hue-${hueB}-rgb) / .18)`} />
        </linearGradient>
        <linearGradient id={`f-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(11 14 19 / 0)" />
          <stop offset="100%" stopColor="rgb(11 14 19 / .72)" />
        </linearGradient>
      </defs>

      <rect width="160" height="120" fill="var(--ink-2)" />
      <rect width="160" height="120" fill={`url(#g-${seed})`} />

      {variant === 0 &&
        Array.from({ length: bands }).map((_, i) => (
          <rect
            key={i}
            x={0}
            y={(120 / bands) * i + 2}
            width={160}
            height={Math.max(2, 120 / bands - 6)}
            fill="rgb(233 237 243 / .07)"
          />
        ))}

      {variant === 1 &&
        Array.from({ length: bands + 2 }).map((_, i) => (
          <circle
            key={i}
            cx={20 + pick(120, i * 5)}
            cy={20 + pick(80, i * 9)}
            r={6 + pick(26, i * 13)}
            fill="none"
            stroke="rgb(233 237 243 / .14)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}

      {variant === 2 && (
        <>
          <path
            d={`M0 ${70 + pick(20, 2)} Q40 ${30 + pick(30, 4)} 80 ${60 + pick(20, 6)} T160 ${
              50 + pick(30, 8)
            }`}
            fill="none"
            stroke="rgb(233 237 243 / .22)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`M0 ${88 + pick(14, 12)} Q40 ${52 + pick(24, 14)} 80 ${78 + pick(18, 16)} T160 ${
              70 + pick(24, 18)
            }`}
            fill="none"
            stroke="rgb(233 237 243 / .14)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}

      {variant === 3 &&
        Array.from({ length: bands + 3 }).map((_, i) => (
          <rect
            key={i}
            x={pick(150, i * 3)}
            y={pick(110, i * 4)}
            width={8 + pick(40, i * 6)}
            height={4 + pick(18, i * 8)}
            rx="2"
            fill="rgb(233 237 243 / .09)"
          />
        ))}

      {variant === 4 && (
        <>
          <polygon
            points={`${20 + pick(30, 1)},100 ${70 + pick(20, 2)},${28 + pick(20, 3)} ${
              130 + pick(20, 4)
            },100`}
            fill="rgb(11 14 19 / .45)"
          />
          <polygon
            points={`0,100 ${40 + pick(24, 5)},${52 + pick(24, 6)} ${90 + pick(20, 7)},100`}
            fill="rgb(11 14 19 / .6)"
          />
          <circle cx={124} cy={30} r={9} fill="rgb(233 237 243 / .18)" />
        </>
      )}

      <rect width="160" height="120" fill={`url(#f-${seed})`} />
    </svg>
  )
}
