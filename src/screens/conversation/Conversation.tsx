import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, PanelRight, Users } from 'lucide-react'
import { cx } from '../../lib/cx'
import { maskById } from '../../mock/masks'
import { communityById } from '../../mock/communities'
import { resolveRoom } from '../../mock/world'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Button, IconButton } from '../../components/primitives/Button'
import { Chip } from '../../components/primitives/Chip'
import { EmptyState } from '../../components/primitives/EmptyState'
import { Sheet } from '../../components/primitives/Overlay'
import { PresenceThread } from '../../components/shell/Columns'
import { Composer } from '../../components/messaging/Composer'
import { MessageStream } from '../../components/messaging/MessageStream'
import { MaskAvatar } from '../../components/identity/MaskAvatar'
import { IdentityChip } from '../../components/identity/IdentityChip'
import { Countdown, RetentionChip } from '../../components/time'
import { BreachBanner, FuzzedCount, SealBadge } from '../../components/trust'
import { GhostGlyph } from '../../components/trust/Glyphs'
import { MemberPanel } from './MemberPanel'

export function Conversation({ roomId, backTo }: { roomId: string; backTo: string }) {
  const navigate = useNavigate()
  const room = resolveRoom(roomId)
  const rightPanel = useUi((s) => s.rightPanel)
  const setRightPanel = useUi((s) => s.setRightPanel)
  const later = useUi((s) => s.later)
  const toast = useUi((s) => s.toast)
  const openOverlay = useUi((s) => s.openOverlay)
  const activeMaskId = useApp((s) => s.activeMaskId)
  const typingIn = useWorld((s) => s.typingIn)
  const overlay = useUi((s) => s.overlay)
  const closeOverlay = useUi((s) => s.closeOverlay)
  const panelOpen = rightPanel !== null

  if (!room) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <EmptyState
          title="This room doesn't exist — or you're wearing the wrong mask."
          actionLabel="Go home"
          onAction={() => navigate('/chats')}
        />
      </div>
    )
  }

  const community = room.communityId ? communityById(room.communityId) : undefined
  const isRequest = room.kind === 'request'
  const isAnnounce = room.kind === 'announce'
  const isDm = room.kind === 'dm'
  const isStaffChannel = room.history === 'none'

  return (
    <div className="flex min-h-0 min-w-0 flex-1">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-ink-0">
        <header className="atm-chrome flex shrink-0 items-center gap-3 px-3 py-2.5 md:px-4">
          <IconButton
            label="Back"
            className="md:hidden"
            onClick={() => navigate(backTo)}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </IconButton>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            {isDm ? <MaskAvatar maskId={room.memberMaskIds?.[0] ?? ''} size={28} /> : null}
            <h1 className="truncate font-display text-15 text-hi">{room.title}</h1>
            {room.subtitle ? (
              <span className="hidden shrink-0 text-13 text-low sm:inline">· {room.subtitle}</span>
            ) : null}
            <SealBadge state={room.sealed ? 'sealed' : 'unsealed'} />
            {isStaffChannel ? (
              <span className="text-low" title="You only see messages from when you joined">
                <GhostGlyph size={14} />
              </span>
            ) : null}
            {room.retention ? <RetentionChip retention={room.retention} /> : null}
            {room.temporaryUntil ? (
              <Countdown until={room.temporaryUntil} prefix="closes in" />
            ) : null}
            {room.headerNote ? (
              <Chip className="hidden lg:inline-flex">{room.headerNote}</Chip>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {room.memberEstimate ? (
              <FuzzedCount value={room.memberEstimate} className="mr-1 hidden md:flex" />
            ) : null}
            <IconButton label="Call" onClick={() => later('Calling from a text room')}>
              <Phone size={17} strokeWidth={1.5} />
            </IconButton>
            <IconButton
              label="Members"
              className="lg:hidden"
              onClick={() => openOverlay('room-details', roomId)}
            >
              <Users size={17} strokeWidth={1.5} />
            </IconButton>
            <IconButton
              label="Right panel"
              className="hidden lg:inline-flex"
              active={panelOpen}
              onClick={() => setRightPanel(panelOpen ? null : 'members')}
            >
              <PanelRight size={17} strokeWidth={1.5} />
            </IconButton>
          </div>
        </header>

        <PresenceThread />

        {!room.sealed ? (
          <BreachBanner
            body={
              room.legacyBridge
                ? 'This channel is bridged from an old forum while LostEra migrates. Anything sensitive belongs in a sealed room.'
                : undefined
            }
            action={
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  toast({
                    kind: 'breach',
                    title: 'Still bridged',
                    body: 'Sealing happens when the migration finishes on Friday.',
                  })
                }
              >
                Why?
              </Button>
            }
          />
        ) : null}

        {room.topic ? (
          <p className="atm-chrome shrink-0 px-4 py-1.5 text-12 text-low hairline-b">{room.topic}</p>
        ) : null}

        <MessageStream
          roomId={roomId}
          layout={isDm ? 'bubbles' : 'stream'}
          retention={room.retention}
          history={room.history}
          typingMaskId={
            typingIn === roomId ? room.memberMaskIds?.[0] : undefined
          }
        />

        {isRequest ? (
          <div className="shrink-0 px-4 py-3 hairline-t">
            <div className="rounded-card border border-[var(--line)] bg-ink-1 p-3">
              <p className="text-13 text-hi">
                Accept this request to allow messages from{' '}
                {maskById(room.requestFromMaskId ?? '').handle}.
              </p>
              <p className="mt-1 text-12 leading-relaxed text-low">
                They see nothing about you until you do. Declining tells them nothing either.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="solid"
                  size="sm"
                  onClick={() =>
                    toast({
                      kind: 'accent',
                      title: 'Request accepted',
                      body: 'They can message this mask now.',
                    })
                  }
                >
                  Accept
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    toast({ kind: 'neutral', title: 'Request declined', body: 'They are not told.' })
                  }
                >
                  Decline
                </Button>
                <Button variant="ghost" size="sm" onClick={() => later('Blocking')}>
                  Block
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Composer
            roomId={roomId}
            roomTitle={room.title}
            usingMaskId={room.usingMaskId || activeMaskId}
            disabled={isAnnounce && !community?.staff}
            disabledNote="Only staff post in announcements. You will still see everything here."
          />
        )}
      </div>

      {panelOpen ? (
        <aside
          className={cx(
            'hidden min-h-0 w-[var(--panel-w)] shrink-0 flex-col border-l border-[var(--line-soft)] bg-ink-1 lg:flex',
          )}
        >
          <MemberPanel roomId={roomId} />
        </aside>
      ) : null}

      <Sheet
        open={overlay === 'room-details'}
        onClose={closeOverlay}
        title="Members"
      >
        <MemberPanel roomId={roomId} />
      </Sheet>
    </div>
  )
}

export function ConversationIdentityBar({ maskId }: { maskId: string }) {
  const openOverlay = useUi((s) => s.openOverlay)
  return <IdentityChip maskId={maskId} onClick={() => openOverlay('mask-switcher')} />
}
