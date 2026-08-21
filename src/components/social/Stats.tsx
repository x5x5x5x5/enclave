import { cx } from '../../lib/cx'
import { fnv1a } from '../../lib/hash'
import type { SocialStats } from '../../mock/types'

/* -- AuraMeter ------------------------------------------------------------- */

const TREND = [
  { key: 'trend7' as const, label: '7d' },
  { key: 'trend30' as const, label: '30d' },
  { key: 'trend90' as const, label: '90d' },
]

/** Visibility, as a thin arc. Opt-in, and it says so when it is off. */
export function AuraMeter({ aura, compact }: { aura: SocialStats['aura']; compact?: boolean }) {
  const max = 1000
  const fraction = Math.min(1, aura.score / max)
  const size = compact ? 96 : 128
  const stroke = 5
  const r = (size - stroke) / 2
  const circumference = Math.PI * r // half circle

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size / 2 + 10 }}>
        <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
          <path
            d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`}
            fill="none"
            stroke="var(--line)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          <path
            d={`M ${stroke / 2} ${size / 2} A ${r} ${r} 0 0 1 ${size - stroke / 2} ${size / 2}`}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fraction)}
            style={{ transition: 'stroke-dashoffset var(--dur-overlay) var(--ease)' }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <p className="mono-num text-24 leading-none text-hi">{aura.score}</p>
          <p className="mt-0.5 text-12 text-low">Aura</p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex gap-4">
          {TREND.map((t) => {
            const v = aura[t.key]
            const up = v >= 0
            return (
              <div key={t.key}>
                <p className="text-12 text-low">{t.label}</p>
                <p
                  className={cx('mono-num text-14', up ? 'text-accent' : 'text-mid')}
                  title={`${up ? 'up' : 'down'} ${Math.abs(v)}%`}
                >
                  {up ? '+' : ''}
                  {v}%
                </p>
              </div>
            )
          })}
        </div>
        <Sparkline series={aura.series} className="mt-3" />
        <p className="mt-2 text-12 text-low">
          Peak day: <span className="text-mid">{aura.peakDay}</span>
        </p>
      </div>
    </div>
  )
}

function Sparkline({ series, className }: { series: number[]; className?: string }) {
  const max = Math.max(...series)
  const min = Math.min(...series)
  const span = Math.max(1, max - min)
  const points = series
    .map((v, i) => `${(i / (series.length - 1)) * 100},${24 - ((v - min) / span) * 22}`)
    .join(' ')
  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" className={cx('h-7 w-full', className)}>
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* -- ReputationLaurel ------------------------------------------------------ */

const TIERS = ['Local', 'Known', 'Respected', 'Renowned', 'Legend'] as const

export function ReputationLaurel({
  reputation,
  compact,
}: {
  reputation: SocialStats['reputation']
  compact?: boolean
}) {
  const index = TIERS.indexOf(reputation.tier)
  const size = compact ? 44 : 62

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
          {/* laurel: two mirrored arcs of leaves, count grows with tier */}
          {[-1, 1].map((side) =>
            Array.from({ length: index + 2 }).map((_, i) => {
              const t = 0.16 + (i / (index + 2)) * 0.7
              const angle = Math.PI * (0.5 + side * (0.15 + t * 0.62))
              const cx0 = 32 + Math.cos(angle) * 24
              const cy0 = 34 - Math.sin(angle) * 24
              return (
                <ellipse
                  key={`${side}-${i}`}
                  cx={cx0}
                  cy={cy0}
                  rx="5"
                  ry="2.4"
                  fill="var(--accent)"
                  opacity={0.35 + i * 0.1}
                  transform={`rotate(${(angle * 180) / Math.PI + (side > 0 ? 90 : -90)} ${cx0} ${cy0})`}
                />
              )
            }),
          )}
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fill="var(--text-hi)"
            fontSize="17"
            fontFamily="var(--font-display)"
            fontWeight="650"
          >
            {index + 1}
          </text>
        </svg>
      </div>

      <div className="min-w-0">
        <p className="font-display text-17 text-hi">{reputation.tier}</p>
        <p className="mono-num text-12 text-low">{reputation.points.toLocaleString()} points</p>
        <div className="mt-1.5 flex gap-1">
          {TIERS.map((t, i) => (
            <span
              key={t}
              title={t}
              className={cx(
                'h-1 w-6 rounded-full',
                i <= index ? 'bg-accent' : 'bg-[var(--line)]',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/* -- BadgeTile ------------------------------------------------------------- */

export function BadgeTile({
  badge,
}: {
  badge: SocialStats['reputation']['badges'][number]
}) {
  const tone =
    badge.kind === 'seasonal'
      ? { border: 'var(--ember-glow)', bg: 'var(--ember-soft)', text: 'var(--ember)' }
      : badge.kind === 'secret'
        ? { border: 'var(--line)', bg: 'var(--ink-2)', text: 'var(--text-low)' }
        : { border: 'var(--accent-line)', bg: 'var(--accent-soft)', text: 'var(--accent)' }

  return (
    <div
      title={badge.note}
      className="flex items-center gap-2.5 rounded-card border p-2.5"
      style={{ borderColor: tone.border, background: tone.bg }}
    >
      <span
        className="mono-num flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border text-12"
        style={{ borderColor: tone.border, color: tone.text }}
      >
        {badge.glyph}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-13 text-hi">{badge.name}</span>
        <span className="block text-12 capitalize text-low">{badge.kind}</span>
      </span>
    </div>
  )
}

/* -- QR ------------------------------------------------------------------- */

/** A mock QR. Deterministic modules, real finder patterns, no library. */
export function QrMark({ seed, size = 96 }: { seed: string; size?: number }) {
  const n = 25
  const cells: boolean[] = []
  for (let i = 0; i < n * n; i++) cells.push((fnv1a(`${seed}:${i}`) & 7) > 3)

  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`} aria-label="Scan to connect">
      <rect width={n} height={n} fill="var(--text-hi)" rx="1" />
      {cells.map((on, i) => {
        const x = i % n
        const y = Math.floor(i / n)
        if (isFinder(x, y) || !on) return null
        return <rect key={i} x={x} y={y} width="1" height="1" fill="var(--ink-0)" />
      })}
      {[
        [0, 0],
        [n - 7, 0],
        [0, n - 7],
      ].map(([fx, fy]) => (
        <g key={`${fx}-${fy}`}>
          <rect x={fx} y={fy} width="7" height="7" fill="var(--ink-0)" />
          <rect x={fx + 1} y={fy + 1} width="5" height="5" fill="var(--text-hi)" />
          <rect x={fx + 2} y={fy + 2} width="3" height="3" fill="var(--ink-0)" />
        </g>
      ))}
    </svg>
  )
}
