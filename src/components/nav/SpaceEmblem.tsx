import { useId } from 'react'
import { cx } from '../../lib/cx'
import type { Hue } from '../../mock/types'

/**
 * Space emblems.
 *
 * A community is a place, and places have signs. Two initials in a rounded box
 * says "row in a database"; a crest says "somewhere you belong to". Each space
 * gets a drawn mark keyed by its id, with initials as the fallback for spaces
 * that have not been designed yet.
 *
 * Like avatars, these are imagery: they carry their own colour.
 */

type EmblemId =
  | 'c-lostera'
  | 'c-atelier'
  | 'c-reading'
  | 'ds-lostera'
  | 'ds-reading'
  | 'ds-atelier'
  | 'ds-kiln'
  | 'ds-northrack'
  | 'ds-nightshift'
  | 'ds-quires'
  | 'ds-thirdcircle'

const ALIASES: Record<string, EmblemId> = {
  'ds-lostera': 'c-lostera',
  'ds-reading': 'c-reading',
  'ds-atelier': 'c-atelier',
}

export function SpaceEmblem({
  id,
  hue,
  fallback,
  size = 44,
  radius = 10,
  className,
}: {
  id: string
  hue: Hue
  /** Initials, used when a space has no drawn mark. */
  fallback: string
  size?: number
  radius?: number
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const key = (ALIASES[id] ?? id) as EmblemId
  const rgb = `var(--hue-${hue}-vivid-rgb)`
  const tint = (a: number) => `rgb(${rgb} / ${a})`
  const ink = (a: number) => `rgb(var(--ink-0-rgb) / ${a})`
  const light = (a: number) => `rgb(var(--text-hi-rgb) / ${a})`

  const known =
    key === 'c-lostera' ||
    key === 'c-atelier' ||
    key === 'c-reading' ||
    key === 'ds-kiln' ||
    key === 'ds-northrack' ||
    key === 'ds-nightshift' ||
    key === 'ds-quires' ||
    key === 'ds-thirdcircle'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      data-imagery="true"
      className={cx('block shrink-0', className)}
    >
      <defs>
        <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint(0.95)} />
          <stop offset="100%" stopColor={tint(0.35)} />
        </linearGradient>
        <clipPath id={`k${uid}`}>
          <rect width="48" height="48" rx={(radius / size) * 48} />
        </clipPath>
      </defs>

      <g clipPath={`url(#k${uid})`}>
        <rect width="48" height="48" fill={`url(#g${uid})`} />

        {/* LostEra — a cracked crown. A gaming hall with history. */}
        {key === 'c-lostera' && (
          <>
            <path d="M9 32 6 15l9 6 9-11 9 11 9-6-3 17z" fill={light(0.92)} />
            <path d="M9 32h30l1 5H8z" fill={light(0.6)} />
            <path d="M24 10v27" stroke={ink(0.55)} strokeWidth="1.6" />
            <circle cx="24" cy="18" r="2" fill={ink(0.6)} />
          </>
        )}

        {/* Atelier Nord — a compass needle over a studio grid. */}
        {key === 'c-atelier' && (
          <>
            <g stroke={light(0.22)} strokeWidth="1">
              <path d="M12 6v36M24 6v36M36 6v36M6 12h36M6 24h36M6 36h36" />
            </g>
            <path d="M24 8 30 26 24 22 18 26z" fill={light(0.95)} />
            <path d="M24 40 18 22l6 4 6-4z" fill={tint(0.95)} />
          </>
        )}

        {/* The Reading Room — an open book, one page in shadow. */}
        {key === 'c-reading' && (
          <>
            <path d="M24 14c-5-4-11-4-16-2v22c5-2 11-2 16 2z" fill={light(0.85)} />
            <path d="M24 14c5-4 11-4 16-2v22c-5-2-11-2-16 2z" fill={light(0.45)} />
            <path d="M24 14v22" stroke={ink(0.7)} strokeWidth="2" />
            <rect x="22" y="8" width="4" height="14" rx="1" fill={tint(1)} />
          </>
        )}

        {/* Kiln & Co — a pot in the mouth of a kiln. */}
        {key === 'ds-kiln' && (
          <>
            <path d="M8 40V22a16 16 0 0 1 32 0v18z" fill={ink(0.5)} />
            <path d="M17 40V27c0-4 3-6 7-6s7 2 7 6v13z" fill={tint(0.95)} />
            <rect x="6" y="39" width="36" height="4" rx="1.5" fill={light(0.7)} />
          </>
        )}

        {/* North Rack — a server rack with one lit unit. */}
        {key === 'ds-northrack' && (
          <>
            <rect x="11" y="7" width="26" height="34" rx="3" fill={ink(0.55)} />
            {[12, 19, 26, 33].map((y, i) => (
              <rect
                key={y}
                x="14"
                y={y}
                width="20"
                height="4"
                rx="1"
                fill={i === 1 ? tint(1) : light(0.35)}
              />
            ))}
          </>
        )}

        {/* Night Shift — a crescent over a flat horizon. */}
        {key === 'ds-nightshift' && (
          <>
            <path d="M31 9a15 15 0 1 0 0 26 18 18 0 0 1 0-26z" fill={light(0.9)} />
            <circle cx="14" cy="13" r="1.6" fill={light(0.55)} />
            <circle cx="38" cy="20" r="1.2" fill={light(0.4)} />
            <rect x="0" y="38" width="48" height="10" fill={ink(0.7)} />
          </>
        )}

        {/* Quires — folded sheets, nested. */}
        {key === 'ds-quires' && (
          <>
            <path d="M10 12h18l10 10v18H10z" fill={light(0.85)} />
            <path d="M28 12v10h10z" fill={ink(0.45)} />
            <path d="M6 18h6v22h20v6H6z" fill={tint(0.9)} />
          </>
        )}

        {/* Third Circle — three rings, one broken. */}
        {key === 'ds-thirdcircle' && (
          <>
            <circle cx="24" cy="24" r="16" fill="none" stroke={light(0.75)} strokeWidth="2.4" />
            <circle cx="24" cy="24" r="10" fill="none" stroke={tint(0.95)} strokeWidth="2.4" />
            <circle
              cx="24"
              cy="24"
              r="4"
              fill="none"
              stroke={light(0.55)}
              strokeWidth="2.4"
              strokeDasharray="14 6"
            />
          </>
        )}

        {!known && (
          <text
            x="24"
            y="30"
            textAnchor="middle"
            fill={light(0.9)}
            fontSize="17"
            fontFamily="var(--font-display)"
            fontWeight="650"
            letterSpacing="-0.5"
          >
            {fallback}
          </text>
        )}
      </g>
      <rect
        width="48"
        height="48"
        rx={(radius / size) * 48}
        fill="none"
        stroke={ink(0.45)}
        strokeWidth="1.5"
      />
    </svg>
  )
}
