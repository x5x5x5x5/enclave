import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Clock,
  Hash,
  Radio,
  Search,
  Sparkles,
  UserSquare,
  Vault as VaultIcon,
  Volume2,
} from 'lucide-react'
import { cx } from '../../lib/cx'
import { COMMUNITIES } from '../../mock/communities'
import { THREADS } from '../../mock/threads'
import { maskById } from '../../mock/masks'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Kbd } from '../primitives/Controls'
import { Modal } from '../primitives/Overlay'
import { IdentityChip } from '../identity/IdentityChip'
import { SealGlyph } from '../trust/Glyphs'

interface Item {
  id: string
  section: 'Recent' | 'Jump to' | 'Actions'
  label: string
  hint?: string
  icon: React.ReactNode
  run: () => void
  keywords?: string
}

export function CommandPalette() {
  const open = useUi((s) => s.overlay) === 'command-palette'
  const closeOverlay = useUi((s) => s.closeOverlay)
  const openOverlay = useUi((s) => s.openOverlay)
  const toast = useUi((s) => s.toast)
  const later = useUi((s) => s.later)
  const navigate = useNavigate()
  const activeMaskId = useApp((s) => s.activeMaskId)
  const demoMode = useWorld((s) => s.demoMode)
  const setDemoMode = useWorld((s) => s.setDemoMode)

  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
    }
  }, [open])

  const items = useMemo<Item[]>(() => {
    const recent: Item[] = [
      {
        id: 'rc-raids',
        section: 'Recent',
        label: 'LostEra · #raids',
        hint: 'expires 24h',
        icon: <Hash size={15} strokeWidth={1.5} />,
        run: () => navigate('/space/c-lostera/ch-raids'),
      },
      {
        id: 'rc-mira',
        section: 'Recent',
        label: 'Mira',
        hint: 'direct',
        icon: <UserSquare size={15} strokeWidth={1.5} />,
        run: () => navigate('/chats/th-mira'),
      },
    ]

    const threads: Item[] = THREADS.filter((t) => t.kind !== 'request').map((t) => ({
      id: `th-${t.id}`,
      section: 'Jump to',
      label: t.title,
      hint: t.kind === 'group' ? t.memberNote : 'direct',
      icon: <UserSquare size={15} strokeWidth={1.5} />,
      run: () => navigate(`/chats/${t.id}`),
      keywords: t.kind,
    }))

    const channels: Item[] = COMMUNITIES.flatMap((c) =>
      c.channels.map((ch) => ({
        id: `ch-${ch.id}`,
        section: 'Jump to' as const,
        label: `${c.name} · ${ch.kind === 'voice' ? ch.name : `#${ch.name}`}`,
        hint: `as ${maskById(c.usingMaskId).displayName}`,
        icon:
          ch.kind === 'voice' ? (
            <Volume2 size={15} strokeWidth={1.5} />
          ) : (
            <Hash size={15} strokeWidth={1.5} />
          ),
        run: () =>
          navigate(
            ch.kind === 'voice'
              ? `/voice/${c.id}/${ch.id}`
              : `/space/${c.id}/${ch.id}`,
          ),
        keywords: c.name,
      })),
    )

    const spaces: Item[] = COMMUNITIES.map((c) => ({
      id: `sp-${c.id}`,
      section: 'Jump to',
      label: c.name,
      hint: c.memberEstimate,
      icon: <Radio size={15} strokeWidth={1.5} />,
      run: () => navigate(`/space/${c.id}`),
    }))

    const actions: Item[] = [
      {
        id: 'ac-mask',
        section: 'Actions',
        label: 'Switch mask',
        hint: 'Cmd I',
        icon: <ArrowRight size={15} strokeWidth={1.5} />,
        run: () => openOverlay('mask-switcher'),
      },
      {
        id: 'ac-ephemeral',
        section: 'Actions',
        label: 'New ephemeral room',
        hint: 'closes when everyone leaves',
        icon: <Clock size={15} strokeWidth={1.5} />,
        run: () => later('Creating rooms'),
      },
      {
        id: 'ac-sealed',
        section: 'Actions',
        label: 'Start sealed group',
        icon: <SealGlyph size={15} />,
        run: () => later('Starting groups'),
      },
      {
        id: 'ac-vault',
        section: 'Actions',
        label: 'Open vault',
        icon: <VaultIcon size={15} strokeWidth={1.5} />,
        run: () => navigate('/vault'),
      },
      {
        id: 'ac-demo',
        section: 'Actions',
        label: demoMode ? 'Turn demo mode off' : 'Turn demo mode on',
        hint: demoMode ? 'restores the world' : 'drips live activity',
        icon: <Sparkles size={15} strokeWidth={1.5} />,
        run: () => {
          setDemoMode(!demoMode)
          toast({
            kind: 'accent',
            title: demoMode ? 'Demo mode off' : 'Demo mode on',
            body: demoMode
              ? 'The world is back exactly as it was.'
              : 'Fake activity every few seconds. Everything is reversible.',
          })
        },
      },
      {
        id: 'ac-playground',
        section: 'Actions',
        label: 'Open the component playground',
        hint: 'every primitive, every state',
        icon: <Sparkles size={15} strokeWidth={1.5} />,
        run: () => navigate('/playground'),
      },
    ]

    return [...recent, ...threads, ...spaces, ...channels, ...actions]
  }, [navigate, openOverlay, later, demoMode, setDemoMode, toast])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((i) =>
      `${i.label} ${i.hint ?? ''} ${i.keywords ?? ''}`.toLowerCase().includes(q),
    )
  }, [items, query])

  const grouped = useMemo(() => {
    const order: Item['section'][] = ['Recent', 'Jump to', 'Actions']
    return order
      .map((section) => ({ section, items: filtered.filter((i) => i.section === section) }))
      .filter((g) => g.items.length > 0)
  }, [filtered])

  const flat = grouped.flatMap((g) => g.items)

  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, flat.length - 1)))
  }, [flat.length])

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const runAt = (i: number) => {
    const item = flat[i]
    if (!item) return
    closeOverlay()
    window.setTimeout(item.run, 0)
  }

  return (
    <Modal open={open} onClose={closeOverlay} size="lg">
      <div className="-mx-5 -my-4">
        <div className="flex items-center gap-2 px-4 py-3 hairline-b">
          <Search size={16} strokeWidth={1.5} className="shrink-0 text-low" />
          <input
            data-autofocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCursor(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setCursor((c) => (c + 1) % Math.max(1, flat.length))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setCursor((c) => (c - 1 + flat.length) % Math.max(1, flat.length))
              } else if (e.key === 'Enter') {
                e.preventDefault()
                runAt(cursor)
              }
            }}
            placeholder="Jump to a room, or do something"
            aria-label="Command palette"
            className="min-w-0 flex-1 bg-transparent text-15 text-hi outline-none placeholder:text-low"
          />
          <Kbd>esc</Kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
          {grouped.length === 0 ? (
            <p className="px-4 py-8 text-center text-13 text-low">
              Nothing matches. Try a space name, a room, or an action.
            </p>
          ) : null}
          {grouped.map((group) => (
            <div key={group.section} className="mb-1">
              <p className="px-4 py-1.5 text-12 font-medium uppercase tracking-[0.08em] text-low">
                {group.section}
              </p>
              {group.items.map((item) => {
                const index = flat.indexOf(item)
                const active = index === cursor
                return (
                  <button
                    key={item.id}
                    data-index={index}
                    onMouseMove={() => setCursor(index)}
                    onClick={() => runAt(index)}
                    className={cx(
                      'flex w-full items-center gap-3 px-4 py-2 text-left transition-colors',
                      active ? 'bg-accent-soft text-hi' : 'text-mid hover:bg-ink-2',
                    )}
                  >
                    <span className={cx('shrink-0', active ? 'text-accent' : 'text-low')}>
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-14">{item.label}</span>
                    {item.hint ? (
                      <span className="shrink-0 text-12 text-low">{item.hint}</span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2.5 hairline-t">
          <IdentityChip maskId={activeMaskId} size="sm" prefix="results as" />
          <span className="flex items-center gap-2 text-12 text-low">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            to move
            <Kbd>↵</Kbd>
            to open
          </span>
        </div>
      </div>
    </Modal>
  )
}
