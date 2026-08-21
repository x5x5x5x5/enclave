import { NavLink, useLocation } from 'react-router-dom'
import { Layers, MessagesSquare, Plus, User, Vault } from 'lucide-react'
import { cx } from '../../lib/cx'
import { useUi } from '../../state/ui'

const tabs = [
  { to: '/chats', label: 'Chats', icon: MessagesSquare },
  { to: '/spaces', label: 'Spaces', icon: Layers },
  { to: null, label: 'New', icon: Plus },
  { to: '/vault', label: 'Vault', icon: Vault },
  { to: '/you', label: 'You', icon: User },
]

export function MobileTabs() {
  const openOverlay = useUi((s) => s.openOverlay)
  const location = useLocation()

  return (
    <nav
      aria-label="Sections"
      className="flex shrink-0 items-stretch border-t border-[var(--line-soft)] bg-ink-1 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map((t) => {
        const Icon = t.icon
        if (!t.to) {
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
            <Icon size={19} strokeWidth={1.5} />
            {t.label}
          </NavLink>
        )
      })}
    </nav>
  )
}
