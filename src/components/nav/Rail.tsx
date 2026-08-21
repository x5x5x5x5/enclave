import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Compass, MessagesSquare, Settings, Vault } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cx } from '../../lib/cx'
import { COMMUNITIES } from '../../mock/communities'
import { maskById } from '../../mock/masks'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { MaskAvatar } from '../identity/MaskAvatar'
import { Tooltip } from '../primitives/Overlay'
import { Murmur } from './Murmur'

function RailTile({
  to,
  label,
  children,
  active,
  onClick,
}: {
  to?: string
  label: string
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  const cls = (isActive: boolean) =>
    cx(
      'flex h-11 w-11 items-center justify-center rounded-card border transition-[background-color,border-color,color] duration-[var(--dur-std)] ease-enclave',
      isActive
        ? 'border-[color:var(--accent-line)] bg-accent-soft text-accent'
        : 'border-transparent bg-ink-1 text-mid hover:border-[var(--line)] hover:bg-ink-2 hover:text-hi',
    )

  const inner = <Tooltip side="right" label={label}>{children}</Tooltip>

  if (!to) {
    return (
      <button aria-label={label} onClick={onClick} className={cls(!!active)}>
        {inner}
      </button>
    )
  }
  return (
    <NavLink to={to} aria-label={label} className={({ isActive }) => cls(isActive || !!active)}>
      {inner}
    </NavLink>
  )
}

export function Rail() {
  const activeMaskId = useApp((s) => s.activeMaskId)
  const presence = useApp((s) => s.presence)
  const openOverlay = useUi((s) => s.openOverlay)
  const demoMode = useWorld((s) => s.demoMode)
  const location = useLocation()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const mask = maskById(activeMaskId)

  return (
    <nav
      aria-label="Spaces"
      className="flex w-[72px] shrink-0 flex-col items-center gap-2 border-r border-[var(--line-soft)] bg-ink-0 py-3"
    >
      <motion.button
        key={activeMaskId}
        aria-label="Switch mask"
        onClick={() => openOverlay('mask-switcher')}
        initial={reduce ? false : { rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.25, ease: [0.2, 0, 0, 1] }}
        className="rounded-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Tooltip side="right" label={`${mask.displayName} · switch mask`}>
          <MaskAvatar
            mask={{ ...mask, presence: presence[mask.id] ?? mask.presence }}
            size={40}
          />
        </Tooltip>
      </motion.button>

      <span className="my-1 h-px w-7 bg-[var(--line-soft)]" />

      <RailTile to="/chats" label="Chats">
        <MessagesSquare size={19} strokeWidth={1.5} />
      </RailTile>

      <div className="flex flex-col items-center gap-2 py-1">
        {COMMUNITIES.map((c) => {
          const isActive = location.pathname.startsWith(`/space/${c.id}`)
          return (
            <div key={c.id} className="flex flex-col items-center gap-1">
              <button
                aria-label={c.name}
                onClick={() => navigate(`/space/${c.id}`)}
                className={cx(
                  'flex h-11 w-11 items-center justify-center rounded-card border font-display text-13 tracking-tight transition-[background-color,border-color,color] duration-[var(--dur-std)]',
                  isActive
                    ? 'text-hi'
                    : 'border-transparent bg-ink-1 text-mid hover:bg-ink-2 hover:text-hi',
                )}
                style={
                  isActive
                    ? {
                        borderColor: `rgb(var(--hue-${c.hue}-rgb) / .5)`,
                        background: `rgb(var(--hue-${c.hue}-rgb) / .12)`,
                        color: `var(--hue-${c.hue})`,
                      }
                    : undefined
                }
              >
                <Tooltip side="right" label={`${c.name} · ${c.memberEstimate}`}>
                  {c.icon}
                </Tooltip>
              </button>
              <Murmur intensity={demoMode ? Math.min(1, c.murmur + 0.1) : c.murmur} hue={c.hue} />
            </div>
          )
        })}
      </div>

      <span className="my-1 h-px w-7 bg-[var(--line-soft)]" />

      <RailTile to="/discover" label="Discover spaces">
        <Compass size={19} strokeWidth={1.5} />
      </RailTile>

      <div className="mt-auto flex flex-col items-center gap-2">
        <RailTile to="/vault" label="Vault">
          <Vault size={19} strokeWidth={1.5} />
        </RailTile>
        <RailTile to="/settings" label="Settings">
          <Settings size={19} strokeWidth={1.5} />
        </RailTile>
      </div>
    </nav>
  )
}
