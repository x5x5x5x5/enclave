import { cx } from '../../lib/cx'

/** Three bars, no bouncing. Speaking is a state, not a party trick. */
export function Waveform({
  bars = 3,
  size = 14,
  tone = 'accent',
  className,
  active = true,
}: {
  bars?: number
  size?: number
  tone?: 'accent' | 'mid'
  className?: string
  active?: boolean
}) {
  return (
    <span
      className={cx('inline-flex items-center gap-[2px]', className)}
      style={{ height: size }}
      aria-hidden="true"
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full"
          style={{
            height: size,
            background: tone === 'accent' ? 'var(--accent)' : 'var(--text-mid)',
            transformOrigin: 'center',
            animation: active ? `bar ${0.8 + i * 0.18}s var(--ease) infinite` : undefined,
            transform: active ? undefined : 'scaleY(0.35)',
            opacity: active ? 1 : 0.5,
          }}
        />
      ))}
    </span>
  )
}
