import { useId } from 'react'
import type { Hue } from '../../mock/types'

/**
 * Profile pictures.
 *
 * These are pictures, not glyphs: the kind of thing a person would actually
 * pick — a landscape, a cat, a comet, a stack of books. Everything is drawn
 * inline because the prototype makes no network calls, and each design is built
 * from a handful of bold shapes so it survives being 20px in a chat list and
 * still holds up at 72px on a profile.
 *
 * Colour: imagery is content, not chrome. A picture carries its own colour the
 * way a photograph does in a dark room — see "Colour discipline" in the design
 * system, which exempts imagery from the two-hue rule.
 */

export const AVATAR_ART = [
  'dune',
  'orbit',
  'crane',
  'skyline',
  'tide',
  'summit',
  'shelf',
  'comet',
  'bloom',
  'visor',
  'feline',
  'static',
] as const

export type AvatarArt = (typeof AVATAR_ART)[number]

export function AvatarMark({
  preset,
  hue,
  size = 32,
}: {
  preset: string
  hue: Hue
  size?: number
}) {
  const uid = useId().replace(/:/g, '')
  const H = `var(--hue-${hue})`
  const rgb = `var(--hue-${hue}-vivid-rgb)`
  const tint = (a: number) => `rgb(${rgb} / ${a})`
  const ink = (a: number) => `rgb(var(--ink-0-rgb) / ${a})`
  const light = (a: number) => `rgb(var(--text-hi-rgb) / ${a})`

  const art = (AVATAR_ART as readonly string[]).includes(preset) ? preset : 'dune'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      data-imagery="true"
      style={{ display: 'block' }}
    >
      <defs>
        <clipPath id={`c${uid}`}>
          <circle cx="24" cy="24" r="24" />
        </clipPath>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tint(0.95)} />
          <stop offset="45%" stopColor={tint(0.6)} />
          <stop offset="100%" stopColor={ink(0.55)} />
        </linearGradient>
        <linearGradient id={`dusk${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint(0.7)} />
          <stop offset="100%" stopColor={ink(0.9)} />
        </linearGradient>
      </defs>

      <g clipPath={`url(#c${uid})`}>
        <rect width="48" height="48" fill={`url(#sky${uid})`} />

        {art === 'dune' && (
          <>
            <circle cx="31" cy="16" r="7" fill={light(0.85)} />
            <path d="M0 34c8-7 13-2 20-6s14-6 28 2v18H0z" fill={ink(0.55)} />
            <path d="M0 41c10-6 16 0 24-3s16-3 24 1v9H0z" fill={ink(0.8)} />
          </>
        )}

        {art === 'orbit' && (
          <>
            <circle cx="24" cy="24" r="11" fill={`url(#dusk${uid})`} />
            <circle cx="20" cy="20" r="3" fill={light(0.25)} />
            <circle cx="29" cy="28" r="2" fill={light(0.18)} />
            <ellipse
              cx="24"
              cy="25"
              rx="21"
              ry="6"
              fill="none"
              stroke={light(0.75)}
              strokeWidth="2"
              transform="rotate(-22 24 25)"
            />
          </>
        )}

        {art === 'crane' && (
          <>
            <path d="M6 30 24 8l6 16z" fill={light(0.9)} />
            <path d="M24 8l18 18-18 4z" fill={light(0.55)} />
            <path d="M24 28l6 14-14-8z" fill={tint(0.85)} />
          </>
        )}

        {art === 'skyline' && (
          <>
            <circle cx="12" cy="13" r="5" fill={light(0.8)} />
            <g fill={ink(0.75)}>
              <rect x="2" y="26" width="8" height="22" />
              <rect x="12" y="18" width="7" height="30" />
              <rect x="21" y="30" width="9" height="18" />
              <rect x="32" y="22" width="7" height="26" />
              <rect x="41" y="33" width="7" height="15" />
            </g>
            <g fill={tint(0.9)}>
              <rect x="14" y="22" width="2" height="2" />
              <rect x="14" y="27" width="2" height="2" />
              <rect x="34" y="26" width="2" height="2" />
              <rect x="24" y="34" width="2" height="2" />
            </g>
          </>
        )}

        {art === 'tide' && (
          <>
            <path d="M0 24c9-9 15 5 24-2s15-4 24 3v23H0z" fill={tint(0.8)} />
            <path d="M0 32c9-8 15 5 24-2s15-3 24 3v15H0z" fill={ink(0.55)} />
            <path d="M0 40c10-6 15 4 24-1s15-2 24 2v7H0z" fill={ink(0.85)} />
          </>
        )}

        {art === 'summit' && (
          <>
            <circle cx="36" cy="13" r="5" fill={light(0.75)} />
            <path d="M0 48 18 16l12 20 6-8 12 20z" fill={ink(0.7)} />
            <path d="M18 16l7 12-7 3-6-4z" fill={light(0.85)} />
          </>
        )}

        {art === 'shelf' && (
          <g>
            <rect x="7" y="12" width="7" height="28" rx="1.5" fill={tint(0.9)} />
            <rect x="16" y="17" width="6" height="23" rx="1.5" fill={light(0.7)} />
            <rect x="24" y="10" width="7" height="30" rx="1.5" fill={ink(0.6)} />
            <rect x="33" y="20" width="8" height="20" rx="1.5" fill={tint(0.55)} />
            <rect x="4" y="40" width="40" height="3" rx="1" fill={ink(0.85)} />
          </g>
        )}

        {art === 'comet' && (
          <>
            <path d="M46 4 14 32l-4 10 12-6z" fill={light(0.28)} />
            <circle cx="15" cy="35" r="6" fill={light(0.95)} />
            <circle cx="38" cy="12" r="1.6" fill={light(0.6)} />
            <circle cx="9" cy="12" r="1.2" fill={light(0.45)} />
            <circle cx="40" cy="38" r="1.2" fill={light(0.4)} />
          </>
        )}

        {art === 'bloom' && (
          <>
            <g fill={tint(0.95)}>
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <ellipse
                  key={deg}
                  cx="24"
                  cy="14"
                  rx="6"
                  ry="10"
                  transform={`rotate(${deg} 24 24)`}
                />
              ))}
            </g>
            <circle cx="24" cy="24" r="6" fill={light(0.9)} />
          </>
        )}

        {art === 'visor' && (
          <>
            <path d="M10 20a14 14 0 0 1 28 0v13a9 9 0 0 1-9 9h-10a9 9 0 0 1-9-9z" fill={ink(0.7)} />
            <rect x="14" y="20" width="20" height="9" rx="4.5" fill={tint(0.95)} />
            <rect x="17" y="22" width="5" height="4" rx="2" fill={light(0.6)} />
          </>
        )}

        {art === 'feline' && (
          <>
            <path d="M12 20 9 8l10 6z" fill={ink(0.8)} />
            <path d="M36 20 39 8l-10 6z" fill={ink(0.8)} />
            <path d="M24 12c10 0 15 8 15 17s-6 15-15 15-15-6-15-15 5-17 15-17z" fill={ink(0.8)} />
            <circle cx="18" cy="27" r="2.6" fill={tint(1)} />
            <circle cx="30" cy="27" r="2.6" fill={tint(1)} />
            <path d="M22 34h4l-2 2.5z" fill={light(0.7)} />
          </>
        )}

        {art === 'static' && (
          <g>
            {[6, 13, 20, 27, 34, 41].map((y, i) => (
              <rect
                key={y}
                x={i % 2 ? 0 : 6}
                y={y}
                width={i % 2 ? 48 : 36}
                height="4"
                fill={i % 3 === 0 ? tint(0.9) : light(0.22)}
              />
            ))}
            <rect x="0" y="27" width="48" height="4" fill={light(0.65)} />
          </g>
        )}

        {/* A soft inner edge so the circle reads as a lens, not a sticker. */}
        <circle cx="24" cy="24" r="23" fill="none" stroke={ink(0.35)} strokeWidth="2" />
      </g>
      <circle cx="24" cy="24" r="23.25" fill="none" stroke={H} strokeWidth="1.5" opacity="0.35" />
    </svg>
  )
}
