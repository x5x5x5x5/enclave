import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { communityById } from '../../mock/communities'
import { useUi } from '../../state/ui'
import { EmptyState, SectionLabel } from '../../components/primitives/EmptyState'
import { Chip } from '../../components/primitives/Chip'
import { Popover } from '../../components/primitives/Overlay'
import { ChannelRow } from '../../components/nav/ChannelRow'
import { IdentityChip } from '../../components/identity/IdentityChip'
import { ListColumn } from '../../components/shell/Columns'
import { useAtmosphere, useContextMask } from '../../components/shell/useChrome'
import { FuzzedCount } from '../../components/trust'
import { ZkGlyph } from '../../components/trust/Glyphs'
import { Conversation } from '../conversation/Conversation'
import { CommunityHome } from './CommunityHome'

export function SpaceScreen() {
  const { communityId, channelId } = useParams()
  const navigate = useNavigate()
  const community = communityId ? communityById(communityId) : undefined
  const openOverlay = useUi((s) => s.openOverlay)
  const reduce = useReducedMotion()

  useAtmosphere(community?.atmosphere)
  useContextMask(community?.usingMaskId, community?.name)

  const grouped = useMemo(() => {
    if (!community) return { text: [], voice: [] }
    return {
      text: community.channels.filter((c) => c.kind !== 'voice'),
      voice: community.channels.filter((c) => c.kind === 'voice'),
    }
  }, [community])

  if (!community) return <Navigate to="/chats" replace />

  const salon = community.atmosphere === 'salon'

  const channelList = (
    <>
      <header className="atm-chrome shrink-0 px-[var(--gutter)] pb-2 pt-3">
        <h1 className="truncate font-display text-17 text-hi">{community.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <FuzzedCount value={`${community.memberEstimate} members`} />
          {community.gate ? (
            <Chip tone="neutral" icon={<ZkGlyph size={11} />}>
              {community.gate.label}
            </Chip>
          ) : null}
        </div>
        <div className="mt-2">
          <IdentityChip
            maskId={community.usingMaskId}
            prefix="you are here as"
            size="sm"
            onClick={() => openOverlay('mask-switcher')}
          />
        </div>
      </header>

      <div className="scroll-area min-h-0 flex-1 pb-3">
        <SectionLabel className="px-4 pb-1 pt-3">Rooms</SectionLabel>
        {grouped.text.map((c) => (
          <ChannelRow
            key={c.id}
            channel={c}
            to={`/space/${community.id}/${c.id}`}
            active={channelId === c.id}
          />
        ))}
        <SectionLabel className="px-4 pb-1 pt-4">Voice</SectionLabel>
        {grouped.voice.map((c) => (
          <ChannelRow key={c.id} channel={c} to={`/voice/${community.id}/${c.id}`} />
        ))}
      </div>
    </>
  )

  return (
    <motion.div
      key={community.atmosphere}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.32, ease: [0.2, 0, 0, 1] }}
      className="flex min-h-0 min-w-0 flex-1"
    >
      {/* Salon collapses the sidebar into a header dropdown — the layout is the
          privacy signal, so a quiet room does not get a loud channel column. */}
      {/* The channel column is a desktop affordance. On a phone the community
          home *is* the channel list, so rendering both pushed one off-screen. */}
      {salon ? null : <ListColumn hideOnMobile>{channelList}</ListColumn>}

      {salon ? (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="atm-chrome flex shrink-0 items-center gap-2 px-4 py-2">
            <Popover
              side="bottom"
              align="start"
              trigger={({ toggle }) => (
                <button
                  onClick={toggle}
                  className="flex items-center gap-1.5 rounded-chip px-2 py-1 text-13 text-mid transition-colors hover:bg-ink-2 hover:text-hi max-md:min-h-11"
                >
                  <span className="font-display text-hi">{community.name}</span>
                  <ChevronDown size={14} strokeWidth={1.5} />
                </button>
              )}
            >
              {(close) => (
                <div className="w-64 p-1" onClick={close}>
                  {community.channels.map((c) => (
                    <ChannelRow
                      key={c.id}
                      channel={c}
                      to={
                        c.kind === 'voice'
                          ? `/voice/${community.id}/${c.id}`
                          : `/space/${community.id}/${c.id}`
                      }
                      active={channelId === c.id}
                    />
                  ))}
                </div>
              )}
            </Popover>
            <IdentityChip
              maskId={community.usingMaskId}
              prefix="as"
              size="sm"
              onClick={() => openOverlay('mask-switcher')}
            />
            {community.gate ? (
              <span className="hidden sm:inline-flex">
                <Chip tone="neutral" icon={<ZkGlyph size={11} />}>
                  {community.gate.label}
                </Chip>
              </span>
            ) : null}
          </div>
          {channelId ? (
            <Conversation roomId={channelId} backTo={`/space/${community.id}`} />
          ) : (
            <CommunityHome community={community} />
          )}
        </div>
      ) : channelId ? (
        <Conversation roomId={channelId} backTo={`/space/${community.id}`} />
      ) : (
        <CommunityHome community={community} />
      )}

      {!channelId && !salon && community.channels.length === 0 ? (
        <EmptyState title="No rooms yet" actionLabel="Go back" onAction={() => navigate('/chats')} />
      ) : null}
    </motion.div>
  )
}
