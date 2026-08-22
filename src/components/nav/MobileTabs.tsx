import { NavLink, useLocation } from 'react-router-dom'
import { Layers, MessagesSquare, Plus, Vault } from 'lucide-react'
import { useApp } from '../../state/app'
import { MaskAvatar } from '../identity/MaskAvatar'
import { cx } from '../../lib/cx'
import { useUi } from '../../state/ui'

type TabIcon = typeof MessagesSquare

/** `icon: null` on You — that tab shows your actual mask instead of a glyph. */
const tabs: { to: string | null; label: string; icon: TabIcon | null }[] = [
  { to: '/chats', label: 'Chats', icon: MessagesSquare },
  { to: '/spaces', label: 'Spaces', icon: Layers },
  { to: null, label: 'New', icon: Plus },
  { to: '/vault', label: 'Vault', icon: Vault },
  { to: '/you', label: 'You', icon: null },
]

export function MobileTabs() {
  const openOverlay = useUi((s) => s.openOverlay)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const location = useLocation()

  return (
    <nav
      aria-label="Sections"
      className="flex shrink-0 items-stretch border-t border-[var(--line-soft)] bg-ink-1 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((t) => {
        const Icon = t.icon
        if (!t.to && Icon) {
          return (
            <button
              key={t.label}
              aria-label="New"
              onClick={() => openOverlay('command-palette')}
              className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-card bg-accent text-[var(--ink-0)]">
                <Icon size={18} strokeWidth={1.8} />
              </span>
            </button>
          )
        }
        if (!t.to) return null
        const active = location.pathname.startsWith(t.to)
        return (
          <NavLink
            key={t.to}
            to={t.to}
            className={cx(
              'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-12 transition-colors',
              active ? 'text-accent' : 'text-low',
            )}
          >
            {Icon ? (
              <Icon size={19} strokeWidth={1.5} />
            ) : (
              /* Your face, not a generic person glyph: identity is always on screen. */
              <MaskAvatar maskId={activeMaskId} size={20} presence={false} ring={false} />
            )}
            {t.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
