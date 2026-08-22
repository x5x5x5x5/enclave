import { cx } from '../../lib/cx'

/**
 * Murmur replaces unread counts everywhere. A 3px shimmer under a space icon,
 * breathing faster the more the room is talking. Aliveness without numbers,
 * which is the only honest thing to show next to a fuzzed member count.
 */
export function Murmur({
  intensity,
  className,
  width = 20,
}: {
  intensity: number
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
        /* Aliveness, not colour: the shimmer is ink so it never competes. */
        background: 'var(--text-low)',
        opacity: opacity * 0.8,
        animation: `murmur ${duration}s var(--ease) infinite`,
        transformOrigin: 'center',
      }}
    />
  )
}
