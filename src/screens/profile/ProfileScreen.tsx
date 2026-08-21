import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Music, Pencil, Share2 } from 'lucide-react'
import { cx } from '../../lib/cx'
import { BRAND } from '../../config/brand'
import { maskById } from '../../mock/masks'
import { AUDIENCES, AUDIENCE_KNOWS, AUDIENCE_VISIBILITY, PROFILE_BLOCKS, SOCIAL } from '../../mock/social'
import type { AudienceId } from '../../mock/social'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { Button, IconButton } from '../../components/primitives/Button'
import { Card, SectionLabel } from '../../components/primitives/EmptyState'
import { Chip } from '../../components/primitives/Chip'
import { Segmented, Toggle } from '../../components/primitives/Controls'
import { MaskAvatar } from '../../components/identity/MaskAvatar'
import { SocialCard } from '../../components/social/SocialCard'
import { AuraMeter, BadgeTile, ReputationLaurel } from '../../components/social/Stats'
import { ZkBadge } from '../../components/trust'

type BlockId = 'about' | 'badges' | 'nowPlaying' | 'projects' | 'spaces' | 'links' | 'aura' | 'reputation'

const BLOCK_TITLES: Record<BlockId, string> = {
  about: 'About',
  badges: 'Badges',
  nowPlaying: 'Now playing',
  projects: 'Projects',
  spaces: 'Public spaces',
  links: 'Links',
  aura: 'Aura',
  reputation: 'Reputation',
}

const DEFAULT_LEFT: BlockId[] = ['about', 'badges', 'projects', 'links']
const DEFAULT_RIGHT: BlockId[] = ['aura', 'reputation', 'nowPlaying', 'spaces']

function BlockShell({
  id,
  title,
  editing,
  hidden,
  onToggle,
  onUp,
  onDown,
  children,
}: {
  id: BlockId
  title: string
  editing: boolean
  hidden: boolean
  onToggle: () => void
  onUp: () => void
  onDown: () => void
  children: React.ReactNode
}) {
  return (
    <Card
      className={cx(
        'p-4 transition-opacity',
        editing && 'border-dashed',
        hidden && 'opacity-45',
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        {editing ? (
          <span className="cursor-grab text-low" title="Drag to reorder">
            <GripVertical size={14} strokeWidth={1.5} />
          </span>
        ) : null}
        <SectionLabel className="flex-1 px-0">{title}</SectionLabel>
        {editing ? (
          <span className="flex items-center gap-0.5">
            <IconButton label={`Move ${title} up`} size="sm" onClick={onUp}>
              <ArrowUp size={13} strokeWidth={1.5} />
            </IconButton>
            <IconButton label={`Move ${title} down`} size="sm" onClick={onDown}>
              <ArrowDown size={13} strokeWidth={1.5} />
            </IconButton>
            <IconButton
              label={hidden ? `Show ${title}` : `Hide ${title}`}
              size="sm"
              onClick={onToggle}
              active={!hidden}
            >
              {hidden ? <EyeOff size={13} strokeWidth={1.5} /> : <Eye size={13} strokeWidth={1.5} />}
            </IconButton>
          </span>
        ) : null}
      </div>
      <div id={`block-${id}`}>{children}</div>
    </Card>
  )
}

export function ProfileScreen() {
  const activeMaskId = useApp((s) => s.activeMaskId)
  const statsOptedIn = useApp((s) => s.statsOptedIn)
  const setStatsOptedIn = useApp((s) => s.setStatsOptedIn)
  const openOverlay = useUi((s) => s.openOverlay)
  const later = useUi((s) => s.later)

  const [editing, setEditing] = useState(false)
  const [audience, setAudience] = useState<AudienceId>('self')
  const [left, setLeft] = useState<BlockId[]>(DEFAULT_LEFT)
  const [right, setRight] = useState<BlockId[]>(DEFAULT_RIGHT)
  const [hidden, setHidden] = useState<BlockId[]>([])

  const knows = AUDIENCE_KNOWS[audience]
  const shownMaskId = knows.maskId === 'active' ? activeMaskId : knows.maskId
  const mask = maskById(shownMaskId)
  const allowed = AUDIENCE_VISIBILITY[audience]

  const visible = useMemo(
    () => (id: BlockId) => {
      if (audience !== 'self' && !allowed.includes(id)) return false
      if (audience !== 'self' && hidden.includes(id)) return false
      if ((id === 'aura' || id === 'reputation') && !statsOptedIn) return false
      return true
    },
    [audience, allowed, hidden, statsOptedIn],
  )

  const move = (column: BlockId[], setColumn: (v: BlockId[]) => void, id: BlockId, delta: number) => {
    const i = column.indexOf(id)
    const j = i + delta
    if (i < 0 || j < 0 || j >= column.length) return
    const next = [...column]
    next.splice(i, 1)
    next.splice(j, 0, id)
    setColumn(next)
  }

  const renderBlock = (id: BlockId, column: BlockId[], setColumn: (v: BlockId[]) => void) => {
    if (!visible(id) && !editing) return null
    if (!visible(id) && editing && audience !== 'self') return null

    const shell = (children: React.ReactNode) => (
      <BlockShell
        key={id}
        id={id}
        title={BLOCK_TITLES[id]}
        editing={editing}
        hidden={hidden.includes(id)}
        onToggle={() =>
          setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]))
        }
        onUp={() => move(column, setColumn, id, -1)}
        onDown={() => move(column, setColumn, id, 1)}
      >
        {children}
      </BlockShell>
    )

    switch (id) {
      case 'about':
        return shell(
          <p className="text-14 leading-relaxed text-mid">{PROFILE_BLOCKS.about}</p>,
        )
      case 'badges':
        return shell(
          <div className="grid gap-2 sm:grid-cols-2">
            {SOCIAL.reputation.badges
              .filter((b) => (audience === 'self' ? true : b.kind !== 'secret'))
              .map((b) => (
                <BadgeTile key={b.id} badge={b} />
              ))}
          </div>,
        )
      case 'nowPlaying':
        return shell(
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[var(--line)] bg-ink-2 text-mid">
              <Music size={16} strokeWidth={1.5} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-14 text-hi">{PROFILE_BLOCKS.nowPlaying.title}</p>
              <p className="truncate text-12 text-low">{PROFILE_BLOCKS.nowPlaying.context}</p>
            </div>
          </div>,
        )
      case 'projects':
        return shell(
          <ul className="flex flex-col gap-2">
            {PROFILE_BLOCKS.projects.map((p) => (
              <li key={p.name} className="border-l border-[var(--line)] pl-3">
                <p className="text-14 text-hi">{p.name}</p>
                <p className="text-12 text-low">{p.note}</p>
              </li>
            ))}
          </ul>,
        )
      case 'spaces':
        return shell(
          <ul className="flex flex-col gap-2">
            {PROFILE_BLOCKS.publicSpaces.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-14 text-hi">{s.name}</span>
                <span className="mono-num shrink-0 text-12 text-low">{s.note}</span>
              </li>
            ))}
            <li className="pt-1 text-12 leading-relaxed text-mid">
              Only spaces you marked public are listed. The rest are not hidden — they are simply
              not knowable from here.
            </li>
          </ul>,
        )
      case 'links':
        return shell(
          <ul className="flex flex-col gap-2">
            {PROFILE_BLOCKS.links.map((l) => (
              <li key={l.label}>
                <button
                  onClick={() => later('Opening links')}
                  className="text-left text-14 text-accent hover:underline"
                >
                  {l.label}
                </button>
                <p className="mono-num text-12 text-low">{l.host}</p>
              </li>
            ))}
          </ul>,
        )
      case 'aura':
        return shell(<AuraMeter aura={SOCIAL.aura} />)
      case 'reputation':
        return shell(<ReputationLaurel reputation={SOCIAL.reputation} />)
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-ink-0">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8">
        <header className="flex flex-wrap items-start gap-5">
          <MaskAvatar maskId={mask.id} size={72} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-30 leading-tight text-hi">
              {knows.showHandle ? mask.displayName : 'Someone'}
            </h1>
            <p className="mono-num mt-0.5 text-13 text-low">
              {knows.showHandle ? mask.handle : 'handle hidden from strangers'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PROFILE_BLOCKS.proofs.map((p) => (
                <ZkBadge key={p.label} label={p.label} note={p.note} />
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="quiet"
              size="md"
              icon={<Share2 size={15} strokeWidth={1.5} />}
              onClick={() => openOverlay('social-card')}
            >
              Social card
            </Button>
            <Button
              variant={editing ? 'solid' : 'quiet'}
              size="md"
              icon={<Pencil size={15} strokeWidth={1.5} />}
              onClick={() => setEditing((e) => !e)}
            >
              {editing ? 'Done' : 'Edit'}
            </Button>
          </div>
        </header>

        {editing ? (
          <Card raised className="mt-5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <SectionLabel className="px-0">Audience lens</SectionLabel>
                <p className="mt-1 max-w-md text-12 leading-relaxed text-mid">{knows.note}</p>
              </div>
              <Segmented
                ariaLabel="View profile as"
                options={AUDIENCES.map((a) => ({ id: a.id, label: a.label }))}
                value={audience}
                onChange={(a) => setAudience(a)}
              />
            </div>
            <div className="mt-3 border-t border-[var(--line-soft)] pt-3">
              <Toggle
                checked={statsOptedIn}
                onChange={setStatsOptedIn}
                label={`Social stats: ${statsOptedIn ? 'on' : 'off'}`}
                description="Aura and Reputation are opt-in. Turning them off removes them for everyone, including you."
              />
            </div>
          </Card>
        ) : audience !== 'self' ? (
          <Card raised className="mt-5 flex flex-wrap items-center justify-between gap-3 p-3">
            <Chip tone="accent">Viewing as {AUDIENCES.find((a) => a.id === audience)?.label}</Chip>
            <Button variant="ghost" size="sm" onClick={() => setAudience('self')}>
              Back to your view
            </Button>
          </Card>
        ) : null}

        {!statsOptedIn ? (
          <Card className="mt-5 p-4">
            <p className="font-display text-15 text-hi">Stats are off.</p>
            <p className="mt-1 text-13 leading-relaxed text-mid">
              Only you can turn them on. Nobody can tell whether you ever had them.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setStatsOptedIn(true)}>
              Turn stats on
            </Button>
          </Card>
        ) : null}

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-3">{left.map((id) => renderBlock(id, left, setLeft))}</div>
          <div className="flex flex-col gap-3">
            {right.map((id) => renderBlock(id, right, setRight))}
          </div>
        </div>

        <p className="mt-6 text-center text-12 text-low">
          {BRAND.name} shows each audience a different profile because each audience met a different
          you.
        </p>
      </div>

      <SocialCard />
    </div>
  )
}
