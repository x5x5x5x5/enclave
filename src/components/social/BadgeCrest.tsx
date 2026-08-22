import { useId } from 'react'
import { cx } from '../../lib/cx'

/**
 * Badges you would want.
 *
 * A mono two-letter chip in a grey box reads like a database column. A badge is
 * a thing you earned, so it gets a shape (the crest), a drawn mark, and a
 * treatment per kind: seasonal crests are cut from a warm metal, community ones
 * from the space's own colour, and secret ones stay deliberately obscured — you
 * can see there is something there and not what it is.
 */

const KIND_TONE = {
  seasonal: {
    a: 'rgb(var(--ember-vivid-rgb) / 1)',
    b: 'rgb(var(--ember-vivid-rgb) / .35)',
    edge: 'rgb(var(--ember-vivid-rgb) / .7)',
  },
  community: {
    a: 'rgb(var(--accent-vivid-rgb) / .95)',
    b: 'rgb(var(--accent-vivid-rgb) / .3)',
    edge: 'rgb(var(--accent-vivid-rgb) / .6)',
  },
  secret: {
    a: 'rgb(var(--text-hi-rgb) / .5)',
    b: 'rgb(var(--text-hi-rgb) / .1)',
    edge: 'var(--line)',
  },
} as const

export type BadgeKind = keyof typeof KIND_TONE

export function BadgeCrest({
  id,
  kind,
  size = 48,
  className,
}: {
  id: string
  kind: BadgeKind
  size?: number
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const tone = KIND_TONE[kind]
  const light = (a: number) => `rgb(var(--text-hi-rgb) / ${a})`
  const ink = (a: number) => `rgb(var(--ink-0-rgb) / ${a})`

  // A hexagonal crest — the shape reads as "awarded" at any size.
  const crest = 'M24 2 42 12v24L24 46 6 36V12z'

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
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={tone.a} />
          <stop offset="100%" stopColor={tone.b} />
        </linearGradient>
        <clipPath id={`c${uid}`}>
          <path d={crest} />
        </clipPath>
      </defs>

      <path d={crest} fill={`url(#b${uid})`} />

      <g clipPath={`url(#c${uid})`}>
        {/* A highlight across the top third, so the crest reads as struck metal. */}
        <path d="M0 0h48v18L0 26z" fill={light(0.16)} />

        {id === 'bd-season1' && (
          <>
            <path
              d="M24 12l2.6 6 6.4.6-4.8 4.3 1.4 6.3L24 26l-5.6 3.2 1.4-6.3-4.8-4.3 6.4-.6z"
              fill={ink(0.7)}
            />
            <text
              x="24"
              y="41"
              textAnchor="middle"
              fill={ink(0.75)}
              fontSize="10"
              fontFamily="var(--font-display)"
              fontWeight="700"
            >
              S1
            </text>
          </>
        )}

        {id === 'bd-raidlead' && (
          <>
            <path d="M15 33 33 15M33 33 15 15" stroke={ink(0.72)} strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="24" cy="24" r="4.5" fill={ink(0.75)} />
            <circle cx="24" cy="24" r="1.8" fill={light(0.9)} />
          </>
        )}

        {id === 'bd-quiet' && (
          <>
            {/* Deliberately unreadable: you can tell it exists, not what it is. */}
            <g fill={ink(0.55)}>
              <rect x="12" y="16" width="24" height="3.5" rx="1.75" />
              <rect x="16" y="23" width="16" height="3.5" rx="1.75" />
              <rect x="13" y="30" width="22" height="3.5" rx="1.75" />
            </g>
            <circle cx="24" cy="24" r="9" fill={ink(0.35)} />
            <path
              d="M24 20a3 3 0 0 1 3 3v1h-6v-1a3 3 0 0 1 3-3zm-4 5h8v5h-8z"
              fill={light(0.55)}
            />
          </>
        )}

        {id === 'bd-margins' && (
          <>
            <path d="M15 12h13l6 6v18H15z" fill={ink(0.65)} />
            <path d="M28 12v6h6z" fill={light(0.35)} />
            <path d="M19 24h9M19 29h6" stroke={light(0.6)} strokeWidth="2" strokeLinecap="round" />
            <path d="M30 32l5-5 2 2-5 5-3 1z" fill={light(0.85)} />
          </>
        )}

        {id === 'bd-winter' && (
          <g stroke={ink(0.7)} strokeWidth="2.6" strokeLinecap="round">
            <path d="M24 13v22M14.5 18.5l19 11M33.5 18.5l-19 11" />
            <path d="M20 16l4 3 4-3M20 32l4-3 4 3" strokeWidth="2" />
          </g>
        )}

        {id === 'bd-relay' && (
          <>
            <path d="M12 24h24" stroke={ink(0.6)} strokeWidth="2.4" />
            <circle cx="12" cy="24" r="4" fill={ink(0.75)} />
            <circle cx="36" cy="24" r="4" fill={ink(0.75)} />
            <circle cx="24" cy="24" r="6" fill="none" stroke={light(0.9)} strokeWidth="2.6" />
          </>
        )}
      </g>

      <path d={crest} fill="none" stroke={tone.edge} strokeWidth="1.6" />
    </svg>
  )
}
