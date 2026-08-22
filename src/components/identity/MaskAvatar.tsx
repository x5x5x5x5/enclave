import { cx } from '../../lib/cx'
import { maskById } from '../../mock/masks'
import type { Mask, Presence } from '../../mock/types'
import { AvatarMark } from './AvatarMark'

const presenceColor: Record<Presence, string> = {
  online: 'var(--hue-moss)',
  away: 'var(--ember)',
  invisible: 'var(--text-low)',
}

export function MaskAvatar({
  maskId,
  mask,
  size = 32,
  ring = true,
  presence = true,
  speaking = false,
  className,
  onClick,
  title,
}: {
  maskId?: string
  mask?: Mask
  size?: number
  ring?: boolean
  presence?: boolean
  speaking?: boolean
  className?: string
  onClick?: () => void
  title?: string
}) {
  const m = mask ?? maskById(maskId ?? '')
  const dot = Math.max(8, Math.round(size * 0.28))
  // Invisible presence is shown as a hollow dot, never hidden: you always know
  // which of your masks is dark, even when nobody else does.
  const invisible = m.presence === 'invisible'

  // A span, not a div: avatars sit inside <p> labels, tooltips and chips, and
  // a div there is invalid nesting. `block` keeps the layout identical.
  const Wrapper = onClick ? 'button' : 'span'

  return (
    <Wrapper
      onClick={onClick}
      title={title ?? m.displayName}
      aria-label={onClick ? `${m.displayName} ${m.handle}` : undefined}
      className={cx('relative block shrink-0', onClick && 'cursor-pointer', className)}
      style={{ width: size, height: size }}
    >
      <span
        className={cx(
          'block rounded-full transition-shadow duration-[var(--dur-std)]',
          speaking && 'animate-[speak-pulse_1.1s_ease-in-out_infinite]',
        )}
        style={{
          /*
           * A hue ring is identity, not decoration, so it only appears where
           * there is room to read it: 32px and up. In dense lists the ring is a
           * neutral hairline, which is what keeps a chat list to two hues.
           */
          boxShadow: !ring
            ? undefined
            : size >= 32
              ? `0 0 0 2px rgb(var(--hue-${m.hue}-rgb) / 0.7)`
              : `0 0 0 1px var(--line)`,
        }}
      >
        <AvatarMark preset={m.avatar} hue={m.hue} size={size} />
      </span>
      {presence ? (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full"
          style={{
            width: dot,
            height: dot,
            background: invisible ? 'var(--ink-1)' : presenceColor[m.presence],
            border: `2px solid var(--ink-0)`,
            boxShadow: invisible ? `inset 0 0 0 1.5px ${presenceColor.invisible}` : undefined,
          }}
          title={m.presence}
        />
      ) : null}
    </Wrapper>
  )
}

/** Overlapping avatars for group rows and voice channel spill-out. */
export function MaskStack({
  maskIds,
  size = 22,
  max = 4,
  className,
}: {
  maskIds: string[]
  size?: number
  max?: number
  className?: string
}) {
  const shown = maskIds.slice(0, max)
  const extra = maskIds.length - shown.length
  return (
    <div className={cx('flex items-center', className)}>
      {shown.map((id, i) => (
        <span
          key={id}
          className="rounded-full ring-2 ring-[var(--ink-0)]"
          style={{ marginLeft: i === 0 ? 0 : -size * 0.32, zIndex: shown.length - i }}
        >
          <MaskAvatar maskId={id} size={size} presence={false} />
        </span>
      ))}
      {extra > 0 ? (
        <span
          className="mono-num ml-1 rounded-full border border-[var(--line)] bg-ink-2 px-1.5 text-12 leading-[18px] text-low"
          style={{ marginLeft: -size * 0.2, paddingLeft: size * 0.35 }}
        >
          +{extra}
        </span>
      ) : null}
    </div>
  )
}
