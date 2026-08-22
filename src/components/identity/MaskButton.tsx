import { ChevronDown } from 'lucide-react'
import { cx } from '../../lib/cx'
import { maskById } from '../../mock/masks'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { MaskAvatar } from './MaskAvatar'

/**
 * Who you are right now, and the way to change it.
 *
 * On desktop this lives at the top of the rail. On a phone the rail is hidden,
 * which left switching masks reachable only by Cmd+I — a chord no phone has —
 * or by finding it in the palette. For the product's headline feature that is
 * not good enough, so the same control sits at the head of every top-level
 * mobile screen, in the same place every time.
 */
export function MaskButton({ className }: { className?: string }) {
  const activeMaskId = useApp((s) => s.activeMaskId)
  const presence = useApp((s) => s.presence)
  const openOverlay = useUi((s) => s.openOverlay)
  const mask = maskById(activeMaskId)

  return (
    <button
      onClick={() => openOverlay('mask-switcher')}
      aria-label={`You are ${mask.displayName}. Switch mask.`}
      className={cx(
        'flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-[var(--line)] bg-ink-1 py-1 pl-1 pr-2 transition-colors active:bg-ink-2',
        className,
      )}
    >
      <MaskAvatar
        mask={{ ...mask, presence: presence[mask.id] ?? mask.presence }}
        size={30}
      />
      <ChevronDown size={14} strokeWidth={1.8} className="text-low" />
    </button>
  )
}
