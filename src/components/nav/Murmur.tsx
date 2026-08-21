import { cx } from '../../lib/cx'
import type { Hue } from '../../mock/types'

/**
 * Murmur replaces unread counts everywhere. A 3px shimmer under a space icon,
 * breathing faster the more the room is talking. Aliveness without numbers,
 * which is the only honest thing to show next to a fuzzed member count.
 */
export function Murmur({
  intensity,
  hue,
  className,
  width = 20,
}: {
  intensity: number
  hue: Hue
  className?: string
  width?: number
}) {
  if (intensity <= 0.02) return null
  const clamped = Math.min(1, Math.max(0, intensity))
  const duration = 2.8 - clamped * 1.6 // busy rooms breathe faster
  const opacity = 0.3 + clamped * 0.7

  return (
    <span
      aria-hidden="true"
      className={cx('block h-[3px] rounded-full', className)}
      style={{
        width,
        background: `linear-gradient(90deg, transparent, var(--hue-${hue}), transparent)`,
        opacity,
        animation: `murmur ${duration}s var(--ease) infinite`,
        transformOrigin: 'center',
      }}
    />
  )
}
