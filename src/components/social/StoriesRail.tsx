import { Plus } from 'lucide-react'
import { cx } from '../../lib/cx'
import { maskById } from '../../mock/masks'
import type { Hue } from '../../mock/types'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { AvatarMark } from '../identity/AvatarMark'

/** Conic ring in the author's mask hue. Seen stories drop to a flat hairline. */
export function StoryRing({
  hue,
  seen,
  size = 52,
  children,
}: {
  hue: Hue
  seen?: boolean
  size?: number
  children: React.ReactNode
}) {
  return (
    <span
      className="relative inline-flex items-center justify-center rounded-full p-[2px]"
      style={{
        width: size,
        height: size,
        background: seen
          ? 'var(--line)'
          : `conic-gradient(from 210deg, rgb(var(--hue-${hue}-rgb) / .25), var(--hue-${hue}), rgb(var(--hue-${hue}-rgb) / .25))`,
      }}
    >
      <span className="flex h-full w-full items-center justify-center rounded-full bg-ink-1 p-[2px]">
        {children}
      </span>
    </span>
  )
}

export function StoriesRail() {
  const stories = useWorld((s) => s.stories)
  const openOverlay = useUi((s) => s.openOverlay)
  const activeMaskId = useApp((s) => s.activeMaskId)

  const order: string[] = []
  const byAuthor = new Map<string, typeof stories>()
  for (const s of stories) {
    if (!byAuthor.has(s.authorMaskId)) {
      byAuthor.set(s.authorMaskId, [])
      order.push(s.authorMaskId)
    }
    byAuthor.get(s.authorMaskId)!.push(s)
  }
  // Your own ring first, then everyone else in fixture order.
  order.sort((a, b) => Number(b === activeMaskId) - Number(a === activeMaskId))

  return (
    <div
      className="relative shrink-0 hairline-b"
      style={{
        maskImage: 'linear-gradient(to right, black 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, black 88%, transparent)',
      }}
    >
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-3 py-3">
        <button
          onClick={() => openOverlay('story-composer')}
          aria-label="Add a story"
          className="flex w-14 shrink-0 flex-col items-center gap-1.5"
        >
          <span
            className="flex h-13 w-13 items-center justify-center rounded-full border border-dashed border-[var(--line)] text-low transition-colors hover:border-[color:var(--accent-line)] hover:text-accent"
            style={{ width: 52, height: 52 }}
          >
            <Plus size={18} strokeWidth={1.5} />
          </span>
          <span className="w-full truncate text-center text-12 text-low">Add</span>
        </button>

        {order.map((maskId) => {
          const mask = maskById(maskId)
          const items = byAuthor.get(maskId)!
          const seen = items.every((s) => s.seen)
          return (
            <button
              key={maskId}
              onClick={() => openOverlay('story-viewer', maskId)}
              aria-label={`Stories from ${mask.displayName}`}
              className="flex w-14 shrink-0 flex-col items-center gap-1.5"
            >
              <StoryRing hue={mask.hue} seen={seen}>
                <AvatarMark preset={mask.avatar} hue={mask.hue} size={44} />
              </StoryRing>
              <span
                className={cx(
                  'w-full truncate text-center text-12',
                  seen ? 'text-low' : 'text-mid',
                )}
              >
                {maskId === activeMaskId ? 'You' : mask.displayName}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
