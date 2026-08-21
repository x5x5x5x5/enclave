import type { Hue } from '../../mock/types'

/**
 * The eight avatar marks. Drawn, not downloaded: a club has a house style, and
 * the mark inherits the mask hue so identity reads at 20px.
 */
export function AvatarMark({ preset, hue, size = 32 }: { preset: string; hue: Hue; size?: number }) {
  const stroke = `var(--hue-${hue})`
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect width="24" height="24" rx="12" fill={`rgb(var(--hue-${hue}-rgb) / .16)`} />
      {preset === 'arc' && (
        <>
          <path d="M6.5 15.5a6 6 0 0 1 11 0" {...common} />
          <path d="M9.5 15.5a3 3 0 0 1 5 0" {...common} />
        </>
      )}
      {preset === 'ring' && (
        <>
          <circle cx="12" cy="12" r="5.5" {...common} />
          <circle cx="12" cy="12" r="1.4" fill={stroke} stroke="none" />
        </>
      )}
      {preset === 'notch' && (
        <path d="M7 7h10v6.5L13.5 17H7z" {...common} />
      )}
      {preset === 'grid' && (
        <>
          {[7.5, 12, 16.5].map((x) =>
            [7.5, 12, 16.5].map((y) =>
              x === 16.5 && y === 7.5 ? null : (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="1.15" fill={stroke} stroke="none" />
              ),
            ),
          )}
        </>
      )}
      {preset === 'wave' && (
        <>
          <path d="M6 13.5c2-3.2 4-3.2 6 0s4 3.2 6 0" {...common} />
          <path d="M6 9.5c2-3.2 4-3.2 6 0" {...common} opacity={0.5} />
        </>
      )}
      {preset === 'prism' && (
        <>
          <path d="M12 6.5 18 17H6z" {...common} />
          <path d="M12 6.5V17" {...common} opacity={0.45} />
        </>
      )}
      {preset === 'stack' && (
        <>
          <rect x="6.5" y="7" width="11" height="3" rx="1.5" {...common} />
          <rect x="8.5" y="11.5" width="9" height="3" rx="1.5" {...common} />
          <rect x="6.5" y="16" width="7" height="3" rx="1.5" {...common} opacity={0.55} />
        </>
      )}
      {preset === 'orbit' && (
        <>
          <circle cx="12" cy="12" r="3.2" {...common} />
          <ellipse cx="12" cy="12" rx="7" ry="3.6" {...common} opacity={0.5} transform="rotate(-24 12 12)" />
          <circle cx="18" cy="9.6" r="1.3" fill={stroke} stroke="none" />
        </>
      )}
    </svg>
  )
}
