import { useEffect, useState } from 'react'
import { cx } from '../../lib/cx'
import { humanDuration, retentionLabel, retentionSentence } from '../../lib/time'
import { useNow } from '../../lib/useNow'
import type { Retention } from '../../mock/types'
import { Chip } from '../primitives/Chip'
import { Tooltip } from '../primitives/Overlay'
import { HourglassGlyph } from '../trust/Glyphs'

/* -- EmberRing ------------------------------------------------------------- */

/**
 * The ephemerality mark. A radial that depletes. Everything with a lifespan in
 * this product wears one, at the size the surface can afford.
 */
export function EmberRing({
  expiresAt,
  totalMs,
  size = 14,
  strokeWidth = 1.6,
  showLabel = false,
  className,
}: {
  expiresAt?: string
  totalMs?: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
  className?: string
}) {
  const now = useNow(1000)
  if (!expiresAt || !totalMs) return null

  const remaining = Math.max(0, new Date(expiresAt).getTime() - now)
  const fraction = Math.min(1, Math.max(0, remaining / totalMs))
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r

  return (
    <span className={cx('inline-flex items-center gap-1', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ember)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - fraction)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      {showLabel ? (
        <span className="mono-num text-12 text-ember">{humanDuration(remaining)}</span>
      ) : null}
    </span>
  )
}

/* -- RetentionChip --------------------------------------------------------- */

export function RetentionChip({
  retention,
  className,
  withGlyph = true,
}: {
  retention: Retention
  className?: string
  withGlyph?: boolean
}) {
  return (
    <Tooltip side="bottom" label={retentionSentence(retention)}>
      {/* At rest this is a fact, not an alarm: neutral chip, ember only on the
          ring that is actually depleting in view. */}
      <Chip
        tone="neutral"
        className={className}
        icon={withGlyph ? <span className="text-low">◔</span> : undefined}
      >
        <span className="mono-num">{retentionLabel(retention)}</span>
      </Chip>
    </Tooltip>
  )
}

/* -- Countdown ------------------------------------------------------------- */

export function Countdown({
  until,
  prefix,
  className,
  tone = 'ember',
}: {
  until: string
  prefix?: string
  className?: string
  tone?: 'ember' | 'mid'
}) {
  const now = useNow(1000)
  const remaining = Math.max(0, new Date(until).getTime() - now)
  return (
    <span
      className={cx(
        'mono-num inline-flex items-center gap-1 text-12',
        tone === 'ember' ? 'text-ember' : 'text-mid',
        className,
      )}
    >
      <HourglassGlyph size={12} />
      {prefix ? <span className="font-ui">{prefix}</span> : null}
      {humanDuration(remaining)}
    </span>
  )
}

/* -- UndoSendBar ----------------------------------------------------------- */

export function UndoSendBar({
  until,
  onUndo,
  onDone,
}: {
  until: string
  onUndo: () => void
  onDone: () => void
}) {
  const [fraction, setFraction] = useState(1)

  useEffect(() => {
    const end = new Date(until).getTime()
    const start = Date.now()
    const span = Math.max(1, end - start)
    let raf = 0
    const tick = () => {
      const left = Math.max(0, end - Date.now())
      setFraction(left / span)
      if (left <= 0) {
        onDone()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [until, onDone])

  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${fraction * 100}%`, transition: 'width 80ms linear' }}
        />
      </div>
      <button
        onClick={onUndo}
        className="min-h-11 shrink-0 md:min-h-9 rounded-chip px-2.5 text-13 text-accent transition-colors hover:bg-accent-soft"
      >
        Undo
      </button>
    </div>
  )
}

/* -- Horizon --------------------------------------------------------------- */

/** Scrollback does not fade into infinity. It ends, and the edge says so. */
export function Horizon({ note }: { note?: string }) {
  return (
    <div className="relative select-none pb-6 pt-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16"
        style={{
          background:
            'linear-gradient(to bottom, rgb(var(--ember-rgb) / .07), rgb(var(--ember-rgb) / 0))',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      />
      <div className="relative flex items-center gap-3">
        <span
          className="h-px flex-1"
          style={{
            background: 'linear-gradient(to right, transparent, rgb(var(--ember-rgb) / .15))',
          }}
        />
        <span className="text-12 text-low">{note ?? 'Messages before this point have expired.'}</span>
        <span
          className="h-px flex-1"
          style={{
            background: 'linear-gradient(to left, transparent, rgb(var(--ember-rgb) / .15))',
          }}
        />
      </div>
    </div>
  )
}
