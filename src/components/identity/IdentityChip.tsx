import { ChevronDown } from 'lucide-react'
import { cx } from '../../lib/cx'
import { maskById } from '../../mock/masks'
import { HUE_LABEL } from '../../mock/world'
import { MaskAvatar } from './MaskAvatar'

/** "You are here as Aija · cove". Says which of you is in the room. */
export function IdentityChip({
  maskId,
  prefix = 'as',
  onClick,
  size = 'md',
  className,
}: {
  maskId: string
  prefix?: string
  onClick?: () => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const mask = maskById(maskId)
  const Wrapper = onClick ? 'button' : 'span'
  return (
    <Wrapper
      onClick={onClick}
      className={cx(
        'inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-ink-1 transition-colors',
        size === 'sm' ? 'py-0.5 pl-0.5 pr-2' : 'py-1 pl-1 pr-2.5',
        onClick && 'max-md:min-h-11',
        onClick && 'hover:border-[color:var(--accent-line)] hover:bg-ink-2',
        className,
      )}
    >
      <MaskAvatar maskId={mask.id} size={size === 'sm' ? 18 : 22} presence={false} />
      <span className={cx('text-mid', size === 'sm' ? 'text-12' : 'text-13')}>
        {prefix} <span className="font-medium text-hi">{mask.displayName}</span>
        <span className="text-low"> · {HUE_LABEL[mask.hue].toLowerCase()}</span>
      </span>
      {onClick ? <ChevronDown size={13} strokeWidth={1.5} className="text-low" /> : null}
    </Wrapper>
  )
}
